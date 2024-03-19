'use client';

import { getZohoClientKeys } from "@/graphql/queries";
import { useApolloClient } from "@apollo/client";
import { useEffect, useMemo, useState } from "react"
import useOrganization from "../providers/useOrganization";
import Modal from "./Modal";
import { ZohoClientKeys, ZohoInventoryApiKeys } from "@/types/dbTypes";
import { upsertZohoClientKeys } from "@/graphql/mutations";
import { BiKey } from "react-icons/bi";

const AddZohoKeysModal = () => {
    const apolloClient = useApolloClient();
    const { organizationId, count } = useOrganization();

    const [keys, setKeys] = useState<ZohoClientKeys>({
        clientId: '',
        clientSecret: '',
        zohoInventoryKeysId: '',
    });

    const updateKeys = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setKeys({
            ...keys,
            [name]: value
        });
    }

    useEffect(() => {
        if (!organizationId){
            return;
        }

        async function loadClientKeys() {
            const { data } = await apolloClient.query({
                query: getZohoClientKeys,
                variables: {
                    organizationId: organizationId
                }
            });

            if (!data?.getZohoClientKeys) {
                console.error('null response');
                return;
            }

            setKeys({
                clientId: data.getZohoClientKeys?.client_id ?? '',
                clientSecret: data.getZohoClientKeys?.client_secret ?? '',
                zohoInventoryKeysId: data.getZohoClientKeys?.zoho_inventory_keys_id ?? ''
            });
        }

        loadClientKeys();
    }, [organizationId, apolloClient]);

    const upsertKeys = async (): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: upsertZohoClientKeys,
            variables: {
                organizationId: organizationId,
                zohoClientInput: keys
            }
        });

        if (!data?.upsertZohoClientKeys){
            console.error('could not update keys');
            return;
        }

        setShowing(false);
    }

    const formTitle = useMemo((): string => {
        return keys.clientId || keys.clientSecret ? 'Update Zoho Keys' : 'Add Zoho Keys'
    }, [keys]);

    const [showing, setShowing] = useState<boolean>(false);
    const showModal = (): void => {
        setShowing(true);
    }

    const hideModal = (): void => {
        setShowing(false);
    }

    return (
        <>
            <Modal title={formTitle} showing={showing} hide={hideModal}>
                <div className="grid grid-cols-12 gap-2 text-sm">
                    <div className="col-span-12">
                        <label>Client ID</label>
                        <div>
                            <input type="text" value={keys.clientId} onChange={updateKeys} name="clientId"
                                className="outline-none border border-slate-300 px-2 py-1 rounded-lg w-full" placeholder="Enter client ID" />
                        </div>
                    </div>
                    <div className="col-span-12">
                        <label>Client Secret</label>
                        <div>
                            <input type="text" value={keys.clientSecret} onChange={updateKeys} name="clientSecret"
                                className="outline-none border border-slate-300 px-2 py-1 rounded-lg w-full" placeholder="Enter client secret" />
                        </div>
                    </div>
                    <div className="col-span-12 flex">
                        <button className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg outline-none ml-auto text-white transition-colors"
                            onClick={upsertKeys}>Save</button>
                    </div>
                </div>
            </Modal>
            <button className="bg-blue-500 px-3 py-1 rounded-lg outline-none transition-colors hover:bg-blue-600 flex items-center gap-2 text-white"
                onClick={showModal}>
                <BiKey />
                {formTitle}
            </button>
        </>
            
    )
}

export default AddZohoKeysModal;