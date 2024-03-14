/* eslint-disable */

import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { readFileSync } from "fs";
import { resolvers } from "@/graphql/resolvers";
import { conditionReasonFieldLoader, conditionTypesLoader, conditionsLoader, fieldEntriesLoader, itemLoader, locationLoader, reasonEmailsLoader, reasonLoader, reasonsFieldsLoader, transactionFieldEntriesLoader, transactionLoader, transactionTypesLoader } from "@/graphql/loaders";
import { NextRequest } from "next/server";

const typeDefs = `${readFileSync(`graphql/schema.graphqls`)}`;
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const validateSessionToken = async (authHeader: string|null): Promise<string|null> => {
    if (!authHeader){
        return null;
    }
    
    const [type, value] = authHeader?.split(' ') as [type: string, value: string];

    const user = await prisma.session.findFirst({
        where: {
            sessionToken: {
                equals: value
            }
        }
    });

    return user?.userId ?? null;
}

const handler = startServerAndCreateNextHandler(apolloServer, {
    context: async (req: NextRequest) => {
      const authHeader = req.headers.get('Authorization');
      const userId = await validateSessionToken(authHeader);

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
            reasonEmails: reasonEmailsLoader
        },
        userId: userId
      };
    },
  });
// Export the handler for GET and POST requests
export { handler as GET, handler as POST };