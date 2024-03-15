'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const session = useSession();


    return (
        <AuthContext.Provider value={session}>
            {children}
        </AuthContext.Provider>
    )
}