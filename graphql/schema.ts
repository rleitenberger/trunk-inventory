import gql from "graphql-tag";

export const typeDefs = gql`
schema {
    query: Query
    mutation: Mutation
}

type Query {
    getInternalQty(itemId: String!): Int!
    getUsers(organizationId: String!, search: String): [OrgUser]!
    getOrganizations: [Organization]!
    getLocations(organizationId: String!, search: String): [Location]!
    getItem(itemId: String!): Item
    getItems(organizationId: String!, search: String, after: String, first: Int): ItemConnection!
    getTransactionType(organizationId: String!, slug: String!): TransactionType
    getReasons(transactionTypeId: String!): [Reason]!
    getTransaction(transactionId: String!): Transaction
    getTransactions(transactionInput: TransactionInput!, paginationInput: PaginationInput!): TransactionConnection!
    getItemsAtLocation(locationId: String, itemId: String, search: String, first: Int, after: String, includeNegative: Boolean): LocationItemConnection!
    getTransactionTypes(organizationId: String): [TransactionType]!
    getConditionTypes(targetDataType: String!): [ConditionType]!
    getFieldConditions(conditionField: String!): [Condition]!
    getFieldTypes: [FieldType]!
    getOtherReasonFields(reasonId: String!, reasonFieldId: String): [ReasonFields]!
    getZohoClientKeys(organizationId: String!): ZohoKeys
    getLastItemSync(organizationId: String!): ItemSyncLog
    getIsAdmin(organizationId: String!): Boolean
    getUserInvites(organizationId: String!): [UserInvite]!
    cycleCountItems(count: Int!): [Item]!
}

type Mutation {
    createTransaction(orgId: String!, transferInput: TransferInput!, fieldEntries: [FieldsEntriesInput]!, transferType: String!, salesOrder: SalesOrderInput!): CreateTransactionResponse
    updateTransaction(args: UpdateTransactionInput!): Transaction
    deleteTransaction(transactionId: String!): Boolean
    
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
    deleteOrgUser(userId: String!, organizationId: String!): Boolean!

    updateUserRole(userId: String!, organizationId: String, role: String!): Boolean!

    createComment(transactionId: String!, comment: String!): TransactionComment!
    updateComment(transactionCommentId: String!, comment: String): TransactionComment!
    deleteComment(transactionCommentId: String!): Boolean!

    updateShelf(itemId: String!, shelf: Int!): Boolean!
}

input SalesOrderInput {
    salesorder_id: String
    salesorder_number: String
    shipping: Boolean!
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

type InventoryCount {
    count_id: Int!
    cycles: [CycleCount]!
}

type CycleCount {
    cycle_count_id: Int!
    items: [Item]!
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
    shelf: Int
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
    created_by: User!
    comments: [TransactionComment]!
    salesorder_id: String
    salesorder_number: String
    updates: [TransactionUpdate]!
    active: Boolean!
}

type TransactionUpdate {
    transaction_update_id: String!
    transaction_id: String!
    created: String!
    update_type: String!
    changes: String!
    user_id: String!
    user: User!
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

type TransactionComment {
    transaction_comment_id: String!
    transaction_id: String!
    comment: String!
    user: User
    created: String!
    modified: String!
    active: Boolean!
}

input UpdateTransactionInput {
    transactionId: String!
    from: String!
    to: String!
    item: String!
    qty: Int!
    transferType: String!
    salesorder_id: String
    salesorder_number: String
}

`;