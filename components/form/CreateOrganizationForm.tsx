'use client';

import { createOrganization } from "@/graphql/mutations";
import { useApolloClient } from "@apollo/client";
import { useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";

export default function CreateOrganizationForm () {
    const [name, setName] = useState<string>('');
    const updateName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setName(e.target.value);
    }

    const apolloClient = useApolloClient();

    const addOrganization = async(): Promise<void> => {
        if (!name){
            toast.error('Name can not be empty');
        }

        const { data } = await apolloClient.mutate({
            mutation: createOrganization,
            variables: {
                name: name
            }
        });

        if (!data?.createOrganization){
            toast.error('Could not create the organization');
            return;
        }

        const a = document.createElement('a');
        a.href='/i';
        a.click();
    }
    
    return (
        <div className="text-sm grid gap-2 grid-cols-12">
            <div className="col-span-12">
                <label>Name</label>
                <div>
                    <input type='text' className="outline-none rounded-lg border border-dg-300 px-2 py-1"
                        value={name} onChange={updateName} />
                </div>
            </div>
            <div className="col-span-12 flex">
                <button className="flex items-center gap-2 outline-none transition-colors bg-blue-500
                    hover:bg-blue-600 rounded-lg px-4 py-1 text-white ml-auto" onClick={addOrganization}>
                    <AiFillPlusCircle />
                    Create Organization
                </button>
            </div>
        </div>
    )
}