import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const POST = async(req: NextRequest) => {
    const body = await req.json();
    const { logId, status } = body;

    if (!logId || !status) {
        return Response.json({
            error: 'Missing fields'
        });
    }

    const pris = await prisma.item_sync_logs.update({
        where: {
            item_sync_log_id: logId
        },
        data: {
            status: status
        }
    });

    return Response.json({
        updated: pris.status === status
    });
}