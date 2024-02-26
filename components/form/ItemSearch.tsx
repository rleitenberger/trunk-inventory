import { PageInfo } from "@/types/paginationTypes"
import DropDownSearch from "./DropDownSearch"
import { ApolloClient, ApolloQueryResult } from "@apollo/client"
import { getItems } from "@/graphql/queries"
import { PaginatedDropDownSearchOptions } from "@/types/DropDownSearchOption"

export default function ItemSearch ({ name='item', organizationId, apolloClient, onChange, title }: {
    name: string
    apolloClient: ApolloClient<object>
    organizationId: string
    onChange: (value: string|null, name: string) => void
    title?: string
}) {



    const fetchItems = async(search: string, pageInfo: PageInfo|undefined = undefined): Promise<PaginatedDropDownSearchOptions> => {
        const res: ApolloQueryResult<any> = await apolloClient.query({
            query: getItems,
            variables: {
                organizationId: organizationId,
                search: search,
                after: pageInfo?.endCursor ? pageInfo.endCursor : undefined
            }
        });

        if (!res.data){
            //error
        }

        const results: any = res.data?.getItems;
        const nodes = results?.edges?.map((e: any) => {
            return {
                name: e.node.name,
                value: e.node.item_id,
                object: e.node
            }
        });
        return {
            nodes: nodes,
            pageInfo: results?.pageInfo
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