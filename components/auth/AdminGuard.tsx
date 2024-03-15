'use client';

import { useIsAdmin } from "../providers/IsAdminProvider";

export default function AdminGuard({ children, callbackUrl } : {
    children: React.ReactNode;
    callbackUrl?: string;
}) {
    const isAdmin = useIsAdmin();

    if (!isAdmin){
        return <div>
            <p>Unauthorized</p>
        </div>
    }

    return (
        <>
            {children}
        </>
    )
}