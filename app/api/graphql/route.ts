/* eslint-disable */

import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag'
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolvers } from "@/graphql/resolvers";
import { itemLoader, locationLoader, reasonLoader, reasonsFieldsLoader, transactionLoader } from "@/graphql/loaders";

const typeDefs = `${readFileSync(`graphql/schema.graphqls`)}`;
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({
      req,
      res,
      loaders: {
          transaction: transactionLoader,
          reason: reasonLoader,
          location: locationLoader,
          item: itemLoader,
          reasonFields: reasonsFieldsLoader,
      },
  }),
});

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };