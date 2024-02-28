'use client';

import useOrganization from "@/components/providers/useOrganization";
import { getTransactionTypes } from "@/graphql/queries";
import { FormEvent, FormEventHandler, SetStateAction, useEffect, useState } from "react";
import { common } from "@/lib/common";

import { Reason, ReasonsFields, type TransactionType } from '@/types/dbTypes';
import { updateReasonName } from "@/graphql/mutations";
import EditableText from "@/components/form/EditableText";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { BiPen, BiPencil, BiPlus } from "react-icons/bi";
import Modal from "@/components/modal/Modal";
import ReasonFieldModal from "@/components/modal/ReasonFieldModal";
import { useApolloClient } from "@apollo/client";

export default function PageAdmin() {
    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);

    const [selectedTransactionTypeId, setSelectedTransactionTypeId] = useState<string>('');
    const updateSelectedTransactionTypeId = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setSelectedTransactionTypeId(options[selectedIndex].value);
    }

    const [reasons, setReasons] = useState<Reason[]>([]);
    const [editingReasonField, setEditingReasonField] = useState<ReasonsFields|null>(null);
    const [showingEditField, setShowingEditField] = useState<boolean>(false);

    const organizationId = useOrganization();
    
    const apolloClient = useApolloClient();

    useEffect(() => {
        async function getTypes () {
            const res = await common.getTransactionTypes(organizationId, apolloClient);
            setTransactionTypes(res);
        }

        getTypes();
    }, [common.getTransactionTypes]);

    useEffect(() => {
        if (!selectedTransactionTypeId){
            return;
        }

        async function getReasons() {
            const res = await common.getReasons(selectedTransactionTypeId, apolloClient);
            setReasons(res);
        }

        getReasons();
    }, [selectedTransactionTypeId]);

    const modifyReasonName = async (reasonId: string, newName: string): Promise<boolean> => {
        const res = await apolloClient.mutate({
            mutation: updateReasonName,
            variables: {
                reasonId: reasonId,
                newName: newName
            }
        });

        const { data } = res;

        if (!data?.updateReasonName) {
            //error
            return false;
        }

        return data.updateReasonName;
    }

    const normalizeFieldType = (fieldType: string) => {
        switch(fieldType) {
            case 'textarea':
                return 'Text Area';
            case 'locationSearch':
                return 'Location Search Box';
            case 'itemSearch':
                return 'Item Search Box'
            default:
                return 'Textbox'
        }
    }

    const removeField = async(reasonsFieldId: string): Promise<void> => {

    }

    const editField = (reasonId: string, reasonsFieldsId: string): void => {
        const reasonIdx = reasons?.map(e => e.reason_id).indexOf(reasonId);
        if(reasonIdx === -1){
            console.error('Reason index not found.');
            return;
        }
        const r = reasons[reasonIdx];
        
        const fieldIdx = r.reasons_fields?.map(e => e.reasons_fields_id).indexOf(reasonsFieldsId);
        if (fieldIdx === -1){
            console.error('Reason field index not found.');
            return;
        }

        setEditingReasonField(r.reasons_fields[fieldIdx]);
        setShowingEditField(true);
    }

    const hideEditFieldModal = (): void => {
        setShowingEditField(false);
    }

    const updateFieldInfo = (response: ReasonsFields|null) => {
        setShowingEditField(false);
        
        if (response === null){
            return;
        }

        if (response.updated) {
            const reasonIdx = reasons?.map(e => e.reason_id).indexOf(response.reason_id);
            if(reasonIdx === -1){
                console.error('Reason index not found.');
                return;
            }
            const r = reasons[reasonIdx];
            
            const fieldIdx = r.reasons_fields?.map(e => e.reasons_fields_id).indexOf(response.reasons_fields_id);
            if (fieldIdx === -1){
                console.error('Reason field index not found.');
                return;
            }

            setReasons((prev: Reason[]): Reason[] => {
                const tmp: Reason[] = prev.map(reason => ({
                    ...reason,
                    reasons_fields: reason.reasons_fields ? [...reason.reasons_fields] : []
                }));
            
                if (tmp[reasonIdx] && tmp[reasonIdx].reasons_fields) {
                    tmp[reasonIdx].reasons_fields[fieldIdx] = response;
                }
            
                return tmp;
            });
        }
    }

    return (
        <>
            {showingEditField && (
                <ReasonFieldModal
                    fn={{
                        hide: hideEditFieldModal,
                        onSave: updateFieldInfo
                    }}
                    showing={showingEditField}
                    obj={editingReasonField}
                    type='update' />
            )}


            <div className="text-sm">
                <label>Transaction type</label>
                <div>
                    <select value={selectedTransactionTypeId} className="px-2 py-1 outline-none rounded-lg border border-slate-300"
                        onChange={updateSelectedTransactionTypeId}>
                        <option value="" className="hidden" >Select type</option>
                        {transactionTypes?.map(e => {
                            return (
                                <option key={`type-${e.transaction_type_id}`} value={e.transaction_type_id}>{e.type}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    {reasons?.map((e: Reason) => {
                        const fields = e?.reasons_fields;

                        return (
                            <div key={`r-${e.reason_id}`} className="border border-slate-300 p-3 rounded-lg
                                col-span-12 md:col-span-6 lg:col-span-4">
                                <EditableText
                                    fn={{
                                        onSave: (value) => {
                                            return modifyReasonName(e.reason_id, value)
                                        }
                                    }}
                                    label={'Reason Name'}
                                    val={e.name} />

                                <div>
                                    <div className="flex items-center">
                                        <p>Required fields</p>
                                        <button className="ml-auto flex items-center gap-2 px-2 py-1 rounded-lg
                                            hover:bg-slate-300/40 transition-colors duration-150">
                                            <BiPlus/>
                                            <p className="text-xs font-medium">Add field</p>
                                        </button>
                                    </div>
                                    <div className="grid-cols-12 grid gap-y-2 my-2">
                                        {fields?.map((f:ReasonsFields) => {
                                            return (
                                                <div key={`rf-${f.reasons_fields_id}`} className="grid grid-cols-12 gap-4 col-span-12">
                                                    <button className="p-2 rounded-lg hover:bg-slate-300/40 transition-colors duration-150
                                                        col-span-2"
                                                        title="remove" onClick={()=>{
                                                            removeField(f.reasons_fields_id)
                                                        }}>
                                                        <AiFillMinusCircle className="text-red-500 text-lg mx-auto" />
                                                    </button>
                                                    <div className="col-span-8 grid grid-cols-12">
                                                        <div className="col-span-12">
                                                            <p className="font-medium">{f.field_name}</p>
                                                            <div className="text-slate-600 text-xs">
                                                                [{normalizeFieldType(f.field_type)}]
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 rounded-lg hover:bg-slate-300/40 transition-colors duration-150
                                                        col-span-2"
                                                        title="Edit" onClick={()=>{
                                                            editField(e.reason_id, f.reasons_fields_id)
                                                        }}>
                                                        <BiPencil className="mx-auto" />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {!fields?.length && (
                                        <div className="text-center text-slate-500 font-medium">No fields have been added</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}