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
    from_location: string;
    to_location: string;
    reason_id: string;
    created: Date;
    expanded?: boolean;
}

export interface TransactionEdge {
    node: TransactionClient;
}

export interface TransactionClient {
    transaction_id: string;
    organization_id: string;
    item: Item;
    qty: number;
    from_location: Location;
    to_location: Location;
    transfer_type: string;
    reason?: Reason;
    created: string;
    entries?: ReasonsFieldsEntry[];
    expanded?: boolean;
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
    reason_emails: ReasonEmail[];
}

export interface ReasonEmail {
    reason_id?: string;
    email: string;
    reason_email_id: string;
}

export type ReasonsFields = {
    reason_id: string;
    reasons_fields_id: string;
    field_name: string;
    field_type: string;
    updated?: boolean;
    conditions?: Condition[];
    entries?: ReasonsFieldsEntry
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

export interface ConditionReasonField {
    reasons_fields_id: string;
    field_name: string;
}

export interface ConditionInput {
    condition_id: string;
    condition_field: string;
    dependent_field: string;
    required_value: string;
    condition_type_id: string;
    new?: boolean;
}

export interface Condition {
    condition_id: string;
    condition_field: ConditionReasonField;
    dependent_field: ConditionReasonField;
    required_value: string;
    condition_type: ConditionConditionType;
    condition_type_id?: string;
    active?:boolean;
    created?: Date;
    modified?: Date;
    new?: boolean;
}

export interface ConditionType {
    condition_type_id: string;
    target_data_type: string;
    type: string;
    name: string;
}

export interface ConditionConditionType {
    condition_type_id: string;
    name: string;
}

export interface FieldType {
    field_type_id: string;
    name: string;
    data_type: string;
}

export interface LocationItemEdge {
    item_id: number;
    node: LocationItem;
}

export interface LocationItem {
    item: Item;
    qty: number;
}

export interface PageInfoVariables {
    
}

export interface TransferInput {
    from: string
    to: string
    itemId: string
    reasonId: string
    qty: number;
}

export interface FieldsEntriesInput {
    field_name: string;
    value: string;
}

export interface ReasonsFieldsEntry {
    transaction_id: string;
    reasons_fields_id: string;
    field_value: string;
}