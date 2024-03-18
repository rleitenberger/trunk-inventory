import prisma from "@/lib/prisma";
import { verifyZohoAuth } from "@/lib/zoho";
import { Item } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const auth: ZohoAuthResponse = await verifyZohoAuth(searchParams.get('organizationId') || '');

    if (!auth.verified){
        return Response.json(auth);
    }

    const organizationId = searchParams.get('organizationId');

    if (!organizationId){
        return Response.json({
            error: 'Invalid organization ID'
        });
    }

    const zohoOrgId = searchParams.get('zohoOrganizationId');
    if (!zohoOrgId){
        return Response.json({
            error: 'Please select an organization'
        });
    }

    const syncId = await prisma.item_sync_logs.create({
        data: {
            item_sync_log_id: randomUUID(),
            organization_id: organizationId,
            status: 'downloading'
        }
    });

    const response = await fetch(process.env.NEXTAUTH_URL + `/api/zoho/inventory/sync?organizationId=${organizationId}&zohoOrganizationId=${zohoOrgId}&syncId=${syncId}`);
    
    return Response.json(response);
}

export { handler as GET };