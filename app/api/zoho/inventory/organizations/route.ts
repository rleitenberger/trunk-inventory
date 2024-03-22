export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { verifyZohoAuth } from "@/lib/zoho";
import { ZohoAuthResponse } from "@/types/responses";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    
    if (!searchParams.get('organizationId') || !searchParams.get('sessionToken')){
        return Response.json([]);
    }

    const auth: ZohoAuthResponse = await verifyZohoAuth(searchParams.get('organizationId') || '', searchParams.get('sessionToken'));

    if (!auth.verified){
        return Response.json(auth);
    }

    const url = `https://www.zohoapis.com/inventory/v1/organizations`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json',
            'Authorization': `Zoho-oauthtoken ${auth.accessToken}`
        }
    });

    const json = await res.json();

    return Response.json(json.organizations.map((e: any) => {
        return {
            name: e.name,
            organization_id: e.organization_id
        }
    }));
}

export { handler as GET };