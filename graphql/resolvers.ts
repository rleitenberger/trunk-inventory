import prisma from '@/lib/prisma';
import type { PageInfo,ItemArgs, ItemEdge, ItemConnection } from '@/types/getItemsTypes';

export const resolvers = {
    Query: {
        getOrganizations: async () => {
            return await prisma.organizations.findMany();
        },
        getLocations: async (_: any, { organizationId, search }: { 
            organizationId: string
            search: string 
        }) => {
            return await prisma.locations.findMany({
                where: {
                    organization_id: {
                        equals: organizationId
                    },
                    name: search ? {
                        contains: search
                    } : undefined
                }
            });
        },
        getItems: async(_: any, {organizationId, search, first, after }: {
            organizationId: string
            search: string
            first: number
            after:string
        }) => {
            const take = first || 10;
            let cursorCondition = {};
            if (after) {
                cursorCondition = {
                    item_id: {
                        gt: after,
                    },
                };
            }

            const items = await prisma.items.findMany({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { name: search ? { contains: search } : undefined },
                        cursorCondition
                    ]
                },
                take: take + 1,
                orderBy: {
                    item_id: 'asc'
                }
            });

            const hasNextPage = items.length > take;
            const edges: ItemEdge[] = (hasNextPage ? items.slice(0, -1) : items).map(item => ({
                node: item,
                cursor: item.item_id, // Use the item_id as the cursor
            }));

            const i = { 
                edges: edges.map((ite, index) => {
                    return{
                        node: ite.node,
                        cursor: ite.node.item_id
                    }
                }),
                pageInfo: {
                    hasNextPage: hasNextPage,
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
                }
            }

            return i;
        }
    }
}