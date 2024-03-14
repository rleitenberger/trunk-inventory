import { PrismaClient } from "@prisma/client";
import { createContext, useMemo, useState } from "react";


export const PrismaContext = createContext<any>(null);

export default function PrismaProvider({ children }: {
    children: React.ReactNode
}) {
    const prismaClient = new PrismaClient();

    return (
        <PrismaContext.Provider value={prismaClient}>
            {children}
        </PrismaContext.Provider>
    )
}