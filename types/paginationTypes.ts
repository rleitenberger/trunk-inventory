export type ItemArgs = {
    organizationId: string;
    search?: string;
    after?: string;
    first?: number;
};

export type ItemEdge = {
    node: {
        item_id: string;
        organization_id: string;
        name: string;
        description: string | null;
        sku: string | null;
        active: boolean;
    };
    cursor: string;
};

export type PageInfo = {
    hasNextPage: boolean;
    endCursor?: string;
};

export type ItemConnection = {
    edges: ItemEdge[];
    pageInfo: PageInfo;
};

export type TransactionArgs = {
    organizationId: string;
    locationId?: string;
    itemId?: string;
    after?: string
    first?: number
}

export type TransactionEdge = {
    node: {
        transaction_id: string;
        organization_id: string;
        qty: number;
        notes: string | null;
        from_location: string;
        to_location: string;
        reason_id: string;
        created: Date;
    };
    cursor: string;
};

export type TransactionConnection = {
    edges: TransactionEdge[];
    pageInfo: PageInfo;
};