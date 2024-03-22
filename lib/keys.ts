import { ApiKey, ZohoInventoryApiKeys } from "@/types/dbTypes";
import prisma from "@/lib/prisma";

export const addKeys = async (keys: ZohoInventoryApiKeys) => {
    console.log('\n\n\n\n\n\n',keys,'\n\n\n\n\n');
    const res = await fetch(process.env.NEXTAUTH_URL + '/api/hello/keys', {
        method: 'POST',
        body: JSON.stringify({
            organizationId: keys.organization_id,
            keys: keys
        })
    });

    const json = await res.json();
    return Response.json(json);
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
    return { key: text ?? '' };
    /*const algorithm = 'aes-256-cbc'
    const password = 'mca2qw3-fr4rqewagrrwww0-aef.fah675w3sw2=1423574sd';
    const salt = '0nc823czmr9q';
    const crypto = require('crypto');
    const key = crypto.scryptSync(password, salt, 32);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv,
        key: encrypted
    }*/
}

export const decrypt = (text?: string|null, iv?: string|null) => {
    return text ?? '';
    if (!text || !iv){
        return;
    }

    // const algorithm = 'aes-256-cbc'
    // const password = 'mca2qw3-fr4rqewagrrwww0-aef.fah675w3sw2=1423574sd';
    // const salt = '0nc823czmr9q';
    // const crypto = require('crypto');
    // const key = crypto.scryptSync(password, salt, 32);

    // const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    // let decrypted = decipher.update(text, 'hex', 'utf8');
    // decrypted += decipher.final('utf8');
    // return decrypted;
}