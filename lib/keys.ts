import { ApiKey, ZohoInventoryApiKeys } from "@/types/dbTypes";
import crypto from 'crypto';
import prisma from "@/lib/prisma";

export const addKeys = async (keys: ZohoInventoryApiKeys) => {
    const { iv } = await prisma.zoho_inventory_keys.findFirst({
        where: {
            organization_id: { equals: keys.organization_id }
        }
    }) as { iv?: string| null };

    if (!iv) {
        return false;
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

    return true;
}

export const loadKeys = async (organizationId: string) : Promise<ZohoInventoryApiKeys|null> => {
    const keys = await prisma.zoho_inventory_keys.findFirst({
        where: {
            organization_id: {
                equals: organizationId
            }
        }
    });

    if (!keys?.iv){
        return keys;
    }

    return {
        ...keys,
        client_id: decrypt(keys.client_id || '', keys.iv),
        client_secret: decrypt(keys.client_secret || '', keys.iv)
    }
}


export const encrypt = (text: string, iv: Buffer) => {
    const algorithm = 'aes-256-cbc'
    const password = 'mca2qw3-fr4rqewagrrwww0-aef.fah675w3sw2=1423574sd';
    const salt = '0nc823czmr9q';
    const key = crypto.scryptSync(password, salt, 32);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv,
        key: encrypted
    }
}

export const decrypt = (text?: string|null, iv?: string|null) => {
    if (!text || !iv){
        return;
    }

    const algorithm = 'aes-256-cbc'
    const password = 'mca2qw3-fr4rqewagrrwww0-aef.fah675w3sw2=1423574sd';
    const salt = '0nc823czmr9q';
    const key = crypto.scryptSync(password, salt, 32);

    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}