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

export const createReasonField = gql`
    mutation createReasonField($reasonId: String!, $fieldName: String!, $fieldType: String!){
        createReasonField(reasonId: $reasonId, fieldName: $fieldName, fieldType: $fieldType) {
            reason_id
            reasons_fields_id
            field_name
            field_type
            
        }
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

export const deleteReasonField = gql`
    mutation deleteReasonField($reasonFieldId: String!){
        deleteReasonField(reasonFieldId: $reasonFieldId)
    }
`;

export const createReason = gql`
    mutation createReason($reasonName: String!, $transactionTypeId: String!, $description: String){
        createReason(reasonName: $reasonName, transactionTypeId: $transactionTypeId, description: $description) {
            reason_id
            name
            transaction_type_id
        }
    }
`;

export const deleteReason = gql`
    mutation deleteReason($reasonId: String!){
        deleteReason(reasonId: $reasonId)
    }
`;

export const updateReasonSendsEmail = gql`
    mutation updateReasonSendsEmail($reasonId: String!, $sendsEmail: Boolean!){
        updateReasonSendsEmail(reasonId: $reasonId, sendsEmail: $sendsEmail)
    }
`;

export const createReasonEmail = gql`
    mutation createReasonEmail($reasonId: String!, $email: String!) {
        createReasonEmail(reasonId: $reasonId, email: $email)
    }
`;

export const deleteReasonEmail = gql`
    mutation deleteReasonEmail($reasonId: String!, $email: String!) {
        deleteReasonEmail(reasonId: $reasonId, email: $email)
    }
`;

export const createFieldCondition = gql`
    mutation createFieldCondition($conditionField: String!, $dependentField: String!, $requiredValue: String!, $conditionTypeId: String!) {
        createFieldCondition(conditionField: $conditionField, dependentField: $dependentField, requiredValue: $requiredValue, conditionTypeId: $conditionTypeId)
    }
`;

export const updateFieldCondition = gql`
    mutation updateFieldCondition($conditionId: String!, $requiredValue: String!, $conditionTypeId: String!) {
        updateFieldCondition(conditionId: $conditionId, requiredValue: $requiredValue, conditionTypeId: $conditionTypeId)
    }
`;

export const deleteFieldCondition = gql`
    mutation deleteFieldCondition($conditionId: String!) {
        deleteFieldCondition(conditionId: $conditionId)
    }
`;