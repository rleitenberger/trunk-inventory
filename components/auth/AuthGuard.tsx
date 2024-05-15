'use client';

import { useEffect } from "react";
import { useAuth } from '@/components/auth/AuthProvider';
import Loader from "../Loader";
import LoginForm from "../form/LoginForm";

export function AuthGuard({ children }: {
    children: React.ReactNode
}) {
    const { data: session, status } = useAuth();

    if (status === 'loading') {
        return (
            <div className="h-full flex items-center justify-center flex-col gap-2">
                <Loader size='md' />
                <p className="text-sm">{/*Authorizing*/}</p>
            </div>
        )
    }

    if (status === 'authenticated') {
        return (
            <>
                {children}
            </>
        )
    }

    return  <LoginForm callbackUrl='/i' />
}