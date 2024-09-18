'use client';

import { Item } from '@/types/dbTypes';
import { ApolloQueryResult, gql, useApolloClient } from '@apollo/client';
import React, { useEffect, useState } from 'react';

const CycleCountPage = (): JSX.Element => {
    const apolloClient = useApolloClient();
    const [items, setItems] = useState<Item[]>([]);
    
    const loadItems = async (): Promise<void> => {
        const { data } = await apolloClient.query({
            query: gql`
                query cycleCountItems($count: Int!) {
                    cycleCountItems(count: $count) {
                        item_id
                        name
                    }
                }
            `,
            variables: {
                count: 40
            }
        }) as ApolloQueryResult<Item[]> & {
            data: {
                cycleCountItems?: Item[];
            }
        };

        if (!data.cycleCountItems) {
            return;
        }

        setItems(data.cycleCountItems);
    }
    
    return (
        <>
            <button onClick={loadItems}
                className='px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg outline-none transition-colors text-sm text-white'>Select random items</button>

            <div className='grid grid-cols-12 gap-1 text-sm'>
                {items.map((item: Item, index: number) => {
                    return (
                        <div key={`item-${item.item_id}`}
                            className='col-span-12'>{item.name}</div>
                    )
                })}
            </div>
        </>
    )
}

export default CycleCountPage;