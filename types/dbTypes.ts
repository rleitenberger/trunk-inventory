export interface Transaction {
    transaction_id: string;
    organization_id: string;
    qty: number;
    notes: string | null;
    from_location: string;
    to_location: string;
    reason_id: string;
    created: Date;
}

export interface Item {
    item_id: string; 
    organization_id: string; 
    zi_item_id: string; 
    name: string; 
    item_price: string | null; 
    item_cost: string | null; 
    sku: string | null; 
    created: Date; 
    modified: Date; 
    active: boolean; 
    description: string | null;
}

export interface Location {
    location_id: string;
    name: string;
    organization_id: string;
    created: Date;
    modified: Date;
    active: boolean;
    orderPriority: number;
}

export interface LocationItem {
    item: Item;
    location: Location;
    qty: number;
}
export type Reason = {
    reason_id: string
    name: string
    description: string|null
    requires_project: boolean
}