import { getConditionTypes, getFieldTypes, getReasons, getTransactionTypes } from "@/graphql/queries";
import { ConditionType, FieldType, Reason, TransactionType } from "@/types/dbTypes";
import { ApolloClient } from "@apollo/client";

export interface KVP {
    key: string;
    value: string;
}

export const common = {
    getTransactionTypes: async (organizationId: string, apolloClient: ApolloClient<object>): Promise<TransactionType[]> => {
        const { data } = await apolloClient.query({
            query: getTransactionTypes,
            variables: {
                organizationId: organizationId
            }
        });

        if (!data?.getTransactionTypes){
            //toast error
            return [];
        }

        return data.getTransactionTypes?.map((e: TransactionType) => {
            return {
                type: e.type,
                transaction_type_id: e.transaction_type_id
            }
        });
    },
    getReasons: async (transactionTypeId: string, apolloClient: ApolloClient<object>): Promise<Reason[]> => {
        const { data } = await apolloClient.query({
            query: getReasons,
            variables: {
                transactionTypeId: transactionTypeId
            }
        });

        if (!data?.getReasons) {
            //error
            return [];
        }

        return data.getReasons?.map((e: Reason) => {
            return {
                reason_id: e.reason_id,
                reasons_fields: e.reasons_fields,
                name: e.name,
                sends_email: e.sends_email,
                description: e.description
            }
        })
    },
    getConditionTypes: async (targetDataType: string, apolloClient: ApolloClient<object>): Promise<ConditionType[]> => {
        const { data } = await apolloClient.query({
            query: getConditionTypes,
            variables: {
                targetDataType: targetDataType
            }
        });

        if (!data?.getConditionTypes){
            return [];
        }

        return data.getConditionTypes;

    },
    getFieldTypes: async (apolloClient: ApolloClient<object>): Promise<FieldType[]> => {
        const { data } = await apolloClient.query({
            query: getFieldTypes,
        });

        if (!data?.getFieldTypes){
            return [];   
        }

        return data.getFieldTypes;
    }
}