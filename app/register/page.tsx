'use client'

import Loader from "@/components/Loader";
import { RegisterFields } from "@/types/authTypes";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from 'next-auth/react';

export default function Register() {
    const searchParams = useSearchParams();

    const [fields, setFields] = useState<RegisterFields>({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteId: ''
    });

    useEffect(() => {
        const email = searchParams.get('email');
        if (!email){
            return;
        }

        setFields((prev) => {
            const tmp = { ...prev };
            tmp.email = email;
            return tmp;
        });
    }, []);

    const updateField = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target as { name: string, value: string };
        setFields((prev: RegisterFields): RegisterFields => {
            return {
                ...prev,
                [name]: value
            }
        });
    }

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const router = useRouter();

    const register = async () => {
        setIsLoading(true);

        const r = await fetch('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                ...fields,
                inviteId: searchParams.get('inviteId'),
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        setIsLoading(false);
        const response = await r.json();

        if (response?.error){
            toast.error(response.error);
            return;
        }

        toast.success('Your account has been created. You will be redirected', {
            autoClose: 3000,
            onClose: async () => {
                await signIn('credentials', {
                    username: fields.username,
                    password: fields.password,
                    callbackUrl: '/i',
                });
            }
        });
    }

    return (

        <div className="flex items-center justify-center flex-col gap-4 h-screen text-[16px] md:text-sm
            max-w-[400px] mx-auto">
            {isRedirecting ? (
                <>
                    <Loader size="md" />
                    <Link href="/i" className="text-blue-500 underline text-sm">Please click here if you are not automatically redirected</Link>
                </>
            ) : (
                <div className="w-full px-6 md:px-0 flex flex-col gap-2">
                    <h1 className="text-4xl font-bold">Register</h1>
                    <div className="w-full">
                        <label>Name</label>
                        <div className="flex">
                            <input type="text" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg flex-1"
                                placeholder="Enter name" name="name" onChange={updateField} value={fields.name} />
                        </div>
                    </div>
                    <div className="w-full">
                        <label>Email</label>
                        <div className="flex">
                            <input type="email" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg flex-1"
                                placeholder="Enter email" name="email" onChange={updateField} value={fields.email} />
                        </div>
                    </div>
                    <div className="w-full">
                        <label>Username</label>
                        <div className="flex">
                            <input type="text" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg flex-1"
                                placeholder="Enter username" name="username" onChange={updateField} value={fields.username} />
                        </div>
                    </div>
                    <div className="w-full">
                        <label>Password</label>
                        <div className="flex">
                            <input type="password" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg flex-1"
                                placeholder="Enter password" name="password" onChange={updateField} value={fields.password} />
                        </div>
                    </div>
                    <div className="w-full">
                        <label>Confirm Password</label>
                        <div className="flex">
                            <input type="password" className="px-2 py-1 border border-slate-300 outline-none bg-white rounded-lg flex-1"
                                placeholder="Confirm password" name="confirmPassword" onChange={updateField} value={fields.confirmPassword} />
                        </div>
                    </div>
                    <div className="flex">
                        <button onClick={register} className="px-6 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white
                            ml-auto">
                            {isLoading ? (
                                <>
                                    <Loader size="sm" />
                                </>
                            ) : (
                                <>
                                    Register
                                </>
                            )}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link href="/login" className='text-blue-500 text-sm underline'>Click here to login</Link>
                    </div>
                </div>
            )}
        </div>

    )
}