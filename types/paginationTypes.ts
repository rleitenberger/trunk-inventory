export type ItemArgs = {
    organizationId: string;
    search?: string;
    after?: string;
    first?: number;
};

export type TransactionArgs = {
    organizationId: string
    locationId?: string
    itemId?: string
    first?: number
    after?: string
    transferType?: string
    last?: number;
    before?: string;
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
    endCursor?: string;
    hasPreviousPage?: boolean;
    startCursor?: string;
    sortColumnValueStart?: Date;
    sortColumnValueEnd?: Date;
};
