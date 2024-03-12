import { verifyZohoAuth } from "@/lib/zoho";
import { ZohoAuthResponse } from "@/types/responses";
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const auth: ZohoAuthResponse = await verifyZohoAuth(searchParams.get('organizationId') || '');

    if (!auth.verified){
        return Response.json(auth);
    }

    const zohoOrgId = searchParams.get('zohoOrganizationId');
    if (!zohoOrgId){
        return Response.json({
            error: 'Please select an organization'
        });
    }

    const allItems: any = [];
    let index = 1;

    const rate = {
        limit: 30,
        time: 60000
    }

    const intervalTime: number = rate.time / rate.limit + 200;
    let hasMore = true;

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    while (hasMore){
        if (!auth.accessToken || !zohoOrgId){
            break;
        }

        const res = await getItems(index, zohoOrgId, auth.accessToken);
        if (res?.error){
            break;   
        }

        const { items, page_context } = res;
        allItems.push(...items);
        hasMore = page_context.has_more_page || false;

        await delay(intervalTime);
        index++;
    }

    return Response.json(allItems);
}

const getItems = async(page: number, orgId: string, accessToken?: string): Promise<any> => {

    let url = `https://www.zohoapis.com/inventory/v1/items?organization_id=${orgId}&page=${page}`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accepts': 'application/json',
            'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
    });
    
    const json= await res.json();
    return {
        items: json?.items?.map((e: any) => {
            return {
                itemId: e.item_id,
                name: e.name,
                description: e.description
            }
        }) ?? [],
        page_context: json.page_context
    }
}

export { handler as GET };