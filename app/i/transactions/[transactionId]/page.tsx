'use client';

import ItemSearch from "@/components/form/ItemSearch";
import LocationSearch from "@/components/form/LocationSearch";
import { useIsAdmin } from "@/components/providers/IsAdminProvider";
import LinkToSalesOrder from "@/components/zoho/LinkToSalesOrder";
import { updateTransaction, deleteTransaction } from "@/graphql/mutations";
import { getTransaction } from "@/graphql/queries";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { GetTransaction, Transaction } from "@/types/dbTypes";
import { SalesOrderInput } from "@/types/formTypes";
import { UpdateTransactionArgs } from "@/types/queryTypes";
import { useApolloClient } from "@apollo/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BiPencil, BiSave, BiX, BiTrash, BiChevronLeft } from "react-icons/bi";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import TransactionUpdates from "@/components/TransactionUpdates";
import Link from "next/link";

interface TransactionParams {
    transactionId: string
}

export default function Transactions ({ params }: {
    params: TransactionParams
}) {
    const [options, setOptions] = useState<any>({
        transactionId: '',
        from: {
            name: '',
            value: '',
        },
        to: {
            name: '',
            value: '',
        },
        item: {
            name: '',
            value: '',
        },
        qty: '',
        salesorder_id: null,
        salesorder_number: null,
    });
    const { transactionId }: { transactionId: string } = params;
    const [loading, setLoading] = useState<boolean>(false);
    const [editing, setEditing] = useState<boolean>(false);
    const [transaction, setTransaction] = useState<GetTransaction|null>(null);
    const isAdmin = useIsAdmin();
    const { push } = useRouter();
    const apolloClient = useApolloClient();

    //hide element rather than make it visible and re-request zoho api
    const soLinkVisibility = useMemo<string>(() => {
        return editing ? 'block' : 'hidden absolute z-[-10000] left-[9999px]';
    }, [editing]);

    const copyTransactionToOptions = (t: GetTransaction|null) => {
        if (t === null){
            return;
        }

        const opts = {
            transactionId: t.transaction_id,
            transferType: t.transfer_type,
            from: {
                name: t.from_location.name,
                value: t.from_location.location_id,
            },
            to: {
                name: t.to_location.name,
                value: t.to_location.location_id,
            },
            item: {
                name: t.item.name,
                value: t.item.item_id,
            },
            qty: t.qty,
            salesorder_id: t.salesorder_id,
            salesorder_number: t.salesorder_number
        };

        setOptions(opts);
    }

    useEffect(() => {
        if (!transactionId) {
            return;
        }
        
        async function loadTransaction() {
            setLoading(true);

            try {
                const { data } = await apolloClient.query({
                    query: getTransaction,
                    variables: {
                        transactionId: transactionId
                    }
                });

                if (!data?.getTransaction){
                    throw new Error('There was an error loading the transaction.');
                }

                const t = data.getTransaction as GetTransaction;

                setTransaction(t);
                copyTransactionToOptions(t);
            } catch(e: any) {
                toast.error('There was an error loading the transaction. Please try again.');
                return;
            } finally {
                setLoading(false);
            }
        }

        loadTransaction();

        if (typeof window !== 'undefined'){
            const anchor = window.location.hash;
            if (anchor === '#edit' && isAdmin){
                setEditing(true);
            }
        }
    }, [transactionId]);

    const enableEditing = () => {
        push('#edit');
        setEditing(true);
    }

    const saveEdits = async () => {
        const variables: UpdateTransactionArgs = {
            transactionId: options.transactionId,
            from: options.from.value,
            to: options.to.value,
            item: options.item.value,
            qty: parseInt(options.qty,10),
            transferType: options.transferType,
            salesorder_id: options.salesorder_id,
            salesorder_number: options.salesorder_number,
        };

        const { data } = await apolloClient.mutate({
            mutation: updateTransaction,
            variables: {
                args: variables
            }
        });

        if (!data?.updateTransaction){
            toast.error('There was an error updating the transaction.');
            return;
        }

        toast.success('The transaction was updated');
        setTransaction(data.updateTransaction);
        setEditing(false);
    }

    const cancelEdits = async () => {
        setEditing(false);

        push('#');

        const t = transaction;

        if (t === null){
            return;
        }
        
        setOptions({
            transactionId: t.transaction_id,
            transferType: t.transfer_type,
            from: {
                name: t.from_location.name,
                value: t.from_location.location_id,
            },
            to: {
                name: t.to_location.name,
                value: t.to_location.location_id,
            },
            item: {
                name: t.item.name,
                value: t.item.item_id,
            },
            qty: t.qty,
        });
    }

    const onFieldChange = (e: DropDownSearchOption, objectName: string): void  => {
        setOptions((prev: any) => {
            return {
                ...prev,
                [objectName]: e
            }
        });
    }

    const clear = (key: string) => {
        setOptions((prev: any) => {
            return {
                ...prev,
                [key]: {
                    name: '',
                    value: '',
                }
            }
        })
    }

    const updateQty = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { value } = e.target;
        setOptions((prev: any) => {
            return {
                ...prev,
                qty: value,
            }
        });
    }

    const onSalesOrderChange = (salesOrder: SalesOrderInput) => {
        setOptions((prev: any) => {
            return {
                ...prev,
                salesorder_number: salesOrder.salesorder_number,
                salesorder_id: salesOrder.salesorder_id,
            }
        })
    }

    const updateTransferType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setOptions((prev: any) => {
            return {
                ...prev,
                transferType: options[selectedIndex].value,
            }
        });
    }

    const transactionDate = useMemo<string>(() => {
        if (transaction === null) {
            return '';
        }
        const date = new Date(parseInt(transaction.created, 10));

        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }, [transaction]);

    const onShippingChange = (shipping: boolean) => {
        //
    }

    const _deleteTransaction = async () => {
        if (typeof window === 'undefined') {
            return;
        }

        const conf = window.confirm('Are you sure you want to delete the transaction? This operation can not be reversed.');

        if (!conf){ 
            return;
        }

        const { data } = await apolloClient.mutate({
            mutation: deleteTransaction,
            variables: {
                transactionId: transactionId,
            }
        });

        if (!data?.deleteTransaction){
            toast.error('The transaction could not be deleted.');
            return;
        }

        toast.success('The transaction was deleted.');
    }

    return (
        <>
            <div className="mb-3">
                <Link href={'/i/transactions'} className="text-sm flex items-center gap-2">
                    <BiChevronLeft />
                    All Transactions
                </Link>
            </div>
            {loading ? (
            <>
                <Loader size='lg' />
            </>
        ) : (
            <>
                {transaction === null ? (
                    <div>
                        <p>The transaction could not be found.</p>
                    </div>
                ) : (    
                    <div>
                        <div className="flex items-center gap-2">
                            <div>
                                <h1 className='text-xl font-medium'>Transaction</h1>
                                <p className="text-xs font-medium text-slate-600">{transaction.transaction_id}</p>
                            </div>
                            <div className="ml-auto">
                                {editing ? (
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-2 text-white bg-green-500
                                            transition-colors hover:bg-green-600 rounded-lg outline-none text-sm
                                            px-3 py-1" onClick={saveEdits}>
                                            <BiSave />
                                            Save
                                        </button>
                                        <button className="flex items-center gap-2 text-white bg-red-500
                                            transition-colors hover:bg-red-600 rounded-lg outline-none text-sm
                                            px-3 py-1" onClick={cancelEdits}>
                                            <BiX />
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-2 text-white bg-blue-500
                                            transition-colors hover:bg-blue-600 rounded-lg outline-none text-sm
                                            px-3 py-1" onClick={enableEditing}>
                                            <BiPencil />
                                            Edit
                                        </button>
                                        <button className="flex items-center gap-2 text-white bg-red-500
                                            transition-colors hover:bg-red-600 rounded-lg outline-none text-sm
                                            px-3 py-1" onClick={_deleteTransaction}>
                                            <BiTrash />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-12 md:col-span-6 text-sm my-2 grid grid-cols-12 gap-2">
                                <div className="col-span-12 md:col-span-6 lg:col-span-4 flex items-center gap-2">
                                    <Image src='/img/user.png' width={30} height={30} alt=''
                                        className="object-cover rounded-full" />
                                    <p className="text-sm">{transaction.created_by.name}</p>
                                </div>
                                <div className="col-span-12">
                                    <p className="font-medium">Created</p>
                                    <p>{transactionDate}</p>
                                </div>
                                <div className="col-span-12">
                                    <p className="font-medium">Type</p>
                                    {editing ? (
                                        <select className="outline-none rounded-lg border border-300 text-sm px-2 py-1" value={options.transferType}
                                            onChange={updateTransferType}>
                                            <option value='transfer'>Transfer</option>
                                            <option value='remove'>Remove</option>
                                            <option value='pull'>Pull</option>
                                            <option value='return'>Return</option>
                                        </select>
                                    ) : (
                                        <p>{transaction.transfer_type}</p>
                                    )}
                                </div>

                                <div className="col-span-12">
                                    {editing ? (
                                        <LocationSearch
                                            displayOptions={{
                                                title: 'From',
                                                name: 'from'
                                            }}
                                            fn={{
                                                onChange: onFieldChange,
                                                clear: () => {
                                                    clear('from')
                                                }
                                            }}
                                            defaultValue={{
                                                name: transaction.from_location.name,
                                                value: transaction.from_location.location_id
                                            }} />
                                    ) : (
                                        <>
                                            <p className="font-medium">From</p>
                                            <p>{transaction.from_location.name}</p>
                                        </>
                                    )}
                                </div>

                                <div className="col-span-12">
                                    {editing ? (
                                        <LocationSearch
                                            displayOptions={{
                                                title: 'To',
                                                name: 'to',
                                            }}
                                            defaultValue={{
                                                name: options.to.name,
                                                value: options.to.value
                                            }}
                                            fn={{
                                                onChange: onFieldChange,
                                                clear: () => {
                                                    clear('to')
                                                }
                                            }} />
                                    ) : (
                                        <>
                                            <p className="font-medium">To</p>
                                            <p>{transaction.to_location.name}</p>
                                        </>
                                    )}
                                </div>

                                <div className="col-span-12">
                                    {editing ? (
                                        <>
                                            {/*<ItemSearch
                                            displayOptions={{
                                                title: 'Item',
                                                name: 'item',
                                            }}
                                            defaultValue={{
                                                name: transaction.item.name,
                                                value: transaction.item.item_id,
                                            }}
                                            fn={{
                                                onChange: onFieldChange,
                                                clear: () => {
                                                    clear('item')
                                                }
                                            }} />*/}
                                            <p className="font-medium">Item</p>
                                            <p>{transaction.item.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-medium">Item</p>
                                            <p>{transaction.item.name}</p>
                                        </>
                                    )}
                                </div>

                                <div className="col-span-12">
                                    <p className="font-medium">Qty</p>
                                    {editing ? (
                                        <input type='number' className="outline-none px-2 py-1 rounded-lg border
                                            border-slate-300" value={options.qty} onChange={updateQty} />
                                    ) : (
                                        <p>{transaction.qty}</p>
                                    )}
                                </div>

                                <div className="col-span-12">
                                    <p className="font-medium">Sales Order</p>
                                    <div className={soLinkVisibility}>
                                        <LinkToSalesOrder
                                            onSalesOrderChange={onSalesOrderChange}
                                            onShippingChange={onShippingChange}
                                            canShip={false} />
                                    </div>
                                    {!editing && (
                                        <p>{transaction.salesorder_number ?? <span className="text-slate-600">No sales order added</span>}</p>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <TransactionUpdates
                                    transactionId={transaction.transaction_id}
                                    updates={transaction.updates} />
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
        }
        </>
    )
}


