import prisma from "@/lib/prisma";
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

const startLoop = async(notify: Notify) => {

    await prisma.item_sync_logs.update({
        data: {
            status: 'uploading'
        },
        where: {
            item_sync_log_id: notify.syncId
        }
    });

    const allItems: any = [];
    let index = 1;

    const rate = {
        limit: 30,
        time: 60000
    }

    const dbItems: Item[] = await prisma.items.findMany({
        where: { organization_id: { equals: notify.organizationId } }
    });

    const dbZiItemIds = new Set(dbItems.map((item: Item) => item.zi_item_id));

    const intervalTime: number = rate.time / rate.limit + 200;
    let hasMore = true;


    let currentBatch = [];

    let added: number = 0;
    let updated: number = 0;

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
            const itemsToAdd = currentBatch.filter((item: Item) => !dbZiItemIds.has(item.zi_item_id));
            added += itemsToAdd.length;

            const itemsToUpdate = currentBatch.filter((item: Item) => dbZiItemIds.has(item.zi_item_id));
            updated += itemsToUpdate.length;

            console.log(added, updated);

            await upsertBatch(itemsToAdd, itemsToUpdate, notify.organizationId);
            currentBatch = [];
        }

        await delay(intervalTime);
    }

    await prisma.item_sync_logs.update({
        data: {
            status: 'finished',
            items_added: added,
            items_updated: updated,
            total_items: added+updated
        },
        where: {
            item_sync_log_id: notify.syncId
        }
    });

    notify.complete({
        status: 2
    });
}

const handler = async (req: NextRequest) => {
    let responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();
    let closed = false;

    const { searchParams } = new URL(req.url);
    const auth: ZohoAuthResponse = await verifyZohoAuth(searchParams.get('organizationId') || '');

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

    const syncId = searchParams.get('syncId');

    if (!syncId){
        const log = await prisma.item_sync_logs.create({
            data: {
                item_sync_log_id: common.createUUID(),
                organization_id: organizationId,
                status: 'downloading'
            }
        });
        return Response.json({
            success: 'Log created',
            syncLogId: log.item_sync_log_id
        });
    }

    const logExists = await prisma.item_sync_logs.findFirst({
        where: { item_sync_log_id: { equals: syncId } }
    });

    if (!logExists){
        return Response.json({
            error: 'Invalid log ID'
        });
    }
    const accessToken= auth.accessToken ?? '';

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
            syncId: syncId,
            organizationId: organizationId,
            zohoOrgId: zohoOrgId,
            accessToken: accessToken
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
        console.log(e);
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

    const adding = await prisma.items.createMany({
        data: add
    });

    update.forEach(async (e: Item) => {
        await prisma.items.update({
            data: {
                description: e.description,
                sku: e.sku,
                modified: new Date()  
            },
            where: {
                zi_item_id: e.zi_item_id
            }
        });
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

    return {
        items: json?.items?.map((e: any) => {
            return {
                item_id: common.createUUID(),
                zi_item_id: e.item_id,
                name: e.name,
                description: e.description,
                sku: e.sku,
                organization_id: _orgId
            }
        }) ?? [],
        page_context: json.page_context
    }
}

export const runtime = 'edge';

export { handler as GET, handler as POST };