import Link from 'next/link';
import React, { useMemo } from 'react';
import { IconType } from 'react-icons';
import { AiFillMinusCircle } from 'react-icons/ai';
import { BiHome, BiTransfer, BiUser } from 'react-icons/bi';
import { IoIosList } from 'react-icons/io';
import { IoReturnUpBack } from 'react-icons/io5';
import { LuMoveUpRight } from 'react-icons/lu';
import { MdOutlineInventory } from 'react-icons/md';

export default function Nav({ isExpanded, children }: {
    isExpanded: boolean
    children: React.ReactNode
}) {

    const textAnimation = useMemo<string>(() => {
        return isExpanded ? 'show-text' : 'hide-text';
    }, [isExpanded]);

    return (
        <div className='bg-primary relative'>
            <div className='grid grid-cols-1 gap-2 py-4 px-2'>
                <MenuItem href='/' Icon={BiHome} text='Home' textClass={textAnimation} />
                <MenuItem href='/transfer' Icon={BiTransfer} text='Transfer' textClass={textAnimation} />
                <MenuItem href='/remove' Icon={AiFillMinusCircle} text='Remove Item' textClass={textAnimation} />
                <MenuItem href='/pull' Icon={LuMoveUpRight} text='Pull Item' textClass={textAnimation} />
                <MenuItem href='/return' Icon={IoReturnUpBack} text='Return Item' textClass={textAnimation} />
                <MenuItem href='/inventory' Icon={MdOutlineInventory} text='Inventory' textClass={textAnimation} />
                <MenuItem href='/transactions' Icon={IoIosList} text='Transactions' textClass={textAnimation} />
            </div>
            {children}
        </div>
    )
}

const MenuItem = ({ href, Icon, text, textClass }: {
    href: string
    Icon: IconType
    text: string
    textClass: string
}) => {
    return (
        <div className='rounded-lg transition-all duration-200 hover:bg-white/20'>
            <Link href={href} className='p-3 flex items-center gap-3 text-main-bg'>
                <div className='nav-icon' title={text}>
                    <Icon className='text-xl mx-auto' />
                </div>
                <p className={`${textClass} font-medium text-sm`}>{text}</p>
            </Link>
        </div>
    )
}