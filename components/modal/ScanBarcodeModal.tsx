import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { BrowserMultiFormatReader } from '@zxing/library';

const ScanBarcodeModal = () => {
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
                alert('found');
                alert(result);
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
            <button onClick={startShowing}>scan barcode</button>
        </>
    )
}

export default ScanBarcodeModal;