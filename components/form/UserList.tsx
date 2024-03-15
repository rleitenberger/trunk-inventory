'use client';

import { getUsers } from "@/graphql/queries";
import { useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import useOrganization from "../providers/useOrganization";
import { OrgUser, User } from "@/types/dbTypes";
import { AiFillMinusCircle } from "react-icons/ai";

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
    }, [organizationId]);

    return (
        <div className="grid grid-cols-12 gap-2 text-sm">
            {users?.map(e => {
                const bgColor = e.role === 'admin' ? 'bg-red-400' : 'bg-slate-500';

                return (
                    <div className="col-span-12 grid grid-cols-12 gap-2" key={`ou-${e.users.id}`}>
                        <div className="col-span-1 flex items-center">
                            <button className="p-2 transition-colors rounded-lg hover:bg-slate-300/40">
                                <AiFillMinusCircle className="text-red-500" />
                            </button>
                        </div>
                        <div className="col-span-9">
                            <p>{e.users.name}</p>
                            <p className="text-xs font-medium text-slate-600">{e.users.email}</p>
                        </div>
                        <div className={`col-span-2 flex items-center text-xs font-medium text-white`}>
                            <div className={`rounded-md px-2 py-1 ${bgColor}`}>{e.role}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}