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

    const [loadingOrgs, setLoadingOrgs] = useState<boolean>(false);

    useEffect(()=>{
        setLoadingOrgs(true);

        if (!apolloClient){
            setLoadingOrgs(false);
            return;
        }

        async function loadOrgs() {
            const { data } = await apolloClient.query({
                query: getOrganizations
            });

            if (data?.getOrganizations){
                setOrganizations(data.getOrganizations);
            }
            
            setLoadingOrgs(false);
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
    }, [organizations, org]);

    const orgType = useMemo(() => {
        return {
            organizationId: org,
            count: organizations?.length ?? 0,
            loading: loadingOrgs
        } as OrganizationProviderType;
    }, [org, organizations, loadingOrgs]);

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