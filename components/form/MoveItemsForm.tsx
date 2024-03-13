'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getReasons } from '@/graphql/queries';
import type { TransferOptions } from '@/types/TransferOptions';
import { BiTransfer } from 'react-icons/bi';
import useOrganization from '@/components/providers/useOrganization';
import { getTransactionType } from '@/graphql/queries';
import { Condition, Reason, ReasonsFields } from '@/types/dbTypes';
import { createTransaction } from '@/graphql/mutations';
import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import Loader from '@/components/Loader';
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { FieldEntry, FieldEntryValue, TransferType } from '@/types/formTypes';
import { moveDefaults } from '@/lib/defaultValues';
import DynamicInputField from './DynamicInputField';
import { DynamicForm } from './DynamicForm';
import { TransactionResponse } from '@/types/responses';
import { IoIosMenu } from 'react-icons/io';
import BoxTimer from './BoxTimer';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function MoveItemsForm({ transferType }: {
    transferType: TransferType
}) {
    const router = useRouter();
    const [fieldValues, setFieldValues] = useState<FieldEntryValue[]>([]);
    const client = useApolloClient();
    const orgId = 'd33e613c-c4b1-4829-a600-eacf71c3f4ed';

    const [transferOptions, setTransferOptions] = useState<TransferOptions<DropDownSearchOption>>(moveDefaults[transferType]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [transactionResponse, setTransactionResponse] = useState<TransactionResponse>({
        transactionId: '',
        sentEmails: false,
        accepted: [],
        rejected: []
    });

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

    const transferItem = async () => {

        if (!transferOptions.from.value || !transferOptions.to.value){
            console.error('Missing location(s)');
            return;
        }

        if (!transferOptions.itemId.value){
            console.error('Missing item');
            return;
        }

        if (!transferOptions.qty.value){
            console.error('Quantity can not be 0');
            return;
        }

        if (transferOptions.qty.value < 0){
            console.error('Quantity can not be less than 0');
            return;
        }

        if (!transferOptions.reasonId.value){
            console.error('You must select a reason');
            return;
        }

        const vals = Object.keys(transferOptions).reduce((acc: any, key: string) => {
            acc[key] = transferOptions[key].value;
            return acc;
        }, {});

        const variables = {
            orgId: orgId,
            transferType: transferType,
            transferInput: {
                ...vals
            },
            fieldEntries: fieldValues
        };

        const { data } = await client.mutate({
            mutation: createTransaction,
            variables: variables
        });

        if (!data?.createTransaction) {
            return;
        }

        setTransactionResponse(data?.createTransaction);
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

    const requiredFields = useMemo(() => {
        const idx = reasons.map(e => e.reason_id).indexOf(transferOptions.reasonId.value);
        if (idx===-1){
            return [];
        }
        const fields = reasons[idx].reasons_fields;

        return fields.map((e: ReasonsFields) => {
            return {
                field_name: e.reasons_fields_id,
                field_type: e.field_type,
                title: e.field_name,
                conditions: e.conditions,
            }
        });
    }, [transferOptions.reasonId]);

    useEffect(() => {
        setFieldValues(requiredFields.map((e: FieldEntry) => {
            return {
                field_name: e.field_name,
                value: ''
            }
        }));
    }, [transferOptions.reasonId]);

    const updateDynamicField = useCallback((newValue: DropDownSearchOption, name: string): any => {
        setFieldValues(prev => {
            return prev.map(e => { 
                if (e.field_name === name) {
                    return { ...e, value: newValue.value };
                }
                return e;
            });
        });
    }, []);

    const fromLocationForItemSearch = useMemo(() => {
        if (transferOptions.from.name === 'Parts Room' || transferOptions.from.name === 'Customer Location'){
            return undefined;
        }
        return transferOptions.from.value; //need to fetch if location can view all items or not
    }, [transferOptions.from]);

    const redirectToHome = () => {
        router.push('/app');
    }

    return (
        <>
            <Head>
                
                <meta name="viewport" content="maximum-scale=1" key="max"></meta>
            </Head>
            <h1 className='text-xl font-medium'>{getTitle()}</h1>
            <div className='grid grid-cols-1 gap-2 mt-2'>
                <div className='grid grid-cols-12 md:grid-cols-11'>
                    <div className='col-span-12 md:col-span-5'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearLocationFrom
                            }}
                            defaultValue={transferOptions.from}
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
                            defaultValue={transferOptions.to}
                            displayOptions={{
                                title:'To location',
                                name: 'to'
                            }} />
                    </div>
                </div>
                <div className='grid grid-cols-12 gap-2'>
                    <div className='col-span-12 md:col-span-6'>
                        <ItemSearch
                        fn={{
                            onChange: onFieldChange,
                            clear: clearItem
                        }}
                        displayOptions={{
                            title:'Item',
                            name:'itemId'
                        }}
                        locationId={fromLocationForItemSearch} />
                    </div>
                    <div className='col-span-12 md:col-span-6'>
                        <div className='flex items-center gap-2'>
                            <IoIosMenu />
                            <label className='text-sm'>Quantity</label>
                        </div>
                        <div>
                            <input type='number' value={transferOptions.qty.value} name='qty' onChange={onQtyChange} min={0}
                                className='px-3 py-1 border border-slate-300 rounded-lg w-full text-sm outline-none' />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 md:col-span-6'>
                        <p className='text-sm'>Reason</p>
                        <select value={transferOptions.reasonId.value} onChange={onReasonChange} className='w-full 
                            px-2 py-1 text-sm border border-slate-300 outline-none rounded-lg bg-white text-[16px] md:text-sm'>
                            <option value='' className='hidden'>Select reason</option>
                            {reasons.map((e: Reason) => {
                                return (
                                    <option key={`reason-${e.reason_id}`} value={e.reason_id}>{e.name}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>
                <div className='grid grid-cols-12 gap-2'>
                    <DynamicForm requiredFields={requiredFields} onChange={updateDynamicField} />

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
                {transactionResponse.transactionId && (
                    <>
                        <div className='p-4 rounded-md bg-green-300/20'>
                            <p className='text-green-600 text-sm text-center'>
                                The transaction was created. <span className='text-xs font-semibold'>(#{transactionResponse.transactionId})</span>
                            </p>
                        </div>
                        <BoxTimer
                            delay={5}
                            onDelayReached={redirectToHome}
                            note='You will be automatically redirected' />
                    </>
                    
                            
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