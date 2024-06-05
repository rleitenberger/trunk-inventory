import prisma from "@/lib/prisma";
import { verifyZohoAuth } from "@/lib/zoho";
import { ZohoAuthResponse } from "@/types/responses";
import { ZCustomer, ZohoApiResponse } from "@/types/zohoTypes";
import { NextRequest } from "next/server";

export const GET = async(req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const orgId: string|null = searchParams.get('organizationId');
    const auth: ZohoAuthResponse = await verifyZohoAuth(orgId || '', searchParams.get('sessionToken'));

    if (!auth.verified || !auth.accessToken){
        return Response.json(auth);
    }

    const zohoOrgId: string|null = searchParams.get('organization_id');
    
    if (!orgId || !zohoOrgId) {
        return Response.json([]);
    }

    const query = searchParams.get('query');
    let GET_CUSTOMERS_URL = `https://www.zohoapis.com/books/v3/contacts?organization_id=${zohoOrgId}&contact_name_contains=${query}`;

    const accessToken= auth.accessToken ?? '';
    const result = await fetch(GET_CUSTOMERS_URL, { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
    });
    const json: ZohoApiResponse<ZCustomer> = await result.json();

    console.log(json)

    if (json.code !== 0){
        return Response.json({
            error: 'An error occured',
            content: json
        });
    }

    const contacts = json.contacts as ZCustomer[];

    return Response.json({
        data: contacts
    });
}