'use client';

import LoginForm from "@/components/form/LoginForm";

export default function Login() {
    return (
        <div className="h-screen">
            <LoginForm callbackUrl='/i' />
        </div>
    )
}