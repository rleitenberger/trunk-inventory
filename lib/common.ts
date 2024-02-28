import { getReasons, getTransactionTypes } from "@/graphql/queries";
import { Reason, TransactionType } from "@/types/dbTypes";
import { ApolloClient } from "@apollo/client";

export const common = {
    getTransactionTypes: async (organizationId: string, apolloClient: ApolloClient<object>): Promise<TransactionType[]> => {
        const res = await apolloClient.query({
            query: getTransactionTypes,
            variables: {
                organizationId: organizationId
            }
        });

        const { data } = res;
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
        const res = await apolloClient.query({
            query: getReasons,
            variables: {
                transactionTypeId: transactionTypeId
            }
        });
        const { data } = res;

        if (!data?.getReasons) {
            //error
            return [];
        }

        console.log(data);
        return data.getReasons?.map((e: Reason) => {
            return {
                reason_id: e.reason_id,
                reasons_fields: e.reasons_fields,
                name: e.name
            }
        })
    }
}