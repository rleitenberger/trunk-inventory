import { ApiKey } from "@/types/dbTypes";
import { NextRequest } from "next/server";
import { addKeys, loadKeys } from "@/lib/keys";

interface ZohoAuthArgs {
    code: string;
    server: string;
    location: string;
    organizationId: string;
}

interface ZohoTokenResponse { 
    access_token: string;
    refresh_token: string;
    expires_in: number;
    type: string;
    error?: string;
}

const handler = async (req: NextRequest) => {
    const data: ZohoAuthArgs = await req.json();
    const { organizationId, code, server, location } = data;

    if (!organizationId){
        return Response.json({
            error: 'Organization id is missing'
        });
    }

    const keys = await loadKeys(organizationId);
    const url = `${server}/oauth/v2/token?code=${code}&client_id=${keys?.client_id}&client_secret=${keys?.client_secret}&redirect_uri=http://localhost:3000/zoho&grant_type=authorization_code`;
    const res = await fetch(url, {
        method: 'POST'
    });

    const json  = await res.json();
    if (json?.error){
        return Response.json(json);
    }

    const updated = await addKeys({
        organization_id: organizationId,
        zoho_inventory_keys_id: keys?.zoho_inventory_keys_id ?? '',
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        iv: ''
    });

    return Response.json({
        updated: updated
    });

}

export { handler as POST };