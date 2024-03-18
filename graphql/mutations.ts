import { gql } from 'graphql-tag'

export const createOrganization = gql`
    mutation createOrganization($name: String!) {
        createOrganization(name: $name) {
            organization_id
        }
    }
`;

export const createTransaction = gql`
    mutation createTransaction($orgId: String!, $transferInput: TransferInput!, $fieldEntries: [FieldsEntriesInput]!, $transferType: String!) {
        createTransaction(orgId: $orgId, transferInput: $transferInput, fieldEntries: $fieldEntries, transferType: $transferType) {
            transactionId
            sentEmails
            accepted
            rejected
        }
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
    mutation createReasonField($reasonId: String!, $fieldName: String!, $fieldType: String!, $conditions: [ConditionInput]!){
        createReasonField(reasonId: $reasonId, fieldName: $fieldName, fieldType: $fieldType, conditions: $conditions) {
            reason_id
            reasons_fields_id
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
`;

export const updateReasonField = gql`
    mutation updateReasonField($reasonFieldId: String!, $fieldName: String!, $fieldType: String!, $conditions: [ConditionInput]!){
        updateReasonField(reasonFieldId: $reasonFieldId, fieldName: $fieldName, fieldType: $fieldType, conditions: $conditions) {
            field_name
            field_type
            reasons_fields_id
            updated
            reason_id
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
    mutation deleteReasonEmail($reasonEmailId: String!) {
        deleteReasonEmail(reasonEmailId: $reasonEmailId)
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

export const createLocation = gql`
    mutation createLocation($organizationId: String!, $locationName: String!) {
        createLocation(organizationId: $organizationId, locationName: $locationName) {
            name
        }
    }
`;

export const updateLocationName = gql`
    mutation updateLocationName($locationId: String!, $locationName: String!) {
        updateLocationName(locationId: $locationId, locationName: $locationName) {
            name
        }
    }
`;

export const updateLocationNCategory = gql`
    mutation updateLocationName($locationId: String!, $isWarehouse: Boolean!) {
        updateLocationName(locationId: $locationId, isWarehouse: $isWarehouse) {
            view_all_items
        }
    }
`;

export const deleteLocation = gql`
    mutation deleteLocation($locationId: String!) {
        deleteLocation(locationId: $locationId)
    }
`;

export const upsertZohoClientKeys = gql`
    mutation upsertZohoClientKeys($organizationId: String!, $zohoClientInput: ZohoClientKeysInput!) {
        upsertZohoClientKeys(organizationId: $organizationId, zohoClientInput: $zohoClientInput) {
            zoho_inventory_keys_id
            client_id
            client_secret
        }
    }
`;

export const createItemSyncLog = gql`
    mutation createItemSyncLog($organizationId: String!){
        createItemSyncLog(organizationId: $organizationId) { 
            item_sync_log_id
            created
        }
    }
`;

export const updateItemSyncLog = gql`
    mutation updateItemSyncLog($itemSyncLog: ItemSyncLogInput!) {
        updateItemSyncLog(itemSyncLog: $itemSyncLog) {
            item_sync_log_id
            items_added
            items_updated
            total_items
            created
            status
        }
    }
`;

export const addOrgUser = gql`
    mutation addOrgUser($organizationId: String!, $email: String!) {
        addOrgUser(organizationId: $organizationId, email: $email) {
            added
            message
            invite {
                invite_id
                modified
            }
        }
    }
`;

export const acceptOrgInvite = gql`
    mutation acceptOrgInvite($inviteId: String) {
        acceptOrgInvite(inviteId: $inviteId)
    }
`;