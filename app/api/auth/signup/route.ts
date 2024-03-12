import { hashBcrypt } from "@/lib/bcrypt";
import { parseRequestBody } from "@/lib/common";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const handler = async(req: NextRequest) => {
    try {
        const data = await parseRequestBody(req.body);
        const { name, username, email, password, confirmPassword, terms, csrfToken } = data;

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
                id: randomUUID(),
                name: name,
                email: email,
                username: username,
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