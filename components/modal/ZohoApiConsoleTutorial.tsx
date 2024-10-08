import { useState } from "react";
import Modal from "./Modal";
import { BiChevronLeft, BiChevronRight, BiLinkExternal } from "react-icons/bi";
import { AiFillQuestionCircle } from "react-icons/ai";
import Image from "next/image";

export default function ZohoApiConsoleTutorialModal () {

    const [showing, setShowing] = useState<boolean>(false);

    const showModal = (): void => {
        setShowing(true);
    }

    const hideModal = (): void => {
        setShowing(false);
    }

    const [tab, setTab] = useState<number>(1);
    const tabs = [1,2,3,4];

    const Tab = () => {
        switch (tab) {
            case 1:
                return (
                    <>
                        <div className="flex items-center gap-1 flex-wrap">
                            Navigate to the
                            <a href="https://api-console.zoho.com/" rel="noopener noreferrer" target="_blank"
                                className="flex items-center gap-2 underline font-medium text-blue-500">Zoho API Console <BiLinkExternal /></a>,
                            and click the 
                            <Image src="/img/tutorial/zoho/add-client.png" width={100} height={30} alt="add client" />
                            button
                        </div>
                        <div>
                            <Image src="/img/tutorial/zoho/add-client-location.png" width={400} height={200} alt="add client button location"
                                className="mx-auto my-2" />
                        </div>
                    </>
                )
            case 2:
                return (
                    <>
                        <div className="flex items-center gap-1 flex-wrap">
                            Scroll to &quot;<strong>Server-based Applications</strong>&quot; and click &quot;<strong>Create now</strong>&quot;
                        </div>
                        <div>
                            <Image src="/img/tutorial/zoho/server-based-app.png" width={400} height={200} alt="server based applications"
                                className="mx-auto my-2" />
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        <div className="flex items-center gap-1 flex-wrap">
                            Enter the following information in the
                            <Image src="/img/tutorial/zoho/client-details-btn.png" width={100} height={30} alt='client details button' />
                            tab
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                                <div className="mt-1">
                                    <strong>Client Name:</strong><br />Trunk Inventory
                                </div>
                                <div className="mt-1">
                                    <strong>Homepage URL</strong><br />https://inventory.directecllc.com
                                </div>
                                <div className="mt-1">
                                    <strong>Authorized Redirect URIs</strong><br />- https://inventory.directecllc.com<br />- https://inventory.directecllc.com/zoho
                                </div>
                            </div>
                            <div className="col-span-6">
                                <Image src="/img/tutorial/zoho/client-details-info.png" width={250} height={150} alt="client details info"
                                    className="mx-auto my-2" />
                            </div>
                        </div>
                    </>
                )
            case 4:
                return (
                    <>
                        <div className="flex items-center gap-1 flex-wrap">
                            Click on
                            <Image src='/img/tutorial/zoho/client-secret-btn.png' width={100} height={30} alt="client secret button" />
                            and to find your Client ID and Client Secret
                        </div>
                        <div>
                            <Image src="/img/tutorial/zoho/get-keys.png" width={400} height={200} alt="get keys location"
                                className="mx-auto my-2" />
                        </div>
                    </>
                )
        }
    }

    const prevTab = (): void => {
        if (tab === 1){
            return;
        }

        setTab((prev: number): number => {
            return prev - 1;
        });
    }

    const nextTab = (): void => {
        if (tab === tabs.length){
            return;
        }
        
        setTab((prev: number): number => {
            return prev + 1;
        });
    }

    return (
        <>
            <Modal title="How to Obtain Zoho Client Keys" showing={showing} hide={hideModal} isFlex={true}>
                <div className="flex-1 relative">
                    <Tab />
                    <div className="bottom-0 absolute w-full">
                        <div className="flex items-center gap-4 justify-center">
                            <button className="px-2 py-1 flex items-center gap-2 rounded-lg hover:bg-slate-300/40 transition-colors
                                disabled:bg-slate-300/40 disabled:text-slate-500 disabled:cursor-not-allowed"
                                disabled={tab === 1} onClick={prevTab}>
                                <BiChevronLeft /> Previous
                            </button>
                            <button className="px-2 py-1 flex items-center gap-2 rounded-lg hover:bg-slate-300/40 transition-colors
                                disabled:bg-slate-300/40 disabled:text-slate-500 disabled:cursor-not-allowed"
                                disabled={tab === tabs.length} onClick={nextTab}>
                                Next <BiChevronRight />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 justify-center mt-2">
                            {tabs?.map((e: number) => {
                                const bg = e === tab ? 'bg-slate-400' : 'bg-slate-300'
                                return (
                                    <div className={`rounded-full h-[10px] w-[10px] ${bg}`} key={`tab-${e}`}>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </Modal>

            <button className="p-2 transition-colors rounded-lg hover:bg-slate-300/40"
                onClick={showModal}>
                <AiFillQuestionCircle />
            </button>
        </>
    )
}