import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiSync } from "react-icons/bi";
import Loader from "@/components/Loader";
import Modal from "./Modal";
import { getLastItemSync } from "@/graphql/queries";
import { useApolloClient } from "@apollo/client";

export interface ZohoOrganization {
    name: string;
    organization_id: string;
}

export default function SyncItemsModal ({ organizationId }: {
    organizationId: string;
}) {
    const router = useRouter();

    const [organizations, setOrganizations] = useState<ZohoOrganization[]>([]);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [lastSyncDetails, setLastSyncDetails] = useState<string>('');
    const [showingSyncModal, setShowingSyncModal] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const apolloClient = useApolloClient();

    const syncItemsFromZoho = async (): Promise<void> => {
        setIsSyncing(true);

        let json = {} as any;

        try {
            const res = await fetch(`/api/zoho/inventory/items?organizationId=${organizationId}&zohoOrganizationId=${selectedOrg}`,{
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            json = await res.json();
    
        } catch (e) {
            setError('An error occured');
            return;
        } finally {
            setIsSyncing(false);
        }

        if (json?.redirectUrl){
            if (json.redirectUrl === '[showModal]'){
                alert('You must add your client keys first.');
                console.error('You must add your client keys first.');
                setIsSyncing(false);
                return;
                //trigger show in children
            }
            router.push(json.redirectUrl);
            return;
        }

        setSuccess('Sync complete. Discovered items: ' + json.length)
    }

    const showSyncModal = (): void => {
        setShowingSyncModal(true);
    }

    const [selectedOrg, setSelectedOrg] = useState<string>('');

    const updateSelectedOrg = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setSelectedOrg(options[selectedIndex].value);
    }
    const [lastSync, setLastSync] = useState({});

    useEffect(() => {
        const loadOrgs = async (): Promise<void> => {
            const res = await fetch(`/api/zoho/inventory/organizations?organizationId=${organizationId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await res.json();
            setOrganizations(json);

            if (json?.length) {
                setSelectedOrg(json[0]?.organization_id);
            }
        }

        const loadLastSync = async (): Promise<void> => {
            const { data } = await apolloClient.query({
                query: getLastItemSync,
                variables: {
                    organizationId: organizationId
                }
            });

            if (!data?.getLastItemSync) {
                console.error('No sync found');
                return;
            }

            setLastSync(data.getLastItemSync);
        }

        loadOrgs();
        loadLastSync();
    }, [organizationId]);

    return (
        <>
            <Modal title="Sync Items from Zoho" showing={showingSyncModal} hide={() => {
                setShowingSyncModal(false)
            }}>
                <div>
                    <select name="" id="" className="border border-slate-300 px-2 py-1 text-sm rounded-lg outline-none bg-white text-[16px] md:text-sm" value={selectedOrg}
                        onChange={updateSelectedOrg}>
                        {organizations?.map(e => {
                            return (
                                <option key={`zo-${e.organization_id}`}>{e.name}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="flex py-2">
                    <button className="px-3 py-1 bg-blue-500 transition-colors rounded-lg hover:bg-blue-600 text-white outline-none ml-auto
                        disabled:bg-blue-600 disabled:text-gray-300 flex items-center gap-2" disabled={isSyncing} onClick={syncItemsFromZoho}>
                            {isSyncing ? (
                                <>
                                    <BiSync className="--syncing text-lg" />
                                    Syncing Items
                                </>
                            ) : (
                                <> 
                                    <BiSync />
                                    Sync Items
                                </>
                            )}
                        </button>
                </div>
            </Modal>
            <button className="bg-blue-500 px-3 py-1 rounded-lg outline-none transition-all text-white hover:bg-blue-600 flex items-center gap-2
                    disabled:bg-blue-600 disabled:text-gray-300"
                onClick={showSyncModal}>
                {isSyncing ? (
                    <>
                        <BiSync className="--syncing text-lg" />
                        Syncing Items
                    </>
                ) : (
                    <> 
                        <BiSync />
                        Sync from Zoho
                    </>
                )}
            </button>

        </>
    )
}