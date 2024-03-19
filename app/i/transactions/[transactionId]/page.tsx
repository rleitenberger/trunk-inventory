'use client';

import { useEffect } from "react";

interface TransactionParams {
    transactionId: string
}

export default function Transaction ({ params }: {
    params: TransactionParams
}) {
    useEffect(() => {
        const { transactionId }: { transactionId: string } = params;
        
        async function loadTransaction() {

        }

        loadTransaction();
    }, [params]);

    return (
        <div></div>
    )
}