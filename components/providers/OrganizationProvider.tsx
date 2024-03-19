import { OrganizationProviderType } from "@/types/hookTypes";
import React, { createContext, useContext } from "react";

export const OrganizationContext = createContext<OrganizationProviderType>({
    organizationId: '',
    count: 0,
    loading: false,
});


export const OrganizationProvider = ({ children, value }: {
    children: React.ReactNode
    value: OrganizationProviderType
}) => {

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    )
}