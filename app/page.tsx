'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined'){
            router.replace('/i');
            return;
        }

        const a = document.createElement('a');
        a.href='/i';
        a.click();
    }, [router]);
}