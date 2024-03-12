'use client';

import LocationSearch from '@/components/form/LocationSearch';
import React, { useEffect, useMemo, useState } from 'react';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { TransferOptions } from '@/types/TransferOptions';
import { useApolloClient } from '@apollo/client';
import { getItemsAtLocation } from '@/graphql/queries';
import Loader from '@/components/Loader';
import { PageInfo } from '@/types/paginationTypes';
import { PaginatedLocationItemsArgs } from '@/types/queryTypes';
import { useSearchParams } from 'next/navigation';

export default function PageInventory() {
    const apolloClient = useApolloClient();

    const [inventoryOptions, setInventoryOptions] = useState<TransferOptions<DropDownSearchOption>>({
        location: {
            name: '',
            value: '',
        }
    });

    const [defaultValue, setDefaultValue] = useState<DropDownSearchOption|null>(null);
    const [isLoadingDefaultValue, setIsLoadingDefaultValue] = useState<boolean>(true);

    const [items, setItems] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const params = useSearchParams();

    const [pageInfo, setPageInfo] = useState<PageInfo>({
        endCursor: '',
        hasNextPage: false
    });


    const clearLocation = () => {
        setInventoryOptions({
            ...inventoryOptions,
            location: {
                name: '',
                value: ''
            }
        });
    }

    const [page, setPage] = useState(0);

    const updateLocation = (e: DropDownSearchOption, name: string): void => {
        setInventoryOptions({
            location: {
                name: name,
                value: e.value
            }
        });
    }

    const fetchInventory = async (dir: 'forward'|'backward'): Promise<any> => {
        if (!inventoryOptions?.location.value){
            console.error('no location was selected');
            return [];
        }

        const variables: PaginatedLocationItemsArgs = {
            locationId: inventoryOptions.location.value,
            includeNegative: true
        }

        if (dir === 'forward'){
            variables.first=25;
            variables.after = pageInfo.endCursor;
        } else {
            variables.last=25;
            variables.before= pageInfo.startCursor;
        }

        const { data } = await apolloClient.query({
            query: getItemsAtLocation,
            variables: variables
        });

        if(!data?.getItemsAtLocation?.edges){
            console.error('no items , error probably');
            return [];
        }

        setPageInfo(data.getItemsAtLocation.pageInfo);

        return data.getItemsAtLocation.edges;
    }

    const prevPage = () => {
        if (page === 0){
            return;
        }

        setPage(page - 1);
    }

    const nextPage = () => {
        if (!pageInfo.hasNextPage){
            return;
        }

        setPage(page + 1);
    }

    const hasPrevPage = useMemo(() => {
        return page > 0;
    }, [pageInfo]);

    useEffect(() => {
        let defVal = {
            name: '',
            value: ''
        };

        if (typeof window === 'undefined'){
            setDefaultValue(defVal);
            setIsLoadingDefaultValue(false);
            return;
        }

        const name = params.get('name');
        const value = params.get('value');

        if (!name || !value){
            setDefaultValue(defVal);
            setIsLoadingDefaultValue(false);
            return;
        }

        defVal={
            name: name,
            value: value
        };

        setInventoryOptions({
            ...inventoryOptions,
            location: defVal
        });
        setDefaultValue(defVal);
        setIsLoadingDefaultValue(false);
    }, []);

    useEffect(() => {
        setIsLoading(true);

        async function getItems () {
            const i = await fetchInventory('forward');
            setItems(i);

            setIsLoading(false);
        }

        getItems();
    }, [inventoryOptions.location]);

    return (
        <>
            <h1 className='text-xl font-medium'>Inventory</h1>
            <div className='grid grid-cols-12 gap-4'>

                <div className='col-span-12 sm:col-span-6 md:col-span-4'>
                    {isLoadingDefaultValue ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader size='lg' />
                        </div>
                    ) : (
                        <>
                            {defaultValue && (
                                <LocationSearch fn={{
                                    onChange: updateLocation,
                                    clear: clearLocation
                                }}
                                displayOptions={{
                                    name: 'location',
                                    title: 'Location'
                                }}
                                defaultValue={defaultValue} />
                            )}
                        </>
                        )}
                </div>
            </div>

            {isLoading ? (
                <div className='p-4 flex items-center justify-center'>
                    <Loader size='lg' />
                </div>
            ) : (
                <div className='text-sm mt-2'>
                    {items?.length ? (
                        <>
                            <div className='grid grid-cols-12 gap-2 font-medium bg-gray-200 px-2 py-1 rounded-t-lg'>
                                <div className='col-span-3 whitespace-nowrap break-words'>
                                    <p>SKU</p>
                                </div>
                                <div className='col-span-3 whitespace-nowrap break-words'>
                                    <p>Item Name</p>
                                </div>
                                <div className='col-span-2 whitespace-nowrap break-words'>
                                    <p>Qty</p>
                                </div>
                                <div className='col-span-4 whitespace-nowrap break-words'>
                                    <p>Description</p>
                                </div>
                            </div>
                            {items?.map((e: any, index: number) => {
                                const bgClassname:string = index % 2 ? 'bg-gray-200' : 'bg-slate-300/20';

                                return (
                                    <div key={e.item_id} className={`grid grid-cols-12 gap-2 ${bgClassname} px-2 py-1`}>
                                    <div className='col-span-3 whitespace-nowrap break-words'>
                                        <p>{e.node.item.sku || <span className='text-slate-600 font-medium text-xs'>No SKU set</span>}</p>
                                    </div>
                                        <div className='col-span-3 whitespace-nowrap break-words'>
                                            <p>{e.node.item.name}</p>
                                        </div>
                                        <div className='col-span-2 whitespace-nowrap break-words'>
                                            <p>{e.node.qty}</p>
                                        </div>
                                        <div className='col-span-4 whitespace-nowrap break-words'>
                                            <p>{e.node.description || <span className='text-slate-600 font-medium text-xs'>No description set</span>}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div>

                            </div>
                        </>
                    ) : (
                        <>
                            {!isLoadingDefaultValue && (
                                <p className='text-slate-600 font-medium text-center'>No items were found at this location</p>
                            )}
                        </>
                    )}
                    
                </div>
            )}

        </>
    )
}