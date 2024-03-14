import React, { createContext } from "react";

export const OrganizationContext = createContext('');

export const OrganizationProvider = ({ children, selectedOrg }: {
    children: React.ReactNode
    selectedOrg: string;
}) => {
    return (
        <OrganizationContext.Provider value={selectedOrg}>
            {children}
        </OrganizationContext.Provider>
    )
}