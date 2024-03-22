import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

export const POST = async ( req: NextRequest) => {
    const { organizationId, status } = await req.json();

    if (!organizationId || !status) {
        return Response.json({
            error: 'Missing fields'
        });
    }

    const log = await prisma.item_sync_logs.create({
        data: {
            item_sync_log_id: randomUUID(),
            organization_id: organizationId,
            status: status
        }
    });

    return Response.json(log);
}

export const GET = async(req:NextRequest) => {
    const { searchParams } = new URL(req.url);
    const logId = searchParams.get('logId')

    if (!logId){
        return Response.json({
            error: 'Missing fields'
        });
    }

    const log = await prisma.item_sync_logs.findFirst({
        where: {
            item_sync_log_id: { equals: logId }
        }
    });

    return Response.json({
        exists: log !== null
    });
}