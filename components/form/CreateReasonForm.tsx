import { common } from "@/lib/common";
import { Reason, TransactionType } from "@/types/dbTypes";
import { useEffect, useState } from "react";
import useOrganization from "../providers/useOrganization";
import { useApolloClient } from "@apollo/client";
import { InputFunctionGroup } from "@/types/formTypes";
import { AiFillPlusCircle } from "react-icons/ai";
import { createReason } from "@/graphql/mutations";

interface CreateReasonFnArgs {
    onSave: (response: Reason|null) => void
}

export default function CreateReasonForm ({ types, fn }: {
    types?: TransactionType[]
    fn: CreateReasonFnArgs
}) {
    const [reasonName, setReasonName] = useState<string>('');
    const updateReasonName = (e: React.ChangeEvent<HTMLInputElement>):void=>{
        setReasonName(e.target.value);
    }

    const [transactionType, setTransactionType] = useState<string>('');
    const updateTransactionType = (e: React.ChangeEvent<HTMLSelectElement>):void=>{
        const { options, selectedIndex } = e.target;
        setTransactionType(options[selectedIndex].value);
    }

    const [description, setDescription] = useState<string>('');
    const updateDescription = (e: React.ChangeEvent<HTMLTextAreaElement>):void=>{
        setDescription(e.target.value);
    }

    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>(types || []);

    const organizationId = useOrganization();
    const apolloClient = useApolloClient();

    useEffect(() => {
        if (transactionTypes?.length){
            return;
        }

        async function getTypes () {
            const res = await common.getTransactionTypes(organizationId, apolloClient);
            setTransactionTypes(res);
        }

        getTypes();
    }, [transactionTypes]);

    const addReason = async () => {
        const { data } = await apolloClient.mutate({
            mutation: createReason,
            variables: {
                reasonName: reasonName,
                transactionTypeId: transactionType,
                description: description
            }
        });

        if (!data?.createReason){
            return;
        }

        if (typeof fn.onSave === 'undefined'){
            return;
        }

        fn.onSave(data.createReason);
    }
    
    return (
        <div className="text-sm grid grid-cols-12 gap-2">
            <div className="col-span-12">
                <label>Reason Name <span className="text-red-500">*</span></label>
                <div>
                    <input type="text" className="px-2 py-1 outline-none rounded-lg border border-slate-300 w-full"
                        value={reasonName} onChange={updateReasonName} placeholder="Enter a name" />
                </div>
            </div>
            <div className="col-span-12">
                <label>Transaction Type <span className="text-red-500">*</span></label>
                <div>
                    <select onChange={updateTransactionType} className="outline-none px-2 py-1 rounded-lg border border-slate-300 w-full bg-white
                        text-[16px] md:text-sm">
                        <option value='' className="hidden">Select type</option>
                        {transactionTypes?.map(e => {
                            return (
                                <option key={`cr-type-${e.transaction_type_id}`} value={e.transaction_type_id}>{e.type}</option>
                            )
                        })}
                    </select>
                </div>
            </div>
            <div className="col-span-12">
                <label>Description</label>
                <div>
                    <textarea className="px-2 py-1 border border-slate-300 rounded-lg outline-none resize-none w-full"
                        value={description} onChange={updateDescription}></textarea>
                </div>
            </div>
            <div className="col-span-12 flex">
                <button className="ml-auto rounded-lg flex items-center gap-2 transition-colors
                    duration-150 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1" onClick={addReason}>
                    <AiFillPlusCircle />
                    Add
                </button>
            </div>
        </div>
    )
}