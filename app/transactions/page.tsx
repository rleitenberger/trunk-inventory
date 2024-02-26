'use client';

import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import useOrganization from '@/components/providers/useOrganization';
import { getTransactions } from '@/graphql/queries';
import { useApolloClient } from '@apollo/client';
import React, { useEffect, useState } from 'react';

export default function PageTransactions() {
    const apollo = useApolloClient();
    const [transactionOptions, setTransactionOptions] = useState({
        locationId: '',
        itemId: '',
    });

    const [transactions, setTransactions] = useState([]);
    const onFieldChange = (value: string|null, name: string): void => {
        setTransactionOptions({
            ...transactionOptions,
            [name]:value
        });
    }
    const [pageInfo, setPageInfo] = useState({
        hasNextPage: false,
        endCursor: '',
    });

    const orgId = useOrganization();

    useEffect(() => {
        if (!orgId){
            return;
        }

        async function loadTransactions() {
            const res = await apollo.query({
                query: getTransactions,
                variables: {
                    organizationId: orgId,
                    locationId: transactionOptions.locationId,
                    itemId: transactionOptions.itemId,
                    first: 25
                }
            });

            const trans = res.data?.getTransactions;

            if (!trans?.edges){
                return;
            }

            setTransactions(trans.edges);
            setPageInfo(trans.pageInfo);
        }

        loadTransactions();
    }, [transactionOptions, orgId]);

    return (
        <>
            <h1 className='text-xl font-medium'>Transactions</h1>

            <div className='p-2 border border-slate-300 rounded-lg mt-2'>
                <p className='text-sm'>Filters</p>
                <div className="grid gap-2 grid-cols-12">
                    <div className='col-span-12 md:col-span-6'>
                        <LocationSearch
                            onChange={onFieldChange}
                            name='locationId'
                            apolloClient={apollo}
                            organizationId={orgId} />
                    </div>
                    <div className='col-span-12 md:col-span-6'>
                        <ItemSearch
                            onChange={onFieldChange}
                            name='itemId'
                            apolloClient={apollo}
                            organizationId={orgId} />
                    </div>
                </div>
            </div>

            <div className='text-sm mt-2'>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-2 font-semibold'>Date</div>
                    <div className='col-span-2 font-semibold'>SKU</div>
                    <div className='col-span-2 font-semibold'>From</div>
                    <div className='col-span-2 font-semibold'>To</div>
                    <div className='col-span-2 font-semibold'>Project</div>
                    <div className='col-span-2 font-semibold'>Reason</div>
                </div>
                {transactions.map((e: any) => {
                    const { node } = e;
                    return (
                        <div key={`t-${node.transaction_id}`} className='grid grid-cols-12 gap-2'>
                            <p className='col-span-2'>{node.created}</p>
                            <p className='col-span-2'>{node.item.name}</p>
                            <p className='col-span-2'>{node.from_location.name}</p>
                            <p className='col-span-2'>{node.to_location.name}</p>
                            <p className='col-span-2'>project</p>
                            <p className='col-span-2'>{node.reason.name}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}