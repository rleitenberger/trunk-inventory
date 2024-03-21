'use client';

import LocationSearch from '@/components/form/LocationSearch';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { TransferOptions } from '@/types/TransferOptions';
import { useApolloClient } from '@apollo/client';
import { getItemsAtLocation } from '@/graphql/queries';
import Loader from '@/components/Loader';
import { InventoryInput, PageInfo } from '@/types/paginationTypes';
import { PaginatedLocationItemsArgs } from '@/types/queryTypes';
import { useSearchParams } from 'next/navigation';
import ExportInventoryCSVModal from '@/components/modal/ExportInventoryCSVModal';
import { Item, LocationItem } from '@/types/dbTypes';
import ItemSearch from '@/components/form/ItemSearch';

export default function PageInventory() {
    const apolloClient = useApolloClient();

    const [locationId, setLocationId] = useState<DropDownSearchOption>({
        name: '',
        value: ''
    });

    const updateLocation = (e: DropDownSearchOption, name: string): void => {
        setLocationId({
            name: e.name,
            value: e.value
        });
    }

    const clearLocation = () => {
        setLocationId({
            name: '',
            value: ''
        });
    }

    const [itemId, setItemId] = useState<DropDownSearchOption>({
        name: '',
        value: '',
    });

    const updateItem = (e: DropDownSearchOption, name: string): void => {
        setItemId({
            name: e.name,
            value: e.value
        })
    }

    const clearItem = () => {
        setItemId({
            name: '',
            value: ''
        })
    }

    const [defaultValue, setDefaultValue] = useState<DropDownSearchOption|null>(null);
    const [isLoadingDefaultValue, setIsLoadingDefaultValue] = useState<boolean>(true);

    const [items, setItems] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const params = useSearchParams();

    const [pageInfo, setPageInfo] = useState<PageInfo>({
        endCursor: '',
        hasNextPage: false
    });


    const [page, setPage] = useState(0);

    const formattedInventory = useMemo(() => {
        let ret: any = {};

        items?.forEach((e: any) => {

            const { node } = e as { node: LocationItem };
;
            if (!ret[node.location.location_id]?.items){
                ret[node.location.location_id] = {
                    name: node.location.name,
                    items: []
                }
            }

            ret[node.location.location_id].items.push({
                item: node.item,
                qty: node.qty
            });
        })

        return ret;
    }, [items]);

    const formattedInventoryKeys = useMemo(() => {
        return Object.keys(formattedInventory);
    }, [formattedInventory]);

    const fetchInventory = useCallback(async (dir: 'forward'|'backward'): Promise<any> => {
        const variables: PaginatedLocationItemsArgs = {
            locationId: locationId.value,
            itemId: itemId.value,
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
    }, [locationId, itemId, apolloClient, pageInfo]);

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
    }, [page]);

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

        setLocationId({
            name: defVal.name,
            value: defVal.value
        });
        setDefaultValue(defVal);
        setIsLoadingDefaultValue(false);
    }, [params]);

    useEffect(() => {
        setIsLoading(true);

        async function getItems () {
            const i = await fetchInventory('forward');
            setItems(i);

            setIsLoading(false);
        }

        getItems();
    }, [locationId, itemId, fetchInventory]);

    const getInventoryOptions = (): DropDownSearchOption => {
        return locationId;
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <h1 className='text-xl font-medium'>Inventory</h1>
                <div className="ml-auto">
                    <ExportInventoryCSVModal exportType='Items' onShowModal={getInventoryOptions} />
                </div>
            </div>
            <div className='grid grid-cols-12 gap-4'>

                <div className='col-span-12 sm:col-span-6 md:col-span-4'>
                    {isLoadingDefaultValue ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader size='lg' />
                        </div>
                    ) : (
                        <>
                            {defaultValue ? (
                                <LocationSearch fn={{
                                    onChange: updateLocation,
                                    clear: clearLocation
                                }}
                                displayOptions={{
                                    name: 'locationId',
                                    title: 'Location'
                                }}
                                defaultValue={defaultValue} />
                            ) : (
                                <LocationSearch fn={{
                                    onChange: updateLocation,
                                    clear: clearLocation
                                }}
                                displayOptions={{
                                    name: 'location',
                                    title: 'Location'
                                }} />
                            )}
                        </>
                        )}
                </div>
                <div className="col-span-12 sm:col-span-6 md:col-span-4">
                    <ItemSearch fn={{
                        onChange: updateItem,
                        clear: clearItem
                    }}
                    displayOptions={{
                        name: 'itemId',
                        title: 'Item'
                    }} />
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
                            
                            {formattedInventoryKeys.map((e: string) => {
                                let obj = formattedInventory[e];
                                return (
                                    <React.Fragment key={`loc-${e}`}>
                                        {!locationId.value && (
                                            <div className='grid grid-cols-12 mt-4'>
                                                <div className='col-span-12 px-2 py-1'>{obj.name}</div>
                                            </div>
                                        )}
                                        <div className='grid grid-cols-12 gap-2 font-medium bg-gray-200'>
                                            <div className='col-span-4 md:col-span-3 break-words px-2 py-1'>
                                                <p>SKU</p>
                                            </div>
                                            <div className='col-span-6 md:col-span-4 break-words px-2 py-1'>
                                                <p>Item Name</p>
                                            </div>
                                            <div className='col-span-2 md:col-span-1 break-words px-2 py-1'>
                                                <p>Qty</p>
                                            </div>
                                            <div className='hidden md:block col-span-4 break-words px-2 py-1'>
                                                <p>Description</p>
                                            </div>
                                        </div>
                                        {obj?.items?.map((itemObj: any, index: number) => {
                                            const bgClassname:string = index % 2 ? 'bg-gray-200' : 'bg-slate-300/20';
                                            const { item, qty } = itemObj as { item: Item, qty: number };

                                            return (
                                                <div key={`${item.item_id}-${e}`} className={`grid grid-cols-12 gap-x-2 gap-y-0 ${bgClassname}`}>
                                                    <div className='col-span-4 md:col-span-3 break-words px-2 py-1'>
                                                        <p>{item.sku || <span className='text-slate-600 font-medium text-xs'>No SKU set</span>}</p>
                                                    </div>
                                                    <div className='col-span-6 md:col-span-4 break-words px-2 py-1'>
                                                        <p className='elip'>{item.name}</p>
                                                    </div>
                                                    <div className='col-span-2 md:col-span-1 break-words px-2 py-1'>
                                                        <p className=''>{qty}</p>
                                                    </div>
                                                    <div className='col-span-12 md:col-span-4 px-2 py-1'>
                                                        <p className='elip'>{item.description || <span className='text-slate-600 font-medium text-xs'>No description set</span>}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </React.Fragment>
                                    
                                )
                            })}
                        </>
                    ) : (
                        <>
                            {!isLoadingDefaultValue && !!locationId.value && (
                                <p className='text-slate-600 font-medium text-center'>No items were found at this location</p>
                            )}
                        </>
                    )}
                    
                </div>
            )}

        </>
    )
}