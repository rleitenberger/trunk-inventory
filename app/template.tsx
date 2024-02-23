'use client';

import Nav from "@/components/Nav";
import apolloClient from "@/lib/apollo";
import { ApolloProvider } from "@apollo/client";
import { useMemo, useState } from "react";
import { BiChevronRight } from "react-icons/bi";

interface NavInfo {
    navClass: string
    chevronClass: string
}

export default function Template({ children }: { children: React.ReactNode }) {

    const [navExpanded, setNavExpanded] = useState(false);
    const navInfo = useMemo<NavInfo>(() => {
        return navExpanded ? {
            navClass: 'grid-cols-main-ex',
            chevronClass: 'rotate-180',
        }  : {
            navClass: 'grid-cols-main',
            chevronClass: 'rotate-0',
        };
    }, [navExpanded]);

    const updateMenuSize = (): void => {
        setNavExpanded(!navExpanded)
    }

    return (
        <ApolloProvider client={apolloClient}>
            <div className={`h-screen grid overflow-hidden ${navInfo.navClass} transition-all duration-200`}>
                <Nav isExpanded={navExpanded}>
                    <div className='absolute bottom-0 left-0 py-3 px-5'>
                        <button onClick={updateMenuSize} className="w-full nav-icon">
                            <BiChevronRight className={`text-3xl text-main-bg transition-all ml-auto duration-300 mx-auto ${navInfo.chevronClass}`} />
                        </button>
                    </div>
                </Nav>
                <div className="overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </ApolloProvider>
    )
}