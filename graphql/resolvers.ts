import prisma from '@/lib/prisma';
import type { Edge, Connection, ItemArgs, TransactionArgs } from '@/types/paginationTypes';
import type { Item, Location, LocationItem, Transaction } from "@/types/dbTypes";
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
                },
                orderBy: [
                    { orderPriority: 'asc' },
                    { name: 'asc' }
                ]
            });
        },
        getItems: async(_: any, {organizationId, search, first, after }: ItemArgs) => {
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
            const edges: Edge<Item>[] = (hasNextPage ? items.slice(0, -1) : items).map(item => ({
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
            const gg = await prisma.reasons.findMany({
                where: {
                    transaction_type_id: {
                        equals: transactionTypeId
                    }
                },
                select: {
                    reason_id: true,
                    name: true,
                    requires_project: true,
                    reasons_fields: true,
                }
            });
            //console.log(gg);
            return gg;
        },
        getTransactions: async(_: any, { organizationId, locationId, itemId, first, after, transferType }: TransactionArgs) => {
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
                        { transfer_type: { equals: transferType && transferType !== '--' ? transferType : undefined } },
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
            const edges: Edge<Transaction>[] = (hasNextPage ? transactions.slice(0, -1) : transactions).map(transaction => ({
                node: transaction,
                cursor: transaction.transaction_id,
            }));

            let transactionConnection: Connection<Transaction> = { 
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
            };

            return transactionConnection;
        },
        getItemsAtLocation: async (_: any, { locationId, search, first, after } : {
            locationId: string
            search?: string
            first?: number
            after?: string
        }) => {
            const take = first || 25;
            let cursorCondition = {};

            if (after) {
                cursorCondition = {
                    item_id: {
                        gt: after
                    }
                }
            }

            const items = await prisma.locations_items_qty.findMany({
                where: {
                    qty: {
                        gt: 0
                    },
                    location_id: locationId,
                    items: {
                        name: {
                            contains: search ? search : undefined,
                        }
                    }
                },
                select: {
                    item_id: true,
                    items: true,
                    locations: true,
                    qty: true
                },
                take: take + 1,
                orderBy: {
                    item_id: 'asc'
                }
            });


            const hasNextPage = items.length > take;
            const edges: Edge<LocationItem>[] = (hasNextPage ? items.slice(0, -1) : items).map(li => ({
                node: {
                    item: li.items,
                    location: li.locations,
                    qty: li.qty
                },
                cursor: li.item_id, // Use the item_id as the cursor
            }));

            let locationItemConnection: Connection<LocationItem> = {
                edges: edges.map((item: any, index: number) => {
                    return {
                        node: item.node,
                        cursor: item.node.item_id
                    }
                }),
                pageInfo: {
                    hasNextPage: hasNextPage,
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
                }
            }

            return locationItemConnection;
        },
        getTransactionTypes: async (_:any, { organizationId }: {
            organizationId: string
        }) => {
            return await prisma.transaction_types.findMany({
                where: {
                    organization_id: {
                        equals: organizationId
                    }
                }
            });
        }
    },
    Mutation: {
        createTransaction: async (_:any, { orgId, from, to, qty, itemId, reasonId, notes, transferType, project }: {
            orgId: string
            from: string
            to: string
            qty: number
            itemId: string
            reasonId: string
            notes?: string
            transferType: string
            project: string
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
                    notes: notes ? notes : '',
                    transfer_type: transferType,
                    project_id: project
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
        },
        updateReasonName: async (_: any, { reasonId, newName }: {
            reasonId: string
            newName: string
        }) => {
            const res = await prisma.reasons.update({
                data: {
                    name: newName
                },
                where: {
                    reason_id: reasonId
                }
            });

            return res?.name === newName;
        },
        updateReasonField: async(_: any, { reasonFieldId, fieldName, fieldType }: {
            reasonFieldId: string
            fieldName: string,
            fieldType: string
        }) => {
            const res = await prisma.reasons_fields.update({
                data: {
                    field_name: fieldName,
                    field_type: fieldType
                },
                where: {
                    reasons_fields_id: reasonFieldId
                }
            });

            return {
                ...res,
                updated: res?.field_name === fieldName
                    && res?.field_type === fieldType
            };
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
    },
    Reason: {
        reasons_fields: async(parent: any, args: any, context: any) => {
            return context.loaders.reasonFields.load(parent.reason_id);
        }
    }
}