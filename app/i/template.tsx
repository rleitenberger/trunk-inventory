'use client';

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/components/auth/AuthProvider";
import NavWrapper from "@/components/wrappers/NavWrapper";

export default async function Template({ children }: { children: React.ReactNode}) {
    return (
        <NavWrapper>
            <AuthProvider>
                <AuthGuard>
                    {children}
                </AuthGuard>
            </AuthProvider>
        </NavWrapper>
    )
}