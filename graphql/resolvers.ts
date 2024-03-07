import prisma from '@/lib/prisma';
import type { Edge, Connection, ItemArgs, TransactionArgs } from '@/types/paginationTypes';
import type { Condition, ConditionInput, FieldsEntriesInput, Item, Location, LocationItem, Reason, ReasonsFields, ReasonsFieldsEntry, Transaction, TransferInput, User } from "@/types/dbTypes";
import { randomUUID } from 'crypto';

export const resolvers = {
    Query: {
        getUsers: async(_: any, { organizationId, role, search, first, after }: {
            organizationId: string,
            role?: string
            search?: string
            first?: number
            after?: string
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

            const users = await prisma.organization_users.findMany({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { active: { equals: true } },
                        {
                            users: { 
                                AND: [
                                    { active: { equals: true } },
                                    {
                                        OR: [
                                            { username: { contains: search ? search: undefined } },
                                            { name: { contains: search ? search : undefined } },
                                            { email: { contains: search ? search : undefined } }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                select: {
                    user_id: true,
                    users: {
                        select: {
                            user_id: true,
                            username: true,
                            email: true,
                            name:true
                        }
                    }
                }
            });

            

            const hasNextPage = users.length > take;
            const edges: Edge<User>[] = (hasNextPage ? users.slice(0, -1) : users).map(user => {
                return {
                     node: user.users,
                    cursor: user.user_id
                }
            });

            const res = { 
                edges: edges.map((item, index) => {
                    return{
                        node: item.node,
                        cursor: item.node.user_id
                    }
                }),
                pageInfo: {
                    hasNextPage: hasNextPage,
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
                }
            }

            return res;
        },
        getOrganizations: async () => {
            return await prisma.organizations.findMany();
        },
        getLocations: async (_: any, { organizationId, search }: { 
            organizationId: string
            search: string 
        }) => {
            return await prisma.locations.findMany({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { name: { contains: search ? search : undefined } }
                    ]
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
            const res = await prisma.reasons.findMany({
                where: {
                    AND: [
                        { transaction_type_id: { equals: transactionTypeId } },
                        { active: { equals: true } }
                    ]
                },
                select: {
                    reason_id: true,
                    name: true,
                    sends_email:true,
                    reasons_fields: true,
                }
            });
            return res;
        },
        getTransactions: async(_: any, { organizationId, locationId, itemId, first, after, transferType, before, last }: TransactionArgs) => {
            const take = first || last || 25;
            let cursorCondition = {};

            type sort_order = 'asc'|'desc';
            let order: sort_order = 'asc';

            if (after) {
                cursorCondition = {
                    item_id: {
                        gt: after
                    }
                }
            }

            if (before) {
                cursorCondition = {
                    item_id: {
                        lt: before
                    }
                };
                order = 'desc';
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
                    created: 'desc'
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
        getItemsAtLocation: async (_: any, { locationId, search, first, after, last, before, includeNegative } : {
            locationId: string;
            search?: string;
            first?: number;
            after?: string;
            last?: number;
            before?: string;
            includeNegative: boolean;
        }) => {
            const take = first || last || 25;
            let cursorCondition = {};

            type sort_order = 'asc'|'desc';
            let order: sort_order = 'asc';

            if (after) {
                cursorCondition = {
                    item_id: {
                        gt: after
                    }
                }
            }

            if (before) {
                cursorCondition = {
                    item_id: {
                        lt: before
                    }
                };
                order = 'desc';
            }

            const items = await prisma.locations_items_qty.findMany({
                where: {
                    AND: [
                        { qty: includeNegative ? { not: 0 } : { gt: 0 } },
                        { location_id: { equals: locationId } },
                        { items: { name: { contains: search ? search : undefined } } },
                        { locations: { active: { equals: true } } }
                    ]
                },
                select: {
                    item_id: true,
                    items: true,
                    locations: true,
                    qty: true
                },
                take: take + 1,
                orderBy: {
                    item_id: order
                }
            });


            const hasNextPage = first ? items.length > take : false;
            const hasPreviousPage = last ? items.length > take : false;

            if (before) {
                items.reverse();
            }

            const edges: Edge<LocationItem>[] = (hasNextPage || hasPreviousPage ? items.slice(0, -1) : items).map(li => ({
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
        },
        getConditionTypes: async(_:any, { targetDataType }: {
            targetDataType: string
        }) => {
            return await prisma.condition_types.findMany({
                where: {
                    target_data_type: {
                        equals: targetDataType
                    }
                }
            });
        },
        getFieldConditions: async(_:any, { conditionField }: {
            conditionField: string
        }) => {
            return prisma.conditions.findMany({
                where: {
                    AND: [
                        { condition_field: { equals: conditionField } },
                        { active: { equals: true } }
                    ]
                }
            });
        },
        getFieldTypes: async(_:any) => {
            return prisma.field_types.findMany();
        },
        getOtherReasonFields: async(_:any, { reasonId, reasonFieldId }: {
            reasonId: string;
            reasonFieldId?: string;
        }) => {
            return await prisma.reasons_fields.findMany({
                where: {
                    AND: [
                        { reason_id: { equals: reasonId } },
                        { reasons_fields_id: { not: reasonFieldId } },
                        { active: { equals: true } }
                    ]
                }
            });
        }
    },
    Mutation: {
        createTransaction: async (_:any, { orgId, transferInput, fieldEntries, transferType }: {
            orgId: string;
            transferInput: TransferInput;
            fieldEntries: FieldsEntriesInput[];
            transferType: string;
        }) => {
            const transactionId = randomUUID().toString();
            const entries: ReasonsFieldsEntry[] = fieldEntries.map((e: FieldsEntriesInput): ReasonsFieldsEntry => {
                return {
                    transaction_id: transactionId,
                    reasons_fields_id: e.field_name,
                    field_value: e.value
                }
            })

            const createTransaction = await prisma.$transaction([
                prisma.transactions.create({
                    data: {
                        transaction_id: transactionId,
                        organization_id: orgId,
                        from_location: transferInput.from,
                        to_location: transferInput.to,
                        qty: transferInput.qty,
                        item_id: transferInput.itemId,
                        reason_id: transferInput.reasonId,
                        transfer_type: transferType,
                    }
                }),
                prisma.reasons_fields_entries.createMany({
                    data: entries
                })
            ]);

            const updateQty = await prisma.$transaction([
                prisma.locations_items_qty.upsert({
                    where: {
                        location_id_item_id: {
                            location_id: transferInput.from,
                            item_id: transferInput.to
                        }
                    },
                    create: {
                        location_id: transferInput.from,
                        item_id: transferInput.itemId,
                        qty: transferInput.qty * -1
                    },
                    update: {
                        qty: {
                            decrement: transferInput.qty
                        }
                    }
                }),
                prisma.locations_items_qty.upsert({
                    where: {
                        location_id_item_id: {
                            location_id: transferInput.to,
                            item_id: transferInput.itemId
                        }
                    },
                    create: {
                        location_id: transferInput.to,
                        item_id: transferInput.itemId,
                        qty: transferInput.qty
                    },
                    update: {
                        qty: {
                            increment: transferInput.qty
                        }
                    }
                })
            ]);

            return transactionId;
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
        createReasonField: async(_:any, { reasonId, fieldName, fieldType, conditions }: {
            reasonId: string;
            fieldName: string;
            fieldType: string;
            conditions: ConditionInput[]
        }) => {

            const res = await prisma.reasons_fields.create({
                data: {
                    reasons_fields_id: randomUUID(),
                    reason_id: reasonId,
                    field_name: fieldName,
                    field_type: fieldType
                }
            });

            
            const conditionField = res.reasons_fields_id;
            await prisma.conditions.deleteMany({
                where: {
                    condition_field: { equals: conditionField }
                }
            });

            const addedConditions = await prisma.conditions.createMany({
                data: conditions.map(e => {
                    const id = e?.new ? randomUUID() : e.condition_id;
                    return {
                        condition_id: id,
                        condition_field: conditionField,
                        dependent_field: e.dependent_field,
                        required_value: e.required_value,
                        condition_type_id: e.condition_type_id
                    }
                })
            });
            return {
                ...res,
                conditions: addedConditions
            }
        },
        updateReasonField: async(_: any, { reasonFieldId, fieldName, fieldType, conditions }: {
            reasonFieldId: string;
            fieldName: string;
            fieldType: string;
            conditions: any[];
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

            const conditionField = res.reasons_fields_id;
            await prisma.conditions.deleteMany({
                where: {
                    condition_field: { equals: conditionField }
                }
            });

            const addedConditions = await prisma.conditions.createMany({
                data: conditions.map(e => {
                    const id = e?.new ? randomUUID() : e.condition_id;
                    return {
                        condition_id: id,
                        condition_field: conditionField,
                        dependent_field: e.dependent_field,
                        required_value: e.required_value,
                        condition_type_id: e.condition_type_id
                    }
                })
            });

            return {
                ...res,
                conditions: addedConditions,
                updated: res?.field_name === fieldName
                    && res?.field_type === fieldType
            };
        },
        deleteReasonField: async(_:any, { reasonFieldId }: {
            reasonFieldId: string
        }) => {
            const res = await prisma.reasons_fields.update({
                data: {
                    active: false
                },
                where: {
                    reasons_fields_id: reasonFieldId
                },
                select: {
                    active: true
                }
            });

            return !res.active;
        },
        createReason: async (_:any, { reasonName, transactionTypeId, description }: {
            reasonName: string;
            transactionTypeId: string;
            description?: string;
        }) => {
            const res = await prisma.reasons.create({
                data: {
                    reason_id: randomUUID(),
                    transaction_type_id: transactionTypeId,
                    name: reasonName,
                    description: description
                }
            });

            return res;
        },
        deleteReason: async(_:any, { reasonId }: {
            reasonId: string
        }) => {
            const res = await prisma.reasons.update({
                data: {
                    active: false
                },
                where: {
                    reason_id: reasonId
                }
            });

            return res.active === false;
        },
        updateReasonSendsEmail: async (_:any, { reasonId, sendsEmail }: {
            reasonId: string;
            sendsEmail: boolean;
        }) => {
            const res = await prisma.reasons.update({
                data: {
                    sends_email: sendsEmail
                },
                where: {
                    reason_id: reasonId
                }
            });

            return res.sends_email === sendsEmail;
        },
        createFieldCondition: async(_: any, { conditionField, dependentField, requiredValue, conditionTypeId }: {
            conditionField: string;
            dependentField: string;
            requiredValue: string;
            conditionTypeId: string;
        }) => {
            return await prisma.conditions.create({
                data: {
                    condition_id: randomUUID(),
                    condition_field: conditionField,
                    dependent_field: dependentField,
                    required_value: requiredValue,
                    condition_type_id: conditionTypeId
                }
            });
        },
        updateFieldCondition: async(_: any, { conditionId, requiredValue, conditionTypeId }: {
            conditionId: string;
            requiredValue: string;
            conditionTypeId: string;
        }) => {
            const res = await prisma.conditions.update({
                data: {
                    required_value: requiredValue,
                    condition_type_id: conditionTypeId
                },
                where: {
                    condition_id: conditionId
                }
            });

            return res.required_value === requiredValue &&
                res.condition_type_id === conditionTypeId;
        },
        deleteFieldCondition: async(_: any, { conditionId }: {
            conditionId: string
        }) => {
            const res = await prisma.conditions.update({
                data: {
                    active: false
                },
                where: {
                    condition_id: conditionId
                }
            });
        },
    },
    Transaction: {
        reason: async (parent: Transaction, args: any, context: any) => {
            return context.loaders.reason.load(parent.reason_id);
        },
        from_location: async (parent: Transaction, args: any, context: any) => {
            return context.loaders.location.load(parent.from_location);
        },
        to_location: async(parent: Transaction, args: any, context: any) => {
            return context.loaders.location.load(parent.to_location);
        },
        item: async(parent: any, args: any, context: any) => {
            return context.loaders.item.load(parent.item_id);
        },
        entries: async(parent: Transaction, args: any, context: any) => {
            return context.loaders.transactionFieldEntries.load(parent.transaction_id);
        }
    },
    Reason: {
        reasons_fields: async(parent: Reason, args: any, context: any) => {
            return context.loaders.reasonFields.load(parent.reason_id);
        },
        transaction_type: async(parent:Reason, args:any, context:any) => {
            return context.loaders.transactionTypes.load(parent.transaction_type_id);
        }
    },
    ReasonFields: {
        conditions: async (parent:ReasonsFields, args: any, context: any) => {
            return context.loaders.condition.load(parent.reasons_fields_id);
        },
        // entries: async (parent: ReasonsFields, args: any, context: any) => {
        //     return context.loaders.fieldEntries.load(parent.reasons_fields_id);
        // }
    },
    Condition: {
        condition_field: async(parent: Condition, args: any, context: any) => {
            return context.loaders.conditionReasonField.load(parent.condition_field);
        },
        dependent_field: async(parent: Condition, args: any, context: any) => {
            return context.loaders.conditionReasonField.load(parent.dependent_field);
        },
        condition_type: async(parent: Condition, args: any, context:any) => {
            return context.loaders.conditionType.load(parent.condition_type_id);
        }
    }
}