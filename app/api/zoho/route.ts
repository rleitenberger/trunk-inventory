export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const handler = async (req: NextRequest) => {
    if (req.method === 'GET'){
        
    } else if (req.method === 'POST'){

    }
}

export { handler as GET, handler as POST };