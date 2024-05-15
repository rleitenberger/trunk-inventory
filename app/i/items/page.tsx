'use client';

import ItemSearch from "@/components/form/ItemSearch";
import { updateShelf } from "@/graphql/mutations";
import { getItem } from "@/graphql/queries";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { Item } from "@/types/dbTypes";
import { useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ItemsPage = () => {
    const apolloClient = useApolloClient();
    const [selectedItem, setSelectedItem] = useState<DropDownSearchOption>({
        name: '',
        value: '', 
    });
    const [item, setItem] = useState<Item|null>(null);
    const [shelf, setShelf] = useState<number>(0);
    const changeShelf = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setShelf(parseInt(e.target.value,10));
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ItemsPage;