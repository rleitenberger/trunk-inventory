import NextAuth, { DefaultSession, NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { JWT, JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { randomUUID } from 'crypto'
import { cookies } from "next/headers";
import { encode, decode } from 'next-auth/jwt'
import { SignInOptions, signIn } from "next-auth/react";
import prisma from "@/lib/prisma";
import { compareBcrypt } from "@/lib/bcrypt";

const createUUID = () => {
    return ('10000000-1000-4000-8000-100000000000').replace(/[018]/g, (c: any) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

// Helper functions to generate unique keys and calculate the expiry dates for session cookies
const generateSessionToken = () => {
  return randomUUID?.() ?? createUUID();
}

const fromDate = (time: number, date = Date.now()) => {
  return new Date(date + time * 1000)
}


interface RouteHandlerContext {
    params: { nextauth: string[] }
}

const auth = async (req: NextRequest, context: RouteHandlerContext) => {
    return await NextAuth(req, context, {
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
                            { email: credentials?.username }
                        ]
                    }
                });
    
                if (!credentials?.password || !user?.password){
                    return null;
                }
    
                const compare = compareBcrypt(credentials?.password, user?.password);
                if (!compare){
                    return null;
                }
    
                return {
                    name: user.name,
                    email: user.email,
                    id: user.id
                };
              }
            }),
        ],
        secret: 'D!recTec',
        jwt: {
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
            decode: async ({ token, secret }: JWTDecodeParams): Promise<JWT|null> => {
                if (context.params.nextauth.includes('callback') &&
                    context.params.nextauth.includes('credentials')) {
                    return null;
                }
                
                return await decode({
                    token: token,
                    secret: secret
                });
            }
        },
        callbacks: {
            signIn: async ({ user, account, credentials }): Promise<boolean> => {
                if (context.params.nextauth.includes('callback') &&
                    context.params.nextauth.includes('credentials')) {

                    if (user){
                        const sessionToken = generateSessionToken();
                        const sessionExpiry = fromDate(30 * 24 * 60 * 60);
        
                        const s = await prisma.session.create({
                            data: {
                                id: randomUUID(),
                                sessionToken: sessionToken,
                                expires: sessionExpiry,
                                userId: user.id
                            }
                        });
        
                        const r = cookies().set('next-auth.session-token', sessionToken, {
                            expires: sessionExpiry,
                            secure: true,
                            httpOnly: true
                        });
        
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
            session: async({ session, token, user }): Promise<Session|DefaultSession> => {
                if (token){
                    session.id = token.id
                }
    
                return session;
            },
            jwt: async ({ token, user, account, profile }): Promise<JWT> => {
                if (user){
                    token.id = user.id
                }
    
                return token;
            }
        },
        pages: {
            error: '/',
            signIn: '/login',
            signOut: '/logout'
        },
    });
}

export { auth as GET, auth as POST };