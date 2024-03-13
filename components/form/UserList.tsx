'use client';

import { getUsers } from "@/graphql/queries";
import { useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import useOrganization from "../providers/useOrganization";
import { User } from "@/types/dbTypes";

export default function UserList ({ }) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const apolloClient = useApolloClient();
    const orgId = useOrganization();

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        async function loadUsers() {
            const { data } = await apolloClient.query({
                query: getUsers,
                variables: {
                    organizationId: orgId
                }
            });

            if (!data?.getUsers){
                console.error('Could not load users.');
                return;
            }

            setUsers
        }

        loadUsers();
    }, []);

    return (
        <div></div>
    )
}