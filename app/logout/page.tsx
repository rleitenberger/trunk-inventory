'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function Logout() {
    useEffect(() => {
        async function logout () {
            await signOut({
                redirect: true,
                callbackUrl: '/login'
            });
        }

        logout();
    }, []);

    return <div></div>
}