'use client';
import { useEffect, useState } from "react";
import { ZohoOrganization } from "../modal/SyncItemsModal";
import useOrganization from "../providers/useOrganization";

const SelectZohoOrg = ({ onChange, sessionToken }: {
    onChange: (orgId: string) => void;
    sessionToken?: string;
}) => {
    const [orgs, setOrgs] = useState<ZohoOrganization[]>([]);
    const [org, setOrg] = useState<string>('');

    const { organizationId } = useOrganization();

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

            const json = await res.json() as ZohoOrganization[];
            setOrgs(json);

            if (json?.length) {
                setOrg(json[0]?.organization_id);
                onChange(json[0]?.organization_id);
            }
        }

        loadOrgs();
    }, [organizationId]);

    const onItemChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        const { value } = options[selectedIndex];

        setOrg(value);
        onChange(value);
    }

    return (
        <>
            <label className="text-xs">Organization</label>
            <div>
                <select onChange={onItemChanged} value={org} className="border border-slate-300 rounded-lg px-2 py-1 text-sm
                    outline-none w-full">
                    {orgs?.map((e: ZohoOrganization) => {
                        return (
                            <option key={e.organization_id} value={e.organization_id}>{e.name}</option>
                        )
                    })}
                </select>
            </div>
        </>
    )
}

export default SelectZohoOrg;