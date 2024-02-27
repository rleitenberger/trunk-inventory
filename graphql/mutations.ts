import { gql } from 'graphql-tag'

export const createTransaction = gql`
    mutation createTransaction($orgId: String!, $from: String!, $to: String!, $itemId: String!, $reasonId: String!, $qty: Int!, $notes: String, $transferType: String!, $project: String) {
        createTransaction(orgId: $orgId, from: $from, to: $to, itemId: $itemId, reasonId: $reasonId, qty: $qty, notes: $notes, transferType: $transferType, project: $project)
    }
`;