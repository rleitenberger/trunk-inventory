import DataLoader from 'dataloader';
import prisma from '@/lib/prisma';
import { Location } from '@/types/Location';

const batchLocations = async (locationIds: any) => {
    const locations = await prisma.locations.findMany({
        where: {
            location_id: {
                in: locationIds
            }
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
            reason_id: {
                in: reasonIds
            }
        }
    });

    const reasonMap: any = {};
    reasons.forEach((reason) => {
        reasonMap[reason.reason_id] = reason;
    })

    return reasonIds.map((id: string) => reasonMap[id]);
}

export const transactionLoader = new DataLoader(batchTransactions);
export const reasonLoader = new DataLoader(batchReasons);
export const locationLoader = new DataLoader(batchLocations);
export const itemLoader = new DataLoader(batchItems);