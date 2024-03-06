'use client';

import LocationSearch from '@/components/form/LocationSearch';
import React, { useEffect, useState } from 'react';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { TransferOptions } from '@/types/TransferOptions';
import { Item } from '@/types/dbTypes';
import { useApolloClient } from '@apollo/client';
import { getItemsAtLocation } from '@/graphql/queries';

export default function PageInventory() {

    const apolloClient = useApolloClient();

    const [inventoryOptions, setInventoryOptions] = useState<TransferOptions<DropDownSearchOption>>({
        location: {
            name: '',
            value: '',
        }
    });
    const [items, setItems] = useState<any>([]);

    const clearLocation = () => {
        setInventoryOptions({
            ...inventoryOptions,
            location: {
                name: '',
                value: ''
            }
        });
    }

    const updateLocation = (e: DropDownSearchOption, name: string): void => {
        setInventoryOptions({
            location: {
                name: name,
                value: e.value
            }
        });
    }

    const fetchInventory = async (): Promise<any> => {
        if (!inventoryOptions?.location.value){
            console.error('no location was selected');
            return [];
        }

        const { data } = await apolloClient.query({
            query: getItemsAtLocation,
            variables: {
                locationId: inventoryOptions.location.value,
                //after: pageinfo
            }
        });

        if(!data?.getItemsAtLocation?.edges){
            console.error('no items , error probably');
            return [];
        }

        return data.getItemsAtLocation.edges;
    }

    useEffect(() => {
        async function getItems () {
            const i = await fetchInventory();
            setItems(i);
        }

        getItems();
    }, [inventoryOptions.location]);

    return (
        <>
            <h1 className='text-xl font-medium'>Inventory</h1>

            <LocationSearch fn={{
                onChange: updateLocation,
                clear: clearLocation
            }}
            displayOptions={{
                name: 'location',
                title: 'Location'
            }} />

            <div>
                {items?.map(e => {
                    return (
                        <div key={e.item_id}>
                            <p>{e.node.item.name}</p>
                            <p>{e.node.qty}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}