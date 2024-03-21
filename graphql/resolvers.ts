import type { Edge, Connection, ItemArgs, TransactionArgs } from '@/types/paginationTypes';
import type { Condition, ConditionInput, FieldsEntriesInput, Item, Location, LocationItem, Reason, ReasonEmail, ReasonsFields, ReasonsFieldsEntry, Transaction, TransactionType, TransferInput, User, ZohoClientKeys, ZohoInventoryApiKeys } from "@/types/dbTypes";
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { decrypt, encrypt } from '@/lib/keys';
import crypto from 'crypto';
import { GQLContext } from '@/types/queryTypes';
import prisma from '@/lib/prisma';

export const resolvers = {
    Query: {
        getIsAdmin: async(_: any, { organizationId }: {
            organizationId: string;
        }, context: GQLContext) => {
            if (!context.userId){
                return false;
            }

            const user = await prisma.organization_users.findFirst({
                where: {
                    AND: [
                        { user_id: { equals: context.userId } },
                        { organization_id: { equals: organizationId } },
                        { active: { equals: true } },
                    ]
                }
            });

            if (!user){
                return false;
            }

            return user.role === 'admin';
        },
        getUsers: async(_: any, { organizationId, search }: {
            organizationId: string,
            search?: string
        }, context: GQLContext) => {
            const users = await prisma.organization_users.findMany({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { active: { equals: true } }
                    ]
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name:true,
                            username: true,
                            email: true,
                            admins: true
                        }
                    },
                }
            });
        
            return users;
        },
        getOrganizations: async (_: any, args: any, context: GQLContext) => {
            if (!context.userId){
                return [];
            }


            return await prisma.organizations.findMany({
                where: {
                    organization_users: {
                        some: {
                            user_id: context.userId
                        }
                    }
                }
            });
        },
        getLocations: async (_: any, { organizationId, search }: { 
            organizationId: string
            search: string 
        }, context: GQLContext) => {
            return await prisma.locations.findMany({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { name: { contains: search ? search : undefined } },
                        { active: { equals: true } }
                    ]
                },
                orderBy: [
                    { orderPriority: 'asc' },
                    { name: 'asc' }
                ]
            });
        },
        getItems: async(_: any, {organizationId, search, first, after }: ItemArgs,
                context: GQLContext) => {
            const take = first || 10000;
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
            const edges: Edge<Item>[] = (hasNextPage ? items.slice(0, -1) : items).map((item: Item) => ({
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
                    description: true
                }
            });
            return res;
        },
        getTransactions: async(_: any, { transactionInput, paginationInput }: TransactionArgs, context: GQLContext) => {
            const { organizationId, locationId, itemId, transferType, between } = transactionInput;
            const { first, after, before, last, sortColumn, sortColumnValue } = paginationInput;
            const take = first || last || 25;

            const v = [
                organizationId,
                itemId ? itemId : null,
                transferType ? (transferType === '--' ? null : transferType) : null,
                !!locationId ? locationId : null,
                !!between.from ? between.from : null,
                !!between.to ? between.to : null,
                sortColumnValue ? sortColumnValue : null,
                after,
                take + 1
            ];

            let cursorCondition = Prisma.sql` ((${v[6]} IS NULL OR ${v[7]} IS NULL) OR ((created, transaction_id) < (FROM_UNIXTIME(${v[6]} / 1000), ${v[7]}))) `;
            let orderBy = Prisma.sql` ORDER BY created DESC `;
            let reverse = false;

            if (before){
                v[7] = before;
                cursorCondition = Prisma.sql` ((${v[6]} IS NULL OR ${v[7]} IS NULL) OR ((created, transaction_id) > (FROM_UNIXTIME(${v[6]} / 1000), ${v[7]}))) `
                orderBy = Prisma.sql` ORDER BY created ASC `;
                reverse= true;
            }

            const transactions: Transaction[] = await prisma.$queryRaw`
            SELECT *
            FROM transactions
            WHERE organization_id = ${v[0]}
                AND (${v[1]} IS NULL OR item_id = ${v[1]})
                AND (${v[2]} IS NULL OR transfer_type = ${v[2]})
                AND (${v[3]} IS NULL OR (from_location = ${v[3]} OR to_location = ${v[3]}))
                AND (${v[4]} IS NULL OR ${v[4]} <= created)
                AND (${v[5]} IS NULL OR ${v[5]} >= created)
                AND ${cursorCondition}
            ${orderBy}
            LIMIT ${v[8]}`;

            const hasNextPage = first ? transactions.length > take : !!before;
            const hasPreviousPage = last ? transactions.length > take : !!after;

            if (transactions.length > take){
                transactions.pop();
            }

            if (reverse) {
                transactions.reverse();
            }

            let edges: Edge<Transaction>[] = transactions.map(transaction => ({
                node: transaction,
                cursor: transaction.transaction_id,
            }));
            

            if (!edges.length){
                return {
                    edges: [],
                    pageInfo: {
                        hasNextPage: false,
                        endCursor: '',
                        hasPreviousPage: false,
                        startCursor: ''
                    }
                }
            }

            let transactionConnection: Connection<Transaction> = { 
                edges: edges?.map((item, index) => {
                    return{
                        node: item.node,
                        cursor: item.node.transaction_id
                    }
                }),
                pageInfo: {
                    hasNextPage: hasNextPage,
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : '',
                    hasPreviousPage: hasPreviousPage,
                    startCursor: edges.length > 0 ? edges[0].cursor : '',
                    sortColumnValueStart: edges[0].node.created,
                    sortColumnValueEnd: edges[edges.length - 1].node.created
                }
            };

            return transactionConnection;
        },
        getItemsAtLocation: async (_: any, { locationId, itemId, search, first, after, last, before, includeNegative } : {
            locationId?: string;
            itemId?: string;
            search?: string;
            first?: number;
            after?: string;
            last?: number;
            before?: string;
            includeNegative: boolean;
        }, context: GQLContext) => {
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
                        { items: { name: { contains: search ? search : undefined } } },
                        { locations: { active: { equals: true } } },
                        (!!locationId ? { location_id: { equals: locationId } } : {}),
                        (!!itemId ? { item_id: { equals: itemId } } : {})
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

            const edges: Edge<LocationItem>[] = (hasNextPage || hasPreviousPage ? items.slice(0, -1) : items).map((li: any) => ({
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
                    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : '',
                    hasPreviousPage: hasPreviousPage,
                    startCursor: edges.length > 0 ? edges[0].cursor : ''
                }
            }

            return locationItemConnection;
        },
        getTransactionTypes: async (_:any, { organizationId }: {
            organizationId: string
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
            return prisma.conditions.findMany({
                where: {
                    AND: [
                        { condition_field: { equals: conditionField } },
                        { active: { equals: true } }
                    ]
                }
            });
        },
        getFieldTypes: async(_:any, args: any, context: GQLContext) => {
            return prisma.field_types.findMany();
        },
        getOtherReasonFields: async(_:any, { reasonId, reasonFieldId }: {
            reasonId: string;
            reasonFieldId?: string;
        }, context: GQLContext) => {
            return await prisma.reasons_fields.findMany({
                where: {
                    AND: [
                        { reason_id: { equals: reasonId } },
                        { reasons_fields_id: { not: reasonFieldId } },
                        { active: { equals: true } }
                    ]
                }
            });
        },
        getZohoClientKeys: async(_:any, { organizationId }: {
            organizationId: string;
        }, context: GQLContext): Promise<ZohoInventoryApiKeys> => {
            const keys = await prisma.zoho_inventory_keys.findFirst({
                where: {
                    organization_id: {
                        equals: organizationId
                    }
                }
            });

            if (!keys || !keys.iv || !keys.zoho_inventory_keys_id){
                return {
                    zoho_inventory_keys_id: '',
                    client_id: '',
                    client_secret: '',
                    organization_id: organizationId,
                    iv:''
                }
            }

            const decryptedClientId = keys.client_id ? decrypt(keys.client_id, keys.iv) : '';
            const decryptedClientSecret = keys.client_secret ? decrypt(keys.client_secret, keys.iv) : '';

            return {
                zoho_inventory_keys_id: keys.zoho_inventory_keys_id,
                client_id: decryptedClientId,
                client_secret: decryptedClientSecret,
                organization_id: organizationId,
                iv:''
            };
        },
        getLastItemSync: async (_: any, { organizationId }: {
            organizationId: string;
        }, context: GQLContext) => {
            return await prisma.item_sync_logs.findFirst({
                where: {
                    organization_id: { equals: organizationId }
                },
                orderBy: {
                    created: 'desc'
                }
            });
        }
    },
    Mutation: {
        updateUserRole: async(_: any, { organizationId, userId, role }: {
            organizationId: string;
            userId: string;
            role: string;
        }, context: GQLContext): Promise<boolean> => {
            if (!context.userId) {
                return false;
            }

            const getUser = await prisma.organization_users.findFirst({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { user_id: { equals: context.userId as string } },
                        { active: { equals: true } },
                        { role: { in: ['admin', 'owner'] }}
                    ]
                }
            });

            if (!getUser) {
                return false;
            }

            const updateUser = await prisma.organization_users.update({
                data: {
                    role: role
                },
                where: {
                    organization_id_user_id: {
                        organization_id: organizationId,
                        user_id: userId
                    }
                }
            });

            return updateUser.role === role;
        },
        deleteOrgUser: async(_: any, { organizationId, userId }: {
            organizationId: string;
            userId: string;
        }, context: GQLContext): Promise<boolean> => {
            if (!context.userId) {
                return false;
            }

            const getUser = await prisma.organization_users.findFirst({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { user_id: { equals: context.userId as string } },
                        { active: { equals: true } },
                        { role: { in: ['admin', 'owner'] }}
                    ]
                }
            });

            if (!getUser) {
                return false;
            }

            const removeUser = await prisma.organization_users.update({
                data: {
                    active: false,
                },
                where: {
                    organization_id_user_id: {
                        organization_id: organizationId,
                        user_id: userId
                    }
                }
            });

            return !removeUser.active;
        },
        createOrganization: async(_: any, { name }: {
            name: string;
        }, context: GQLContext) => {
            if (!name || !context?.userId){
                return {
                    organization_id: '',
                }
            }

            const newOrganization = await prisma.organizations.create({
                data: {
                    organization_id: randomUUID(),
                    name: name
                }
            });

            const addUser = await prisma.organization_users.upsert({
                create: {
                    organization_id: newOrganization.organization_id,
                    user_id: context.userId,
                    role: 'admin',
                },
                update: {
                    active: true,
                    role: 'admin',
                },
                where: {
                    organization_id_user_id: {
                        organization_id: newOrganization.organization_id,
                        user_id: context.userId
                    }
                }
            });

            const _types: TransactionType[] = ['transfer', 'pull', 'push', 'remove'].map((e: string) => {
                return {
                    organization_id: newOrganization.organization_id,
                    type: e,
                    transaction_type_id: randomUUID(),
                    description: ''
                }
            })

            const types = await prisma.transaction_types.createMany({
                data: _types,
            });

            return newOrganization;
        },
        acceptOrgInvite: async(_: any, { inviteId }: {
            inviteId: string
        }, context: GQLContext) => {
            const invite = await prisma.user_invite_requests.update({
                data: {
                    active: false,
                    modified: new Date()
                },
                where: {
                    invite_id: inviteId
                }
            });

            const userId = context?.userId ?? '';
            if (!invite?.invite_id || context.userId) {
                return false;
            }

            const added = await prisma.organization_users.upsert({
                update: {
                    active: true,
                    role: 'user'
                },
                where: {
                    organization_id_user_id: {
                        user_id: userId,
                        organization_id: invite.organization_id
                    }
                },
                create: {
                    organization_id: invite.organization_id,
                    user_id: userId,
                    role: 'user'
                }
            });

            return true;
        },
        addOrgUser: async(_: any, { organizationId, email }: {
            organizationId: string;
            email: string;
        }, context: GQLContext) => {

            let inviteId: string = '';
            let emailInvite: boolean = false;

            const inviteExists = await prisma.user_invite_requests.findFirst({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { email: { equals: email } }
                    ]
                }
            });

            if (inviteExists?.invite_id){
                const invite = await prisma.user_invite_requests.update({
                    data: {
                        active: true,
                        modified: new Date(),
                    },
                    where: {
                        invite_id: inviteExists.invite_id
                    },
                    select: {
                        invite_id: true,
                        organizations:{
                            select: {
                                name: true
                            }
                        },
                        email: true,
                        organization_id: true
                    }
                });

                const emailData = await sendInviteEmail({
                    inviteId: invite.invite_id,
                    orgId: organizationId,
                    email: email,
                    orgName: invite.organizations.name,
                    context: context
                })

                return {
                    added: true,
                    message: email + ' has been invited to join the organization.',
                    invite: invite,
                }
            }

            const userExists = await prisma.user.findFirst({
                where: {
                    email: { equals: email }
                }
            });

            if (userExists){
                const invite = await prisma.user_invite_requests.create({
                    data: {
                        invite_id: randomUUID(),
                        organization_id: organizationId,
                        email: email
                    }
                });

                return {
                    added: true,
                    message: email + ' has been invited to join the organization.',
                    invite: invite,
                }
            }

            const user = await prisma.organization_users.findFirst({
                where: {
                    AND: [
                        { organization_id: { equals: organizationId } },
                        { users: {
                            email: { equals: email } }
                        },
                        { active: { equals: true } }
                    ]
                }
            });

            if (user?.active === true){
                return {
                    added: false,
                    message: 'A user with that email is already a member of the organization.'
                }
            }

            const invite = await prisma.user_invite_requests.create({
                data: {
                    invite_id: randomUUID(),
                    organization_id: organizationId,
                    email: email
                },
                select: {
                    invite_id: true,
                    organizations: {
                        select: {
                            name: true
                        }
                    },
                    email: true,
                    organization_id: true
                }
            });

            const emailData = await sendInviteEmail({
                inviteId: invite.invite_id,
                orgId: organizationId,
                email: email,
                orgName: invite.organizations.name,
                context: context
            })

            return {
                added: true,
                message: email + ' has been invited to join the organization.',
                invite: invite,
            }
        },
        createItemSyncLog: async (_: any, { organizationId }: {
            organizationId: string;
        }, context: GQLContext) => {
            return await prisma.item_sync_logs.create({
                data: {
                    item_sync_log_id: randomUUID(),
                    organization_id: organizationId
                }
            });
        },
        updateItemSyncLog: async (_: any, { item_sync_log_id, items_added, items_updated, total_items, status }: {
            item_sync_log_id: string;
            items_added?: number;
            items_updated?: number;
            total_items?: number;
            status?: string;
        }, context: GQLContext) => {
            return await prisma.item_sync_logs.update({
                where: {
                    item_sync_log_id: item_sync_log_id
                },
                data: {
                    items_added: items_added,
                    items_updated: items_updated,
                    total_items: total_items,
                    status: status
                }
            });
        },
        upsertZohoClientKeys: async(_: any, { organizationId, zohoClientInput }: {
            organizationId: string;
            zohoClientInput: ZohoClientKeys
        }, context: GQLContext) => {
            if (!organizationId){
                return false;
            }
            

            const getIv = await prisma.zoho_inventory_keys.findFirst({
                where: {
                    organization_id: { equals: zohoClientInput.zohoInventoryKeysId }
                }
            });

            let iv = crypto.randomBytes(16);
            if (getIv?.iv){
                iv = Buffer.from(getIv.iv, 'hex');
            }

            const encryptedClientId = encrypt(zohoClientInput.clientId, iv);
            const encryptedClientSecret = encrypt(zohoClientInput.clientSecret, iv);

            const added = await prisma.zoho_inventory_keys.upsert({
                where: {
                    zoho_inventory_keys_id: zohoClientInput.zohoInventoryKeysId
                },
                update: {
                    client_id: encryptedClientId.key,
                    client_secret: encryptedClientSecret.key,
                    iv: iv.toString('hex')
                },
                create: {
                    zoho_inventory_keys_id: randomUUID(),
                    client_id: encryptedClientId.key,
                    client_secret: encryptedClientSecret.key,
                    organization_id: organizationId,
                    iv: iv.toString('hex')
                },
                select: {
                    zoho_inventory_keys_id: true
                }
            });

            return added;
        },
        createTransaction: async (_:any, { orgId, transferInput, fieldEntries, transferType }: {
            orgId: string;
            transferInput: TransferInput;
            fieldEntries: FieldsEntriesInput[];
            transferType: string;
        }, context: GQLContext) => {

            if (!context.userId){
                context.userId = '0';
                //needs to error handle
            }

            const transactionId = randomUUID().toString();
            const entries: ReasonsFieldsEntry[] = fieldEntries.map((e: FieldsEntriesInput): ReasonsFieldsEntry => {
                return {
                    transaction_id: transactionId,
                    reasons_fields_id: e.field_name,
                    field_value: e.value
                }
            })

            
            let [transaction, _0] = await prisma.$transaction([
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
                        created_by: context.userId
                    },
                    select:{ 
                        created: true,
                        reasons: {
                            select: {
                                name:true
                            }
                        }
                    }
                }),
                prisma.reasons_fields_entries.createMany({
                    data: entries,
                }),
            ]);

            let [fromLocation, toLocation, fields] = await prisma.$transaction([
                prisma.locations_items_qty.upsert({
                    where: {
                        location_id_item_id: {
                            location_id: transferInput.from,
                            item_id: transferInput.itemId
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
                    },
                    select: {
                        locations: {
                            select: {
                                name: true
                            }
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
                    },
                    select: {
                        items: {
                            select: {
                                name: true,
                                sku: true
                            }
                        },
                        locations: {
                            select: {
                                name: true
                            }
                        }
                    }
                }),
                prisma.reasons_fields_entries.findMany({
                    where: {
                        transaction_id: transactionId
                    },
                    select: {
                        reasons_fields: {
                            select: {
                                field_name: true,
                            }
                        },
                        field_value: true
                    }
                })
            ]);

            const email = await prisma.reasons.findFirst({
                where: {
                    reason_id: {
                        equals: transferInput.reasonId
                    }
                },
                select: {
                    name: true,
                    sends_email: true,
                    reason_emails: {
                        select: {
                            email: true
                        },
                        where: {
                            active: true
                        }
                    }
                }
            });

            let ret = {
                transactionId: transactionId,
                sentEmails: false,
                accepted: [],
                rejected: []
            }

            if (email?.sends_email){
                const scheme = context.req.headers.get('x-forwarded-proto');
                const host = context.req.headers.get('host');
                
                try {
                    const result = await fetch(`${scheme ?? 'http'}://${host}/api/email`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            transaction: {
                                id: transactionId,
                                url: `${scheme ?? 'http'}://${host}/i/transactions/`,//${transactionId}`,
                            },
                            type: transferType,
                            emails: email?.reason_emails?.map((e: any) => {
                                return e.email;
                            }) ?? [],
                            date: transaction.created,
                            reason: {
                                name: transaction.reasons.name
                            },
                            locations: {
                                from: fromLocation.locations.name,
                                to: toLocation.locations.name
                            },
                            item: {
                                name: toLocation.items.name,
                                qty: transferInput.qty,
                                sku: toLocation.items.sku
                            },
                            fields: fields.map((e: any) => {
                                return {
                                    key: e.reasons_fields.field_name,
                                    value: e.field_value
                                }
                            })

                        })
                    });

                    const json = await result.json();
                    ret = {
                        ...ret,
                        ...json
                    }

                } catch (e) {
                    //handle exception
                }
            }

            return ret;
        },
        updateReasonName: async (_: any, { reasonId, newName }: {
            reasonId: string
            newName: string
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {

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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
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
        }, context: GQLContext) => {
            const res = await prisma.conditions.update({
                data: {
                    active: false
                },
                where: {
                    condition_id: conditionId
                }
            });
        },
        createReasonEmail: async(_: any, { reasonId, email }: {
            reasonId: string,
            email: string
        }, context: GQLContext) => {
            const reasonEmailId = randomUUID();
            const added = await prisma.reason_emails.create({
                data: {
                    reason_id: reasonId,
                    email: email,
                    reason_email_id: reasonEmailId
                }
            });

            return reasonEmailId;
        },
        deleteReasonEmail: async(_: any, { reasonEmailId }: {
            reasonEmailId: string;
        }, context: GQLContext) => {
            const removed = await prisma.reason_emails.update({
                data: {
                    active: false,
                    modified: new Date()
                },
                where: {
                    reason_email_id: reasonEmailId
                }
            });

            return true;
        },
        createLocation: async(_: any, { locationName, organizationId, isWarehouse }: {
            locationName: string;
            organizationId: string;
            isWarehouse: boolean;
        }, context: GQLContext) => {
            const location = await prisma.locations.create({
                data: {
                    location_id: randomUUID(),
                    organization_id: organizationId,
                    name: locationName,
                    view_all_items: isWarehouse,
                    orderPriority: isWarehouse ? 2 : 1
                }
            });

            return location;
        },
        updateLocationCategory: async(_: any, { locationId,  isWarehouse }: {
            locationId: string;
            locationName: string;
            isWarehouse: boolean;
        }, context: GQLContext) => {
            const location = await prisma.locations.update({
                data: {
                    orderPriority: isWarehouse ? 2 : 1,
                    view_all_items: isWarehouse
                },
                where: {
                    location_id: locationId
                }
            });

            return location;
        },
        updateLocationName: async(_: any, { locationId, locationName }: {
            locationId: string;
            locationName: string;
            isWarehouse: boolean;
        }, context: GQLContext) => {
            const location = await prisma.locations.update({
                data: {
                    name: locationName,
                },
                where: {
                    location_id: locationId
                }
            });

            return location;
        },
        deleteLocation: async(_: any, { locationId }: {
            locationId: string;
        }, context: GQLContext) => {
            const location = await prisma.locations.update({
                data: {
                    active: false,
                },
                where: {
                    location_id: locationId
                }
            });

            return !location.active;
        }
    },
    Transaction: {
        reason: async (parent: Transaction, args: any, context: GQLContext) => {
            return context.loaders.reason.load(parent.reason_id);
        },
        from_location: async (parent: Transaction, args: any, context: GQLContext) => {
            return context.loaders.location.load(parent.from_location);
        },
        to_location: async(parent: Transaction, args: any, context: GQLContext) => {
            return context.loaders.location.load(parent.to_location);
        },
        item: async(parent: any, args: any, context: GQLContext) => {
            return context.loaders.item.load(parent.item_id);
        },
        entries: async(parent: Transaction, args: any, context: GQLContext) => {
            return context.loaders.transactionFieldEntries.load(parent.transaction_id);
        },
        created_by: async(parent: Transaction, args: any, context: GQLContext) => {
            return context.loaders.user.load(parent.created_by);
        }
    },
    Reason: {
        reasons_fields: async(parent: Reason, args: any, context: any) => {
            return context.loaders.reasonFields.load(parent.reason_id);
        },
        transaction_type: async(parent:Reason, args:any, context:any) => {
            return context.loaders.transactionTypes.load(parent.transaction_type_id);
        },
        reason_emails: async(parent: Reason, args: any, context:any) => {
            return context.loaders.reasonEmails.load(parent.reason_id);
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


const sendInviteEmail = async ({ inviteId, orgId, orgName, email, context }: {
    inviteId: string;
    orgId: string;
    orgName: string;
    email: string;
    context: GQLContext;
}): Promise<object> => {
    const scheme = context.req.headers.get('x-forwarded-proto');
    const host = context.req.headers.get('host');
    
    try {
        const result = await fetch(`${scheme ?? 'http'}://${host}/api/email/invite`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                url: (scheme ?? 'http') + '://' + host + '/register?inviteId=' + inviteId + '&organizationId=' + orgId + '&email=' + email,
                orgName: orgName,
            })
        });

        return await result.json();

    } catch (e) {
        //handle exception
    }

    return {
        error: 'Could not send an invite email'
    }
}