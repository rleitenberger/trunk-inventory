'use client';

import DropDownSearch from '@/components/form/DropDownSearch';
import React, { useEffect, useState } from 'react';
import type { Location } from '@/types/Location';
import type { Item } from '@/types/Item';
import { ApolloQueryResult, useApolloClient } from '@apollo/client';
import { getLocations, getItems } from '@/graphql/queries';
import type { TransferOptions } from '@/types/TransferOptions';
import { BiRightArrow, BiRightArrowAlt, BiTransfer } from 'react-icons/bi';
import { DropDownSearchOption, PaginatedDropDownSearchOptions } from '@/types/DropDownSearchOption';
import useOrganization from '@/components/providers/useOrganization';
import { PageInfo } from '@/types/getItemsTypes';

export default function PageTransfer() {
    const client = useApolloClient();
    const orgId = useOrganization();

    const [transferOptions, setTransferOptions] = useState<TransferOptions>({
        from: '',
        to: '',
        item: '',
        qty: 0
    });


    const fetchLocations = async(search: string): Promise<DropDownSearchOption[]> => {
        const res: ApolloQueryResult<any> = await client.query({
            query: getLocations,
            variables: {
                organizationId: orgId,
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

    const fetchItems = async(search: string, pageInfo: PageInfo|undefined = undefined): Promise<PaginatedDropDownSearchOptions> => {
        const res: ApolloQueryResult<any> = await client.query({
            query: getItems,
            variables: {
                organizationId: orgId,
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

    const onFieldChange = (value: string|null, name: string): void  => {
        setTransferOptions({
            ...transferOptions,
            [name]: value
        });
    }

    const onQtyChange = (e: React.ChangeEvent<HTMLInputElement>):void => {
        setTransferOptions({
            ...transferOptions,
            qty: parseInt(e.target.value)
        });
    }

    const transferItem = async () => {
        console.log(transferOptions);
    }

    return (
        <>
            <h1 className='text-xl font-medium'>Transfer to Trunk Inventory</h1>

            <div className='grid grid-cols-1 gap-2'>
                <div className='grid grid-cols-12 gap-4'>
                    <div className='col-span-12 md:col-span-6'>
                        <label className='text-sm'>Item</label>
                        <DropDownSearch
                            name='item'
                            refetch={fetchItems}
                            onChange={onFieldChange} />
                    </div>
                    <div className='col-span-12 md:col-span-6'>
                        <div>
                            <label className='text-sm'>Quantity</label>
                        </div>
                        <div>
                            <input type='number' value={transferOptions.qty} name='qty' onChange={onQtyChange}
                                className='px-3 py-1 border border-slate-300 rounded-lg w-full text-sm outline-none' />
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-11'>
                    <div className='col-span-12 md:col-span-5'>
                        <label className='text-sm'>From location</label>
                        <DropDownSearch
                            name='from'
                            refetch={fetchLocations}
                            onChange={onFieldChange}
                            defaultValue={{
                                name: 'Parts Room',
                                value: 'd0223790-565d-440e-8667-5c05228afe33',
                            }} />
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
                <div className="grid grid-cols-12">
                    <div>
                        <p className='text-sm'>Reason</p>
                        <select>
                            <option></option>
                        </select>
                    </div>
                </div>
                <div>
                    <button className=' bg-blue-500 transition-colors hover:bg-blue-600 flex items-center gap-2
                    text-sm text-white px-3 py-1 rounded-lg duration-100' onClick={transferItem}>
                        <BiTransfer />
                        Transfer Item{transferOptions.qty === 1 || transferOptions.qty === -1 ? (
                            ''
                        ) : (
                            's'
                        )}
                    </button>
                </div>
            </div>
        </>
    )
}