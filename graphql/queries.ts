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

export const getReasons = gql`
    query getReasons($transactionTypeId: String!) {
        getReasons(transactionTypeId: $transactionTypeId) {
            reason_id
            name
            requires_project
            reasons_fields {
                reasons_fields_id
                field_name
                field_type
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
                    }
                    item {
                        item_id
                        name
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
    query getItemsAtLocation($locationId: String!, $search: String, $first: Int, $after: String) {
        getItemsAtLocation(locationId: $locationId, search: $search, first: $first, after: $after) {
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