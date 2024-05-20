import { ApiKey, ZohoClientKeys, ZohoInventoryApiKeys } from "@/types/dbTypes";
import { ZohoAuthResponse } from "@/types/responses";
import { addKeys, decrypt } from "./keys";
import prisma from "@/lib/prisma";

const REDIRECT =  process.env.NEXTAUTH_URL + '/zoho'

export const verifyZohoAuth = async (organizationId: string, sessionToken?: any): Promise<any> => {

    const res = await fetch(process.env.NEXTAUTH_URL + '/api/hello', {
        method: 'POST',
        body: JSON.stringify({
            organizationId: organizationId,
            sessionToken: sessionToken as string
        })
    });


    const json = await res.json();

    if (!json || json?.error){
        const response: ZohoAuthResponse = {
            verified: false,
            error: 'No keys found',
            redirectUrl: '[showModal]'
        }

        return Response.json(response);
    }

    const keys = json.organizations.zoho_inventory_keys[0];

    if (!keys?.client_id){// || !keys?.iv){
        return {
            verified: false,
            redirectUrl: '[showModal]',
            error: 'Missing client id'
        }
    }

    const refreshToken = keys?.refresh_token;
    if (!refreshToken){

        const scope = 'ZohoInventory.items.READ,ZohoInventory.settings.READ,ZohoInventory.compositeitems.READ,ZohoInventory.salesorders.ALL,ZohoBooks.salesorders.ALL,ZohoInventory.packages.ALL,ZohoBooks.contacts.READ,ZohoInventory.shipmentorders.ALL';

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

    const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refresh}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token&redirect_uri=${process.env.NEXTAUTH_URL}/zoho`;
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