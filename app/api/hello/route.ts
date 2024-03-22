import { decode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const handler = async(req: NextRequest) => {
    const { organizationId, sessionToken } = await req.json();
    if (!organizationId || !sessionToken){
        return Response.json({
            error: 'Missing fields'
        });
    }

    const keys = await prisma.organization_users.findFirst({
        where: {
            AND: [
                { users: { session: { some: { sessionToken: { equals: sessionToken } } } } },
                { organization_id: { equals: organizationId } },
                { active: { equals: true } },
                { role: { in: ['admin', 'user', 'owner'] } }
            ]
        },
        select: {
            user_id: true,
            organizations: {
                select: {
                    zoho_inventory_keys: {
                        select: {
                            client_id: true,
                            client_secret: true,
                            refresh_token: true,
                            access_token: true,
                            expiry: true,
                            zoho_inventory_keys_id: true,
                        }
                    }
                }
            }
        }
    });

    return Response.json(keys);
}

export { handler as GET, handler as POST };