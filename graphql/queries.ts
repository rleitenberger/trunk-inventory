import { gql } from 'graphql-tag'

export const getOrganizations = gql`
    query getOrganizations {
        getOrganizations {
            organization_id
            name
        }
    }
`;

export const getLocations = gql`
    query getLocations($organizationId: String!, $search: String) {
        getLocations(organizationId: $organizationId, search: $search) {
            location_id
            name
        }
    }
`;

export const getItem = gql`
    query getItem($itemId: String!) {
        getItem(itemId: $itemId) {
            item_id
            name
            shelf
        }
    }
`;

export const getItems = gql`
    query getItems($organizationId: String!, $search: String, $after: String, $first: Int) {
        getItems(organizationId: $organizationId, search: $search, after: $after, first: $first) {
            edges {
                node {
                    item_id
                    name
                    description
                    sku
                    active
                }
                cursor
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const getTransactionType = gql`
    query getTransactionType($organizationId: String!, $slug: String!) {
        getTransactionType (organizationId: $organizationId, slug: $slug) {
            transaction_type_id
            type
            description
        }
    }
`;

export const getTransactionTypes = gql`
    query getTransactionTypes($organizationId: String!) {
        getTransactionTypes (organizationId: $organizationId) {
            transaction_type_id
            type
            description
        }
    }
`

export const getReasons = gql`
    query getReasons($transactionTypeId: String!) {
        getReasons(transactionTypeId: $transactionTypeId) {
            reason_id
            name
            sends_email
            description
            reason_emails {
                email
                reason_email_id
            }
            reasons_fields {
                reasons_fields_id
                reason_id
                field_name
                field_type
                conditions {
                    condition_id
                    condition_field {
                        reasons_fields_id
                        field_name
                    }
                    dependent_field {
                        reasons_fields_id
                        field_name
                    }
                    condition_type {
                        condition_type_id
                        name
                    }
                    required_value
                }
            }
        }
    }
`;

export const getTransactions = gql`
    query getTransactions($transactionInput: TransactionInput!, $paginationInput: PaginationInput!) {
        getTransactions (transactionInput: $transactionInput, paginationInput: $paginationInput) {
            edges {
                node {
                    transaction_id
                    created
                    from_location {
                        name
                        location_id
                    }
                    to_location {
                        name
                        location_id
                    }
                    reason {
                        reason_id
                        name
                        description
                        reasons_fields {
                            reasons_fields_id
                            field_name
                        }
                    }
                    item {
                        item_id
                        name
                        sku
                    }
                    qty
                    transfer_type
                    entries {
                        reasons_fields_id
                        field_value
                    }
                    created_by {
                        id
                        name
                    }
                    comments {
                        transaction_comment_id
                        comment
                        modified
                        user {
                            name
                        }
                    }
                    salesorder_number
                }
            }
            pageInfo {
                hasNextPage
                endCursor
                startCursor
                sortColumnValueStart
                sortColumnValueEnd
            }
        }
    }
`;

export const getTransaction = gql`
    query getTransaction($transactionId: String!) {
        getTransaction(transactionId: $transactionId) {
            transaction_id
            created
            from_location {
                name
                location_id
            }
            to_location {
                name
                location_id
            }
            reason {
                reason_id
                name
                description
                reasons_fields {
                    reasons_fields_id
                    field_name
                }
            }
            item {
                item_id
                name
                sku
            }
            qty
            transfer_type
            entries {
                reasons_fields_id
                field_value
            }
            created_by {
                id
                name
            }
            comments {
                transaction_comment_id
                comment
                modified
                user {
                    name
                }
            }
            updates {
                transaction_update_id
                created
                update_type
                changes
                user {
                    id
                    name
                }
            }
            salesorder_number
        }
    }
`;

export const getItemsAtLocation = gql`
    query getItemsAtLocation($locationId: String, $itemId: String, $search: String, $first: Int, $after: String, $includeNegative: Boolean) {
        getItemsAtLocation(locationId: $locationId, itemId: $itemId, search: $search, first: $first, after: $after, includeNegative: $includeNegative) {
            edges {
                node {
                    item {
                      item_id
                      name
                      sku
                    }
                    location {
                        location_id
                        name
                    }
                    qty
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const getUsers = gql`
    query getUsers($organizationId: String!, $search: String) {
        getUsers(organizationId: $organizationId, search: $search) {
            users {
                name
                username
                email
                id
            }
            role
        }
    }
`;

export const getConditionTypes = gql`
    query getConditionTypes($targetDataType: String!) {
        getConditionTypes(targetDataType: $targetDataType) {
            condition_type_id
            name
            type
        }
    }
`;

export const getFieldConditions = gql`
    query getFieldCondition($conditionField: String!) {
        getFieldConditions(conditionField: $conditionField)
    }
`;

export const getFieldTypes = gql`
    query getFieldTypes {
        getFieldTypes {
            field_type_id
            name
            data_type
        }
    }
`;

export const getOtherReasonFields = gql`
    query getOtherReasonFields($reasonId: String!, $reasonFieldId: String) {
        getOtherReasonFields(reasonId: $reasonId, reasonFieldId: $reasonFieldId) {
            reasons_fields_id
            field_name
            field_type
        }
    }
`;

export const getZohoClientKeys = gql`
    query getZohoClientKeys($organizationId: String!) {
        getZohoClientKeys(organizationId: $organizationId) {
            client_id
            client_secret
            zoho_inventory_keys_id
        }
    }
`;

export const getLastItemSync = gql`
    query getLastItemSync($organizationId: String!) {
        getLastItemSync(organizationId: $organizationId) {
            item_sync_log_id
            items_added
            items_updated
            total_items
            created
            status
        }
    }
`;

export const getIsAdmin = gql`
    query getIsAdmin($organizationId: String!) {
        getIsAdmin(organizationId: $organizationId)
    }
`;

export const getUserInvites = gql`
    query getUserInvites($organizationId: String!) {
        getuserInvites(organizationId: $organizationId) {
            added
            message
            invite {
                email
                invite_id
                active
                created
            }
        }
    }
`;