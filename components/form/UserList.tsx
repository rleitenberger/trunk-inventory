'use client';

import { getUsers } from "@/graphql/queries";
import { useApolloClient } from "@apollo/client";
import React, { useEffect, useState } from "react";
import useOrganization from "../providers/useOrganization";
import { OrgUser, User } from "@/types/dbTypes";
import { AiFillMinusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { deleteOrgUser, updateUserRole } from "@/graphql/mutations";
import { BiCheck, BiPencil, BiX } from "react-icons/bi";
import { useSession } from "next-auth/react";

interface EditUserArgs {
    id: string;
    role: string;
}

export default function UserList ({ }) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const apolloClient = useApolloClient();
    const { organizationId, count } = useOrganization();

    const [users, setUsers] = useState<OrgUser[]>([]);

    useEffect(() => {
        async function loadUsers() {
            const { data } = await apolloClient.query({
                query: getUsers,
                variables: {
                    organizationId: organizationId
                }
            });

            if (!data?.getUsers){
                console.error('Could not load users.');
                return;
            }

            setUsers(data.getUsers);
        }

        loadUsers();
    }, [organizationId, apolloClient]);

    const removeUser = async(userId: string): Promise<void> => {
        let conf = false;
        if (typeof window !== 'undefined'){
            conf = confirm('Are you sure you want to remove this user?');
        } else {
            conf = true;
        }

        if (!conf){
            return;
        }

        const usrIdx = users.map(e => e.users.id).indexOf(userId);

        const { data } = await apolloClient.mutate({
            mutation: deleteOrgUser,
            variables: {
                userId: userId,
                organizationId: organizationId
            }
        });

        if (!data?.deleteOrgUser){
            toast.error('Could not remove the user. Please try again later.');
            return;
        }

        setUsers((prev) => {
            return prev.filter(e => {
                return e.users.id !== userId;
            })
        });
    }

    const { data: session } = useSession();

    const [editingUser, setEditingUser] = useState<EditUserArgs>({
        id: '',
        role: ''
    });

    const updateEditingUserRole = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setEditingUser((prev) => {
            return {
                ...prev,
                role: options[selectedIndex].value
            }
        })
    }

    const modifyOrgUser = async (): Promise<void> => {

        const usrIdx = users.map(e => e.users.id).indexOf(editingUser.id);
        if(usrIdx === -1){
            toast.error('Invalid user.');
            return;
        }

        const currentRole = users[usrIdx].role;
        if (editingUser.role === currentRole){
            setEditingUser({
                id: '',
                role: '',
            })
            return;
        }

        const { data } = await apolloClient.mutate({
            mutation: updateUserRole,
            variables: {
                organizationId: organizationId,
                userId: editingUser.id,
                role: editingUser.role
            }
        });

        if (!data?.updateUserRole) {
            toast.error('Could not update the user. Please try again later.');
            return;
        }

        setUsers((prev) => {
            const tmp = prev.map((e: OrgUser): OrgUser => {
                return {
                    ...e,
                    role: e.role,
                    users: e.users
                }
            })
            tmp[usrIdx].role = editingUser.role
            return tmp;
        });

        setEditingUser({
            id: '',
            role: ''
        })
    }

    return (
        <div className="grid grid-cols-12 gap-2 text-sm">
            {users?.map(e => {
                const bgColor = e.role === 'admin' ? 'bg-red-400' : 'bg-slate-500';

                return (
                    <React.Fragment key={`ou-${e.users.id}`}>
                        {editingUser.id === e.users.id ? (
                            <div className="col-span-12 grid grid-cols-12 gap-2">
                                <div className="col-span-1 flex items-center">
                                </div>
                                <div className="col-span-7">
                                    <p>{e.users.name}</p>
                                    <p className="text-xs font-medium text-slate-600">{e.users.email}</p>
                                </div>
                                <div className={`col-span-2 flex items-center`}>
                                    <select value={editingUser.role} onChange={updateEditingUserRole}
                                        className="px-2 py-1 rounded-lg border border-slate-300 outline-none flex-1">
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <button className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors outline-none
                                        text-white ml-auto" onClick={modifyOrgUser}>
                                        <BiCheck />
                                    </button>
                                    <button className="p-2 rounded-lg transition-colors text-white bg-red-500 hover:bg-red-600"
                                        onClick={()=>{
                                            setEditingUser({
                                                id: '',
                                                role: ''
                                            })
                                        }}>
                                        <BiX />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="col-span-12 grid grid-cols-12 gap-2">
                                <div className="col-span-1 flex items-center">
                                    {session?.user.id !== e.users.id && (
                                        <button className="p-2 transition-colors rounded-lg hover:bg-slate-300/40"
                                            onClick={() => {
                                                removeUser(e.users.id)
                                            }}>
                                            <AiFillMinusCircle className="text-red-500" />
                                        </button>
                                    )}
                                </div>
                                <div className="col-span-8">
                                    <p>{e.users.name}</p>
                                    <p className="text-xs font-medium text-slate-600">{e.users.email}</p>
                                </div>
                                <div className={`col-span-2 flex items-center text-xs font-medium text-white`}>
                                    <div className={`rounded-md px-2 py-1 ${bgColor}`}>
                                        <label>{e.role}</label>
                                    </div>
                                </div>
                                <div className="col-span-1 flex items-center">
                                    {session?.user.id !== e.users.id && (
                                        <button className="p-2 rounded-lg transition-colors hover:bg-slate-300/40 ml-auto"
                                            onClick={()=>{
                                                setEditingUser({
                                                    id: e.users.id,
                                                    role: e.role
                                                })
                                            }}>
                                            <BiPencil />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                    
                )
            })}
        </div>
    )
}