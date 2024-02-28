import { gql } from 'graphql-tag'

export const createTransaction = gql`
    mutation createTransaction($orgId: String!, $from: String!, $to: String!, $itemId: String!, $reasonId: String!, $qty: Int!, $notes: String, $transferType: String!, $project: String) {
        createTransaction(orgId: $orgId, from: $from, to: $to, itemId: $itemId, reasonId: $reasonId, qty: $qty, notes: $notes, transferType: $transferType, project: $project)
    }
`;

export const updateReasonName = gql`
    mutation updateReasonName($reasonId: String!, $newName: String!) {
        updateReasonName(reasonId: $reasonId, newName: $newName)
    }
`;

export const modifyReasonsFieldFieldName = gql`
    mutation updateReasonsFieldFieldName($reasonsFieldId: String!, $newName: String!) {
        updateReasonsFieldFieldName(reasonsFieldId: $reasonsFieldId, newName: $newName)
    }
`;

export const updateReasonField = gql`
    mutation updateReasonField($reasonFieldId: String!, $fieldName: String!, $fieldType: String!){
        updateReasonField(reasonFieldId: $reasonFieldId, fieldName: $fieldName, fieldType: $fieldType) {
            field_name
            field_type
            reasons_fields_id
            updated
            reason_id
        }
    }
`;