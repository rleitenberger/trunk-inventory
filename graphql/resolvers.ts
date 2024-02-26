import prisma from '@/lib/prisma';
import type { PageInfo,ItemArgs, ItemEdge, ItemConnection, TransactionEdge } from '@/types/paginationTypes';
import { randomUUID } from 'crypto';

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
                        {
                            OR: [
                                { name: search ? { contains: search } : undefined },
                                { sku: search ? { contains: search } : undefined }
                            ]
                        },
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

            return { 
                edges: edges.map((item, index) => {
                    return{
                        node: item.node,
                        cursor: item.node.item_id
                    }
                }),
                pageInfo: {
                    hasNextPage: hasNextPage,
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
                }
            }
        },
        getTransactionType: async(_:any, { organizationId, slug }: {
            organizationId: string
            slug: string
        }) => {
            return await prisma.transaction_types.findFirst({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { type: { equals: slug } }
                    ]
                }
            });
        },
        getReasons: async(_:any, { transactionTypeId }: {
            transactionTypeId: string
        }) => {
            return await prisma.reasons.findMany({
                where: {
                    transaction_type_id: {
                        equals: transactionTypeId
                    }
                }
            });
        },
        getTransactions: async(_: any, { organizationId, locationId, itemId, first, after }: {
            organizationId: string
            locationId: string
            itemId: string
            first: number
            after: string
        }) => {
            const take = first || 25;
            let cursorCondition = {};
            if (after) {
                cursorCondition = {
                    item_id: {
                        gt: after,
                    },
                };
            }

            const transactions = await prisma.transactions.findMany({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { item_id: { equals: itemId ? itemId : undefined } },
                        {
                            OR: [
                                { from_location: { equals: locationId ? locationId : undefined } },
                                { to_location: { equals: locationId ? locationId : undefined } }
                            ]
                        },
                        cursorCondition
                    ]
                },
                take: take + 1,
                orderBy: {
                    item_id: 'asc'
                }
            });

            const hasNextPage = transactions.length > take;
            const edges: TransactionEdge[] = (hasNextPage ? transactions.slice(0, -1) : transactions).map(transaction => ({
                node: transaction,
                cursor: transaction.transaction_id, // Use the item_id as the cursor
            }));

            return { 
                edges: edges.map((item, index) => {
                    return{
                        node: item.node,
                        cursor: item.node.transaction_id
                    }
                }),
                pageInfo: {
                    hasNextPage: hasNextPage,
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
                }
            }

            return transactions;
        }
    },
    Mutation: {
        createTransaction: async (_:any, { orgId, from, to, qty, itemId, reasonId, notes }: {
            orgId: string
            from: string
            to: string
            qty: number
            itemId: string
            reasonId: string
            notes?: string
        }) => {
            const newTransaction = await prisma.transactions.create({
                data: {
                    transaction_id: randomUUID(),
                    organization_id: orgId,
                    from_location: from,
                    to_location: to,
                    qty: qty,
                    item_id: itemId,
                    reason_id: reasonId,
                    notes: notes ? notes : ''
                }
            });

            const updateQty = await prisma.$transaction([
                prisma.locations_items_qty.upsert({
                    where: {
                        location_id_item_id: {
                            location_id: from,
                            item_id: itemId
                        }
                    },
                    create: {
                        location_id: from,
                        item_id: itemId,
                        qty: qty * -1
                    },
                    update: {
                        qty: {
                            decrement: qty
                        }
                    }
                }),
                prisma.locations_items_qty.upsert({
                    where: {
                        location_id_item_id: {
                            location_id: to,
                            item_id: itemId
                        }
                    },
                    create: {
                        location_id: to,
                        item_id: itemId,
                        qty: qty
                    },
                    update: {
                        qty: {
                            increment: qty
                        }
                    }
                })
            ]);

            const { transaction_id } = newTransaction;
            return transaction_id;
        }
    },
    Transaction: {
        reason: async (parent: any, args: any, context: any) => {
            return context.loaders.reason.load(parent.reason_id);
        },
        from_location: async (parent: any, args: any, context: any) => {
            return context.loaders.location.load(parent.from_location);
        },
        to_location: async(parent: any, args: any, context: any) => {
            return context.loaders.location.load(parent.to_location);
        },
        item: async(parent: any, args: any, context: any) => {
            return context.loaders.item.load(parent.item_id);
        }
    }
}