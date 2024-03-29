import { encrypt } from "@/lib/keys";
import prisma from "@/lib/prisma";
import { ZohoInventoryApiKeys } from "@/types/dbTypes";
import { NextRequest } from "next/server";

const handler = async(req: NextRequest) => {
    const body = await req.json();
    const { organizationId, keys } = body;

    const { iv } = await prisma.zoho_inventory_keys.findFirst({
        where: {
            organization_id: { equals: organizationId }
        }
    }) as { iv?: string| null };
    
    if (!iv) {
        return Response.json({
            error: 'No iv found'
        });
    }
    
    const buffer = Buffer.from(iv, 'hex');
    const encrypted = {
        access: keys.access_token ? encrypt(keys.access_token, buffer) : null,
        refresh: keys.refresh_token ? encrypt(keys.refresh_token, buffer) : null
    };
    
    const now = new Date();
    
    const updated = await prisma.zoho_inventory_keys.update({
        where: {
            zoho_inventory_keys_id: keys.zoho_inventory_keys_id
        },
        data: {
            access_token: encrypted.access?.key,
            ...(encrypted.refresh?.key && { refresh_token: encrypted.refresh?.key }),
            expiry: new Date(now.getTime() + 59 * 60000),
        },
    });
    
    return Response.json({
        updated: true
    });
}

export { handler as POST };