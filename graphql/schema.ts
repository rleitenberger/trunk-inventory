import gql from "graphql-tag";

export const typeDefs = gql`
schema {
    query: Query
    mutation: Mutation
}

type Query {
    getUsers(organizationId: String!, search: String): [OrgUser]!
    getOrganizations: [Organization]!
    getLocations(organizationId: String!, search: String): [Location]!
    getItems(organizationId: String!, search: String, after: String, first: Int): ItemConnection!
    getTransactionType(organizationId: String!, slug: String!): TransactionType
    getReasons(transactionTypeId: String!): [Reason]!
    getTransactions(transactionInput: TransactionInput!, paginationInput: PaginationInput!): TransactionConnection!
    getItemsAtLocation(locationId: String!, search: String, first: Int, after: String, includeNegative: Boolean): LocationItemConnection!
    getTransactionTypes(organizationId: String): [TransactionType]!
    getConditionTypes(targetDataType: String!): [ConditionType]!
    getFieldConditions(conditionField: String!): [Condition]!
    getFieldTypes: [FieldType]!
    getOtherReasonFields(reasonId: String!, reasonFieldId: String): [ReasonFields]!
    getZohoClientKeys(organizationId: String!): ZohoKeys
    getLastItemSync(organizationId: String!): ItemSyncLog
    getIsAdmin(organizationId: String!): Boolean
    getUserInvites(organizationId: String!): [UserInvite]!
}

type Mutation {
    createTransaction(orgId: String!, transferInput: TransferInput!, fieldEntries: [FieldsEntriesInput]!, transferType: String!): CreateTransactionResponse
    createOrganization(name: String!): Organization
    createItem(name: String!, sku: String, description: String): Item
    createUser(name: String!, email:String!, username:String!, password:String!): User
    
    createReason(reasonName: String!, transactionTypeId: String!, description: String): Reason
    updateReasonName(reasonId: String!, newName: String!): Boolean
    updateReasonSendsEmail(reasonId: String!, sendsEmail: Boolean!): Boolean
    deleteReason(reasonId: String!): Boolean

    createReasonEmail(reasonId: String!, email: String!): String
    deleteReasonEmail(reasonEmailId: String!): Boolean

    createReasonField(reasonId: String!, fieldName: String!, fieldType: String!, conditions: [ConditionInput]!): ReasonFields
    updateReasonField(reasonFieldId: String!, fieldName: String!, fieldType: String!, conditions: [ConditionInput]!): ReasonFields
    deleteReasonField(reasonFieldId: String!): Boolean

    createFieldCondition(conditionField: String!, dependentField: String!, requiredValue: String!, conditionTypeId: String!): Condition
    updateFieldCondition(conditionId: String!, requiredValue: String!, conditionTypeId: String!): Boolean
    deleteFieldCondition(conditionId: String): Boolean

    createLocation(organizationId: String!, locationName: String!): Location
    updateLocationName(locationId: String!, locationName: String!): Location
    updateLocationCategory(locationId: String!, isWarehouse: Boolean!): Location
    deleteLocation(locationId: String!): Boolean

    upsertZohoClientKeys(organizationId: String!, zohoClientInput: ZohoClientKeysInput!): ZohoKeys!

    createItemSyncLog(organizationId: String!): ItemSyncLog!
    updateItemSyncLog(itemSyncLog: ItemSyncLogInput): ItemSyncLog!

    addOrgUser(organizationId: String!, email: String!): AddOrgUserResponse!
    acceptOrgInvite(inviteId: String!): Boolean
}

type OrgUser {
    organization_id: String!
    user_id: String!
    created: String!
    modified: String!
    active: Boolean!
    users: User!
    role: String!
}

type AddOrgUserResponse {
    added: Boolean!
    message: String!
    invite: UserInvite!
}

type UserInvite {
    invite_id: String!
    organization_id: String!
    email: String!
    active: Boolean
    created: String
    modified: String
}

input TransactionInput {
    organizationId: String!
    locationId: String
    itemId: String
    transferType: String
    between: BetweenDateInput!
}

input PaginationInput {
    first: Int
    after: String
    before: String
    last: Int
    sortColumn: String
    sortColumnValue: String
    take: Int
}

type Organization {
    organization_id: String!
    name: String!
    created: String
    modified: String
    active: Boolean!
    locations: [Location]!
}

type User {
    id: String!
    name: String!
    username: String
    password: String
    email: String!
    emailVerified: String
    image: String
    admins: Admins!
}

type Admins {
    user_id: String
}

type Account {
    userId: String!
    type: String!
    provider: String!
    providerAccountId: String!
    refresh_token: String
    access_token: String
    expires_at: Int
    token_type: String
}

type Location {
    location_id: String!
    name: String!
    active: Boolean!
}

type Item {
    item_id: String!
    organization_id: String!
    name: String!
    sku: String
    description: String
    created: String
    modified: String
    active: Boolean
}

type ItemConnection {
    edges: [ItemEdge]
    pageInfo: PageInfo
}

type ItemEdge {
    node: Item!
    cursor: String!
}

type LocationItemConnection {
    edges: [LocationItemEdge]
    pageInfo: PageInfo
}

type LocationItemEdge {
    node: LocationItem!
    cursor: String!
}

type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
    hasPreviousPage: Boolean!
    startCursor: String
    sortColumn: String
    sortColumnValueStart: String
    sortColumnValueEnd: String
}

type TransactionType {
    transaction_type_id: String!
    organization_id: String!
    type: String!
    description: String
}

type Reason {
    reason_id: String!
    transaction_type_id: String!
    transaction_type: TransactionType!
    name: String!
    description: String
    created: String
    modified: String
    active: Boolean!
    sends_email: Boolean!
    reasons_fields: [ReasonFields]!
    reason_emails: [ReasonEmail]!
}

type Transaction {
    transaction_id: String!
    organization_id: String!
    from_location: Location!
    to_location: Location!
    qty: Int!
    item: Item!
    reason: Reason
    notes: String!
    created: String!
    project: String
    transfer_type: String!
    entries: [ReasonsFieldsEntry]!
}

type TransactionConnection {
    edges: [TransactionEdge]
    pageInfo: PageInfo
}

type TransactionEdge {
    node: Transaction!
    cursor: String!
}

type LocationItem {
    item: Item
    location: Location
    qty: Int!
}

type ReasonFields {
    reasons_fields_id: String!
    reason_id: String!
    field_name: String!
    field_type: String!
    updated: Boolean
    conditions: [Condition]!
}

type ReasonsFieldsEntry {
    transaction_id: String!
    reasons_fields_id: String!
    field_value: String
}

type UserConnection {
    edges: [UserEdge]
    pageInfo: PageInfo
}

type UserEdge {
    node: User!
    cursor: String!
}

type ConditionType {
    condition_type_id: String!
    target_data_type: String!
    type: String!
    name: String!
}

type Condition {
    condition_id: String!
    condition_field: ReasonFields!
    dependent_field: ReasonFields!
    required_value: String!
    condition_type: ConditionType!
    active: Boolean!
    created: String!
    modified: String!
}

type FieldType {
    field_type_id: String!
    name: String!
    data_type: String!
}

input ConditionInput {
    dependent_field: String!
    required_value: String!
    condition_type_id: String!
    condition_field: String
    condition_id: String
    new: Boolean
}

input TransferInput {
    from: String!
    to: String!
    itemId: String!
    reasonId: String!
    qty: Int!
}

input FieldsEntriesInput {
    field_name: String!
    value: String!
}

type TransactionDetailsField {
    field_name: String!
    field_value: String
    transaction_id: String!
}

type ReasonEmail { 
    reason_email_id: String!
    reason_id: String!
    email: String!
    active: Boolean!
    created: String!
    modified: String!
}

type CreateTransactionResponse {
    transactionId: String!
    sentEmails: Boolean!
    accepted: [String]!
    rejected: [String]!
}

type ZohoKeys {
    zoho_inventory_keys_id: String!
    organization_id: String!
    client_id: String
    client_secret: String
    access_token: String
    refresh_token: String
    expiry: String
    iv: String
    location: String
    server: String
    type: String
}

input ZohoClientKeysInput {
    zohoInventoryKeysId: String
    clientId: String
    clientSecret: String
}

type ItemSyncLog {
    item_sync_log_id: String!
    status: String!
    items_added: Int!
    items_updated: Int!
    total_items: Int!
    created: String!
}

input ItemSyncLogInput {
    item_sync_log_id: String!
    status: String
    items_added: Int
    items_updated: Int
    total_items: Int
    created: String
}

input BetweenDateInput {
    from: String
    to: String
}
`;