import { redirect, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BiSync } from "react-icons/bi";
import Loader from "@/components/Loader";
import Modal from "./Modal";
import { getLastItemSync } from "@/graphql/queries";
import { useApolloClient } from "@apollo/client";
import useOrganization from "../providers/useOrganization";
import { toast } from "react-toastify";
import { SyncDetails } from "@/types/dbTypes";
import ScanBarcodeModal from "./ScanBarcodeModal";
import { useSession } from "next-auth/react";

export interface ZohoOrganization {
    name: string;
    organization_id: string;
}

export default function SyncItemsModal ({ sessionToken }: {
    sessionToken: string;
}) {
    const router = useRouter();

    const [organizations, setOrganizations] = useState<ZohoOrganization[]>([]);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [showingSyncModal, setShowingSyncModal] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastSync, setLastSync] = useState<SyncDetails|null>(null);
    const [currentCount, setCurrentCount] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [estimatedTime, setEstimatdTime] = useState<number>(0);
    const [transitionTime, setTransitionTime] = useState<string>('2s');

    const progress = useMemo(() => {
        if (!lastSync?.total_items){
            return 0;
        }

        return Math.round(currentCount / lastSync.total_items * 100);
    }, [lastSync?.total_items, currentCount])

    const sync = async() => {
        setIsSyncing(true);
        const es = new EventSource(`/api/zoho/inventory/items?organizationId=${organizationId}&zohoOrganizationId=${selectedOrg}&sessionToken=${sessionToken}`, {
            withCredentials: true,
        });

        setLastSync({
            items_added: 0,
            items_updated: 0,
            item_sync_log_id: '',
            total_items: 0,
            status: 'pending',
            created: new Date().toLocaleDateString()
        });

        es.onmessage = (event) => {
            const obj = JSON.parse(event.data);
            switch (obj.type){
                case 'init':
                    console.log(obj.data.itemCount)
                    setEstimatdTime(obj.data.estimatedTime);
                    setTransitionTime(`${obj.data.transitionTime / 1000}s`);
                    setLastSync({
                        items_added: 0,
                        items_updated: 0,
                        item_sync_log_id: obj.data.logId,
                        total_items: obj.data.itemCount,
                        status: 'pending',
                        created: new Date().toLocaleDateString()
                    });
                    break;
                case 'u':
                    setLastSync((prev) => {
                        if (!prev) {
                            return null;
                        }

                        return { ...prev, status: obj.data.status as string }
                    });
                    break;
                case 'i':
                    setCurrentCount(obj.data.current);
                    console.log(progress, lastSync?.total_items, obj.data.current)
                    break;
                case 'done':
                    setIsSyncing(false);
                    es.close();
                    break;
            }
        }
        
        es.onerror = (err) => {
            setIsSyncing(false);
            es.close();
        }
    }

    const apolloClient = useApolloClient();
    const { organizationId, count } = useOrganization();

    const syncItemsFromZoho = async (): Promise<void> => {
        setIsSyncing(true);

        let url = `/api/zoho/inventory/items?organizationId=${organizationId}&zohoOrganizationId=${selectedOrg}`;

        try {
            const log = await fetch(url);
            const logJson = await log.json();

            if (!logJson.success){
                throw new Error('There was an error syncing the items. Please try again later.');
            }

            url = url + `&syncId=${logJson.syncLogId}`;
        } catch (e: any) {
            toast.error(e.message);
            setIsSyncing(false);
            return;
        }

        let json = {} as any;

        try {
            const res = await fetch(url,{
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
                toast.error('You must add your client keys first.');
                setIsSyncing(false);
                return;
                //trigger show in children
            }
            router.push(json.redirectUrl);
            return;
        }

        toast.success('Sync complete.\nAdded: ' + json.added + '\nUpdated: ' + json.updated + '\nTotal: ' + json.total);
    }

    const showSyncModal = (): void => {
        setShowingSyncModal(true);
    }

    const [selectedOrg, setSelectedOrg] = useState<string>('');

    const updateSelectedOrg = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setSelectedOrg(options[selectedIndex].value);
    }

    useEffect(() => {
        if (!organizationId){
            return;
        }

        const loadOrgs = async (): Promise<void> => {
            const res = await fetch(`/api/zoho/inventory/organizations?organizationId=${organizationId}&sessionToken=${sessionToken}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await res.json();
            if (json?.redirectUrl){
                if (json.redirectUrl === '[showModal]'){
                    toast.error('You must add your client keys first.');
                    setIsSyncing(false);
                    return;
                    //trigger show in children
                }
                router.push(json.redirectUrl)
            }else {
                
                setOrganizations(json);
            }

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
    }, [organizationId, apolloClient]);

    const lastSyncState = useMemo(() => {
        switch (lastSync?.status){
            case 'pending':
                return <div className="ml-auto uppercase font-medium text-white text-xs px-3 py-1 bg-yellow-500 rounded-lg">{lastSync.status}</div>
            case 'fetching':
                return <div className="ml-auto uppercase font-medium text-white text-xs px-3 py-1 bg-blue-500 rounded-lg">{lastSync.status}</div>
            case 'completed':
                return <div className="ml-auto uppercase font-medium text-white text-xs px-3 py-1 bg-green-500 rounded-lg">{lastSync.status}</div>
            case 'error':
                return <div className="ml-auto uppercase font-medium text-white text-xs px-3 py-1 bg-red-500 rounded-lg">{lastSync.status}</div>
            default:
                return <div className="ml-auto uppercase font-medium text-white text-xs px-3 py-1 bg-slate-400 rounded-lg">not found</div>
        }
    }, [lastSync]);

    const orgs = useMemo(() => {
        if (Array.isArray(organizations)){
            return organizations;
        }

        return [];
    }, [organizations]);

    return (
        <>
            <Modal title="Sync Items from Zoho" showing={showingSyncModal} hide={() => {
                setShowingSyncModal(false)
            }}>
                <div>
                    <select name="" id="" className="border border-slate-300 px-2 py-1 text-sm rounded-lg outline-none bg-white text-[16px] md:text-sm" value={selectedOrg}
                        onChange={updateSelectedOrg}>
                        {orgs?.map(e => {
                            return (
                                <option key={`zo-${e.organization_id}`}>{e.name}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="flex py-2">
                    <button className="px-3 py-1 bg-blue-500 transition-colors rounded-lg hover:bg-blue-600 text-white outline-none ml-auto
                        disabled:bg-blue-600 disabled:text-gray-300 flex items-center gap-2" disabled={isSyncing} onClick={sync}>
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
                <div>
                    {lastSync && (
                        <div>
                            <div className="flex items-center">
                                <p className="text-lg font-medium">{isSyncing ? 'Syncing' : 'Latest Sync'}</p>
                                {lastSyncState}
                            </div>
                            <div className="h-[1px] bg-slate-300 my-1"></div>
                            {isSyncing ? (
                                <>
                                    <div>
                                        <div className="h-[2px] bg-blue-500" style={{
                                            width: `${progress}%`,
                                            transition: `${transitionTime} all ease`
                                        }}></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <p>Date:</p>
                                        <p className="ml-auto font-medium">{new Date(parseInt(lastSync.created, 10)).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <p>Items added:</p>
                                        <p className="ml-auto font-medium">{lastSync.items_added}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <p>Items updated:</p>
                                        <p className="ml-auto font-medium">{lastSync.items_updated}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <p>Total items indexed: </p>
                                        <p className="ml-auto font-medium">{lastSync.total_items}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
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