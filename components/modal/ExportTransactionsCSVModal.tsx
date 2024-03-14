import { useEffect, useState } from "react"
import { BiCloudDownload, BiTransfer } from "react-icons/bi";
import Modal from "./Modal";
import { BetweenDate, ExportOptions, Transaction } from "@/types/dbTypes";
import { TransactionInput } from "@/types/paginationTypes";
import { ExportResponse } from "@/types/responses";
import LocationSearch from "../form/LocationSearch";
import ItemSearch from "../form/ItemSearch";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";


export default function ExportTransactionCSVModal({ exportType, onShowModal }: {
    exportType: string;
    onShowModal: () => TransactionInput;
}) {
    const [exportOptions, setExportOptions] = useState<TransactionInput>({
        organizationId: '',
        locationId: {
            name: '',
            value: ''
        },
        itemId: {
            name: '',
            value: ''
        },
        transferType: '--',
        between: {
            from: '',
            to: ''
        } as BetweenDate
    });

    const [showing, setShowing] = useState<boolean>(false);
    const showModal = (): void => {
        if (typeof onShowModal !== 'undefined'){
            setExportOptions(onShowModal());
        }
        setShowing(true);
    }

    const hideModal = (): void => {
        setExportOptions({
            organizationId: '',
            locationId: {
                name: '',
                value: ''
            },
            itemId: {
                name: '',
                value: ''
            },
            transferType: '--',
            between: {
                from: '',
                to: ''
            } as BetweenDate
        });
        setShowing(false);
    }

    const fetchExportTransactions = async (): Promise<ExportResponse|null> => {
        const data = await fetch('/api/export?type=transactions', {
            method: 'POST',
            body: JSON.stringify(exportOptions),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await data.json();
        if (json?.error){
            console.error('Error: ' + json.error);
            return  null;
        }

        return json;
    }

    const download = async (): Promise<void> => {
        const a = document.createElement('a');
        
        const data = await fetchExportTransactions();

        if (data === null){
            console.error('Error: data is empty');
            return;
        }

        const blob = new Blob([data.content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        a.download = data.fileName;
        a.href = url;

        a.click();

        URL.revokeObjectURL(url);
    }

    const changeField = (e: DropDownSearchOption, objectName: string) => {
        setExportOptions({
            ...exportOptions,
            [objectName]: e.value
        });
    }

    const clearField = (fieldName: string) => {
        setExportOptions({
            ...exportOptions,
            [fieldName]: {
                name: '',
                value: ''
            }
        });
    }

    const updateDate = (e: React.ChangeEvent<HTMLInputElement>, field: string): void => {
        setExportOptions({
            ...exportOptions,
            between: {
                ...exportOptions.between,
                [field]: e.target.value
            }
        });
    }

    const updateTransferType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { options, selectedIndex } = e.target;
        setExportOptions({
            ...exportOptions,
            transferType: options[selectedIndex].value
        });
    }

    
    return (
        <>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm bg-blue-500 transition-colors hover:bg-blue-600 text-white outline-none"
                onClick={showModal}>
                <BiCloudDownload />
                Export to CSV
            </button>
            <Modal title={`Export ${exportType} to CSV`}
                showing={showing} hide={hideModal}>
                <div className="grid grid-cols-12 gap-2 text-sm">
                    <div className="grid-cols-12 grid gap-2 col-span-12">
                        <div className="col-span-12">
                            <label>Between</label>
                        </div>
                        <div className="col-span-6">  
                            <label>From</label>
                            <div className="flex">
                                <input type="date" className="px-2 py-1 rounded-lg border border-slate-300 outline-none w-full bg-white flex-1"
                                    value={exportOptions.between.from} onChange={(e) => {
                                        updateDate(e, 'from')
                                    }}  />
                            </div>
                        </div>
                        <div className="col-span-6">
                            <label>To</label>
                            <div className="flex">
                                <input type="date" className="px-2 py-1 rounded-lg border border-slate-300 outline-none w-full bg-white flex-1"
                                    value={exportOptions.between.to} onChange={(e) => {
                                        updateDate(e, 'to')
                                    }}  />
                            </div>
                        </div>
                        <div className="col-span-12 grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                                <div>
                                    <LocationSearch
                                        displayOptions={{
                                            name: 'locationId',
                                            title: 'Location'
                                        }}
                                        defaultValue={exportOptions.locationId}
                                        fn={{
                                            onChange: changeField,
                                            clear: () => { clearField('itemId') }
                                        }} />
                                </div>
                            </div>
                            <div className="col-span-6">  
                                <div>
                                    <ItemSearch
                                    displayOptions={{
                                        name: 'itemId',
                                        title: 'Item'
                                    }}
                                    defaultValue={exportOptions.itemId}
                                    fn={{
                                        onChange: changeField,
                                        clear: () => { clearField('itemId') }
                                    }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                                <div className='flex items-center gap-2'>
                                    <BiTransfer />
                                    <label className='text-sm'>Transfer Type</label>
                                </div>
                                <div>
                                    <select value={exportOptions.transferType} className='px-2 py-1 text-sm
                                        outline-none rounded-lg border border-slate-300 w-full bg-white text-[16px] md:text-sm' onChange={updateTransferType}>
                                        <option value="--">All</option>
                                        <option value="transfer">Transfer</option>
                                        <option value="remove">Remove</option>
                                        <option value="pull">Pull</option>
                                        <option value="return">Return</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 flex">
                            <button className="ml-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 transition-colors outline-none rounded-lg text-white"
                                onClick={download}>Download Report</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}