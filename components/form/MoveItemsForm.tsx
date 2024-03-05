'use client';

import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getReasons } from '@/graphql/queries';
import type { TransferOptions } from '@/types/TransferOptions';
import { BiTransfer } from 'react-icons/bi';
import useOrganization from '@/components/providers/useOrganization';
import { getTransactionType } from '@/graphql/queries';
import { Reason } from '@/types/dbTypes';
import { createTransaction } from '@/graphql/mutations';
import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import Loader from '@/components/Loader';
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { TransferType } from '@/types/formTypes';
import { moveDefaults } from '@/lib/defaultValues';

export default function MoveItemsForm({ transferType }: {
    transferType: TransferType
}) {
    const client = useApolloClient();
    const orgId = useOrganization();

    const [transferOptions, setTransferOptions] = useState<TransferOptions<DropDownSearchOption>>(moveDefaults[transferType]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [transactionId, setTransactionId] = useState<string>('');

    const onFieldChange = (e:DropDownSearchOption, objectName: string): void  => {
        setTransferOptions({
            ...transferOptions,
            [objectName]: e
        });
    }

    const onQtyChange = (e: React.ChangeEvent<HTMLInputElement>):void => {
        setTransferOptions({
            ...transferOptions,
            qty: {
                ...transferOptions.qty,
                value: parseInt(e.target.value)
            }
        });
    }

    const onReasonChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;

        setTransferOptions({
            ...transferOptions,
            reasonId: {
                ...transferOptions.reasonId,
                value: options[selectedIndex].value
            }
        });
    }

    const onProjectChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setTransferOptions({
            ...transferOptions,
            project: {
                ...transferOptions.project,
                value: e.target.value
            }
        });
    }

    const onNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setTransferOptions({
            ...transferOptions,
            notes: {
                ...transferOptions.notes,
                value: e.target.value
            }
        });
    }

    const transferItem = async () => {
        if (!transferOptions.from.value || !transferOptions.to.value){
            return;
        }

        if (!transferOptions.itemId.value){
            return;
        }

        if (!transferOptions.qty.value){
            return;
        }

        if (!transferOptions.reasonId){
            return;
        }

        const vals = Object.keys(transferOptions).reduce((acc: any, key: string) => {
            acc[key] = transferOptions[key].value;
            return acc;
        }, {});

        const res = await client.mutate({
            mutation: createTransaction,
            variables: {
                orgId: orgId,
                transferType: transferType,
                ...vals
            }
        });

        const tId = res.data?.createTransaction;
        if (!tId) {
            return;
        }

        setTransactionId(tId);
    }

    useEffect(() => {
        async function loadReasons() {
            const transactionType = await client.query({
                query: getTransactionType,
                variables: {
                    organizationId: orgId,
                    slug: transferType
                }
            });

            const { transaction_type_id } = transactionType.data?.getTransactionType;
            if (!transaction_type_id){
                //error
                return;
            }

            const reasons = await client.query({
                query: getReasons,
                variables: {
                    transactionTypeId: transaction_type_id
                }
            });

            const allReasons = reasons.data?.getReasons;
            if (!allReasons || !allReasons?.length) {
                return;
                //error
            }

            setReasons(allReasons);
        }

        loadReasons();
    }, []);

    useEffect(() => {
        if (!transferOptions?.reasonId.value){
            return;
        }

        const reasonId: string = transferOptions.reasonId.value || '';// transferOptions.reasonId.value || '';

        const index: number = reasons.map((e: Reason) => e.reason_id).indexOf(reasonId);
        const selectedReason: Reason = reasons[index];
        setTransferOptions({
            ...transferOptions,
            project: {
                name: 'project',
                value: ''
            }
        });
    }, [transferOptions.reasonId]);
    
    const _clear = (key: string) => {
        setTransferOptions({
            ...transferOptions,
            [key]: {
                name: key,
                value: ''
            }
        });
    }

    const clearItem = (): void => {
        _clear('itemId');
    }

    const clearLocationTo = () => {
        _clear('to');
    }

    const clearLocationFrom = () => {
        _clear('from');
    }

    const getTitle = () => {
        switch (transferType) {
            case 'transfer':
                return 'Transfer to Trunk Inventory';
            case 'return':
                return 'Return Item from Project';
            case 'pull':
                return 'Pull Item for Project';
            case 'remove':
                return 'Remove from Trunk Inventory';
            default:
                return 'Trunk Inventory';
        }
    }

    return (
        <>
            <h1 className='text-xl font-medium'>{getTitle()}</h1>
            <div className='grid grid-cols-1 gap-2'>
                <div className='grid grid-cols-12 gap-2'>
                    <div className='col-span-12 md:col-span-6'>
                        <ItemSearch
                        fn={{
                            onChange: onFieldChange,
                            clear: clearItem
                        }}
                        val={transferOptions.itemId}
                        displayOptions={{
                            title:'Item',
                            name:'itemId'
                        }} />
                    </div>
                    <div className='col-span-12 md:col-span-6'>
                        <div>
                            <label className='text-sm'>Quantity</label>
                        </div>
                        <div>
                            <input type='number' value={transferOptions.qty.value} name='qty' onChange={onQtyChange}
                                className='px-3 py-1 border border-slate-300 rounded-lg w-full text-sm outline-none' />
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-11'>
                    <div className='col-span-12 md:col-span-5'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearLocationFrom
                            }}
                            val={transferOptions.from}
                            displayOptions={{
                                title:'From location',
                                name: 'from'
                            }}/>
                    </div>
                    <div className='col-span-12 md:col-span-1'>
                        <p>&nbsp;</p>
                        <HiOutlineArrowNarrowRight className='text-lg col-span-1 self-center mx-auto hidden md:block' />
                        <HiOutlineArrowNarrowDown className='text-lg col-span-1 self-center mx-auto block md:hidden' />
                    </div>
                    <div className='col-span-12 md:col-span-5'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear:clearLocationTo
                            }}
                            val={transferOptions.to} 
                            displayOptions={{
                                title:'To location',
                                name: 'to'
                            }} />
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 md:col-span-6'>
                        <p className='text-sm'>Reason</p>
                        <select value={transferOptions.reasonId.value} onChange={onReasonChange} className='w-full 
                            px-2 py-1 text-sm border border-slate-300 outline-none rounded-lg'>
                            <option value='' className='hidden'>Select reason</option>
                            {reasons.map((e: Reason) => {
                                return (
                                    <option key={`reason-${e.reason_id}`} value={e.reason_id}>{e.name}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 md:col-span-6'>
                        <p className='text-sm'>Notes</p>
                        <textarea className='w-full px-2 py-1 text-sm rounded-lg border
                            border-slate-300 outline-none resize-none' value={transferOptions.notes.value}
                            name='notes' onChange={onNotesChange}></textarea>
                    </div>
                </div>
                <div>
                    <button className=' bg-blue-500 transition-colors hover:bg-blue-600 flex items-center gap-2
                    text-sm text-white px-4 py-2 rounded-lg duration-100' onClick={transferItem}>
                        <BiTransfer />
                        Transfer Item{transferOptions.qty.value === 1 || transferOptions.qty.value === -1 ? (
                            ''
                        ) : (
                            's'
                        )}
                    </button>
                </div>
                {transactionId && (
                    <div className='p-4 rounded-md bg-green-300/20'>
                        <p className='text-green-600 text-sm text-center'>
                            The transaction was created. <span className='text-xs font-semibold'>(#{transactionId})</span>
                        </p>
                    </div>
                )}
                {isLoading && (
                    <div>
                        <Loader size='md' />
                    </div>
                )}
            </div>
        </>
    )
}