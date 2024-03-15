import { ApiKey, ZohoInventoryApiKeys } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { addKeys, decrypt } from "./keys";
import prisma from "@/lib/prisma";

const REDIRECT = 'http://localhost:3000/zoho'

export const verifyZohoAuth = async (organizationId: string): Promise<ZohoAuthResponse> => {
    const keys = await prisma.zoho_inventory_keys.findFirst({
        where: {
            organization_id: {
                equals: organizationId
            }
        }
    });

    if (!keys?.client_id || !keys?.iv){
        return {
            verified: false,
            redirectUrl: '[showModal]',
            error: 'Missing client id'
        }
    }

    const refreshToken = keys?.refresh_token;
    if (!refreshToken){

        const scope = 'ZohoInventory.items.READ,ZohoInventory.settings.READ';

        const decryptedClientId = decrypt(keys.client_id, keys.iv);
        let redirectUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${decryptedClientId}&response_type=code&redirect_uri=${REDIRECT}&access_type=offline`;

        return {
            verified: false,
            redirectUrl: redirectUrl
        }
    }

    let reroll = false;

    if (keys.expiry){
        const now = new Date();
        const expiry = new Date(keys.expiry);
        if (now > expiry){
            reroll = true;
        }
    }

    let ret: ZohoAuthResponse = {
        verified: true,
        error: '',
        accessToken: keys.access_token === null ? undefined : decrypt(keys.access_token, keys.iv),
        redirectUrl: undefined
    }

    if (reroll){
        const rerollResult = await rerollAccessToken(keys);

        if (rerollResult.verified && rerollResult.accessToken){
            addKeys({
                organization_id: organizationId,
                access_token: rerollResult.accessToken,
                zoho_inventory_keys_id: keys.zoho_inventory_keys_id,
                iv: ''
            });

            ret.accessToken = rerollResult.accessToken;
            ret.verified = true;
        } else {
            ret.accessToken = undefined;
            ret.error = rerollResult.error || 'An error occured';
        }
    }

    return ret;
}

const rerollAccessToken = async(keys: ZohoInventoryApiKeys): Promise<ZohoAuthResponse> => {

    const clientId = decrypt(keys.client_id, keys.iv);
    const clientSecret = decrypt(keys.client_secret, keys.iv);
    const refresh = decrypt(keys.refresh_token, keys.iv);

    const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refresh}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&redirect_uri=http://localhost:3000/zoho`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const json = await res.json();
    if (json?.error){
        return {
            verified: false,
            redirectUrl: '[error]',
            error: json.error,
        }
    }


    return {
        verified:true,
        accessToken: json.access_token
    }

}