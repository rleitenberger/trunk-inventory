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