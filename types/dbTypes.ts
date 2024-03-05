export interface Organization {
    organization_id: string;
    name: string;
}

export interface User {
    user_id: string;
    name: string;
    username: string;
    email: string;
    created?: Date;
    modified?: Date;
    password?: string;
    active?: boolean;
}

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
    sends_email: boolean
    reasons_fields: ReasonsFields[];
    transaction_type_id: string;
}

export type ReasonsFields = {
    reason_id: string;
    reasons_fields_id: string;
    field_name: string;
    field_type: string;
    updated?: boolean;
    conditions: Condition[];
}

export type DynamicInputField = {
    field_type: string
    field_name: string
}

export type TransactionType = {
    type: string;
    transaction_type_id: string
    description?: string
}

export type OrgUser = {
    organization: Organization;
    user: User;
}

export interface Condition {
    condition_id: string;
    condition_field: string;
    dependent_field: string;
    required_value: string;
    condition_type_id: string;
    active?:boolean;
    created?: Date;
    modified?: Date;
}

export interface ConditionType {
    condition_type_id: string;
    target_data_type: string;
    type: string;
    name: string;
}

export interface FieldType {
    field_type_id: string;
    name: string;
    data_type: string;
}