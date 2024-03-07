'use client';

import Loader from '@/components/Loader';
import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import useOrganization from '@/components/providers/useOrganization';
import { getTransactions } from '@/graphql/queries';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { ReasonsFieldsEntry, Transaction, TransactionClient, TransactionEdge } from '@/types/dbTypes';
import { useApolloClient } from '@apollo/client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BiLinkExternal } from 'react-icons/bi';
import { FaCaretDown } from 'react-icons/fa';

export default function PageTransactions() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const apollo = useApolloClient();
    const [transactionOptions, setTransactionOptions] = useState({
        locationId: {
            name: '',
            value: ''
        },
        itemId: {
            name: '',
            value: ''
        },
        transferType: '--'
    });

    const [transactions, setTransactions] = useState<TransactionEdge[]>([]);
    const onFieldChange = (e: DropDownSearchOption, objectName: string): void => {
        setTransactionOptions({
            ...transactionOptions,
            [objectName]: e
        });
    }
    const [pageInfo, setPageInfo] = useState({
        hasNextPage: false,
        endCursor: '',
    });

    const orgId = useOrganization();

    const updateTransferType = (e: React.ChangeEvent<HTMLSelectElement>):void => {
        const { options, selectedIndex }: {
            options: HTMLOptionsCollection
            selectedIndex: number
        } = e.target;

        setTransactionOptions({
            ...transactionOptions,
            transferType: options[selectedIndex].value
        });
    }

    useEffect(() => {
        if (!orgId){
            return;
        }

        setIsLoading(true);

        async function loadTransactions() {
            const res = await apollo.query({
                query: getTransactions,
                variables: {
                    organizationId: orgId,
                    locationId: transactionOptions.locationId.value,
                    itemId: transactionOptions.itemId.value,
                    first: 5,
                    transferType: transactionOptions.transferType
                }
            });

            const trans = res.data?.getTransactions;
            setIsLoading(false);

            if (!trans?.edges){
                return;
            }

            setTransactions(
                trans.edges.map((e: TransactionEdge): TransactionEdge => {
                    return {
                        node: {
                            ...e.node,
                            expanded: false
                        }
                    }
                })
            );
            setPageInfo(trans.pageInfo);
        }

        loadTransactions();
    }, [transactionOptions, orgId]);

    const clearLocation = (): void => {
        setTransactionOptions({
            ...transactionOptions,
            locationId: {
                name: '',
                value: ''
            }
        });
    }

    const clearItem = (): void => {
        setTransactionOptions({
            ...transactionOptions,
            itemId: {
                name: '',
                value: ''
            }
        });
    }

    const updateShowDetails = (transactionId: string): void => {
        const transactionIdx: number = transactions.map((e: TransactionEdge) => e.node.transaction_id).indexOf(transactionId);
        if (transactionIdx === -1) {
            console.error('Transaction was not found');
            return;
        }

        setTransactions((prev: TransactionEdge[]): TransactionEdge[] => {
            const tmp: TransactionEdge[] = prev.map((e: TransactionEdge): TransactionEdge => {
                return {
                    node: {
                        ...e.node
                    }
                }
            })

            tmp[transactionIdx].node.expanded = !tmp[transactionIdx].node.expanded;
            return tmp;
        });
    }

    return (
        <>
            <h1 className='text-xl font-medium'>Transactions</h1>

            <div className='p-2 border border-slate-300 rounded-lg mt-2'>
                <p className='text-sm'>Filters</p>
                <div className="grid gap-2 grid-cols-12">
                    <div className='col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearLocation
                            }}
                            displayOptions={{
                                name: 'locationId'
                            }} />
                    </div>
                    <div className='col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'>
                        <ItemSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearItem
                            }}
                            displayOptions={{
                                name: 'itemId'
                            }} />
                    </div>
                    <div className='col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'>
                        <label className='text-sm'>Transfer Type</label>
                        <div>
                            <select value={transactionOptions.transferType} className='px-2 py-1 text-sm
                                outline-none rounded-lg border border-slate-300 w-full' onChange={updateTransferType}>
                                <option value="--">All</option>
                                <option value="transfer">Transfer</option>
                                <option value="remove">Remove</option>
                                <option value="pull">Pull</option>
                                <option value="return">Return</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className='flex items-center justify-center p-2'>
                    <Loader size='lg' />
                </div>
            ) : (
                <div className='text-sm mt-2'>
                    {transactions?.length > 0 && (
                        <div className="grid-cols-12 gap-2 bg-gray-200 px-2 py-1 hidden md:grid">
                            {transactionOptions.transferType === '--' ? (
                                <>
                                    <div className='col-span-1 font-semibold'>Date</div>
                                    <div className='col-span-1 font-semibold'>Type</div>
                                    <div className='col-span-2 font-semibold'>Item</div>
                                    <div className='col-span-1 font-semibold'>Qty</div>
                                    <div className='col-span-2 font-semibold'>From</div>
                                    <div className='col-span-2 font-semibold'>To</div>
                                    <div className='col-span-2 font-semibold'>Reason</div>
                                </>
                            ) : (
                                <>
                                    <div className='col-span-1 font-semibold'>Date</div>
                                    <div className='col-span-2 font-semibold'>Item</div>
                                    <div className='col-span-1 font-semibold'>Qty</div>
                                    <div className='col-span-2 font-semibold'>From</div>
                                    <div className='col-span-2 font-semibold'>To</div>
                                    <div className='col-span-3 font-semibold'>Reason</div>
                                </>
                            )}
                        </div>
                    )}
                    
                    {transactions.map((e: any, index:number) => {
                        const { node } = e as { node: TransactionClient };

                        const bgClassname:string = index % 2 ? 'md:bg-gray-200' : 'md:bg-slate-300/20';
                        const date = new Date(parseInt(node.created));
                        const rotation = node.expanded ? 'rotate-180' : 'rotate-0';
                        const detailsHeight = node.expanded ? 'h-[100px]' : 'h-[0px]';

                        const { entries } = node as { entries: ReasonsFieldsEntry[] };

                        return (
                            <div key={`t-${node.transaction_id}`} className={`grid grid-cols-12 gap-2 bg-gray-200 rounded-lg md:rounded-none my-2 md:my-0 ${bgClassname}
                                px-2 py-1`}>
                                <div className='col-span-6 md:col-span-1 flex items-center'>
                                    <p className='font-medium block md:hidden'>Date: &nbsp;</p>
                                    <p className='break-all'>{date.toLocaleDateString()}</p>
                                </div>
                                {transactionOptions.transferType === '--' && (
                                    <div className='col-span-6 md:col-span-1 flex items-center'>
                                    <p className='font-medium block md:hidden ml-auto'>Type: &nbsp;</p>
                                        <p className='break-all'>{node.transfer_type}</p>
                                    </div>
                                )}
                                
                                <div className='col-span-6 md:col-span-2'>
                                    <div className='block md:hidden'>
                                        <p className='font-medium'>Item</p>
                                    </div>
                                    <div>
                                        <p>{node.item.name}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs font-semibold text-slate-500'>{node.item.sku || 'No SKU'}</p>
                                    </div>
                                </div>
                                <div className="col-span-1 block md:flex md:items-center">
                                    <div className='block md:hidden'>
                                        <p className='font-medium'>Qty</p>
                                    </div>
                                    <p className='col-span-1'>{node.qty}</p>
                                </div>
                                <div className="col-span-6 md:col-span-2 block md:flex items-center">
                                    <div className='block md:hidden'>
                                        <p className='font-medium'>From</p>
                                    </div>
                                    <div>
                                        <Link href={`/inventory?name=${node.from_location.name}&value=${node.from_location.location_id}`}
                                            className=' flex items-center gap-2 text-blue-500'>
                                            <span>{node.from_location.name}</span>
                                            <BiLinkExternal className='ml-auto' />
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-span-6 md:col-span-2 block md:flex items-center">
                                    <div className='block md:hidden'>
                                        <p className='font-medium'>To</p>
                                    </div>
                                    <div>
                                        <Link href={`/inventory?name=${node.to_location.name}&value=${node.to_location.location_id}`}
                                            className=' flex items-center gap-2 text-blue-500'>
                                            <span>{node.to_location.name}</span>
                                            <BiLinkExternal className='ml-auto' />
                                        </Link>
                                    </div>
                                </div>
                                
                                {transactionOptions.transferType === '--' ? (
                                    <div className="col-span-11 md:col-span-2">
                                        <p className='font-medium'>Reason</p>
                                        <div className="block md:flex items-center">
                                            <p>{node.reason?.name || <span className='text-slate-600'>Reason was archived</span>}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="col-span-11 md:col-span-3">
                                        <p className='font-medium'>Reason</p>
                                        <div className="block md:flex items-center">
                                            <p>{node.reason?.name || <span className='text-slate-600'>Reason was archived</span>}</p>
                                        </div>
                                    </div>
                                )}
                                {node.reason?.reasons_fields?.length && (
                                    <>
                                        <div className='col-span-1 flex'>
                                            <button className='ml-auto p-2 transition-all rounded-lg hover:bg-slate-300/40'
                                                onClick={()=>{
                                                    updateShowDetails(node.transaction_id)
                                                }}>
                                                <FaCaretDown className={rotation} />
                                            </button>
                                        </div>
                                        <div className={`${detailsHeight} transition-all overflow-hidden col-span-12`}>
                                            <div className=''>
                                            <p className='font-medium'>Fields</p>
                                                {node.reason?.reasons_fields?.map(r => {
                                                    const entry = entries?.map(e => e.reasons_fields_id).indexOf(r.reasons_fields_id);
                                                    const value = entries[entry]?.field_value;
                                                    return (
                                                        <div key={r.reasons_fields_id}>
                                                            <p className='font-medium'>{r.field_name}</p>
                                                            <p className='text-slate-600'>{value || <span className='text-slate-600 font-medium text-xs'>No value entered</span>}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}