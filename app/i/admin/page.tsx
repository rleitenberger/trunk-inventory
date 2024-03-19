'use client';

import useOrganization from "@/components/providers/useOrganization";
import { getTransactionTypes } from "@/graphql/queries";
import { FormEvent, FormEventHandler, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { common } from "@/lib/common";

import { Condition, ConditionType, Reason, ReasonEmail, ReasonsFields, type TransactionType } from '@/types/dbTypes';
import { createReasonEmail, deleteReason, deleteReasonEmail, deleteReasonField, updateReasonName, updateReasonSendsEmail } from "@/graphql/mutations";
import EditableText from "@/components/form/EditableText";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { BiCheck, BiPen, BiPencil, BiPlus, BiTrash, BiX } from "react-icons/bi";
import Modal from "@/components/modal/Modal";
import ReasonFieldModal from "@/components/modal/ReasonFieldModal";
import { useApolloClient } from "@apollo/client";
import Loader from "@/components/Loader";
import { sendEmail } from "@/lib/emailer";
import CreateReasonForm from "@/components/form/CreateReasonForm";
import AdminNav from "@/components/AdminNav";

export default function PageAdmin() {

    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);

    const [selectedTransactionTypeId, setSelectedTransactionTypeId] = useState<string>('');
    const updateSelectedTransactionTypeId = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setSelectedTransactionTypeId(options[selectedIndex].value);
    }

    const [reasons, setReasons] = useState<Reason[]>([]);
    const [editingReasonField, setEditingReasonField] = useState<ReasonsFields|null>(null);
    
    const [showingCreateReason, setShowingCreateReason] = useState<boolean>(false);
    const [showingCreateField, setShowingCreateField] = useState<boolean>(false);
    const [showingEditField, setShowingEditField] = useState<boolean>(false);

    const { organizationId, count } = useOrganization();
    
    const apolloClient = useApolloClient();

    const [loadingReasons, setLoadingReasons] = useState<boolean>(false);
    const [modalReasonId, setModalReasonId] = useState<string>('');

    const [conditionTypes, setConditionTypes] = useState<ConditionType[]>([]);
    const emailRef = useRef<any>();

    useEffect(() => {
        async function getTypes () {
            const res = await common.getTransactionTypes(organizationId, apolloClient);
            setTransactionTypes(res);
        }

        getTypes();
    }, [organizationId, apolloClient]);

    useEffect(() => {
        if (!selectedTransactionTypeId){
            return;
        }

        setLoadingReasons(true);

        async function getReasons() {
            const res = await common.getReasons(selectedTransactionTypeId, apolloClient);
            setReasons(res);

            setLoadingReasons(false);
        }

        getReasons();
    }, [selectedTransactionTypeId, apolloClient]);

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
                return 'Item Search Box';
            case 'checkbox':
                return 'Checkbox';
            default:
                return 'Textbox'
        }
    }

    const removeField = async(reasonsFieldId: string): Promise<void> => {
        const { data }  = await apolloClient.mutate({
            mutation: deleteReasonField,
            variables: {
                reasonFieldId: reasonsFieldId
            }
        });

        if (!data?.deleteReasonField){
            return;
        }

        let reasonIdx=-1;

        reasons?.forEach((e: Reason) => {
            const fieldMap = e.reasons_fields.map((rf: ReasonsFields) => rf.reasons_fields_id).indexOf(reasonsFieldId);

            if (fieldMap !== -1){
                reasonIdx=fieldMap;
                return;
            }
        });

        if (reasonIdx === -1){
            console.error('Could not find reason');
            return;
        }

        setReasons((prev: Reason[]): Reason[] => {
            const tmp: Reason[] = copyReasons(prev);

            tmp[reasonIdx].reasons_fields = tmp[reasonIdx].reasons_fields.filter(e => {
                return e.reasons_fields_id !== reasonsFieldId
            });

            return tmp;
        });
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

    const hideCreateFieldModal = (): void => {
        setShowingCreateField(false);
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
                const tmp: Reason[] = copyReasons(prev);
            
                if (tmp[reasonIdx] && tmp[reasonIdx].reasons_fields) {
                    tmp[reasonIdx].reasons_fields[fieldIdx] = response;
                }
            
                return tmp;
            });
        }
    }

    const createReasonField = (response: ReasonsFields|null): void => {
        setShowingCreateField(false);

        if (response === null){
            return;
        }

        if (response.reasons_fields_id){
            const reasonIdx = reasons?.map(e => e.reason_id).indexOf(response.reason_id);
            if(reasonIdx === -1){
                console.error('Reason index not found.');
                return;
            }
            
            setReasons((prev: Reason[]): Reason[] => {
                const tmp: Reason[] = copyReasons(prev);

                tmp[reasonIdx].reasons_fields = [
                    ...tmp[reasonIdx].reasons_fields,
                    response
                ];

                return tmp;
            })
        }
    }

    const showCreateReason = (): void => {
        setShowingCreateReason(true);
    }

    const hideCreateReasonModal = () => {
        setShowingCreateReason(false);
    }

    const updateModalReasonId = (reasonId: string): void => {
        setModalReasonId(reasonId);
        setShowingCreateField(true);
    }

    const addNewReason = (response: Reason|null): void => {
        setShowingCreateReason(false);

        if (response === null){
            return;
        }

        if (response.transaction_type_id !== selectedTransactionTypeId){
            return;
        }

        setReasons(
            [...reasons, response]
        );
    }

    const removeReason = async (reasonId: string) => {
        if (typeof window === 'undefined'){
            console.error('Window object not found.');
            return;
        }

        const conf = window.confirm('Are you sure you want to remove this reason?');

        if (!conf){
            return;
        }

        const { data } = await apolloClient.mutate({
            mutation: deleteReason,
            variables: {
                reasonId: reasonId
            }
        });

        if (!data?.deleteReason){
            return;
        }

        setReasons(
            reasons.filter((e: Reason) => {
                return e.reason_id !== reasonId
            })
        );
    }

    const copyReasons = (prev: Reason[]): Reason[] => {
        return prev.map(reason => ({
            ...reason,
            reasons_fields: reason.reasons_fields ? [...reason.reasons_fields] : []
        }));
    }

    const modifyReasonSendsEmail = async (ev: React.ChangeEvent<HTMLInputElement>, reasonId: string): Promise<void> => {
        const { checked } = ev.target;
        
        const { data } = await apolloClient.mutate({
            mutation: updateReasonSendsEmail,
            variables: {
                reasonId: reasonId,
                sendsEmail: checked
            }
        });

        if (!data?.updateReasonSendsEmail){
            return;
        }

        const reasonIdx = reasons.map(e => e.reason_id).indexOf(reasonId);

        if (reasonIdx === -1){
            console.error('Reason was not found');
            return;
        }

        setReasons((prev: Reason[]): Reason[] => {
            const tmp: Reason[] = copyReasons(prev);
            tmp[reasonIdx].sends_email = checked;
            return tmp;
        });

    }

    const updateConditions = (condition: Condition): void => {
        if (!editingReasonField?.reason_id || !editingReasonField?.reasons_fields_id) {
            return;
        }

        const reasonIdx = reasons?.map(e => e.reason_id).indexOf(editingReasonField.reason_id);
        if (reasonIdx === -1){
            console.error('Could not find the reason');
            return;
        }

        const reasonFieldIdx = reasons[reasonIdx].reasons_fields.map(e => e.reasons_fields_id).indexOf(editingReasonField.reasons_fields_id);
        if(reasonFieldIdx === -1){
            console.error('Could not find reason field');
            return;
        }
        const conds = reasons[reasonIdx].reasons_fields[reasonFieldIdx].conditions;

        setReasons((prev: Reason[]): Reason[] => {
            const tmp: Reason[] = copyReasons(prev);
            tmp[reasonIdx].reasons_fields[reasonFieldIdx].conditions = [
                ...(conds || []),
                condition
            ];
            return tmp;
        });
    }

    const [addingEmail, setAddingEmail] = useState<boolean>(false);
    const updateAddingEmail = (reasonId?: string) => {
        setEmailToAdd({
            ...emailToAdd,
            reasonId: reasonId ?? ''
        })
        setAddingEmail(!addingEmail);
    }

    const addingEmailClassName = useMemo((): string =>{
        return addingEmail ? 'rotate-45' : 'rotate-0';
    }, [addingEmail]);

    interface EmailToAddArgs {
        email: string;
        reasonId: string;
    }

    const [emailToAdd, setEmailToAdd] = useState<EmailToAddArgs>({
        email: '',
        reasonId: '',
    });
    const updateEmailToAdd = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEmailToAdd({
            ...emailToAdd,
            email: e.target.value
        });
    }

    const addEmail = async(): Promise<void> => {
        if (!emailToAdd.email){
            console.error('Email is missing');
            return;
        }

        const { data } = await apolloClient.mutate({
            mutation: createReasonEmail,
            variables: {
                reasonId: emailToAdd.reasonId,
                email: emailToAdd.email
            }
        });

        if (!data?.createReasonEmail){
            console.error('Email was not added');
            return;
        }

        const reasonIdx = reasons.map(e => e.reason_id).indexOf(emailToAdd.reasonId);
        
        if (reasonIdx === -1) {
            console.error('Reason did not exist.');
            return;
        }

        const reasonEmailId = data.createReasonEmail;

        setReasons((prev) => {
            const tmp = prev.map((e: Reason): Reason => {
                return {
                    ...e,
                    reasons_fields: [
                        ...e.reasons_fields
                    ],
                    reason_emails: [...e.reason_emails, {
                        reason_id: emailToAdd.reasonId,
                        email: emailToAdd.email,
                        reason_email_id: reasonEmailId
                    }]
                }
            })
            return tmp;
        });
        setEmailToAdd({
            ...emailToAdd,
            email: ''
        });

        emailRef.current?.focus();
    }

    const removeEmail = async(reasonEmailId: string): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: deleteReasonEmail,
            variables: {
                reasonEmailId: reasonEmailId
            }
        });

        if (!data?.deleteReasonEmail){
            console.error('Could not delete the email');
            return;
        }

        setReasons((prev) => {
            const tmp = prev.map((e: Reason): Reason => {
                return {
                    ...e,
                    reasons_fields: [
                        ...e.reasons_fields
                    ],
                    reason_emails: e.reason_emails.filter(e => {
                        return e.reason_email_id !== reasonEmailId
                    })
                }
            })
            return tmp;
        });
    }

    const cancelAddingEmail = (): void => {
        setAddingEmail(false);
        setEmailToAdd({
            reasonId: '',
            email: ''
        })
    }

    return (
        <>
            <AdminNav pageName="/" />
            <h1 className="font-medium my-2 text-lg">Reasons</h1>
            {showingEditField && (
                <ReasonFieldModal
                    fn={{
                        hide: hideEditFieldModal,
                        onSave: updateFieldInfo,
                    }}
                    showing={showingEditField}
                    obj={editingReasonField}
                    type='update' />
            )}

            {showingCreateField && (
                <ReasonFieldModal
                    fn={{
                        hide: hideCreateFieldModal,
                        onSave: createReasonField,
                    }}
                    showing={showingCreateField}
                    obj={{
                        reason_id: modalReasonId,
                        field_type: '',
                        field_name: '',
                        reasons_fields_id: '',
                        conditions: []
                    }}
                    type="create" />
            )}

            {showingCreateReason && (
                <Modal
                    title="Add New Reason"
                    showing={showingCreateReason}
                    hide={hideCreateReasonModal}>
                    <CreateReasonForm
                        types={transactionTypes}
                        fn={{
                            onSave: addNewReason
                        }}
                    />
                </Modal>
            )}

            <div className="text-sm">
                <label>Transaction type</label>
                <div className="flex items-center">
                    <select value={selectedTransactionTypeId} className="px-2 py-1 outline-none rounded-lg border border-slate-300 bg-white
                        text-[16px] md:text-sm"
                        onChange={updateSelectedTransactionTypeId}>
                        <option value="" className="hidden" >Select type</option>
                        {transactionTypes?.map(e => {
                            return (
                                <option key={`type-${e.transaction_type_id}`} value={e.transaction_type_id}>{e.type}</option>
                            )
                        })}
                    </select>
                    <button className='px-3 py-1 rounded-lg bg-blue-500 transition-colors duration-150 hover:bg-blue-600 flex items-center gap-2
                        text-white ml-auto' onClick={showCreateReason}>
                        <AiFillPlusCircle />
                        Add reason
                    </button>
                </div>
                {loadingReasons ? (
                    <div className="flex items-center justify-center gap-2 p-4">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-2 mt-2">
                        {reasons?.map((e: Reason) => {
                            const fields = e?.reasons_fields;
                            return (
                                <div key={`r-${e.reason_id}`} className="border border-slate-300 p-3 rounded-lg
                                    col-span-12 md:col-span-6 lg:col-span-4 flex flex-col gap-2">
                                        <div className="flex items-center flex-wrap">
                                            <EditableText
                                                fn={{
                                                    onSave: (value) => {
                                                        return modifyReasonName(e.reason_id, value)
                                                    }
                                                }}
                                                label={'Reason Name'}
                                                val={e.name} />
                                            <button className="flex items-center gap-2 transition-colors duration-150 text-red-500 rounded-lg outline-none p-2 text-base
                                                ml-auto hover:bg-slate-300/40" onClick={()=>{
                                                    removeReason(e.reason_id)
                                                }}>
                                                <BiTrash />
                                            </button>
                                        </div>

                                    <div className="flex flex-col gap-2 h-full">
                                        <div className="flex items-center">
                                            <p>Required fields</p>
                                            <button className="ml-auto flex items-center gap-2 px-2 py-1 rounded-lg
                                                hover:bg-slate-300/40 transition-colors duration-150" onClick={()=>{
                                                    updateModalReasonId(e.reason_id)
                                                }}>
                                                <BiPlus />
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
                                            <div className="text-center text-slate-500 font-medium ">No fields have been added</div>
                                        )}
                                        <div className="mt-auto">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={e.sends_email} onChange={(ev)=>{
                                                    modifyReasonSendsEmail(ev, e.reason_id)
                                                }} />
                                                <label>Send email on submit</label>
                                            </div>
                                            <div className="mt-2">
                                                {e.sends_email && (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">Emails</p>
                                                            <button className="p-2 ml-auto transition-colors hover:bg-slate-300/40 rounded-lg"
                                                                onClick={() => {
                                                                    updateAddingEmail(e.reason_id)
                                                                }}>
                                                                <BiPlus className={`transition-all ${addingEmailClassName}`} />
                                                            </button>
                                                        </div>
                                                        {addingEmail && emailToAdd.reasonId === e.reason_id && (
                                                            <div className="flex items-center gap-2">
                                                                <input type="text" value={emailToAdd.email} onChange={updateEmailToAdd}
                                                                    className="px-2 py-1 text-sm rounded-lg border border-slate-300 outline-none flex-1"
                                                                    ref={emailRef} />
                                                                <button onClick={addEmail} className=" bg-green-500 hover:bg-green-600 rounded-md p-2
                                                                    transition-colors duration-150 text-white">
                                                                    <BiCheck className="" />
                                                                </button>
                                                                <button onClick={cancelAddingEmail} className=" bg-red-500 hover:bg-red-600 rounded-md p-2
                                                                    transition-colors duration-150 text-white">
                                                                    <BiX />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {e.reason_emails?.length ? (
                                                            <>
                                                                {e.reason_emails?.map((e: ReasonEmail) => {
                                                                    return (
                                                                        <div key={`re-${e.reason_email_id}`} className="grid grid-cols-12 gap-2">
                                                                            <div className="col-span-1">
                                                                                <button className="p-2 rounded-lg hover:bg-slate-300/40 text-red-500 transition-colors"
                                                                                    onClick={()=>{
                                                                                        removeEmail(e.reason_email_id)
                                                                                    }}>
                                                                                    <AiFillMinusCircle />
                                                                                </button>
                                                                            </div>
                                                                            <div className="col-span-11 flex items-center">
                                                                                <p>{e.email}</p>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </>
                                                        ) : (
                                                            <p className='text-slate-600 font-medium text-center'>No emails have been added</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {!reasons?.length && (
                            <div className="col-span-12 text-slate-500">
                                <div className="text-center">
                                    <p>No reasons have been added to this transaction type.</p>
                                </div>
                                <div className="text-center">
                                    <button className="flex items-center gap-2 justify-center p-2 rounded-lg transition-colors
                                    hover:bg-slate-300/40 duration-150 mx-auto my-2" onClick={()=>{
                                        setShowingCreateReason(true)
                                    }}>
                                        <AiFillPlusCircle className="text-lg"/>
                                        Click here to add a new reason
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
            </div>
        </>
    )
}