export interface PaginatedLocationItemsArgs {
    locationId: string;
    includeNegative?: boolean;
    after?: string|null;
    before?: string|null;
    first?:number;
    last?:number;
}