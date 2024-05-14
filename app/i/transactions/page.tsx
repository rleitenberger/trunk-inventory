'use client';

import Loader from '@/components/Loader';
import AdminGuard from '@/components/auth/AdminGuard';
import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import ExportTransactionCSVModal from '@/components/modal/ExportTransactionsCSVModal';
import TransactionCommentsModal from '@/components/modal/TransactionCommentsModal';
import useOrganization from '@/components/providers/useOrganization';
import { getTransactions } from '@/graphql/queries';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { BetweenDate, ExportOptions, ReasonsFieldsEntry, TransactionClient, TransactionEdge } from '@/types/dbTypes';
import { PageInfo, TransactionArgs, TransactionInput } from '@/types/paginationTypes';
import { useApolloClient } from '@apollo/client';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { BiChevronLeft, BiChevronRight, BiLinkExternal, BiRightArrowAlt, BiTransfer } from 'react-icons/bi';
import { FaCaretDown } from 'react-icons/fa';
import { MdOutlineTableView } from 'react-icons/md';

const SORT_COLUMN = 'created';

interface DefaultTransactionOptions {
    to: string|null;
    from: string|null;
    take: string|null;
    locationName:string|null;
    locationId:string|null;
    itemName:string|null;
    itemId:string|null;
    transferType:string|null;
}

export default function TransactionsURLWrapper() {
    const [defaultOptions, setDefaultOptions] = useState<DefaultTransactionOptions|null>(null);

    useEffect(() => {
        if (typeof window === 'undefined'){
            setDefaultOptions({
                to: null, from: null, take: null, locationName: null, locationId: null,
                    itemName: null, itemId: null, transferType: null,
            });
            return;
        }

        const url = new URL(window.location.href);
        const { searchParams } = url;

        setDefaultOptions({
            to: searchParams.get('to'),
            from: searchParams.get('from'),
            take: searchParams.get('take'),
            locationName:searchParams.get('locationName'),
            locationId: searchParams.get('location'),
            itemName: searchParams.get('itemName'),
            itemId: searchParams.get('itemId'),
            transferType: searchParams.get('transferType'),
        });
    }, []);

    return defaultOptions === null ? (
        <div className='h-screen w-screen flex items-center justify-center'>
            <Loader size='lg' />
        </div>
    ) : (
        <PageTransactions defaultOptions={defaultOptions} />
    )
}

function PageTransactions({ defaultOptions }: {
    defaultOptions: DefaultTransactionOptions;
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const apollo = useApolloClient();

    const { organizationId, count } = useOrganization();
    const [transactionOptions, setTransactionOptions] = useState<TransactionArgs>({
        transactionInput: {
            organizationId: organizationId,
            locationId: {
                name: defaultOptions.locationName ?? '',
                value: defaultOptions.locationId ?? '',
            },
            itemId: {
                name: defaultOptions.itemName ?? '',
                value: defaultOptions.itemId ?? '',
            },
            transferType: defaultOptions.transferType ?? '--',
            between: {
                from: defaultOptions.from ?? '',
                to: defaultOptions.to ?? '',
            } as BetweenDate
        },
        paginationInput: {
            before: '',
            after: '',
            take: defaultOptions.take ? parseInt(defaultOptions.take, 10) : 25,
        }
    });

    const [transactions, setTransactions] = useState<TransactionEdge[]>([]);
    const onFieldChange = (e: DropDownSearchOption, objectName: string): void => {
        setTransactionOptions({
            transactionInput: {
                ...transactionOptions.transactionInput,
                [objectName]: e
            },
            paginationInput: transactionOptions.paginationInput
        });

        let param = objectName.replace('Id', '');
        addUrlParam(`${param}Name`, e.name);
        addUrlParam(`${param}Id`, e.value);
    }
    const [pageInfo, setPageInfo] = useState({
        hasNextPage: false,
        startCursor: '',
        endCursor: '',
        sortColumn: SORT_COLUMN,
        sortColumnValueStart: '',
        sortColumnValueEnd: ''
    });

    const updateTransferType = (e: React.ChangeEvent<HTMLSelectElement>):void => {
        const { options, selectedIndex }: {
            options: HTMLOptionsCollection
            selectedIndex: number
        } = e.target;

        setTransactionOptions({
            transactionInput: {
                ...transactionOptions.transactionInput,
                transferType: options[selectedIndex].value
            },
            paginationInput: transactionOptions.paginationInput
        });

        addUrlParam('transferType', options[selectedIndex].value)
    }


    const fetchTransactions = useCallback(async (direction: 'forward'|'backward'|'ignore') => {
        setIsLoading(true);

        let variables: TransactionArgs = {
            transactionInput: {
                organizationId: organizationId,
                locationId: transactionOptions.transactionInput.locationId?.value,
                itemId: transactionOptions.transactionInput.itemId?.value,
                transferType: transactionOptions.transactionInput.transferType,
                between: {
                    from: transactionOptions.transactionInput.between.from,
                    to: transactionOptions.transactionInput.between.to
                }
            },
            paginationInput: {
                sortColumn: SORT_COLUMN,
                sortColumnValue: '',
                take: transactionOptions.paginationInput.take
            }
        }

        if (direction === 'backward'){
            variables.paginationInput.before = pageInfo.startCursor;
            variables.paginationInput.last =transactionOptions.paginationInput.take;
            variables.paginationInput.sortColumnValue = pageInfo.sortColumnValueStart;
        } else if (direction === 'forward') {
            variables.paginationInput.after = pageInfo.endCursor;
            variables.paginationInput.first=transactionOptions.paginationInput.take;
            variables.paginationInput.sortColumnValue = pageInfo.sortColumnValueEnd
        } else {
            variables.paginationInput.first=transactionOptions.paginationInput.take;
        }

        const res = await apollo.query({
            query: getTransactions,
            variables: variables
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
        setPageInfo((prev) => {
            return {
                ...prev,
                endCursor: trans.pageInfo.endCursor,
                startCursor: trans.pageInfo.startCursor,
                hasNextPage: trans.pageInfo.hasNextPage,
                sortColumn: 'created',
                sortColumnValueStart: trans.pageInfo.sortColumnValueStart,
                sortColumnValueEnd: trans.pageInfo.sortColumnValueEnd
            };
        });
    }, [organizationId, pageInfo, transactionOptions, apollo]);

    useEffect(() => {
        if (!organizationId){
            return;
        }

        setPageInfo((prev) => {
            return {
                ...prev,
                endCursor: '',
                startCursor: '',
                sortColumnValueStart: '',
                sortColumnValueEnd: ''
            }
        });
        setPage(1);

        fetchTransactions('ignore');

    }, [transactionOptions, organizationId]);

    const clearLocation = (): void => {
        setTransactionOptions({
            transactionInput: {
                ...transactionOptions.transactionInput,
                locationId: {
                    name: '',
                    value: ''
                }
            },
            paginationInput: transactionOptions.paginationInput
        });

        removeUrlParam('locationName');
        removeUrlParam('locationId');
    }

    const clearItem = (): void => {
        setTransactionOptions({
            transactionInput: {
                ...transactionOptions.transactionInput,
                itemId: {
                    name: '',
                    value: ''
                }
            },
            paginationInput: transactionOptions.paginationInput
        });

        removeUrlParam('itemName');
        removeUrlParam('itemId');
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

    const updateDisplayCount = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setTransactionOptions({
            transactionInput: transactionOptions.transactionInput,
            paginationInput: {
                ...transactionOptions.paginationInput,
                take: parseInt(options[selectedIndex].value, 10)
            }
        });

        addUrlParam('take', options[selectedIndex].value)
    }

    const [page,setPage] = useState<number>(1);

    const prevPage = (): void => {
        if (page <= 1){
            return;
        }

        setPage((prev: number): number => {
            return prev - 1;
        })

        fetchTransactions('backward');
    }

    const nextPage = (): void => {
        if (!pageInfo.hasNextPage){
            return;
        }

        setPage((prev: number): number => {
            return prev + 1;
        })

        fetchTransactions('forward');
    }

    const updateDate = (e: React.ChangeEvent<HTMLInputElement>, field: string): void => {
        setTransactionOptions({
            transactionInput: {
                ...transactionOptions.transactionInput,
                between: {
                    ...transactionOptions.transactionInput.between,
                    [field]: e.target.value
                }
            },
            paginationInput: transactionOptions.paginationInput,
        });

        if (!e.target.value) {
            removeUrlParam(field);
        } else {
            addUrlParam(field, e.target.value);
        }
    }

    const addUrlParam = (key: string, value: string): void => {
        if (typeof window === 'undefined'){
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState(null,'',url);
    }

    const removeUrlParam = (key: string) => {
        if (typeof window === 'undefined') {
            return;
        }
        
        const url = new URL(window.location.href);
        url.searchParams.delete(key);
        window.history.replaceState(null,'',url);
    }

    const getTransactionOptions = (): TransactionInput => {
        return transactionOptions.transactionInput;
    }

    return (
        <AdminGuard callbackUrl='/i/transactions'>
            <div className='flex items-center gap-2'>
                <h1 className='text-xl font-medium'>Transactions</h1>
                <div className='ml-auto'>  
                    <ExportTransactionCSVModal exportType='Transactions' onShowModal={getTransactionOptions} />
                </div>
            </div>

                <p className='text-sm'>Filters</p>
                <div className="grid gap-2 grid-cols-12">
                    <div className="col-span-6 md:col-span-4 lg:col-span-3 text-sm">
                        <label>From</label>
                        <div className='flex'>
                            <input type="date" className='border border-slate-300 rounded-lg px-2 py-1 flex-1 outline-none
                                bg-white'
                                value={transactionOptions.transactionInput.between.from} onChange={(e) => {
                                    updateDate(e, 'from')
                                }} />
                        </div>
                    </div>
                    <div className="col-span-6 md:col-span-4 lg:col-span-3 text-sm">
                        <label>To</label>
                        <div className='flex'>
                            <input type="date" className='border border-slate-300 rounded-lg px-2 py-1 flex-1 outline-none
                                bg-white'
                                value={transactionOptions.transactionInput.between.to} onChange={(e) => {
                                    updateDate(e, 'to')
                                }} />
                        </div>
                    </div>
                    <div className='col-span-6 md:col-span-4 lg:col-span-3'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearLocation
                            }}
                            displayOptions={{
                                name: 'locationId'
                            }}
                            defaultValue={transactionOptions.transactionInput.locationId} />
                    </div>
                    <div className='col-span-6 md:col-span-4 lg:col-span-3'>
                        <ItemSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearItem
                            }}
                            displayOptions={{
                                name: 'itemId'
                            }}
                            defaultValue={transactionOptions.transactionInput.itemId} />
                    </div>
                    <div className='col-span-6 md:col-span-4 lg:col-span-3'>
                        <div className='flex items-center gap-2'>
                            <BiTransfer />
                            <label className='text-sm'>Transfer Type</label>
                        </div>
                        <div>
                            <select value={transactionOptions.transactionInput.transferType} className='px-2 py-1 text-sm
                                outline-none rounded-lg border border-slate-300 w-full bg-white text-[16px] md:text-sm' onChange={updateTransferType}>
                                <option value="--">All</option>
                                <option value="transfer">Transfer</option>
                                <option value="remove">Remove</option>
                                <option value="pull">Pull</option>
                                <option value="return">Return</option>
                            </select>
                        </div>
                    </div>
                    <div className='col-span-6 md:col-span-4 lg:col-span-3'>
                        <div className='flex items-center gap-2'>
                            <MdOutlineTableView />
                            <label className='text-sm'># of transactions</label>
                        </div>
                        <div>
                            <select value={transactionOptions.paginationInput.take} className='px-2 py-1 text-sm
                                outline-none rounded-lg border border-slate-300 w-full bg-white text-[16px] md:text-sm' onChange={updateDisplayCount}>
                                <option value="5">5</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
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
                            {transactionOptions.transactionInput.transferType === '--' ? (
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
                                px-2 py-1 text-[.8rem]`}>
                                <div className='col-span-12 md:col-span-1 flex items-center'>
                                    <p className='font-medium block md:hidden'>Date</p>
                                    <p className='break-all ml-auto md:ml-0'>{date.toLocaleDateString()}</p>
                                </div>
                                {transactionOptions.transactionInput.transferType === '--' && (
                                    <div className='col-span-12 md:col-span-1 flex items-center'>
                                        <p className='font-medium block md:hidden'>Type &nbsp;</p>
                                        <p className='break-all ml-auto md:ml-0'>{node.transfer_type}</p>
                                    </div>
                                )}
                                
                                <div className='col-span-12 md:col-span-2 flex items-center'>
                                    <p className='font-medium block md:hidden'>Item</p>
                                    <div className='ml-auto md:ml-0'>
                                        <p>{node.item.name} <span className='inline md:hidden'>({node.qty})</span></p>
                                        <p className='text-xs font-semibold text-slate-500 text-right md:text-left block'>{node.item.sku || 'No SKU'}</p>
                                    </div>
                                </div>
                                <div className='col-span-1 md:col-span-1 hidden md:flex items-center'>
                                    <p className='font-medium'>{node.qty}</p>
                                </div>
                                <div className='col-span-12 flex md:hidden items-center gap-2'>
                                    <p className='block md:hidden font-medium'>Location</p>
                                    <div className='ml-auto'>
                                        <Link href={`/i/inventory?name=${node.from_location.name}&value=${node.from_location.location_id}`}
                                            className=' flex items-center gap-2 text-blue-500'>
                                            <span>{node.from_location.name}</span>
                                            <BiLinkExternal className='ml-0 md:ml-auto' />
                                        </Link>
                                    </div>
                                    <BiRightArrowAlt />
                                    <Link href={`/i/inventory?name=${node.to_location.name}&value=${node.to_location.location_id}`}
                                        className=' flex items-center gap-2 text-blue-500'>
                                        <span>{node.to_location.name}</span>
                                        <BiLinkExternal className='ml-0 md:ml-auto' />
                                    </Link>
                                </div>
                                <div className="col-span-6 md:col-span-2 hidden md:flex items-center">
                                    <div className='block md:hidden'>
                                        <p className='font-medium'>From</p>
                                    </div>
                                    <div>
                                        <Link href={`/i/inventory?name=${node.from_location.name}&value=${node.from_location.location_id}`}
                                            className=' flex items-center gap-2 text-blue-500'>
                                            <span>{node.from_location.name}</span>
                                            <BiLinkExternal className='ml-0 md:ml-auto' />
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-span-6 md:col-span-2 hidden md:flex items-center">
                                    <div className='block md:hidden'>
                                        <p className='font-medium'>To</p>
                                    </div>
                                    <div>
                                        <Link href={`/i/inventory?name=${node.to_location.name}&value=${node.to_location.location_id}`}
                                            className=' flex items-center gap-2 text-blue-500'>
                                            <span>{node.to_location.name}</span>
                                            <BiLinkExternal className='ml-0 md:ml-auto' />
                                        </Link>
                                    </div>
                                </div>
                                
                                {transactionOptions.transactionInput.transferType === '--' ? (
                                    <div className="col-span-9 md:col-span-1 flex items-center">
                                        <p className='font-medium block md:hidden'>Reason</p>
                                        <p className='ml-auto md:ml-0'>{node.reason?.name || <span className='text-slate-600'>Reason was archived</span>}</p>
                                    </div>
                                ) : (
                                    <div className="col-span-9 md:col-span-2 flex items-center">
                                        <p className='font-medium block md:hidden'>Reason</p>
                                        <p className='ml-auto md:ml-0'>{node.reason?.name || <span className='text-slate-600'>Reason was archived</span>}</p>
                                    </div>
                                )}
                                {node.reason?.reasons_fields?.length && (
                                    <>
                                        <div className='col-span-3 md:col-span-2 flex justify-end'>
                                            <TransactionCommentsModal comments={node.comments} transactionId={node.transaction_id} />
                                            <button className='p-1 md:p-2 transition-all rounded-lg hover:bg-slate-300/40'
                                                onClick={()=>{
                                                    updateShowDetails(node.transaction_id)
                                                }} style={{ 
                                                    zIndex: 1
                                                }}>
                                                <FaCaretDown className={`${rotation}`} />
                                            </button>
                                            <Link href={`/i/transactions/${node.transaction_id}`} className='flex items-center'>
                                                <button className='p-1 md:p-2 transition-all rounded-lg hover:bg-slate-300/40'>
                                                    <BiLinkExternal />
                                                </button>
                                            </Link>
                                        </div>
                                        <div className={`${detailsHeight} transition-all overflow-hidden col-span-12`}>
                                            <div className=''>
                                            {!!node.salesorder_number && (
                                                <p>Sales Order: {node.salesorder_number}</p>
                                            )}
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

                    <div className='flex items-center gap-4 mt-2 justify-center'>
                        <button className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors hover:bg-slate-300/40
                            outline-none disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-500`}
                            disabled={page <= 1} onClick={prevPage}>
                            <BiChevronLeft />
                            Previous
                        </button>
                        <p>{page}</p>
                        <button className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors hover:bg-slate-300/40
                            outline-none disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-500`}
                            disabled={!pageInfo.hasNextPage} onClick={nextPage}>
                            Next
                            <BiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </AdminGuard>
    )
}