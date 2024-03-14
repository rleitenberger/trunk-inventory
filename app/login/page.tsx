'use client';

import Loader from '@/components/Loader';
import { LoginFields } from '@/types/authTypes';
import { signIn } from 'next-auth/react'
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const parseError = (e: string|null): string => {
    if (e === null){{
        return '';
    }}

    switch (e){
        case 'CredentialsSignIn':
            return 'Invalid username and/or password.';
        default: 
            return 'An error occured. Please try again.';
    }
}

export default function Login() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const params = useSearchParams();
    const [error, setError] = useState<string|null>(parseError(params.get('error')));
    const buttonRef = useRef<any>();

    useEffect(() => {
        setError(parseError(params.get('error')))
    }, [params]);

    const [fields, setFields] = useState<LoginFields>({
        usernameOrEmail: '',
        password: ''
    });

    const updateField = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target as { name: string, value: string };
        setFields((prev: LoginFields): LoginFields => {
            return {
                ...prev,
                [name]: value
            }
        });
    }

    const login = async () => {
        setIsLoading(true);
        await signIn('credentials', {
            ...fields,
            callbackUrl: '/app',
        });

        setIsLoading(false);
    }

    const keyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter') {
            buttonRef?.current.click();
        }
    }

    return (
        <div className='text-[16px] md:text-sm flex items-center gap-4 justify-center h-screen flex-col
            max-w-[400px] mx-auto'>
            <h1 className='font-bold text-4xl'>Login</h1>
            {error && (
                <div className='bg-red-500/20 text-red-600 text-center px-8 py-4 rounded-lg mx-auto'>
                    <p className=''>{error}</p>
                </div>
            )}
            <div className='w-full'>
                <label>Username</label>
                <div className='flex'>
                    <input type="text" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg w-full"
                        placeholder="Enter username" name="username" onChange={updateField} tabIndex={0} onKeyDown={keyDown} />
                </div>
            </div>
            <div className='w-full'>
                <label>Password</label>
                <div className='flex'>
                    <input type="password" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg w-full"
                        placeholder="Enter password" name="password" onChange={updateField} onKeyDown={keyDown} />
                </div>
            </div>
            <button onClick={login} className="px-6 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white"
                ref={buttonRef}>
                {isLoading ? (
                    <Loader size="sm" />
                ) : (
                    <>
                        Login
                    </>
                )}
            </button>
            <Link href="/register" className='text-blue-500 text-sm underline'>Click here to register</Link>
        </div>
    )
}