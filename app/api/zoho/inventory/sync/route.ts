export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import prisma from "@/lib/prisma";
import { verifyZohoAuth } from "@/lib/zoho";
import { Item } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const syncId = searchParams.get('syncId');

    if (!syncId){
        return Response.json({
            error: 'Missing sync log ID'
        });
    }

    const log = await prisma.item_sync_logs.findFirst({
        where: { item_sync_log_id: { equals: syncId } }
    });

    return Response.json(log);
}

export { handler as GET };