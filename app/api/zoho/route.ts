import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const handler = async (req: NextRequest) => {
    if (req.method === 'GET'){
        
    } else if (req.method === 'POST'){

    }
}

export { handler as GET, handler as POST };