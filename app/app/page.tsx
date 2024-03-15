'use client';

import HomeCard from "@/components/HomeCard";
import { useIsAdmin } from "@/components/providers/IsAdminProvider";
import useOrganization from "@/components/providers/useOrganization";
import Image from "next/image";
import Link from "next/link";
import { AiFillMinusCircle } from "react-icons/ai";
import { BiRightArrow, BiRightArrowAlt, BiTransfer } from "react-icons/bi";
import { IoIosList } from "react-icons/io";
import { IoReturnUpBack } from "react-icons/io5";
import { LuMoveUpRight } from "react-icons/lu";
import { MdAdminPanelSettings, MdOutlineInventory } from "react-icons/md";

export default function Home() {

  const { organizationId, count } = useOrganization();
  const isAdmin = useIsAdmin();

  return (
    <div className="grid grid-cols-12 gap-4 pt-8 md:pt-0">
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/app/transfer' className="p-4 block">
          <div>
            <BiTransfer className="mx-auto text-xl text-gray-700 my-2" />
            <p>Transfer to Trunk Inventory</p>
            <p className="text-xs font-medium my-2 flex items-center gap-2 mx-auto justify-center">Parts Room <BiRightArrowAlt className="text-lg" /> Van</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/app/remove' className="p-4 block">
          <div>
            <AiFillMinusCircle className="mx-auto text-xl text-gray-700 my-2" />
            <p>Remove from Trunk Inventory</p>

            <p className="text-xs font-medium my-2 flex items-center gap-2 mx-auto justify-center">Van <BiRightArrowAlt className="text-lg" /> Parts room or customer location</p>          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/app/pull' className="p-4 block">
          <div>
            <LuMoveUpRight className="mx-auto text-xl text-gray-700 my-2" />
            <p>Pull Item for Project</p>

            <p className="text-xs font-medium my-2 flex items-center gap-2 mx-auto justify-center">Parts Room <BiRightArrowAlt className="text-lg" /> Customer location</p>          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/app/app/return' className="p-4 block">
          <div>
            <IoReturnUpBack className="mx-auto text-xl text-gray-700 my-2" />
            <p>Return Item from Project</p>
            <p className="text-xs font-medium my-2 flex items-center gap-2 mx-auto justify-center">Customer location <BiRightArrowAlt className="text-lg" /> Parts room</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/app/inventory' className="p-4 block">
          <div>
            <MdOutlineInventory className="mx-auto text-xl text-gray-700 my-2" />
            <p>View Trunk Inventory</p>
          </div>
        </Link>
      </HomeCard>
      {isAdmin && (
        <>
          <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
            <Link href='/app/transactions' className="p-4 block">
              <div>
                <IoIosList className="mx-auto text-xl text-gray-700 my-2" />
                View Transactions
              </div>
            </Link>
          </HomeCard>
          <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
            <Link href='/app/admin' className="p-4 block">
              <div>
                <MdAdminPanelSettings className="mx-auto text-xl text-gray-700 my-2" />
                Admin
              </div>
            </Link>
          </HomeCard>
        </>
      )}
    </div>
  )
}
