import { DropDownSearchOption } from "./DropDownSearchOption";
import { BetweenDate } from "./dbTypes";

export type ItemArgs = {
    organizationId: string;
    search?: string;
    after?: string;
    first?: number;
};

export type TransactionArgs = {
    transactionInput: TransactionInput;
    paginationInput: PaginationInput;
}

export interface InventoryInput {
    locationId: DropDownSearchOption;
}

export interface TransactionInput {
    organizationId: string
    locationId?: DropDownSearchOption
    itemId?: DropDownSearchOption
    transferType?: string;
    between: BetweenDate;
}

export interface PaginationInput {
    first?: number
    after?: string;
    before?: string;
    last?: number;
    take: number;
    sortColumn?: string;
    sortColumnValue?: string;
}

export type Connection<T> = {
    edges: Edge<T>[];
    pageInfo: PageInfo;
};

export type Edge<T> = {
    node: T,
    cursor: string
}

export type PageInfo = {
    hasNextPage: boolean;
    endCursor?: string|null;
    hasPreviousPage?: boolean;
    startCursor?: string;
    sortColumnValueStart?: Date;
    sortColumnValueEnd?: Date;
};
