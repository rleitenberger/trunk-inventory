'use client';

import ItemSearch from "@/components/form/ItemSearch";
import SelectZohoOrg from "@/components/form/SelectZohoOrg";
import { updateShelf } from "@/graphql/mutations";
import { getItem } from "@/graphql/queries";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { Item } from "@/types/dbTypes";
import { gql, useApolloClient } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useOrganization from "@/components/providers/useOrganization";

const ItemsPage = () => {
    const apolloClient = useApolloClient();
    const { organizationId } = useOrganization();
    const [selectedItem, setSelectedItem] = useState<DropDownSearchOption>({
        name: '',
        value: '', 
    });
    const [item, setItem] = useState<Item|null>(null);
    const [shelf, setShelf] = useState<number>(0);
    const changeShelf = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setShelf(parseInt(e.target.value,10));
    }

    useEffect(() => {
        setPackedCount(-1);
        setQty(-1);
    }, [selectedItem]);

    const { data: session } = useSession();
    const [zohoOrg, setZohoOrg] = useState<string>('');
    const updateZohoOrg = (org: string): void => {
        setZohoOrg(org);
    }

    const updateItem = (e: DropDownSearchOption, objectName: string): void => {
        setSelectedItem(e);
    }

    const clearItem = (): void => {
        setSelectedItem({
            name: '',
            value: '',
        });
    }

    const loadItem = async(): Promise<void> => {
        const { data } = await apolloClient.query({
            query: getItem,
            variables: {
                itemId: selectedItem.value,
            }
        });

        if (!data?.getItem){
            toast.error('Could not find item');
            return;
        }

        setItem(data.getItem);
        setShelf(data.getItem?.shelf ?? 0)
    }

    const modifyShelf = async(): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: updateShelf,
            variables: {
                itemId: selectedItem.value,
                shelf: shelf,
            }
        });

        if (!data?.updateShelf){
            toast.error('Could not update item shelf');
            return;
        }

        if (item === null) {
            return;
        }

        setItem({
            ...item,
            shelf: shelf,
        });

        setShelf(0);
        setItem(null);
    }

    useEffect(() => {
        console.log(zohoOrg)
    }, [zohoOrg])

    const [packedCount, setPackedCount] = useState<number>(-1);
    const [qty, setQty] = useState<number>(-1);

    const getZohoPackedCount = async(): Promise<void> => {
        const data = await fetch(`/api/zoho/books/salesorders?action=getItem&organization_id=${zohoOrg}&itemId=${selectedItem.value}&sessionToken=${session?.user.sessionToken}&orgId=${organizationId}`);
        const res = await data.json();
        if (typeof res?.amount !== 'number'){
            toast.error('Could not find the item count');
            return;
        }

        setPackedCount(res.amount);

        const getInternalQty = await apolloClient.query({
            query: gql`
                query getInternalQty($itemId: String!) {
                    getInternalQty(itemId: $itemId)
                }
            `,
            variables: {
                itemId: selectedItem.value
            }
        });

        if (typeof getInternalQty.data?.getInternalQty !== 'number') {
            toast.error('Error getting item qty');
            return;
        }

        setQty(getInternalQty.data.getInternalQty);
    }

    useEffect(() => {
        if (!selectedItem.value) {
            return;
        }

        loadItem();
    }, [selectedItem]);

    return (
        <div>
            <p className="font-medium text-lg">Items</p>
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 md:col-span-6">   
                    <ItemSearch
                        displayOptions={{
                            name: 'item',
                            title: 'Item'
                        }}
                        fn={{
                            onChange: updateItem,
                            clear: clearItem,
                        }} />

                    {item === null ? (
                        <p className="text-sm text-center p-2 text-slate-600">Select an item</p>
                    ) : (
                        <div className="text-sm mt-2">
                            <label className="text-xs font-semibold">Shelf</label>
                            <div className="flex items-center gap-2">
                                <input type="number" value={shelf} onChange={changeShelf}
                                    className="px-2 py-1 rounded-lg border border-slate-300 flex-1 outline-none" min={0} max={20}/>
                                <button className="rounded-lg text-white bg-blue-500 hover:bg-blue-600
                                    outline-none px-4 py-1 transition-colors" onClick={modifyShelf}>Save</button>
                            </div>
                            <div className=" grid grid-cols-12">
                                <div className="col-span-8">
                                    <SelectZohoOrg
                                        sessionToken={session?.user.sessionToken}
                                        onChange={updateZohoOrg} />
                                </div>
                                <div className="col-span-4 flex items-end justify-end">
                                    <button className="outline-none bg-blue-500 transition-colors hover:bg-blue-600 rounded-lg text-white
                                        px-2 py-1" onClick={getZohoPackedCount}>
                                        Get packed count
                                    </button>
                                </div>
                            </div>
                            {packedCount > -1 && (
                                <p>Packed count: {packedCount}</p>
                            )}
                            {qty > -1 && (
                                <p>Qty across all trunks: {qty}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ItemsPage;