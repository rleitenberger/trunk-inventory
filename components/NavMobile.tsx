import { BiChevronRight, BiHome, BiMenu, BiTransfer } from "react-icons/bi";
import MenuItem from "./MenuItem";
import Image from "next/image";
import { IoIosList } from "react-icons/io";
import { MdOutlineInventory } from "react-icons/md";
import { IoReturnUpBack } from "react-icons/io5";
import { LuMoveUpRight } from "react-icons/lu";
import { AiFillMinusCircle } from "react-icons/ai";
import { Organization } from "@/types/dbTypes";

export default function NavMobile ({ isExpanded, setter, organizations }: {
    isExpanded: boolean;
    setter: (val: boolean) => void;
    organizations: Organization[];
}) {

    return (
        <>
            {!isExpanded && (
                <div className="fixed top-0 left-0 right-0 h-[50px] bg-[#ececec] flex md:hidden shadow-md
                    items-center px-4">
                    <select className="px-2 py-1 border border-slate-300 rounded-lg outline-none">
                        {organizations?.map((e: Organization) => {
                            return (
                                <option key={`org-${e.organization_id}`}>{e.name}</option>
                            )
                        })}
                    </select>
                    <button className=" ml-auto" onClick={()=>{
                        setter(true)
                    }}>
                        <BiMenu className="text-4xl" />
                    </button>
                </div>
            )}
            <div className={`${isExpanded ? 'w-full' : 'w-[0px]'} md:hidden absolute right-0 top-0 bottom-0 transition-all
                bg-primary z-50 overflow-y-hidden`}>
                    <div className="relative p-2">
                        {isExpanded && <div className="absolute top-0 right-0 p-2">
                            <button className="text-4xl text-white p-2" onClick={()=>{
                                setter(false)
                            }}>
                                <BiChevronRight />
                            </button>
                        </div>}
                    </div>
                <div className="p-4">
                    <Image src="/logo.webp" width="120" height="120" alt="logo" className="mx-auto" />
                </div>
                <div className="block md:hidden overflow-hidden">
                    <MenuItem href='/app/' Icon={BiHome} text='Home' />
                    <MenuItem href='/app/transfer' Icon={BiTransfer} text='Transfer' />
                    <MenuItem href='/app/remove' Icon={AiFillMinusCircle} text='Remove Item' />
                    <MenuItem href='/app/pull' Icon={LuMoveUpRight} text='Pull Item' />
                    <MenuItem href='/app/return' Icon={IoReturnUpBack} text='Return Item' />
                    <MenuItem href='/app/inventory' Icon={MdOutlineInventory} text='Inventory' />
                    <MenuItem href='/app/transactions' Icon={IoIosList} text='Transactions' />
                </div>
            </div>
        </>
    )
}