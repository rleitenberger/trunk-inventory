import { NextRequest } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions'
import { RouteHandlerContext } from "@/types/authTypes";

const handler = async(req: NextRequest, context: RouteHandlerContext) => {

    if (req.body?.locked){
        return Response.json({
            error: 'Stream is locked.',
            url: req.url,
            sent: false
        });
    }
    const session = await getServerSession(authOptions(context));
    return Response.json(session);
}   

export { handler as GET, handler as POST };