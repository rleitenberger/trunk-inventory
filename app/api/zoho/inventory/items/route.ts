import prisma from "@/lib/prisma";
import { verifyZohoAuth } from "@/lib/zoho";
import { Item } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from '@prisma/client';

const handler = async (req: NextRequest) => {const { searchParams } = new URL(req.url);
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
                item_sync_log_id: randomUUID(),
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

    await prisma.item_sync_logs.update({
        data: {
            status: 'uploading'
        },
        where: {
            item_sync_log_id: syncId
        }
    });

    const allItems: any = [];
    let index = 1;

    const rate = {
        limit: 30,
        time: 60000
    }

    const dbItems: Item[] = await prisma.items.findMany({
        where: { organization_id: { equals: organizationId } }
    });

    const dbZiItemIds = new Set(dbItems.map((item: Item) => item.zi_item_id));

    const intervalTime: number = rate.time / rate.limit + 200;
    let hasMore = true;

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    let currentBatch = [];

    let added: number = 0;
    let updated: number = 0;

    
    await prisma.item_sync_logs.update({
        data: {
            status: 'uploading'
        },
        where: {
            item_sync_log_id: syncId
        }
    });

    while (hasMore){
        const res = await getItems(index, zohoOrgId, organizationId, accessToken);
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

            await upsertBatch(itemsToAdd, itemsToUpdate, organizationId);
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
            item_sync_log_id: syncId
        }
    });


    return Response.json({
        total: added + updated,
        added: added,
        updated: updated
    });
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
                item_id: randomUUID(),
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

export { handler as GET };