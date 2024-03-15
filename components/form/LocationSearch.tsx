import { ApolloClient, ApolloQueryResult, useApolloClient } from "@apollo/client"
import DropDownSearch from "./DropDownSearch"
import { getLocations } from "@/graphql/queries"
import { DropDownSearchOption } from "@/types/DropDownSearchOption"
import type { Location } from '@/types/dbTypes';
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";
import useOrganization from "../providers/useOrganization";
import { MdLocationOn } from "react-icons/md";

export default function LocationSearch ({ fn, displayOptions, defaultValue=undefined }: {
    displayOptions: DropDownDisplayGroup
    fn: DropDownValueFunctionGroup
    defaultValue?: DropDownSearchOption
}) { 
    const { organizationId, count } = useOrganization();
    const apolloClient = useApolloClient();

    const fetchLocations = async(search: string): Promise<DropDownSearchOption[]> => {
        const res: ApolloQueryResult<any> = await apolloClient.query({
            query: getLocations,
            variables: {
                organizationId: organizationId,
                search: search
            }
        });

        if (!res.data) {
            //error
        }

        const results: any = res.data?.getLocations;
        return results.map((e: Location) => {
            return {
                name: e.name,
                value:e.location_id,
                object: e
            };
        });
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <MdLocationOn />
                <label className='text-sm'>{displayOptions?.title ? displayOptions.title : 'Location'}</label>
            </div>
            <DropDownSearch
                fn={{
                    refetch: fetchLocations,
                    ...fn
                }}
                defaultValue={defaultValue}
                objectName={displayOptions?.name} />
        </>
    )
}