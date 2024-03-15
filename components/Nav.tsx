import { BiChevronRight, BiHome, BiLogOut, BiMenu, BiTransfer } from "react-icons/bi"
import MenuItem from "@/components/MenuItem"
import { getOrganizations } from "@/graphql/queries"
import { Organization } from "@/types/dbTypes"
import { useMemo, useState } from "react"
import Image from "next/image"
import { AiFillMinusCircle } from "react-icons/ai"
import { LuMoveUpRight } from "react-icons/lu"
import { IoReturnUpBack } from "react-icons/io5"
import { MdAdminPanelSettings, MdOutlineInventory } from "react-icons/md"
import { IoIosList } from "react-icons/io"
import useOrganization from "./providers/useOrganization"
import { useIsAdmin } from "./providers/IsAdminProvider"

interface NavInfo {
    navClass: string
    chevronClass: string
}

export default function Nav({ children, update, organizations }: {
    children: React.ReactNode;
    update: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    organizations: Organization[];
}) {
    const [navExpanded, setNavExpanded] = useState(false);
    const navInfo = useMemo<NavInfo>(() => {
        return navExpanded ? {
            navClass: 'grid-cols-1 md:grid-cols-main-ex',
            chevronClass: 'rotate-180',
        }  : {
            navClass: 'grid-cols-1 md:grid-cols-main',
            chevronClass: 'rotate-0',
        };
    }, [navExpanded]);

    const textAnimation = useMemo<string>(() => {
        return navExpanded ? 'show-text' : 'hide-text';
    }, [navExpanded]);
    
    const { organizationId, count } = useOrganization();

    const isAdmin = useIsAdmin();

    return (
        <div className={`h-screen grid overflow-hidden ${navInfo.navClass} transition-all duration-200 relative`}>
            <div className='bg-primary relative hidden md:block'>
                <div className='grid grid-cols-1 gap-2 py-4 px-2'>
                    <Image src="/logo.webp" width="50" height="50" alt="logo" className='mx-auto' />
                    <MenuItem href='/app/' Icon={BiHome} text='Home' textClass={textAnimation} />
                    <MenuItem href='/app/transfer' Icon={BiTransfer} text='Transfer' textClass={textAnimation} />
                    <MenuItem href='/app/remove' Icon={AiFillMinusCircle} text='Remove Item' textClass={textAnimation} />
                    <MenuItem href='/app/pull' Icon={LuMoveUpRight} text='Pull Item' textClass={textAnimation} />
                    <MenuItem href='/app/return' Icon={IoReturnUpBack} text='Return Item' textClass={textAnimation} />
                    <MenuItem href='/app/inventory' Icon={MdOutlineInventory} text='Inventory' textClass={textAnimation} />
                    {isAdmin && (
                        <>
                            <MenuItem href='/app/transactions' Icon={IoIosList} text='Transactions' textClass={textAnimation} />
                            <MenuItem href='/app/admin' Icon={MdAdminPanelSettings} text='Admin' textClass={textAnimation} />
                        </>
                    )}
                    <MenuItem href='/logout' Icon={BiLogOut} text='Logout' textClass={textAnimation} />
                </div>
                <div className='absolute bottom-0 left-0 py-3 px-5'>
                    <button onClick={()=>{setNavExpanded(!navExpanded)}} className="w-full nav-icon" title={navExpanded ? 'Shrink' : 'Expand'}>
                        <BiChevronRight className={`text-3xl text-main-bg transition-all ml-auto duration-300 mx-auto ${navInfo.chevronClass}`} />
                    </button>
                </div>
            </div>

            {!navExpanded && (
                <div className="fixed top-0 left-0 right-0 h-[50px] bg-[#ececec] flex md:hidden shadow-md
                    items-center px-4">
                    {!!organizations?.length && (
                        <select className="px-2 py-1 border border-slate-300 rounded-lg outline-none text-[16px] md:text-sm" value={organizationId} onChange={update}>
                            {organizations?.map((e: Organization) => {
                                return (
                                    <option key={`org-${e.organization_id}`}>{e.name}</option>
                                )
                            })}
                        </select>
                    )}
                    <button className=" ml-auto" onClick={()=>{setNavExpanded(true)}}>
                        <BiMenu className="text-4xl" />
                    </button>
                </div>
            )}
            <div className={`${navExpanded ? 'w-full' : 'w-[0px]'} md:hidden absolute right-0 top-0 bottom-0 transition-all
                bg-primary z-50 overflow-y-hidden`}>
                    <div className="relative p-2">
                        {navExpanded && (
                            <div className="absolute top-0 right-0 p-2">
                                <button className="text-4xl text-white p-2" onClick={()=>{setNavExpanded(false)}}>
                                    <BiChevronRight />
                                </button>
                            </div>
                        )}
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
                    {isAdmin && (
                        <>
                            <MenuItem href='/app/transactions' Icon={IoIosList} text='Transactions' />
                            <MenuItem href='/app/admin' Icon={MdAdminPanelSettings} text='Admin' />
                        </>
                    )}
                    <MenuItem href='/logout' Icon={BiLogOut} text='Logout' />
                </div>
            </div>

            <div className="overflow-y-auto px-6 py-[68px] md:py-6">
                {children}
            </div>
        </div>
    )
}