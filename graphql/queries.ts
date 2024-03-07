import { gql } from 'graphql-tag'

export const getLocations = gql`
    query getLocations($organizationId: String!, $search: String) {
        getLocations(organizationId: $organizationId, search: $search) {
            location_id
            name
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
    query getTransactions($organizationId: String!, $locationId: String, $itemId: String, $first: Int, $after: String, $transferType: String) {
        getTransactions (organizationId: $organizationId, locationId: $locationId, itemId: $itemId, first: $first, after: $after, transferType: $transferType) {
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
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const getItemsAtLocation = gql`
    query getItemsAtLocation($locationId: String!, $search: String, $first: Int, $after: String, $includeNegative: Boolean) {
        getItemsAtLocation(locationId: $locationId, search: $search, first: $first, after: $after, includeNegative: $includeNegative) {
            edges {
                node {
                    item {
                      item_id
                      name
                      sku
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
    query getUsers($organizationId: String!, $role: String, $search: String) {
        getUsers(organizationId: $organizationId, role: $role, search: $search) {
            user_id
            name
            username
            email
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