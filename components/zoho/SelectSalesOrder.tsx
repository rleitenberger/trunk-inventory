'use client';

import { ZCustomer, ZSalesOrder } from "@/types/zohoTypes";
import { useEffect, useState } from "react";
import useOrganization from "../providers/useOrganization";
import { SalesOrderInput } from "@/types/formTypes";
import { IoIosSwap } from "react-icons/io";
import Modal from "../modal/Modal";
import { AiFillPlusCircle } from "react-icons/ai";
import { BiX } from "react-icons/bi";

const SelectSalesOrder = ({ customer, onChange, zohoOrgId, sessionToken, disabled }: {
    customer: ZCustomer;
    onChange: (salesOrder: SalesOrderInput) => void;
    zohoOrgId: string;
    sessionToken?: string;
    disabled: boolean;
}) => {
    const [salesOrders, setSalesOrders] = useState<ZSalesOrder[]>([]);
    const [salesOrder, setSalesOrder] = useState<ZSalesOrder|null>(null);
    const updateSalesOrder = (e: ZSalesOrder): void => {
        setSalesOrder(e);
        onChange({
            salesorder_id: e.salesorder_id,
            organizationId: zohoOrgId,
            salesorder_number: e.salesorder_number
        });
        setShowing(false);
    }

    const { organizationId } = useOrganization();

    useEffect(() => {
        if (!organizationId || !customer?.company_name) {
            return;
        }

        const loadSalesOrders = async (): Promise<void> => {
            const result = await fetch(`/api/zoho/books/salesorders?orgId=${organizationId}&organization_id=${zohoOrgId}&sessionToken=${sessionToken}&customer=${customer.company_name}`);
            const { data } = await result.json() as {
                data: ZSalesOrder[];
            }

            setSalesOrders(data);

            if (data?.length) {
                setSalesOrder(data[0]);
                onChange({
                    salesorder_id: data[0].salesorder_id,
                    salesorder_number: data[0].salesorder_number,
                    organizationId: zohoOrgId
                });
            }
        }

        loadSalesOrders();
    }, [customer, organizationId]);

    const clearSalesOrder = (): void => {
        setSalesOrder(null);
        onChange({
            salesorder_id: null,
            salesorder_number: null,
            organizationId: ''
        })
    }

    const [showing, setShowing] = useState<boolean>(false);
    const hide = (): void => {
        setShowing(false);
    }

    return (
        <>
            <Modal title="Select Sales Order" showing={showing} hide={hide}>
                <div className="grid grid-cols-12 gap-2">
                    {salesOrders?.map((e: ZSalesOrder) => {
                        return (
                            <button className="text-sm px-2 py-1 col-span-12 flex items-center gap-2" onClick={() => {
                                updateSalesOrder(e)
                            }} key={e.salesorder_id}>
                                <AiFillPlusCircle className="text-green-500" />
                                <div>
                                    <p className="font-medium">{e.salesorder_number}</p>
                                    <p className="text-slate-600">{e.reference_number ?? '[No reference number]'}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </Modal>
            <label className="text-xs">Sales Order</label>
            <div className="flex items-center gap-2">
                {salesOrder !== null && (
                    <button className="border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none flex items-center gap-2" value={salesOrder?.salesorder_id}
                        onClick={clearSalesOrder}>
                            <BiX className='text-red-500 text-lg' />
                        <p>{salesOrder.salesorder_number}</p>
                    </button>
                )}
                <button className="bg-blue-500 hover:bg-blue-600 rounded-lg outline-none transition-colors text-white
                    flex items-center gap-2 px-2 py-1 text-sm" onClick={() => {
                        setShowing(true)
                    }}>
                    <IoIosSwap />
                    {salesOrder === null ? 'Select' : 'Change'} Sales Order
                </button>
            </div>
        </>
    )
}

export default SelectSalesOrder;