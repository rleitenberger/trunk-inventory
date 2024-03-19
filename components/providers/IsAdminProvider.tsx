import { createContext, useContext, useEffect, useState } from "react";
import useOrganization from "./useOrganization";
import { useApolloClient } from "@apollo/client";
import { getIsAdmin } from "@/graphql/queries";

export const IsAdminContext = createContext<boolean>(false);

export const useIsAdmin = () => useContext(IsAdminContext);

export function IsAdminProvider ({ children }: {
    children: React.ReactNode;
}) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const { organizationId, count } = useOrganization();
    const apolloClient = useApolloClient();

    useEffect(() => {
        async function loadIsAdmin () {
            const { data } = await apolloClient.query({
                query: getIsAdmin,
                variables: {
                    organizationId: organizationId
                }
            });

            if (!data?.getIsAdmin){
                setIsAdmin(false);
            }

            setIsAdmin(data.getIsAdmin);
        }

        loadIsAdmin();
    }, [organizationId, apolloClient]);

    return (
        <IsAdminContext.Provider value={isAdmin}>
            {children}
        </IsAdminContext.Provider>
    )
}