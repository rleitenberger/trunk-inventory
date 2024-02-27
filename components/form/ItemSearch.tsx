import { PageInfo } from "@/types/paginationTypes"
import DropDownSearch from "./DropDownSearch"
import { ApolloClient, ApolloQueryResult } from "@apollo/client"
import { getItems, getItemsAtLocation } from "@/graphql/queries"
import { PaginatedDropDownSearchOptions } from "@/types/DropDownSearchOption"

export default function ItemSearch ({ name='item', organizationId, apolloClient, onChange, title, locationId=undefined }: {
    name: string
    apolloClient: ApolloClient<object>
    organizationId: string
    onChange: (value: string|null, name: string) => void
    title?: string
    locationId?: string
}) {

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
            <label className='text-sm'>{title ? title : 'Item'}</label>
            <DropDownSearch
                name={name}
                refetch={fetchItems}
                onChange={onChange} />
        </>
    )
}