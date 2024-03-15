'use client';

import { useState } from "react";
import { BiPlus } from "react-icons/bi";
import Modal from "../modal/Modal";
import { AiFillPlusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import useOrganization from "../providers/useOrganization";
import { addOrgUser } from "@/graphql/mutations";
import { UserInvite } from "@/types/dbTypes";

export default function AddUserForm ({  }) {
    const [email, setEmail] = useState<string>('');
    const updateEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEmail(e.target.value);
    }

    const [isAdding, setIsAdding] = useState<boolean>(false);
    const startAdding = (): void => {
        setIsAdding(true);
    }

    const stopAdding = (): void => {
        setIsAdding(false);
        setEmail('');
    }

    const apolloClient = useApolloClient();
    const { organizationId, count } = useOrganization();

    const addUser = async (): Promise<void> => {
        if (!email){
            toast.error('Email can\'t be empty');
            return;
        }

        const { data } = await apolloClient.mutate({
            mutation: addOrgUser,
            variables: {
                organizationId: organizationId,
                email: email
            }
        });

        if (!data?.addOrgUser){
            toast.error('An unexpected error occured.');
            return;
        }

        const { added, message, invite } = data.addOrgUser;

        if (!added){
            toast.error(message);
            return;
        }

        toast.success(message);
    }

    return (
        <>
            <button className="p-2 rounded-lg transition-colors hover:bg-slate-300/40"
                onClick={startAdding}>
                <BiPlus className={`text-lg`} />
            </button>
            {isAdding && (
                <Modal title="Add User" showing={isAdding} hide={stopAdding}>
                    <div className="text-sm my-2">
                        <label>Email</label>
                        <div className="flex">
                            <input type='email' className="px-2 py-1 border border-slate-300 rounded-lg outline-none flex-1"
                                placeholder="Enter email" onChange={updateEmail} value={email} />
                        </div>
                    </div>
                    <div className="flex">
                        <button className="ml-auto px-4 py-1 bg-blue-500 rounded-lg flex items-center gap-2 text-white text-sm
                            transition-colors hover:bg-blue-600" onClick={addUser}>
                            <AiFillPlusCircle />
                            Add User
                        </button>
                    </div>
                </Modal>
            )}
        </>
    )
}