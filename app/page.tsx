import HomeCard from "@/components/HomeCard";
import Image from "next/image";
import Link from "next/link";
import { AiFillMinusCircle } from "react-icons/ai";
import { BiTransfer } from "react-icons/bi";
import { IoIosList } from "react-icons/io";
import { IoReturnUpBack } from "react-icons/io5";
import { LuMoveUpRight } from "react-icons/lu";
import { MdOutlineInventory } from "react-icons/md";

export default function Home() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/transfer' className="p-4 block">
          <div>
            <BiTransfer className="mx-auto text-xl text-blue-800 my-2" />
            <p>Transfer to Trunk Inventory</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/remove' className="p-4 block">
          <div>
            <AiFillMinusCircle className="mx-auto text-xl text-red-600 my-2" />
            <p>Remove from Trunk Inventory</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/pull' className="p-4 block">
          <div>
            <LuMoveUpRight className="mx-auto text-xl text-blue-500 my-2" />
            <p>Pull Item for Project</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/return' className="p-4 block">
          <div>
            <IoReturnUpBack className="mx-auto text-xl text-red-900 my-2" />
            <p>Return Item from Project</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/inventory' className="p-4 block">
          <div>
            <MdOutlineInventory className="mx-auto text-xl text-amber-800 my-2" />
            <p>View Trunk Inventory</p>
          </div>
        </Link>
      </HomeCard>
      <HomeCard className="col-span-12 sm:col-span-6 md:col-span-4">
        <Link href='/transactions' className="p-4 block">
          <div>
            <IoIosList className="mx-auto text-xl text-blue-700 my-2" />
            View Transactions
          </div>
        </Link>
      </HomeCard>
    </div>
  )
}
