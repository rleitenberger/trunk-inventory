'use client';

import DropDownSearch from '@/components/form/DropDownSearch';
import React, { useEffect, useState } from 'react';
import type { Location } from '@/types/Location';
import { ApolloQueryResult, useApolloClient } from '@apollo/client';
import { getLocations } from '@/graphql/queries';
import { TransferOptions } from '@/types/TransferOptions';
import { BiRightArrow, BiRightArrowAlt, BiTransfer } from 'react-icons/bi';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';

export default function PageTransfer() {
    const client = useApolloClient();

    const [transferOptions, setTransferOptions] = useState<TransferOptions>({
        from: '',
        to: '',
    });


    const fetchLocations = async(search: string): Promise<DropDownSearchOption<Location>[]> => {
        const res: ApolloQueryResult<any> = await client.query({
            query: getLocations,
            variables: {
                organizationId: 'd33e613c-c4b1-4829-a600-eacf71c3f4ed',
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

    const onFieldChange = (value: string, name: string): void  => {
        setTransferOptions({
            ...transferOptions,
            [name]: value
        });
    }

    return (
        <>
            <h1 className='text-xl font-medium'>Transfer to Trunk Inventory</h1>

            <div>
                <div className='grid grid-cols-11'>
                    <div className='col-span-12 md:col-span-5'>
                        <label className='text-sm'>From location</label>
                        <DropDownSearch
                            name='from'
                            refetch={fetchLocations}
                            onChange={onFieldChange} />
                    </div>
                    <BiRightArrowAlt className='text-lg col-span-1 self-center mx-auto hidden md:block' />
                    <div className='col-span-12 md:col-span-5'>
                        <label className='text-sm'>To location</label>
                        <DropDownSearch
                            name='to'
                            refetch={fetchLocations}
                            onChange={onFieldChange} />
                    </div>
                </div>
            </div>
        </>
    )
}