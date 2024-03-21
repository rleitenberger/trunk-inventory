import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { BrowserMultiFormatReader } from '@zxing/library';
import { IoBarcodeOutline } from "react-icons/io5";

const ScanBarcodeModal = ({ onScanned }: {
    onScanned?: (result: any) => Promise<void>;
}) => {
    const [showing, setShowing] = useState<boolean>(false);
    const canvas = useRef<HTMLCanvasElement>(null);

    const video = useRef<HTMLVideoElement>(null);
    const reader = useRef(new BrowserMultiFormatReader());

    const [scanning, setScanning] = useState<boolean>(false);
   
    useEffect(() => {
        if (!scanning){
            return;
        }

        if (!video.current){
            return;
        }

        reader.current.decodeFromConstraints({
            audio: false,
            video: {
                facingMode: 'environment',
            },
        }, video.current,
        (result, error) => {
            if (result){
                if (onScanned !== undefined){
                    onScanned(result);
                }
                setScanning(false);
                setShowing(false);
            }
        })

        return () => {
            reader.current.reset();
        }
    }, [video, scanning]);

    const startShowing = (): void => {
        setShowing(true);
        setScanning(true);
    }

    const stopShowing = (): void => {
        setScanning(false);
        setShowing(false);
    }


    return (
        <>
            <Modal showing={showing} title="Scan barcode" hide={stopShowing}>
                {scanning && (
                    <video ref={video} />
                )}
                <></>
            </Modal>
            <button onClick={startShowing} className="flex items-center px-2 py-1 
                rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors" title="Scan barcode">
                <IoBarcodeOutline className="text-xl" />
            </button>
        </>
    )
}

export default ScanBarcodeModal;