import { PageInfo } from "@/types/paginationTypes"
import DropDownSearch from "./DropDownSearch"
import { ApolloClient, ApolloQueryResult, useApolloClient } from "@apollo/client"
import { getItems, getItemsAtLocation } from "@/graphql/queries"
import { DropDownSearchOption, PaginatedDropDownSearchOptions } from "@/types/DropDownSearchOption"
import useOrganization from "../providers/useOrganization"
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown"

export default function ItemSearch ({ val, fn, displayOptions, locationId=undefined }: {
    displayOptions: DropDownDisplayGroup
    fn: DropDownValueFunctionGroup
    val: DropDownSearchOption,
    locationId?: string
}) {

    
    const apolloClient = useApolloClient();
    const organizationId = useOrganization();

    const fetchItems = async(search: string, pageInfo: PageInfo|undefined = undefined): Promise<PaginatedDropDownSearchOptions> => {
        
        let query = getItems;
        let variables: object = {
            organizationId: organizationId,
            search: search,
            after: pageInfo?.endCursor ? pageInfo.endCursor : undefined
        };

        if (locationId) {
            query = getItemsAtLocation;
            variables = {
                locationId: locationId,
                search: search,
                after: pageInfo?.endCursor ? pageInfo.endCursor : undefined
            }
        }

        const res: ApolloQueryResult<any> = await apolloClient.query({
            query: query,
            variables: variables
        });

        if (!res.data){
            //error
        }

        const { data } = res;

        if (data?.getItems) {
            const nodes = data.getItems?.edges?.map((e: any) => {
                return {
                    name: e.node.name,
                    value: e.node.item_id,
                }
            });
            return {
                nodes: nodes,
                pageInfo: data.getItems?.pageInfo
            }
        } else if (data?.getItemsAtLocation) {
            return {
                nodes: data.getItemsAtLocation?.edges?.map((e: any) => {
                    const { item } = e.node;
                    return {
                        name: item.name,
                        value: item.value
                    }
                }),
                pageInfo: data.getItemsAtLocation?.pageInfo
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
                objectName={displayOptions.name}
                val={val} />
        </>
    )
}