'use client';

import AdminNav from "@/components/AdminNav";
import AddZohoKeysModal from "@/components/modal/AddZohoKeysModal";
import ZohoApiConsoleTutorialModal from "@/components/modal/ZohoApiConsoleTutorial";
import SyncItemsModalWrapper from "@/components/wrappers/SyncItemsModalWrapper";

export default function PageAdminItems ({  }) {

    return (
        <>
            <AdminNav pageName="items" />
            <h1 className="font-medium my-2 text-lg">Items</h1>
            <div className="flex items-center gap-2 text-sm">
                <SyncItemsModalWrapper />
                <AddZohoKeysModal />
                <ZohoApiConsoleTutorialModal />
            </div>
        </>
    )
}