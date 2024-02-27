'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getReasons } from '@/graphql/queries';
import type { TransferOptions } from '@/types/TransferOptions';
import { BiTransfer } from 'react-icons/bi';
import useOrganization from '@/components/providers/useOrganization';
import { getTransactionType } from '@/graphql/queries';
import { Reason, ReasonsFields } from '@/types/dbTypes';
import { createTransaction } from '@/graphql/mutations';
import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import Loader from '@/components/Loader';
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import DynamicInputField from '@/components/form/DynamicInputField';
import apolloClient from '@/lib/apollo';

export default function PageTransfer() {
    const client = useApolloClient();
    const orgId = useOrganization();

    const [transferOptions, setTransferOptions] = useState<TransferOptions>({
        from: '',
        to: '',
        item: '',
        qty: 0,
        reasonId: '',
        notes: '',
        project: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [transactionId, setTransactionId] = useState<string>('');
    const [requiresProject, setRequiresProject] = useState<boolean>(false);

    const onFieldChange = (value: string|null, name: string): void  => {
        if (!value || !name) {
            return;
        }
        
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

    const requiredFields = useMemo(() => {
        const idx = reasons.map(e => e.reason_id).indexOf(transferOptions.reasonId);
        if (idx===-1){
            return [];
        }
        const fields = reasons[idx].reasons_fields;
        return fields;
    }, [transferOptions.reasonId]);

    const [fieldsEntries, setFieldsEntries] = useState({});

    useEffect(() => {
        if (transferOptions.reasonId){
            setFieldsEntries({});
            return;
        }
        setFieldsEntries(requiredFields.reduce((acc: any, item: ReasonsFields) => {
            acc[item.field_name] = '';
            return acc;
        }, {}));
    }, [transferOptions.reasonId]);

    const onReasonChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;

        setTransferOptions({
            ...transferOptions,
            reasonId: options[selectedIndex].value
        });
    }

    const onProjectChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setTransferOptions({
            ...transferOptions,
            project: e.target.value
        });
    }

    const onNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setTransferOptions({
            ...transferOptions,
            notes: e.target.value
        });
    }

    const transferItem = async () => {
        if (!transferOptions.from || !transferOptions.to){
            return;
        }

        if (!transferOptions.item){
            return;
        }

        if (!transferOptions.qty){
            return;
        }

        if (!transferOptions.reasonId){
            return;
        }

        const res = await client.mutate({
            mutation: createTransaction,
            variables: {
                orgId: orgId,
                from: transferOptions.from,
                to: transferOptions.to,
                qty: transferOptions.qty,
                reasonId: transferOptions.reasonId,
                itemId: transferOptions.item,
                notes: transferOptions.notes,
                transferType: 'pull',
                project: transferOptions.project
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
                    slug: 'pull'
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
        if (!transferOptions.reasonId){
            return;
        }

        const index: number = reasons.map((e: Reason) => e.reason_id).indexOf(transferOptions.reasonId);
        const selectedReason: Reason = reasons[index];

        if (selectedReason.requires_project) {
            setRequiresProject(true);
            return;
        }

        setRequiresProject(false);
        setTransferOptions({
            ...transferOptions,
            project: ''
        });
    }, [transferOptions.reasonId]);

    const updateDynamicField = (val: string, name: string): any => {
        console.log(val, name);
        setFieldsEntries({
            [name]: val
        });
    }

    return (
        <>
            <h1 className='text-xl font-medium'>Pull Item for Project</h1>
            <div className='grid grid-cols-1 gap-2'>
                <div className='grid grid-cols-12 gap-2'>
                    <div className='col-span-12 md:col-span-6'>
                        <ItemSearch
                            onChange={onFieldChange}
                            organizationId={orgId}
                            apolloClient={client}
                            name='item'
                        />
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
                        <LocationSearch
                            name='from'
                            apolloClient={client}
                            organizationId={orgId}
                            onChange={onFieldChange}
                            defaultValue={{
                                name: 'Parts Room',
                                value: 'd0223790-565d-440e-8667-5c05228afe33',
                            }}
                            title='From location' />
                    </div>
                    <div className='col-span-12 md:col-span-1'>
                        <p>&nbsp;</p>
                        <HiOutlineArrowNarrowRight className='text-lg col-span-1 self-center mx-auto hidden md:block' />
                        <HiOutlineArrowNarrowDown className='text-lg col-span-1 self-center mx-auto block md:hidden' />
                    </div>
                    <div className='col-span-12 md:col-span-5'>
                        <LocationSearch
                            name='to'
                            apolloClient={client}
                            organizationId={orgId}
                            onChange={onFieldChange}
                            title='To location'
                            defaultValue={{
                                name: 'Customer Location',
                                value: '0aff29d1-d58e-11ee-b92b-4cd717dba858'
                            }} />
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 md:col-span-6'>
                        <p className='text-sm'>Reason</p>
                        <select value={transferOptions.reasonId} onChange={onReasonChange} className='w-full 
                            px-2 py-1 text-sm border border-slate-300 outline-none rounded-lg'>
                            <option value='' className='hidden'>Select reason</option>
                            {reasons.map((e: Reason) => {
                                return (
                                    <option key={`reason-${e.reason_id}`} value={e.reason_id}>{e.name}</option>
                                )
                            })}
                        </select>
                    </div>
                    {requiresProject && (
                        <div className='col-span-12 md:col-span-6'>
                            <p className='text-sm'>Project</p>
                            <input type='text' value={transferOptions.project} onChange={onProjectChange}
                                className='border border-slate-300 px-2 py-1 text-sm outline-none rounded-lg w-full' />
                        </div>
                    )}
                </div>
                <div className='grid grid-cols-12 gap-2'>
                    {requiredFields.map(e => {
                        return (
                            <div key={`rf-${e.reasons_fields_id}`} className='col-span-12 md:col-span-6'>
                                <DynamicInputField fieldName={e.field_name} fieldType={e.field_type} apolloClient={apolloClient}
                                organizationId={orgId} onChange={updateDynamicField}/>
                            </div>
                            
                        )
                    })}
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 md:col-span-6'>
                        <p className='text-sm'>Notes</p>
                        <textarea className='w-full px-2 py-1 text-sm rounded-lg border
                            border-slate-300 outline-none resize-none' value={transferOptions.notes}
                            name='notes' onChange={onNotesChange}></textarea>
                    </div>
                </div>
                <div>
                    <button className=' bg-blue-500 transition-colors hover:bg-blue-600 flex items-center gap-2
                    text-sm text-white px-4 py-2 rounded-lg duration-100' onClick={transferItem}>
                        <BiTransfer />
                        Transfer Item{transferOptions.qty === 1 || transferOptions.qty === -1 ? (
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