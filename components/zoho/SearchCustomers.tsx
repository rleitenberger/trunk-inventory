'use client';

import { useState } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import useOrganization from "../providers/useOrganization";
import { ZCustomer } from "@/types/zohoTypes";
import { toast } from "react-toastify";
import Modal from "../modal/Modal";
import Loader from "../Loader";
import { AiFillPlusCircle } from "react-icons/ai";

const SearchCustomers = ({ onChange, sessionToken, disabled, orgId }: {
    onChange: (customer: ZCustomer) => void;
    disabled: boolean;
    sessionToken?: string;
    orgId: string;
}) => {
    const [searching, setSearching] = useState<boolean>(false);
    const { organizationId } = useOrganization();

    const [customer, setCustomer] = useState<ZCustomer|null>(null);

    const [query, setQuery] = useState<string>('');
    const updateQuery = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setQuery(e.target.value);
    }
    
    const onCustomerChange = (contact: ZCustomer): void => {
        setCustomer(contact);
        onChange(contact);

        setShowingSelect(false);
    }

    const searchCustomers = async(): Promise<void> => {
        setSearching(true);

        const result = await fetch(`/api/zoho/books/customers?organizationId=${organizationId}&organization_id=${orgId}&sessionToken=${sessionToken}&query=${query}`);
        const { data, error } = await result.json() as {
            data: ZCustomer[],
            error?: string;
        };

        setSearching(false);

        if (error){
            toast.error(error);
            return;
        }

        setCustomers(data);
        setShowingSelect(true);
    }

    const [customers, setCustomers] = useState<ZCustomer[]>([]);
    const [showingSelect, setShowingSelect] = useState<boolean>(false);
    const hideSelect = () => {
        setShowingSelect(false);
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            searchCustomers();
        }
    }

    const clearCustomer = (): void => {
        setCustomer(null);
    }
    
    return (
        <>
            <Modal showing={showingSelect} hide={hideSelect} title="Select customer">
                <div className="grid grid-cols-12 gap-2">
                    {customers?.map((e: ZCustomer) => {
                        return (
                            <button key={e.contact_id} className="p-2 rounded-lg hover:bg-slate-300/40 transition-colors text-sm col-span-12 text-left
                                flex items-center gap-2"
                                onClick={() => {
                                    onCustomerChange(e)
                                }}>
                                <div>
                                    <AiFillPlusCircle className="text-green-500" />
                                </div>
                                <div>
                                    <div className="font-medium">{e.company_name}</div>
                                    <div className="text-slate-600">{e.first_name} {e.last_name}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </Modal>
            <label className="text-xs">Customer</label>
            <div className="flex items-center gap-2">
                <input type='text' onChange={updateQuery} className='px-2 py-1 text-sm flex-1 rounded-lg
                    border border-slate-300 outline-none' placeholder="Company or customer name" onKeyDown={onKeyDown} />
                <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors" onClick={searchCustomers}>
                    {searching ? (
                        <div><Loader size="sm" /></div>
                    ) : (
                        <BiSearch className="text-white text-xl" />
                    )}
                </button>
            </div>
            {customer !== null && (
                <button className="my-1 rounded-md text-xs px-2 py-1 font-medium bg-slate-300/40 w-fit
                    flex items-center gap-3 transition-colors hover:bg-slate-300/70" onClick={clearCustomer}>
                    <BiX className="text-red-500 text-lg" />
                    {customer.company_name}
                </button>
            )}
        </>
    )
}

export default SearchCustomers;