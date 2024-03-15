import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Organization } from '@/types/dbTypes';
import { OrganizationProviderType } from '@/types/hookTypes';
import { IsAdminProvider } from '../providers/IsAdminProvider';
import { OrganizationProvider } from '../providers/OrganizationProvider';
import { useApolloClient } from '@apollo/client';
import { getOrganizations } from '@/graphql/queries';
import Nav from '../Nav';

export default function NavWrapper ({ children }: {
    children: React.ReactNode;
}) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
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
                setOrganizations(data.getOrganizations);
            }
        }

        loadOrgs();
    }, [apolloClient]);

    const [org, setOrg] = useState<string>('');
    const updateOrganization = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setOrg(options[selectedIndex].value);
    }, []);

    useEffect(() => {
        if (org){
            return;
        }

        if (!organizations?.length) {
            return;
        }

        setOrg(organizations[0].organization_id)
    }, [organizations]);

    const orgType = useMemo(() => {
        return {
            organizationId: org,
            count: organizations?.length ?? 0,
        } as OrganizationProviderType;
    }, [org, organizations]);

    return (
        <OrganizationProvider value={orgType}>
            <IsAdminProvider>
                <Nav 
                    update={updateOrganization}
                    organizations={organizations}>
                    {children}
                </Nav>
            </IsAdminProvider>
        </OrganizationProvider>
    )
}