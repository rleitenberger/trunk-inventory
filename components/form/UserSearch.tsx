import { PageInfo } from "@/types/paginationTypes"
import DropDownSearch from "./DropDownSearch"
import { ApolloClient, ApolloQueryResult, useApolloClient } from "@apollo/client"
import { getItems, getItemsAtLocation, getUsers } from "@/graphql/queries"
import { DropDownSearchOption, PaginatedDropDownSearchOptions } from "@/types/DropDownSearchOption"
import useOrganization from "../providers/useOrganization"
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown"

export default function UserSearch ({ val, fn, displayOptions, role }: {
    displayOptions: DropDownDisplayGroup;
    fn: DropDownValueFunctionGroup;
    val: DropDownSearchOption;
    role?: string
}) {

    
    const apolloClient = useApolloClient();
    const { organizationId, count } = useOrganization();

    const fetchItems = async(search: string, pageInfo: PageInfo|undefined = undefined): Promise<PaginatedDropDownSearchOptions> => {
        
        let query = getUsers;
        let variables: object = {
            organizationId: organizationId,
            search: search,
            after: pageInfo?.endCursor ? pageInfo.endCursor : undefined,
            role: role
        };

        const res: ApolloQueryResult<any> = await apolloClient.query({
            query: query,
            variables: variables
        });

        if (!res.data){
            //error
        }

        const { data } = res;

        if (data?.getUsers) {
            const nodes = data.getUsers?.edges?.map((e: any) => {
                return {
                    name: e.node.name,
                    value: e.node.user_id,
                }
            });
            return {
                nodes: nodes,
                pageInfo: data.getItems?.pageInfo
            }
        }

        return {
            nodes: [],
            pageInfo: {
                endCursor: null,
                hasNextPage: false
            }
        }
    }

    return (
        <>
            <label className='text-sm'>{displayOptions?.title ? displayOptions.title : 'Item'}</label>
            <DropDownSearch
                fn={{
                    refetch: fetchItems,
                    ...fn
                }}
                objectName={displayOptions.name} />
        </>
    )
}