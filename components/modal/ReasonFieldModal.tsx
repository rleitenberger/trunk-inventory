import React, { useEffect, useMemo, useState } from "react";
import { ModalFnArgs, TypedModalArgs } from "@/types/formTypes";
import { Condition, ConditionType, FieldType, ReasonsFields } from "@/types/dbTypes";
import { createFieldCondition, createReasonField, updateReasonField } from "@/graphql/mutations";
import Modal from "./Modal";
import { useApolloClient } from "@apollo/client";
import { KVP, common } from "@/lib/common";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { BiCheck, BiPlus, BiX } from "react-icons/bi";
import { getConditionTypes, getFieldConditions, getOtherReasonFields } from "@/graphql/queries";
import { randomUUID } from "crypto";

type ReasonFieldModalType = 'create' | 'update';

export default function ReasonFieldModal ({ showing, fn, type, obj }: {
    showing: boolean
    fn: ModalFnArgs<ReasonsFields>
    type: ReasonFieldModalType
    obj: ReasonsFields|null
}) {
    const [fieldName, setFieldName] = useState(obj?.field_name || '');
    const updateFieldName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFieldName(e.target.value);
    }

    const apolloClient = useApolloClient();

    const [conditionTypes, setConditionTypes] = useState<ConditionType[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [targetDataType, setTargetDataType] = useState<string>('');
    const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);

    const [fieldType, setFieldType] = useState(obj?.field_type||'');
    const updateFieldType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setFieldType(options[selectedIndex].value);
    }

    const onSave = async (): Promise<any> => {
        if (type === 'create'){
            const { data } = await apolloClient.mutate({
                mutation: createReasonField,
                variables: {
                    reasonId: obj?.reason_id,
                    fieldName: fieldName,
                    fieldType: fieldType,
                    conditions: conditions
                }
            });

            if (!data?.createReasonField) {
                return;
            }

            if (typeof fn.onSave === 'undefined'){
                return;
            }

            fn.onSave(data?.createReasonField);
        } else if (type ==='update') {
            const { data } = await apolloClient.mutate({
                mutation: updateReasonField,
                variables: {
                    reasonFieldId: obj?.reasons_fields_id,
                    fieldName: fieldName,
                    fieldType: fieldType,
                    conditions: conditions
                }
            });
    
            if (!data?.updateReasonField){
                return;
            }

            if (typeof fn.onSave === 'undefined'){
                return;
            }

            fn.onSave(data?.updateReasonField);
            return;
        }

        return obj;
    }

    const getTitle = () => {
        return type.charAt(0).toUpperCase() + type.slice(1) + ' field';
    }


    useEffect(() => {
        if (fieldTypes?.length){
            return;
        }

        async function getFieldTypes() {
            const types = await common.getFieldTypes(apolloClient);
            setFieldTypes(types);
        }

        getFieldTypes();
    }, []);

    const [addingCondition, setAddingCondition] = useState<boolean>(false);

    const addingConditionRotation = useMemo(()=>{
        return addingCondition ? 'rotate-45' : 'rotate-0';
    }, [addingCondition]);

    const [otherFields, setOtherFields] = useState<ReasonsFields[]>([]);

    useEffect(() => {
        const getFields = async (): Promise<void> => {
            const { data } = await apolloClient.query({
                query: getOtherReasonFields,
                variables: {
                    reasonId: obj?.reason_id,
                    reasonFieldId: obj?.reasons_fields_id
                },
                fetchPolicy: 'network-only'
            });

            if (!data?.getOtherReasonFields){
                setOtherFields([]);
                return;
            }

            setOtherFields(data.getOtherReasonFields);
        }

        getFields();
    }, [obj?.reasons_fields_id]);

    const [dependentField, setDependentField] = useState<KVP>({
        key: '',
        value: ''
    });
    const updateDependentField = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setDependentField({
            key: options[selectedIndex].innerHTML,
            value: options[selectedIndex].value
        });
    }

    const [conditionTypeId, setConditionTypeId] = useState<KVP>({
        key: '',
        value: ''
    });
    const updateConditionTypeId = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setConditionTypeId({
            key: options[selectedIndex].innerHTML,
            value: options[selectedIndex].value
        });
    }

    const [requiredValue, setRequiredValue] = useState<KVP>({
        key: '',
        value: ''
    });
    const updateRequiredValue = (e:React.ChangeEvent<HTMLInputElement>): void => {
        setRequiredValue({
            key: e.target.value,
            value: e.target.value
        });
    }

    const updateRequiredValueBoolean = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setRequiredValue({
            key: options[selectedIndex].innerHTML,
            value: options[selectedIndex].value
        });
    }

    useEffect(() => {
        if (!dependentField){
            return;
        }

        async function getCondTypes () {
            const fieldIdx = otherFields?.map(e => e.reasons_fields_id).indexOf(dependentField.value);
            const fieldType = otherFields?.[fieldIdx]?.field_type;
            const fieldTypeIdx = fieldTypes?.map(e => e.field_type_id).indexOf(fieldType);
            const targetDataTyp = fieldTypes?.[fieldTypeIdx]?.data_type;

            if (!targetDataTyp){
                return;
            }

            setTargetDataType(targetDataTyp);

            const { data } = await apolloClient.query({
                query: getConditionTypes,
                variables: {
                    targetDataType: targetDataTyp
                }
            });

            if (!data?.getConditionTypes) {
                return;
            }

            setConditionTypes(data.getConditionTypes);
        }

        getCondTypes();

    }, [dependentField]);

    const clearConditionFields = () => {
        setDependentField({
            key: '',
            value: ''
        });
        setRequiredValue({
            key: '',
            value: ''
        });
        setConditionTypeId({
            key: '',
            value: ''
        });
    }

    const addCondition = (): void => {
        setConditions([
            ...conditions,
            {
                condition_id: '325q',
                condition_field: '',
                dependent_field: dependentField.value,
                required_value: requiredValue.value,
                condition_type_id: conditionTypeId.value
            }
        ]);

        setAddingCondition(false);
    }

    const removeCondition = (conditionId: string): void => {
        setConditions((prev: Condition[]):Condition[] => {
            return prev.filter((e: Condition) => {
                return e.condition_id !== conditionId;
            })
        });
    }

    useEffect(() => {
        if (!addCondition) {
            clearConditionFields();
        }
    }, [addingCondition, clearConditionFields]);

    /*
    const addFieldCondition = async () => {
        const { data } = await apolloClient.mutate({
            mutation: createFieldCondition,
            variables: {
                dependentCondition: dependentField,
                requiredValue: requiredValue,
                conditionTypeId: conditionTypeId
            }
        });
    }*/

    return (
        <Modal
            showing={showing}
            hide={fn.hide}
            title={getTitle()}>
                <div className="text-sm mt-2">
                <label className="font-medium">Field name</label>
                <div>
                    <input type="text" value={fieldName} onChange={updateFieldName}
                        className="border border-slate-300 rounded-lg px-2 py-1 outline-none w-full"
                        placeholder="Enter field name" />
                </div>
            </div>
            <div className="text-sm mt-2">
                <label className="font-medium">Field type</label>
                <div>
                    <select className="border border-slate-300 rounded-lg px-2 py-1 outline-none w-full"
                        onChange={updateFieldType} value={fieldType}>
                        <option value='' className="hidden">Select field type</option>
                        {fieldTypes?.map((e: FieldType) => {
                            return (
                                <option value={e.field_type_id} key={`ft-${e.field_type_id}`}>{e.name}</option>
                            )
                        })}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-12 mt-2 text-sm">
                <div className="col-span-12 flex items-center">
                    <p className="font-medium">Visibility conditions</p>
                    {fieldType && (
                        <button className="ml-auto p-2 rounded-lg transition-colors duration-150 hover:bg-slate-300/40"
                            title="Add condition" onClick={()=>{
                                setAddingCondition(!addingCondition);
                            }}>
                                <BiPlus className={`transition-all ${addingConditionRotation}`} />
                        </button>
                    )}
                </div>
                {fieldType ? (
                    <div className="col-span-12">
                        {addingCondition && (
                            <div className="flex items-center gap-2 flex-wrap w-full">
                                <div className="col-span-1">
                                    <p>When</p>
                                </div>
                                <div className="col-span-3">
                                    <select className="px-2 py-1 rounded-lg border border-slate-300 outline-none"
                                        value={dependentField.value} onChange={updateDependentField}>
                                        <option value='' className="hidden">Field</option>
                                        {otherFields?.map(e => {
                                            return (
                                                <option key={`field-${e.reasons_fields_id}`} value={e.reasons_fields_id}>{e.field_name}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                                
                                <div className="">
                                    <p>is</p>
                                </div>
                                <div className="">
                                    <select className="px-2 py-1 rounded-lg border border-slate-300 outline-none"
                                        value={conditionTypeId.value} onChange={updateConditionTypeId}>
                                        <option value='' className="hidden">Condition</option>
                                        {conditionTypes?.map(e => {
                                            return (
                                                <option key={`ctype-${e.condition_type_id}`} value={e.condition_type_id}>{e.name}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                                
                                <div className="flex-1">
                                    <p></p>
                                    {targetDataType === 'boolean' ? (
                                        <select className="outline-none rounded-lg border border-slate-300 px-2 py-1"
                                            value={requiredValue.value} onChange={updateRequiredValueBoolean}>
                                            <option value='' className="hidden">Value</option>
                                            <option value='true'>True</option>
                                            <option value='true'>False</option>
                                        </select>
                                    ) : (
                                        <input type="text" placeholder="value" className="w-full px-2 py-1 border border-slate-300 rounded-lg outline-none" 
                                            value={requiredValue.value} onChange={updateRequiredValue} />
                                    )}
                                </div>

                                <button className="p-2 bg-green-500 transition-colors hover:bg-green-600 rounded-lg text-white"
                                    onClick={addCondition}>
                                    <BiCheck />
                                </button>
                            </div>
                        )}
                        {conditions?.length ? (
                            <div>
                                {conditions.map(e => {
                                    return (
                                        <div className='grid grid-cols-12 gap-2'>
                                            <button className="transition-colors rounded-lg hover:bg-slate-300 col-span-1 p-2">
                                                <AiFillMinusCircle className="text-red-500 mx-auto" />
                                            </button>
                                            <div className="col-span-11 p-2">
                                                When <span className="font-medium text-xs px-2 py-1 bg-slate-300/40 rounded-sm">{dependentField.key}</span> is {conditionTypeId.key} {requiredValue.value}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <>
                                {!addingCondition && (
                                    <div className="col-span-12">
                                        <p className="text-slate-600 text-center">No conditions have been added</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="col-span-12">
                        <p className="text-slate-600 text-center">Select field type</p>
                    </div>
                )}
            </div>
            <div className="flex">
                <button className="px-4 py-1 text-sm text-white font-medium my-2 bg-blue-500
                    ml-auto transition-colors duration-150 hover:bg-blue-600 rounded-lg outline-none"
                    onClick={onSave}>
                    Save
                </button>
            </div>
        </Modal>
    )
}