'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getReasons } from '@/graphql/queries';
import type { TransferOptions } from '@/types/TransferOptions';
import { BiTransfer } from 'react-icons/bi';
import { getTransactionType } from '@/graphql/queries';
import { Condition, Reason, ReasonsFields } from '@/types/dbTypes';
import { createTransaction } from '@/graphql/mutations';
import ItemSearch from '@/components/form/ItemSearch';
import LocationSearch from '@/components/form/LocationSearch';
import Loader from '@/components/Loader';
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { DropDownSearchOption } from '@/types/DropDownSearchOption';
import { FieldEntry, FieldEntryValue, SalesOrderInput, TransferType } from '@/types/formTypes';
import { moveDefaults } from '@/lib/defaultValues';
import DynamicForm from '@/components/form/DynamicForm';
import { TransactionResponse } from '@/types/responses';
import { IoIosMenu } from 'react-icons/io';
import BoxTimer from '@/components/form/BoxTimer';
import Head from 'next/head';
import useOrganization from '@/components/providers/useOrganization';
import { toast } from 'react-toastify';
import LinkToSalesOrder from '../zoho/LinkToSalesOrder';
import { useSession } from 'next-auth/react';
import type { ZLineItem, ZPackage, ZSalesOrder, ZShipment, ZohoApiResponse } from '@/types/zohoTypes';
import { useIsAdmin } from '../providers/IsAdminProvider';

export default function MoveItemsForm({ transferType }: {
    transferType: TransferType
}) {

    const [zohoShipLogs, setZohoShipLogs] = useState<string[]>([]);
    const addShipLog = (msg: string): void => {
        setZohoShipLogs((prev: string[]): string[] => {
            return [...prev, msg];
        })
    }
    
    const { data: session } = useSession();

    const [fieldValues, setFieldValues] = useState<FieldEntryValue[]>([]);
    const client = useApolloClient();
    const { organizationId, count, loading } = useOrganization();

    const [salesOrder, setSalesOrder] = useState<SalesOrderInput>({
        salesorder_id: null,
        salesorder_number: null,
        organizationId: ''
    });

    const [shipping, setShipping] = useState<boolean>(false);

    const [transferOptions, setTransferOptions] = useState<TransferOptions<DropDownSearchOption>>(moveDefaults[transferType]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [transactionResponse, setTransactionResponse] = useState<TransactionResponse>({
        transactionId: '',
        sentEmails: false,
        accepted: [],
        rejected: []
    });

    const onFieldChange = (e:DropDownSearchOption, objectName: string): void  => {
        setTransferOptions({
            ...transferOptions,
            [objectName]: e
        });
    }

    const onQtyChange = (e: React.ChangeEvent<HTMLInputElement>):void => {
        setTransferOptions({
            ...transferOptions,
            qty: {
                ...transferOptions.qty,
                value: parseInt(e.target.value)
            }
        });
    }

    const onReasonChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;

        setTransferOptions({
            ...transferOptions,
            reasonId: {
                ...transferOptions.reasonId,
                value: options[selectedIndex].value
            }
        });
    }

    const transferItem = async () => {

        if (!transferOptions.from.value || !transferOptions.to.value){
            toast.error('Missing location(s)');
            return;
        }

        if (!transferOptions.itemId.value){
            toast.error('Missing item');
            return;
        }

        if (!transferOptions.qty.value){
            toast.error('Quantity can not be 0');
            return;
        }

        if (transferOptions.qty.value < 0){
            toast.error('Quantity can not be less than 0');
            return;
        }

        if (!transferOptions.reasonId.value){
            toast.error('You must select a reason');
            return;
        }

        const vals = Object.keys(transferOptions).reduce((acc: any, key: string) => {
            acc[key] = transferOptions[key].value;
            return acc;
        }, {});

        const variables = {
            orgId: organizationId,
            transferType: transferType,
            transferInput: {
                ...vals
            },
            fieldEntries: fieldValues,
            salesOrder: {
                salesorder_id: salesOrder.salesorder_id,
                salesorder_number: salesOrder.salesorder_number
            },
            shipping: shipping,
        };

        const { data } = await client.mutate({
            mutation: createTransaction,
            variables: variables
        });

        if (!data?.createTransaction) {
            return;
        }
        setTransactionResponse(data?.createTransaction);

        if (shipping){
            await shipItem()
        }
    }

    const shipItem = async() => {
        if (transferOptions.qty.value <= 0){
            toast.error('Cannot pack and ship to zoho if qty <= 0.')
            return;   
        }

        //check sales order for item id
        const res = await fetch(`/api/zoho/books/salesorders?action=getItems&organization_id=${salesOrder.organizationId}&orgId=${organizationId}&salesOrderId=${salesOrder.salesorder_id}&sessionToken=${session?.user.sessionToken}&itemId=${transferOptions.itemId.value}`);
        const data = await res.json();

        if (!data.zItemId){
            toast.error('This item is not currently tracked. Sync items from zoho and try again.');
            return;
        }

        const { line_items } = data as { line_items: ZLineItem[] };
        if (!line_items) {
            toast.error('No line_items found in response. Please try again later.');
            return;
        }

        const exists = line_items.map((e: ZLineItem) => e.item_id).indexOf(data.zItemId);

        if (exists === -1) {
            //create item
            
            line_items.push({
                item_order: line_items.length - 1,
                item_id: data.zItemId,
                quantity: transferOptions.qty.value,
            });
        } else {
            line_items[exists].quantity += transferOptions.qty.value;
        }

        const updatedItems = await fetch(`/api/zoho/books/salesorders?action=updateItems&organization_id=${salesOrder.organizationId}&orgId=${organizationId}&sessionToken=${session?.user.sessionToken}&salesOrderId=${salesOrder.salesorder_id}&zi_item_id=${data.zItemId}`, {
            method: 'POST',
            body: JSON.stringify({
                line_items: line_items.map((e: ZLineItem) => {
                    const args = {
                        item_id: e.item_id,
                        rate: e.rate,
                        name: e.name,
                        description: e.description,
                        quantity: e.quantity,
                        discount: e.discount,
                        tax_id: e.tax_id,
                        unit: e.unit,
                        item_custom_fields: e.item_custom_fields,
                        tax_exemption_id: e.tax_exemption_id,
                        tax_exemption_code: e.tax_exemption_code,
                        project_id: e.project_id,
                        warehouse_id: e.warehouse_id,
                    } as ZLineItem;

                    if (e.line_item_id){
                        args.line_item_id = e.line_item_id;
                    }

                    return args;
                })
            })
        });

        const itemsUpdated = await updatedItems.json() as ZohoApiResponse<ZSalesOrder> & {
            lineItemId: string;
        };

        if (itemsUpdated.code !== 0){
            toast.error(itemsUpdated.message);
            return;
        }

        addShipLog(`${transferOptions.qty.value} items added to ${salesOrder.salesorder_number}`);

        const createPackage = await fetch(`/api/zoho/books/salesorders?action=createPackage&organization_id=${salesOrder.organizationId}&orgId=${organizationId}&salesOrderId=${salesOrder.salesorder_id}&sessionToken=${session?.user.sessionToken}`, {
            method: 'POST',
            body: JSON.stringify({
                lineItemId: itemsUpdated.lineItemId,
                qty: transferOptions.qty.value,
                salesOrderId: salesOrder.salesorder_id,
            }),
        });
        const createPackageRes = await createPackage.json() as ZohoApiResponse<ZPackage> & {
            package: ZPackage;
        };

        if (createPackageRes.code !== 0){
            toast.error(createPackageRes.message);
            return;
        }

        const { package_id, package_number, customer_id } = createPackageRes.package;
        addShipLog(`Package ${package_number} was created`);

        const createShipment = await fetch(`/api/zoho/books/salesorders?action=createShipment&organization_id=${salesOrder.organizationId}&orgId=${organizationId}&sessionToken=${session?.user.sessionToken}`, {
            method: 'POST',
            body: JSON.stringify({
                packageId: package_id,
                salesOrderId: salesOrder.salesorder_id,
                deliveryMethod: 'Delivered',
            })
        });

        const createShipmentRes = await createShipment.json() as ZohoApiResponse<ZShipment> & {
            shipmentorder: ZShipment;
        };

        if (createShipmentRes.code !== 0){
            toast.error(createShipmentRes.message);
            return;
        }

        const { shipment_id, shipment_number } = createShipmentRes;
        addShipLog(`Shipment ${shipment_number} was created.`);

    }

    
    const isAdmin = useIsAdmin();

    useEffect(() => {

        if (!client || !organizationId){
            return;
        }

        async function loadReasons() {
            const { data } = await client.query({
                query: getTransactionType,
                variables: {
                    organizationId: organizationId,
                    slug: transferType
                }
            });

            if (!data?.getTransactionType){
                toast.error('Could not load transaction type');
                return;
            }

            const { transaction_type_id } = data?.getTransactionType;
            if (!transaction_type_id){
                //error
                return;
            }

            const reasons = await client.query({
                query: getReasons,
                variables: {
                    transactionTypeId: transaction_type_id
                }
            });

            const allReasons = reasons.data?.getReasons;
            if (!allReasons || !allReasons?.length) {
                return;
                //error
            }

            setReasons(allReasons);
        }

        loadReasons();
    }, [client, transferType, organizationId]);

    
    const _clear = (key: string) => {
        setTransferOptions({
            ...transferOptions,
            [key]: {
                name: key,
                value: ''
            }
        });
    }

    const clearItem = (): void => {
        _clear('itemId');
    }

    const clearLocationTo = () => {
        _clear('to');
    }

    const clearLocationFrom = () => {
        _clear('from');
    }

    const getTitle = () => {
        switch (transferType) {
            case 'transfer':
                return 'Transfer to Trunk Inventory';
            case 'return':
                return 'Return Item from Project';
            case 'pull':
                return 'Pull Item for Project';
            case 'remove':
                return 'Remove from Trunk Inventory';
            default:
                return 'Trunk Inventory';
        }
    }

    const requiredFields = useMemo(() => {
        const idx = reasons.map(e => e.reason_id).indexOf(transferOptions.reasonId.value);
        if (idx===-1){
            return [];
        }
        const fields = reasons[idx].reasons_fields;

        return fields.map((e: ReasonsFields) => {
            return {
                field_name: e.reasons_fields_id,
                field_type: e.field_type,
                title: e.field_name,
                conditions: e.conditions,
            }
        });
    }, [transferOptions.reasonId, reasons]);

    useEffect(() => {
        setFieldValues(requiredFields.map((e: FieldEntry) => {
            return {
                field_name: e.field_name,
                value: ''
            }
        }));
    }, [transferOptions.reasonId, requiredFields]);

    const updateDynamicField = useCallback((newValue: DropDownSearchOption, name: string): any => {
        setFieldValues(prev => {
            return prev.map(e => { 
                if (e.field_name === name) {
                    return { ...e, value: newValue.value.toString() };
                }
                return e;
            });
        });
    }, []);

    const fromLocationForItemSearch = useMemo(() => {
        if (transferOptions.from.name === 'Parts Room' || transferOptions.from.name === 'Customer Location'){
            return undefined;
        }
        return transferOptions.from.value; //need to fetch if location can view all items or not
    }, [transferOptions.from]);

    const redirectToHome = () => {
        const a = document.createElement('a');
        a.href='/i';
        //a.click();
    }

    const reasonDesc = useMemo(() => {
        const idx = reasons?.map((e: Reason) => e.reason_id).indexOf(transferOptions.reasonId.value);

        if (idx === -1){
            return '';
        }

        return reasons[idx]?.description;
    }, [transferOptions.reasonId]);

    const onSalesOrderChange = (salesOrder: SalesOrderInput): void => {
        setSalesOrder((prev) => {
            if (!salesOrder.organizationId){
                return {
                    ...prev,
                    salesorder_id: salesOrder.salesorder_id,
                    salesorder_number: salesOrder.salesorder_number
                };
            }

            return salesOrder;
        });
    }

    const onShippingChange = (ship: boolean): void => {
        setShipping(ship);
    }
    
    return (
        <>
            <Head>
                <meta name="viewport" content="maximum-scale=1" key="max"></meta>
            </Head>
            <h1 className='text-xl font-medium'>{getTitle()}</h1>
            <div className='grid grid-cols-1 gap-2 mt-2'>
                <div className='grid grid-cols-12 md:grid-cols-11'>
                    <div className='col-span-12 md:col-span-5'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear: clearLocationFrom
                            }}
                            defaultValue={transferOptions.from}
                            displayOptions={{
                                title:'From location',
                                name: 'from'
                            }}/>
                    </div>
                    <div className='col-span-12 md:col-span-1'>
                        <p>&nbsp;</p>
                        <HiOutlineArrowNarrowRight className='text-lg col-span-1 self-center mx-auto hidden md:block' />
                        <HiOutlineArrowNarrowDown className='text-lg col-span-1 self-center mx-auto block md:hidden' />
                    </div>
                    <div className='col-span-12 md:col-span-5'>
                        <LocationSearch
                            fn={{
                                onChange: onFieldChange,
                                clear:clearLocationTo
                            }}
                            defaultValue={transferOptions.to}
                            displayOptions={{
                                title:'To location',
                                name: 'to'
                            }} />
                    </div>
                </div>
                <div className='grid grid-cols-12 gap-2'>
                    <div className='col-span-12 md:col-span-6'>
                        <ItemSearch
                        fn={{
                            onChange: onFieldChange,
                            clear: clearItem
                        }}
                        displayOptions={{
                            title:'Item',
                            name:'itemId'
                        }}
                        locationId={fromLocationForItemSearch} />
                    </div>
                    <div className='col-span-12 md:col-span-6'>
                        <div className='flex items-center gap-2'>
                            <IoIosMenu />
                            <label className='text-sm'>Quantity</label>
                        </div>
                        <div>
                            <input type='number' value={transferOptions.qty.value} name='qty' onChange={onQtyChange} min={0}
                                className='px-3 py-1 border border-slate-300 rounded-lg w-full text-sm outline-none' />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 md:col-span-6'>
                        <p className='text-sm'>Reason</p>
                        <select value={transferOptions.reasonId.value} onChange={onReasonChange} className='w-full 
                            px-2 py-1 text-sm border border-slate-300 outline-none rounded-lg bg-white text-[16px] md:text-sm'>
                            <option value='' className='hidden'>Select reason</option>
                            {reasons?.map((e: Reason) => {
                                return (
                                    <option key={`reason-${e.reason_id}`} value={e.reason_id}>{e.name}</option>
                                )
                            })}
                        </select>
                        {!!reasonDesc?.length && (
                            <p className='text-sm font-medium px-2 py-1'>{reasonDesc}</p>
                        )}
                    </div>
                </div>
                <div className='grid grid-cols-12 gap-2'>
                    <DynamicForm requiredFields={requiredFields} onChange={updateDynamicField} />

                </div>
                {(transferType === 'pull' && isAdmin) && (
                    <LinkToSalesOrder onSalesOrderChange={onSalesOrderChange} onShippingChange={onShippingChange} />
                )}
                <div>
                    <button className=' bg-blue-500 transition-colors hover:bg-blue-600 flex items-center gap-2
                    text-sm text-white px-4 py-2 rounded-lg duration-100' onClick={transferItem}>
                        <BiTransfer />
                        Transfer Item{transferOptions.qty.value === 1 || transferOptions.qty.value === -1 ? (
                            ''
                        ) : (
                            's'
                        )}
                    </button>
                </div>
                {transactionResponse.transactionId && (
                    <>
                        <div className='p-4 rounded-md bg-green-300/20'>
                            <p className='text-green-600 text-sm text-center'>
                                The transaction was created. <span className='text-xs font-semibold'>(#{transactionResponse.transactionId})</span>
                            </p>
                        </div>
                        <BoxTimer
                            delay={5}
                            onDelayReached={redirectToHome}
                            note='' />
                    </>
                    
                            
                )}
                {isLoading && (
                    <div>
                        <Loader size='md' />
                    </div>
                )}
            </div>
        </>
    )
}