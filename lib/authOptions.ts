import { Account, DefaultSession, ModifiedUser, NextAuthOptions, Profile, Session } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";
import { cookies } from "next/headers";
import { encode, decode } from 'next-auth/jwt'
import prisma from "@/lib/prisma";
import { compareBcrypt } from "@/lib/bcrypt";
import { randomUUID } from 'crypto';
import { ModifiedSession, RouteHandlerContext } from "@/types/authTypes";
import { AdapterUser } from "next-auth/adapters";
import { common } from "./common";

const generateSessionToken = () => {
    return randomUUID?.() ?? common.createUUID();
}
  
const fromDate = (time: number, date = Date.now()) => {
    return new Date(date + time * 1000)
}

export const authOptions: (context: RouteHandlerContext) => NextAuthOptions = (context: RouteHandlerContext) => {
    return {
        adapter: PrismaAdapter(prisma),
        providers: [
            CredentialsProvider({
            name: "Username & password",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { username: credentials?.username },
                        ]
                    },
                });
                
                if (!credentials?.password || !user?.password){
                    return null;
                }


                const compare = await compareBcrypt(credentials?.password, user?.password);
                if (!compare){
                    return null;
                }

                let sessionToken: string|null = null;

                if (user){
                    sessionToken = generateSessionToken();
                    const sessionExpiry = fromDate(30 * 24 * 60 * 60);
    
                    const s = await prisma.session.create({
                        data: {
                            id: randomUUID(),
                            sessionToken: sessionToken,
                            expires: sessionExpiry,
                            userId: user.id
                        }
                    });

                    /*

                    if (context.params.nextauth.includes('credentials') &&
                        context.params.nextauth.includes('callback')) {

                            const r = cookies().set('next-auth.session-token', sessionToken, {
                                expires: sessionExpiry,
                                secure: true,
                                httpOnly: true
                            });
                        }
                        */
    
                }

                const obj = {
                    name: user.name,
                    email: user.email,
                    id: user.id,
                    sessionToken: sessionToken,
                };
                
                return obj;
            }
            }),
        ],
        secret: process.env.NEXTAUTH_SECRET as string,
        session: {
            strategy: 'jwt'
        },
        jwt: {/*
            
            encode: async (params): Promise<string> => {

                if (context.params.nextauth.includes('callback') &&
                    context.params.nextauth.includes('credentials')) {
                    const cookie = cookies().get('next-auth.session-token');
                    if (cookie){
                        return cookie.value;
                    }
                    return '';
                }

                return await encode({
                    token: params.token,
                    secret: params.secret,
                    maxAge: params.maxAge
                });
            },
            decode: async (args: JWTDecodeParams): Promise<JWT|null> => {
                const {token, secret} = args;
                if (context.params.nextauth.includes('callback') &&
                    context.params.nextauth.includes('credentials')) {
                    return null;
                }
                
                return await decode({
                    token: token,
                    secret: secret
                });
            }*/
        },
        callbacks: {
            signIn: async ({ user, account, credentials }): Promise<boolean> => {
                if (context.params.nextauth.includes('callback') &&
                    context.params.nextauth.includes('credentials')) {

                    if (user) {
                        return true;
                    }
        
                    return false;
                }

                return true;
            },
            redirect: async({ url, baseUrl }): Promise<string> => {
                if (url.startsWith(baseUrl)) {
                    return url;
                } else if (url.startsWith('/')) {
                    return new URL(url, baseUrl).toString();
                }

                return baseUrl;
            },
            session: async({ session, token, user }: {
                session: Session;
                token: JWT;
                user: ModifiedUser
            }): Promise<Session|DefaultSession> => {
                if (token?.sessionToken && session?.user) {
                    session.user.id = token.id as string;
                    session.user.sessionToken = token.sessionToken as string;
                }

                if (user && session?.user) {
                    session.user.id = user.id;
                    session.user.sessionToken = user.sessionToken as string;
                }


                return { ...session };
            },
            jwt: async ({ token, user, account, profile }: {
                token: JWT;
                user: ModifiedUser;
                account: Account;
                profile: Profile;
            }): Promise<JWT> => {
                if (user){
                    token.id = user.id
                    token.sessionToken = user.sessionToken;
                }

                return { ...token, ...user };
            }
        },
        pages: {
            error: '/',
            signIn: '/login',
            signOut: '/logout'
        },

    } as NextAuthOptions
}