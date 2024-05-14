'use client';

import { useSession } from "next-auth/react";
import SelectZohoOrg from "../form/SelectZohoOrg";
import { SalesOrderInput, SalesOrderLinkKey, SalesOrderLinkOptions } from "@/types/formTypes";
import { useEffect, useState } from "react";
import SearchCustomers from "./SearchCustomers";
import SelectSalesOrder from "./SelectSalesOrder";
import { ZCustomer, ZSalesOrder } from "@/types/zohoTypes";

const LinkToSalesOrder = ({ onSalesOrderChange, onShippingChange, canShip=true }: {
    onSalesOrderChange: (salesOrder: SalesOrderInput) => void;
    onShippingChange: (shipping: boolean) => void;
    canShip: boolean
}) => {
    const [options, setOptions] = useState<SalesOrderLinkOptions>({
        orgId: '',
        customer: null,
        salesOrder: null,
    });
    const { data: session } = useSession();

    const onChange = (key: SalesOrderLinkKey, value: string|ZCustomer|SalesOrderInput) => {
        setOptions((prev: SalesOrderLinkOptions): SalesOrderLinkOptions => {
            return {
                ...prev,
                [key]: value
            }
        });

        if (key === 'salesOrder') {
            onSalesOrderChange(value as SalesOrderInput);
        }
    }

    const [isShipping, setIsShipping] = useState<boolean>(false);
    const updateIsShipping = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { checked } = e.target;
        setIsShipping(checked);
        onShippingChange(checked);
    }

    return (
        <div className="px-3 py-2 border border-slate-300 rounded-lg">
            <p className="text-xs uppercase font-medium text-slate-500">Link to sales order</p>
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-6">
                    <SelectZohoOrg sessionToken={session?.user.sessionToken} onChange={(orgId: string) => {
                        onChange('orgId', orgId)
                    }} />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <SearchCustomers sessionToken={session?.user.sessionToken} onChange={(customer: ZCustomer) => {
                        onChange('customer', customer)
                    }} disabled={!options.orgId} orgId={options.orgId as string} />
                </div>
                <div className="col-span-12 sm:col-span-6">
                    <SelectSalesOrder sessionToken={session?.user.sessionToken} onChange={(salesOrder: SalesOrderInput) => {
                        onChange('salesOrder', salesOrder)
                    }} customer={options.customer as ZCustomer} disabled={!options.customer} zohoOrgId={options.orgId as string} />
                </div>
            </div>
            {canShip && (
                <div>
                    <div className="flex items-center gap-2 my-2">
                        <input type="checkbox" checked={isShipping} onChange={updateIsShipping} />
                        <p className="text-sm">Create package & shipment in Zoho Inventory</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LinkToSalesOrder;