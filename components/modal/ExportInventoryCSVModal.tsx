import { useState } from "react"
import { BiCloudDownload } from "react-icons/bi";
import Modal from "./Modal";
import { BetweenDate, ExportOptions, LocationItem } from "@/types/dbTypes";
import { InventoryInput } from "@/types/paginationTypes";
import LocationSearch from "../form/LocationSearch";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { ExportResponse } from "@/types/responses";
import { toast } from "react-toastify";


export default function ExportInventoryCSVModal({ exportType, onShowModal }: {
    exportType: string;
    onShowModal: () => DropDownSearchOption;
}) {
    const [exportOptions, setExportOptions] = useState<DropDownSearchOption>({
        name: '',
        value: ''
    });

    const [showing, setShowing] = useState<boolean>(false);
    const showModal = (): void => {
        if (typeof onShowModal !== 'undefined'){
            setExportOptions(onShowModal());
        }
        setShowing(true);
    }

    const hideModal = (): void => {
        setShowing(false);
    }

    const fetchExportInventory = async (): Promise<ExportResponse> => {
        const data = await fetch('/api/export?type=inventory', {
            method: 'POST',
            body: JSON.stringify(exportOptions),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await data.json();
        if (json?.error){
            toast.error('Error: ' + json.error + '. Please try again later.');
            return {
                fileName: 'download.csv',
                content: '',
            };
        }

        return json;
    }


    const download = async (): Promise<void> => {
        const a = document.createElement('a');
        
        const data = await fetchExportInventory();

        if (!data){
            console.error('Error: data is empty');
            return;
        }

        const blob = new Blob([data.content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        a.download=data.fileName;
        a.href = url;

        a.click();

        URL.revokeObjectURL(url);
    }

    const updateInventoryLocation = (e: DropDownSearchOption): void => {
        setExportOptions({
            name: e.name,
            value: e.value
        });
    }

    const clearInventoryLocation = () => {
        setExportOptions({
            name: '',
            value: ''
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
                            <LocationSearch
                                displayOptions={{
                                    title: 'Location',
                                    name: 'locationId'
                                }}
                                defaultValue={exportOptions}
                                updatesDefault={true}
                                fn={{
                                    onChange: updateInventoryLocation,
                                    clear: clearInventoryLocation
                                }} />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            
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