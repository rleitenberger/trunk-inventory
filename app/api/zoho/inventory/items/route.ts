import { verifyZohoAuth } from "@/lib/zoho";
import { Item } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { NextRequest } from "next/server";
import { common } from "@/lib/common";

interface Notify {
    log: (msg: any) => void;
    complete: (data: any) => void;
    error: (error: Error|any) => void;
    close: () => void;
    syncId: string;
    organizationId: string;
    accessToken: string;
    zohoOrgId: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const intervalTime: number = (60000 / 30) + 200;

const startLoop = async(notify: Notify) => {
    await fetch(process.env.NEXTAUTH_URL + '/api/hello/sync/update', {
        method: 'POST',
        body: JSON.stringify({
            logId: notify.syncId,
            status: 'uploading'
        })
    });

    notify.log({
        type: 'u',
        data: {
            status: 'fetching'
        }
    });

    const allItems: any = [];
    let index = 1;


    const dbItemsRes = await fetch(process.env.NEXTAUTH_URL + '/api/hello/items?organizationId=' + notify.organizationId, {
        method: 'GET',
    });
    const dbZiItemIds = await dbItemsRes.json();

    if (dbZiItemIds?.error){
        console.log('no items', dbZiItemIds)
    }

    let hasMore = true;


    let currentBatch = [];

    let added: number = 0;
    let updated: number = 0;

    let current = 0;

    while (hasMore){
        const res = await getItems(index, notify.zohoOrgId, notify.organizationId, notify.accessToken);
        if (res?.error){
            break;   
        }

        const { items, page_context } = res;
        allItems.push(...items);
        hasMore = page_context.has_more_page || false;
        index++;

        currentBatch.push(...items);

        if (currentBatch.length >= 1000 || !hasMore){

            const itemsToAdd = currentBatch.filter((item: Item) => !dbZiItemIds.includes(item.zi_item_id));
            added += itemsToAdd.length;

            const itemsToUpdate = currentBatch.filter((item: Item) => dbZiItemIds.includes(item.zi_item_id));
            updated += itemsToUpdate.length;

            console.log(added, updated)
            await upsertBatch(itemsToAdd, itemsToUpdate, notify.organizationId);
            currentBatch = [];
        }

        current += items.length;

        notify.log({
            type: 'i',
            data: {
                current: current
            }
        });

        await delay(intervalTime);
    }

    
    await fetch(process.env.NEXTAUTH_URL + '/api/hello/sync/update', {
        method: 'POST',
        body: JSON.stringify({
            logId: notify.syncId,
            status: 'completed',
            items: {
                added: added,
                updated: updated,
                total: added+updated
            }
        })
    });

    notify.log({
        type: 'u',
        data: {
            status: 'finished'
        }
    })

    notify.complete({
        type:'done'
    });
}

const handler = async (req: NextRequest) => {
    let responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();
    let closed = false;

    const { searchParams } = new URL(req.url);
    const auth: ZohoAuthResponse = await verifyZohoAuth(searchParams.get('organizationId') || '', searchParams.get('sessionToken'));

    if (!auth.verified || !auth.accessToken){
        return Response.json(auth);
    }

    const organizationId = searchParams.get('organizationId');

    if (!organizationId){
        return Response.json({
            error: 'Invalid organization ID'
        });
    }

    const zohoOrgId = searchParams.get('zohoOrganizationId');
    if (!zohoOrgId){
        return Response.json({
            error: 'Please select an organization'
        });
    }

    let syncId = searchParams.get('syncId');

    if (!syncId){
        const res = await fetch(process.env.NEXTAUTH_URL + '/api/hello/sync', {
            method: 'POST',
            body: JSON.stringify({
                organizationId: organizationId,
                status: 'downloading'
            })
        });

        const log = await res.json();
        if (log.error){
            return Response.json(log);
        }

        syncId = log.item_sync_log_id;
    }

    const logExistsRes = await fetch(process.env.NEXTAUTH_URL + '/api/hello/sync?logId=' + syncId, {
        method: 'GET'
    });

    const { exists } = await logExistsRes.json();
    if (!exists){
        return Response.json({
            error: 'Invalid log ID'
        });
    }

    const accessToken= auth.accessToken ?? '';

    const itemCountRes = await fetch(`https://www.zohoapis.com/inventory/v1/items?response_option=2&organization_id=${zohoOrgId}&filter_by=Status.Active`, {  
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
    });
    const { page_context } = await itemCountRes.json();
    
    const time = {
        itemCount: page_context.total,
        estimatedTime: (intervalTime * page_context.total) / 60000
    };

    writer.write(encoder.encode("data: " + JSON.stringify({
        type: 'init',
        data: {
            ...time,
            logId: syncId,
            transitionTime: intervalTime
        }
    }) + "\n\n"));


    try {
        startLoop({
            log: (msg: any) => {
                writer.write(encoder.encode("data: " + JSON.stringify(msg) + "\n\n"))
            },
            complete: (data: any) => {
                if (!closed){
                    writer.write(encoder.encode("data: " + JSON.stringify(data) + "\n\n"))
                    writer.close();
                    closed=true;
                }
            },
            error: (err: Error | any) => {
                writer.write(encoder.encode("data: " + err?.message + "\n\n"))
                if (!closed){
                    writer.close();
                    closed=true;
                }
            },
            close: () => {
                if (!closed){
                    writer.close();
                    closed=true;
                }
            },
            syncId: syncId as string,
            organizationId: organizationId,
            zohoOrgId: zohoOrgId,
            accessToken: accessToken,
        }).then(() => {
            if (!closed) {
                writer.close();
            }
        }).catch((e) => {
            console.error('Error');
            if (!closed){
                writer.close();
            }
        });
    } catch (e) {
        writer.close();
    }

    

    const res =  new Response(responseStream.readable, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
            'Content-Encoding': 'none'
        }
    })

    return res;
}



const upsertBatch = async (add: Item[], update: Item[], orgId: string): Promise<Boolean> => {
    //add
    let vals: any = [];

    await fetch(process.env.NEXTAUTH_URL + '/api/hello/items', {
        method: 'POST',
        body: JSON.stringify({
            items: add,
            action: 'add',
        })
    });
    await fetch(process.env.NEXTAUTH_URL + '/api/hello/items', {
        method: 'POST',
        body: JSON.stringify({
            items: update,
            action: 'update'
        })
    })
    
    return true;
}

const getItems = async(page: number, orgId: string, _orgId: string, accessToken?: string): Promise<any> => {

    let url = `https://www.zohoapis.com/inventory/v1/items?organization_id=${orgId}&page=${page}&filter_by=Status.Active`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
    });

    const json= await res.json();

    const object = {
        items: json?.items?.map((e: any) => {
            return {
                item_id: createUUID(),
                zi_item_id: e.item_id,
                name: e.name,
                description: e.description,
                sku: e.sku,
                organization_id: _orgId
            }
        }) ?? [],
        page_context: json.page_context
    };


    return object;
}

function createUUID() {
    let d = new Date().getTime(), d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
}

export const runtime = 'edge';

export { handler as GET, handler as POST };