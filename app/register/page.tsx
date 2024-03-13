'use client'

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Register() {   
    const opts = {
        name: 'DirecTec Shop',
        username: 'shop',
        email: 'inventory@directecllc.com',
        password: 'D!recTec',
        confirmPassword: 'D!recTec',
    }

    const { data:session, status } = useSession();

    const register = async () => {
        const r = await fetch('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(opts),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await r.json();
    }

    const login = async () => {
        const l = await signIn('credentials', {
            username: 'shop',
            password: 'D!recTec',
            redirect: false
        });
    }

    const logout = async () => {
        const s = await signOut({
            redirect: false
        });
    }
    
    return (

        <div>

            <button onClick={register}>Register</button>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>

        </div>

    )
}