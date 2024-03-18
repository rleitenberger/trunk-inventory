export interface Organization {
    organization_id: string;
    name: string;
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
    transaction_type_id: string;
    organization_id: string;
    description?: string;
}

export type OrgUser = {
    organization: Organization;
    users: User;
    role: string;
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

export interface ApiKey {
    api_key_id: string;
    token_name: string;
    value: string;
    apitype: string;
    token_type: string;
    expiry: Date;
    created: Date;
    modified: Date;
    active: boolean;
}

export interface ZohoInventoryApiKeys {
    zoho_inventory_keys_id: string;
    organization_id: string;
    client_id?: string|null;
    client_secret?: string|null;
    access_token?: string|null;
    refresh_token?: string|null;
    expiry?: Date|null;
    location?: string|null;
    server?: string|null;
    type?:string|null;
    iv: string|null;
}

export interface ZohoClientKeys {
    zohoInventoryKeysId?: string;
    clientId: string;
    clientSecret: string;
}

export interface BetweenDate {
    from: string;
    to: string;
}

export interface ExportOptions {
    between: BetweenDate;
}


export interface User {
    id: string;
    name: string;
    username?: string|null;
    password?: string|null;
    email: string;
    emailVerified?: string|null;
    image?: string|null;
    account: Account;
    isAdmin: boolean;
}

export interface Account {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string|null;
    access_token?: string|null;
    expires_at?: number|null;
    token_type?: string|null;
}

export interface UserInvite {
    invite_id: string;
    email: string;
    active: boolean;
    created: string;
    modified: string;
}

export interface SyncDetails {
    item_sync_log_id: string;
    organization_id?: string;
    status: string;
    items_added: string;
    items_updated: string;
    total_items: string;
    created: string;
}