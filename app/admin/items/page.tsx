'use client';

import AdminNav from "@/components/AdminNav";
import { useEffect, useState } from "react";
import AddZohoKeysModal from "@/components/modal/AddZohoKeysModal";
import ZohoApiConsoleTutorialModal from "@/components/modal/ZohoApiConsoleTutorial";
import useOrganization from "@/components/providers/useOrganization";
import SyncItemsModal from "@/components/modal/SyncItemsModal";

export default function PageAdminItems ({  }) {
    const orgId = useOrganization();

    return (

        <>
            <AdminNav pageName="items" />
            <h1 className="font-medium my-2 text-lg">Items</h1>

            <div className="flex items-center gap-2 text-sm">
                <SyncItemsModal organizationId={orgId} />
                <AddZohoKeysModal />
                <ZohoApiConsoleTutorialModal />
            </div>
        </>
    )
}