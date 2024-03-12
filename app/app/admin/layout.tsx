'use server'

import { getServerSession } from "next-auth"

export default async function Layout({ children }: {
    children: React.ReactNode
}) {



    return (
        <div>
            {children}
        </div>
    )
}