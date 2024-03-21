import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { readFileSync } from "fs";
import { resolvers } from "@/graphql/resolvers";
import { conditionReasonFieldLoader, conditionTypesLoader, conditionsLoader, fieldEntriesLoader, itemLoader, locationLoader, reasonEmailsLoader, reasonLoader, reasonsFieldsLoader, transactionFieldEntriesLoader, transactionLoader, transactionTypesLoader, userLoader } from "@/graphql/loaders";
import { NextRequest } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import { decode, JWT } from 'next-auth/jwt'
import { typeDefs } from '@/graphql/schema';
import { hashBcrypt } from "@/lib/bcrypt";

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const validateSessionToken = async (authHeader: string|null): Promise<string> => {
    if (!authHeader) {
        throw new Error('No authorization header found.');
    }
    
    const [type, value] = authHeader?.split(' ') as [type: string, value: string];

    if (value === 'no-auth'){
        throw new Error('Invalid authorization.');
    }

    let token: JWT|null = null;
    const secret = process.env.NEXTAUTH_SECRET as string;

    if (!secret){
        throw new Error('Could not load JWT secret');
    }

    try {
        token = await decode({
            token: value,
            secret: secret
        })
    } catch (e) {
        throw new Error('Could not decode session token.');
    }

    let sessionToken = token?.sessionToken ?? '';
    const user = await prisma.session.findFirst({
        where: {
            sessionToken: {
                equals: sessionToken as string
            }
        },
        select: {
            userId: true
        }
    });

    if (!user){
        throw new Error('Invalid user ID');
    }

    return user.userId;
}


const handler = startServerAndCreateNextHandler(apolloServer, {
    context: async (req: NextRequest) => {
      const authHeader = req.headers.get('Authorization');
      let userId = '';

      try {
        userId = await validateSessionToken(authHeader);
      } catch (e) {
        userId = '';
      }

      return {
        req,
        loaders: {
            transaction: transactionLoader,
            reason: reasonLoader,
            location: locationLoader,
            item: itemLoader,
            reasonFields: reasonsFieldsLoader,
            transactionTypes: transactionTypesLoader,
            condition: conditionsLoader,
            conditionReasonField: conditionReasonFieldLoader,
            conditionType: conditionTypesLoader,
            transactionFieldEntries: transactionFieldEntriesLoader,
            fieldEntries: fieldEntriesLoader,
            reasonEmails: reasonEmailsLoader,
            user: userLoader
        },
        userId: userId,
      };
    },
  });
// Export the handler for GET and POST requests
export { handler as GET, handler as POST };