'use client';

import Nav from "@/components/Nav";
import NavMobile from "@/components/NavMobile";
import { getOrganizations } from "@/graphql/queries";
import { Organization } from "@/types/dbTypes";
import { useApolloClient } from "@apollo/client";
import React, { useEffect, useMemo, useState } from "react";
import { BiChevronRight } from "react-icons/bi";



export default function AppWrapper ({ children }: { 
    children: React.ReactNode;
}) {

    const [orgs, setOrgs] = useState<Organization[]>([]);
    const apolloClient = useApolloClient();

    useEffect(()=>{
        if (!apolloClient){
            return;
        }

        async function loadOrgs() {
            const { data } = await apolloClient.query({
                query: getOrganizations
            });

            if (data?.getOrganizations){
                setOrgs(data.getOrganizations);
            }
        }

        loadOrgs();
    }, [apolloClient]);

    return (
        <Nav organizations={orgs}>
            {children}
        </Nav>
    )
}