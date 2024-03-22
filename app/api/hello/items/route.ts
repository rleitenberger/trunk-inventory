import prisma from "@/lib/prisma";
import { Item } from "@/types/dbTypes";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    if (!searchParams.get('organizationId')){
        return Response.json({
            error: 'Missing fields'
        });
    }

    const items = await prisma.items.findMany({
        where: {
            organization_id: {
                equals: searchParams.get('organizationId') as string
            }
        },
        select: {
            zi_item_id: true
        }
    });

    return Response.json(items.map(e => {
        return e.zi_item_id;
    }));
}

export const POST = async(req: NextRequest) => {
    const body = await req.json();
    const { action, items } = body as { action: string, items: Item[] }

    switch(action){
        case 'add':
            await prisma.items.createMany({
                data: items
            });
            break;
        case 'update':
            items.forEach(async (e: Item) => {
                await prisma.items.update({
                    data: {
                        description: e.description,
                        sku: e.sku,
                        modified: new Date(),
                    },
                    where: {
                        zi_item_id: e.zi_item_id
                    }
                });
            })
            break;
        default:
            return Response.json({
                error: 'Invalid action'
            })
    }

    return Response.json({
        success: true
    });
}