import { ApolloClient, ApolloQueryResult } from "@apollo/client"
import DropDownSearch from "./DropDownSearch"
import { getLocations } from "@/graphql/queries"
import { DropDownSearchOption } from "@/types/DropDownSearchOption"
import type { Location } from '@/types/dbTypes';

export default function LocationSearch ({ name, organizationId, apolloClient, onChange, defaultValue, title }: {
    name: string
    apolloClient: ApolloClient<object>
    organizationId: string
    onChange: (value: string|null, name: string) => void
    defaultValue?: DropDownSearchOption
    title?: string
}) { 

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
            <label className='text-sm'>{title ? title : 'Location'}</label>
            <DropDownSearch
                name={name}
                refetch={fetchLocations}
                onChange={onChange}
                defaultValue={defaultValue ? defaultValue : undefined} />
        </>
    )
}