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