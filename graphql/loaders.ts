import DataLoader from 'dataloader';
import prisma from '@/lib/prisma';
import { ReasonsFields, User } from '@/types/dbTypes';

const batchLocations = async (locationIds: any) => {
    const locations = await prisma.locations.findMany({
        where: {
            AND: [
                { location_id: { in: locationIds } },
                { active: { equals: true } }
            ]
        }
    });

    const locationMap: any = {};
    locations.forEach((location) => {
        locationMap[location.location_id] = location;
    });

    return locationIds.map((id: string) => locationMap[id]);
}

const batchItems = async (itemIds: any) => {
    const items = await prisma.items.findMany({
        where: {
            item_id: {
                in: itemIds
            }
        }
    });

    const itemMap: any = {};
    items.forEach((item) => {
        itemMap[item.item_id] = item;
    });

    return itemIds.map((id: string) => itemMap[id]);
}


const batchTransactions = async (transactionIds:any) => {
    const transactions = await prisma.transactions.findMany({
        where: {
            transaction_id: {
                in: transactionIds
            }
        }
    });

    const transactionMap: any = {};
    transactions.forEach((transaction) => {
        transactionMap[transaction.transaction_id] = transaction;
    });

    return transactionIds.map((id: string) => transactionMap[id]);
}

const batchReasons = async (reasonIds: any) => {
    const reasons = await prisma.reasons.findMany({
        where: {
            AND: [
                { reason_id: { in: reasonIds } },
                { active: { equals: true } }
            ]
        }
    });

    const reasonMap: any = {};
    reasons.forEach((reason) => {
        reasonMap[reason.reason_id] = reason;
    })

    const res =reasonIds.map((id: string) => reasonMap[id]);
    return res;
}

const batchReasonsFields = async(reasonsFieldsIds: any) => {
    const reasonsFields = await prisma.reasons_fields.findMany({
        where: {
            AND: [
                { reason_id: { in: reasonsFieldsIds } },
                { active: { equals: true } }
            ]
        }
    });

    const reasonsFieldsMap: any = {};
    reasonsFields.forEach((reasonField) => {
        if (!reasonsFieldsMap[reasonField.reason_id]){
            reasonsFieldsMap[reasonField.reason_id] = [];
        }
        reasonsFieldsMap[reasonField.reason_id].push(reasonField);
    })

    const res = reasonsFieldsIds.map((id: string) => reasonsFieldsMap[id] ?? []);
    return res;
}

const batchTransactionTypes = async(transactionTypeIds: any) => {
    const transactionTypes = await prisma.transaction_types.findMany({
        where: {
            transaction_type_id: {
                in: transactionTypeIds
            },
        }
    });

    const transactionTypesMap: any = {};
    transactionTypes.forEach((transactionType) => {
        if (!transactionTypesMap[transactionType.transaction_type_id]) {
            transactionTypesMap[transactionType.transaction_type_id] = [];
        }
        transactionTypesMap[transactionType.transaction_type_id].push(transactionType);
    })

    const res = transactionTypeIds.map((id: string) => transactionTypesMap[id] ?? []);
    return res;
}

const batchConditions = async (reasonFieldsIds: any) => {
    const conditions = await prisma.conditions.findMany({
        where: {
            AND: [
                { condition_field: { in: reasonFieldsIds } },
                { active: { equals: true } }
            ]
        }
    });

    const conditionsMap: any = {};
    conditions.forEach((condition) => {
        if (!conditionsMap[condition.condition_field]){
            conditionsMap[condition.condition_field] = [];
        }
        conditionsMap[condition.condition_field].push(condition);
    })

    const res = reasonFieldsIds.map((id: string) => conditionsMap[id] ?? []);
    return res;
}

const batchConditionReasonFields = async (reasonFieldIds: any) => {
    const reasonsFields = await prisma.reasons_fields.findMany({
        where: {
            AND: [
                { reasons_fields_id: { in: reasonFieldIds } },
                { active: { equals: true } }
            ]
        }
    });

    const reasonsFieldsMap: any = {};
    reasonsFields.forEach((reasonField: ReasonsFields) => {
        reasonsFieldsMap[reasonField.reasons_fields_id] = reasonField;
    })

    const res = reasonFieldIds.map((id: string) => reasonsFieldsMap[id] ?? []);

    return res;
}

const batchConditionTypes = async (conditionTypeIds: any) => {
    const conditions = await prisma.condition_types.findMany({
        where: {
            condition_type_id: { in: conditionTypeIds } 
        }
    });

    const conditionTypesMap: any = {};
    conditions.forEach((condition) => {
        conditionTypesMap[condition.condition_type_id] = condition;
    })

    const res = conditionTypeIds.map((id: string) => conditionTypesMap[id] ?? []);
    return res;
}

const batchTransactionFieldEntries = async (transactionIds: any) => {
    const fieldEntries = await prisma.reasons_fields_entries.findMany({
        where: {
            transaction_id: {
                in: transactionIds
            }
        },
    });

    const entriesMap: any = {};
    fieldEntries.forEach((entry) => {
        if (!entriesMap[entry.transaction_id]) {
            entriesMap[entry.transaction_id] = [];
        }

        entriesMap[entry.transaction_id].push(entry);
    })

    const res = transactionIds.map((id: string) => entriesMap[id] ?? []);
    return res;
}

const batchFieldEntriesLoader = async (reasonsFieldsIds: any) => {
    const entries = await prisma.reasons_fields_entries.findMany({
        where: {
            reasons_fields: {
                reasons_fields_id: {
                    in: reasonsFieldsIds
                }
            }
        }
    });

    const entriesMap: any = {};
    entries.forEach((entry) => {
        entriesMap[entry.reasons_fields_id] = entry
    })

    const res = reasonsFieldsIds.map((id: string) => entriesMap[id] ?? []);
    return res;
}

const batchReasonEmails = async (reasonIds: any) => {
    const emails = await prisma.reason_emails.findMany({
        where: {
            reason_id: {
                in: reasonIds
            }
        }
    });

    const emailsMap: any = {};
    emails.forEach((email) => {
        if (!emailsMap[email.reason_id]) {
            emailsMap[email.reason_id] = [];
        }

        emailsMap[email.reason_id].push(email);
    })

    const res = reasonIds.map((id: string) => emailsMap[id] ?? []);
    return res;

}

const batchUsers = async (userIds: any) => {
    const users = await prisma.user.findMany({
        where: {
            id: { in: userIds }
        }
    });

    const usersMap: any = {};
    users.forEach((user) => {
        usersMap[user.id] = user;
    })

    const res = userIds.map((id: string) => usersMap[id] ?? []);
    console.log(res);
    return res;
}

export const transactionLoader = new DataLoader(batchTransactions);
export const reasonLoader = new DataLoader(batchReasons);
export const locationLoader = new DataLoader(batchLocations);
export const itemLoader = new DataLoader(batchItems);
export const reasonsFieldsLoader = new DataLoader(batchReasonsFields);
export const transactionTypesLoader = new DataLoader(batchTransactionTypes);
export const conditionsLoader=new DataLoader(batchConditions);
export const conditionReasonFieldLoader = new DataLoader(batchConditionReasonFields);
export const conditionTypesLoader = new DataLoader(batchConditionTypes);
export const transactionFieldEntriesLoader = new DataLoader(batchTransactionFieldEntries);
export const fieldEntriesLoader = new DataLoader(batchFieldEntriesLoader);
export const reasonEmailsLoader = new DataLoader(batchReasonEmails);
export const userLoader = new DataLoader(batchUsers);