'use client';

import { useSession } from "next-auth/react";
import Loader from "../Loader";
import SyncItemsModal from "../modal/SyncItemsModal";

export default function SyncItemsModalWrapper() {
    const { data: session, status } = useSession();

    if (status === 'loading'){
        return (
            <div>
                <Loader size='sm' />
            </div>
        )
    }

    return <SyncItemsModal sessionToken={session?.user.sessionToken as string} />
}