import DataLoader from "dataloader";
import { NextRequest } from "next/server";

export interface PaginatedLocationItemsArgs {
    locationId: string;
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
}