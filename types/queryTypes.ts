import { PrismaClient } from "@prisma/client/extension";
import DataLoader from "dataloader";
import { NextRequest } from "next/server";

export interface PaginatedLocationItemsArgs {
    locationId?: string;
    itemId?: string;
    includeNegative?: boolean;
    after?: string|null;
    before?: string|null;
    first?:number;
    last?:number;
}

export interface GQLContext {
    req: NextRequest;
    res?: any;
    loaders: any;
    userId: string|null;
    db?: PrismaClient;
}

export interface UpdateTransactionArgs {
    transactionId: string;
    from: string;
    to: string;
    qty: number;
    item: string;
    transferType: string;
    salesorder_number?: string|null;
    salesorder_id?: string|null;
}