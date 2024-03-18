import prisma from "@/lib/prisma";
import { verifyZohoAuth } from "@/lib/zoho";
import { Item } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const syncId = searchParams.get('syncId') ?? '';
    const accessToken = searchParams.get('accessToken');

    if(!accessToken){
        return Response.json({
            error: 'Missing access token'
        });
    }

    const organzationId = searchParams.get('organizationId') ?? '';
    const zohoOrgId = searchParams.get('zohoOrganizationId') ?? '';

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

    const intervalTime: number = rate.time / rate.limit + 200;
    let hasMore = true;

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    while (hasMore && index < 2){
        const res = await getItems(index, zohoOrgId, accessToken);
        if (res?.error){
            break;   
        }

        const { items, page_context } = res;
        allItems.push(...items);
        hasMore = page_context.has_more_page || false;

        await delay(intervalTime);
        index++;
    }

    await prisma.item_sync_logs.update({
        data: {
            status: 'uploading'
        },
        where: {
            item_sync_log_id: syncId
        }
    });

    
    const transactions = await prisma.$transaction([
        prisma.items.findMany({
            where: { active: { equals: true } },
        })
    ]);

    const [items] = transactions;
    const existingZiIds = new Set(items.map((e: Item) => e.zi_item_id));

    const itemsToAdd = allItems.filter((item: Item) => !existingZiIds.has(item.zi_item_id));
    const itemsToUpdate = allItems.filter((item: Item) => existingZiIds.has(item.zi_item_id))
                                .map((e: Item) => {
                                    return {
                                        item_id: e.item_id,
                                        zi_item_id: e.zi_item_id,
                                        sku: e.sku,
                                        description: e.description,
                                        modified: new Date(),
                                    }
                                });

                                console.log(itemsToUpdate[0])

    return Response.json({});

    const ops = await prisma.$transaction([
        prisma.items.updateMany({
            data: itemsToUpdate,
        }),
        prisma.items.createMany({
            data: itemsToUpdate,
            skipDuplicates: true
        })
    ]);

    const now = new Date();

    const addLen = itemsToAdd.length;
    const updateLen = itemsToUpdate.length;

    /*
    const res = await prisma.$transaction( async(prisma) => {
        try {
            for (let i = 0; i < allItems.length; i++) {
                const item: Item = allItems[i];
                await prisma.items.upsert({
                    where: {
                        zi_item_id: item.zi_item_id
                    },
                    update: {
                        name: item.name,
                        sku: item.sku,
                        description: item.description,
                        modified: new Date(),
                    },
                    create: {
                        item_id: randomUUID(),
                        name: item.name,
                        zi_item_id: item.zi_item_id,
                        organization_id: organizationId,
                        description: item.description,
                        sku: item.sku,
                    }
                });
            }
        } catch (e) {
        }
    }, {
        timeout: 15000,
    });*/


    return Response.json({
        total: addLen + updateLen,
        added: addLen,
        updated: updateLen
    });
}

const getItems = async(page: number, orgId: string, accessToken?: string): Promise<any> => {

    let url = `https://www.zohoapis.com/inventory/v1/items?organization_id=${orgId}&page=${page}`;
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
                sku: e.sku
            }
        }) ?? [],
        page_context: json.page_context
    }
}

export { handler as GET };