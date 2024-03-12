'use client';

import Nav from "@/components/Nav";
import NavMobile from "@/components/NavMobile";;
import { useMemo, useState } from "react";
import { BiChevronRight } from "react-icons/bi";

interface NavInfo {
    navClass: string
    chevronClass: string
}

export default function Template({ children }: { children: React.ReactNode}) {

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

    const updateMenuSize = (): void => {
        setNavExpanded(!navExpanded)
    }

    return (
        <div className={`h-screen grid overflow-hidden ${navInfo.navClass} transition-all duration-200 relative`}>
            <NavMobile isExpanded={navExpanded} setter={setNavExpanded}>
                <div className='absolute bottom-0 left-0 py-3 px-5'>
                    <button onClick={updateMenuSize} className="w-full nav-icon" title={navExpanded ? 'Shrink' : 'Expand'}>
                        <BiChevronRight className={`text-3xl text-main-bg transition-all ml-auto duration-300 mx-auto ${navInfo.chevronClass}`} />
                    </button>
                </div>
            </NavMobile>
            <Nav isExpanded={navExpanded}>
                <div className='absolute bottom-0 left-0 py-3 px-5'>
                    <button onClick={updateMenuSize} className="w-full nav-icon" title={navExpanded ? 'Shrink' : 'Expand'}>
                        <BiChevronRight className={`text-3xl text-main-bg transition-all ml-auto duration-300 mx-auto ${navInfo.chevronClass}`} />
                    </button>
                </div>
            </Nav>
            <div className="overflow-y-auto p-6">
                {children}
            </div>
        </div>
        
    )
}