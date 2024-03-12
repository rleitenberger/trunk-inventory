import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { IconType } from 'react-icons';
import { AiFillMinusCircle } from 'react-icons/ai';
import { BiHome, BiTransfer, BiUser } from 'react-icons/bi';
import { IoIosList } from 'react-icons/io';
import { IoReturnUpBack } from 'react-icons/io5';
import { LuMoveUpRight } from 'react-icons/lu';
import { MdOutlineInventory } from 'react-icons/md';
import MenuItem from './MenuItem';

export default function Nav({ isExpanded, children }: {
    isExpanded: boolean
    children: React.ReactNode
}) {

    const textAnimation = useMemo<string>(() => {
        return isExpanded ? 'show-text' : 'hide-text';
    }, [isExpanded]);

    return (
        <div className='bg-primary relative hidden md:block'>
            <div className='grid grid-cols-1 gap-2 py-4 px-2'>
                <Image src="/logo.webp" width="50" height="50" alt="logo" />
                <MenuItem href='/app/' Icon={BiHome} text='Home' textClass={textAnimation} />
                <MenuItem href='/app/transfer' Icon={BiTransfer} text='Transfer' textClass={textAnimation} />
                <MenuItem href='/app/remove' Icon={AiFillMinusCircle} text='Remove Item' textClass={textAnimation} />
                <MenuItem href='/app/pull' Icon={LuMoveUpRight} text='Pull Item' textClass={textAnimation} />
                <MenuItem href='/app/return' Icon={IoReturnUpBack} text='Return Item' textClass={textAnimation} />
                <MenuItem href='/app/inventory' Icon={MdOutlineInventory} text='Inventory' textClass={textAnimation} />
                <MenuItem href='/app/transactions' Icon={IoIosList} text='Transactions' textClass={textAnimation} />
            </div>
            {children}
        </div>
    )
}