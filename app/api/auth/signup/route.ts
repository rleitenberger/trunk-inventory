export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { hashBcrypt } from "@/lib/bcrypt";
import { common } from "@/lib/common";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const handler = async(req: NextRequest) => {
    try {
        const data = await req.json();
        const { name, username, email, password, confirmPassword, terms, csrfToken, inviteId } = data;

        if (
            !((name && username && email && password && confirmPassword))
        ) {
            return Response.json({
                error: 'Missing fields'
            });
        }

        if (password !== confirmPassword) {
            return Response.json({
                error: 'Passwords do not match'
            });
        }

        const userExists = await prisma.user.findMany({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (userExists && Array.isArray(userExists)
            && userExists.length > 0) {
            return Response.json({
                error: 'An account with the submitted username or email already exists.'
            })        
        }

        const passwordHash = await hashBcrypt(password);

        const user = await prisma.user.create({
            data: {
                id: common.createUUID(),
                name: name,
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: passwordHash
            }
        });

        if (!user){
            return Response.json({
                error: 'Unable to create account. Please try again'
            });
        }

        const account = await prisma.account.create({
            data: {
                userId: user.id,
                type: 'credentials',
                provider: 'credentials',
                providerAccountId: user.id
            }
        });

        if (inviteId) {
            const invite = await prisma.user_invite_requests.findFirst({
                where: {
                    AND: [
                        { invite_id: { equals: inviteId } },
                        { active: { equals: true } }
                    ]
                }
            });

            if (invite?.invite_id){
                await prisma.$transaction([
                    prisma.organization_users.upsert({
                        create: {
                            organization_id: invite.organization_id,
                            user_id: user.id,
                            role: 'user'
                        },
                        update: {
                            active: true,
                            role: 'user',
                            modified: new Date(),
                        },
                        where: {
                            organization_id_user_id: {
                                organization_id: invite.organization_id,
                                user_id: user.id
                            }
                        }
                    }),
                    prisma.user_invite_requests.update({
                        data: {
                            active: false,
                        },
                        where: {
                            invite_id: invite.invite_id
                        }
                    })
                ]);
            }
        }

        if (user && account) {
            return Response.json({
                id: user.id,
                name: user.name,
                email: user.email
            });
        }

        return Response.json({
            error: 'Unable to link account to created user profile'
        });

    } catch (e) {

    }

    return Response.json({ error: 'impossible '});

}

export { handler as POST };