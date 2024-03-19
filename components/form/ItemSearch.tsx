import { PageInfo } from "@/types/paginationTypes"
import DropDownSearch from "./DropDownSearch"
import { ApolloClient, ApolloQueryResult, useApolloClient } from "@apollo/client"
import { getItems, getItemsAtLocation } from "@/graphql/queries"
import { DropDownSearchOption, PaginatedDropDownSearchOptions } from "@/types/DropDownSearchOption"
import useOrganization from "../providers/useOrganization"
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown"
import { useEffect, useRef } from "react"
import { FaBox, FaBoxOpen } from "react-icons/fa"

export default function ItemSearch ({ fn, displayOptions, updatesDefault=false, locationId=undefined, defaultValue=undefined, }: {
    displayOptions: DropDownDisplayGroup
    fn: DropDownValueFunctionGroup
    updatesDefault?: boolean;
    locationId?: string
    defaultValue?: DropDownSearchOption
}) {    
    const apolloClient = useApolloClient();
    const { organizationId, count } = useOrganization();
    const ref=useRef<any>();

    useEffect(() => {
        ref.current?.onLocationChanged();
    }, [locationId]);

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
                        value: item.item_id,
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
            <div className="flex items-center gap-2">
                <FaBoxOpen />
                <label className='text-sm'>{displayOptions?.title ? displayOptions.title : 'Item'}</label>
            </div>
            <DropDownSearch
                fn={{
                    refetch: fetchItems,
                    ...fn
                }}
                defaultValue={defaultValue}
                updatesDefault={updatesDefault}
                objectName={displayOptions.name}
                ref={ref} />
        </>
    )
}