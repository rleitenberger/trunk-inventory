import { useState } from "react"
import { BiCloudDownload } from "react-icons/bi";
import Modal from "./Modal";

export interface BetweenDate {
    from: Date;
    to: Date;
};
interface ExportOptions {
    between: BetweenDate;
    
};

export default function ExportCSVModal({ getData, exportType }: {
    getData: (exportOptions: ExportOptions)=> Promise<void>;
    exportType: string;
}) {
    const [exportOptions, setExportOptions] = useState<ExportOptions>({});

    const [showing, setShowing] = useState<boolean>(false);
    const showModal = (): void => {
        setShowing(true);
    }

    const hideModal = (): void => {
        setShowing(false);
    }

    const download = async (): Promise<void> => {
        const a = document.createElement('a');
        a.download=`${exportType}.csv`;
        
        const data = await getData(exportOptions);

        if (!data){
            console.error('Error: data is empty');
            return;
        }

        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.click();

        URL.revokeObjectURL(url);
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
                <div>

                </div>
            </Modal>
        </>
    )
}