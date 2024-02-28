import { useState } from "react";
import { ModalFnArgs, TypedModalArgs } from "@/types/formTypes";
import { ReasonsFields } from "@/types/dbTypes";
import { updateReasonField } from "@/graphql/mutations";
import Modal from "./Modal";
import { useApolloClient } from "@apollo/client";

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

    const [fieldType, setFieldType] = useState(obj?.field_type||'');
    const updateFieldType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setFieldType(options[selectedIndex].value);
    }

    const onSave = async (): Promise<any> => {
        if (type === 'create'){

        } else if (type ==='update') {
            const { data } = await apolloClient.mutate({
                mutation: updateReasonField,
                variables: {
                    reasonFieldId: obj?.reasons_fields_id,
                    fieldName: fieldName,
                    fieldType: fieldType
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
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    return (
        <Modal
            showing={showing}
            hide={fn.hide}
            title={getTitle()}>
                <div className="text-sm mt-2">
                <label className="font-medium">Field name</label>
                <div>
                    <input type="text" value={fieldName} onChange={updateFieldName}
                        className="border border-slate-300 rounded-lg px-2 py-1 outline-none w-full" />
                </div>
            </div>
            <div className="text-sm mt-2">
                <label className="font-medium">Field type</label>
                <div>
                    <select className="border border-slate-300 rounded-lg px-2 py-1 outline-none w-full"
                        onChange={updateFieldType} value={fieldType}>
                        <option value='' className="hidden">Select field type</option>
                        <option value='text'>Textbox</option>
                        <option value='textarea'>Text Area</option>
                        <option value='locationSearch'>Location Search</option>
                        <option value='itemSearch'>Item Search</option>
                    </select>
                </div>
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