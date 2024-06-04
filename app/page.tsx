'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        const a = document.createElement('a');
        a.href='/i';
        a.click();
    }, []);
}