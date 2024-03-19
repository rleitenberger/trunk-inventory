import { DefaultSession } from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import NextAuth from "next-auth/next";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            sessionToken: string;
        } & DefaultSession['user']
    }

    interface HasToken {
        sessionToken?: string;
    }

    type ModifiedUser = AdapterUser & HasToken
}