/* eslint-disable */

import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag'
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolvers } from "@/graphql/resolvers";
import { conditionReasonFieldLoader, conditionTypesLoader, conditionsLoader, fieldEntriesLoader, itemLoader, locationLoader, reasonLoader, reasonsFieldsLoader, transactionFieldEntriesLoader, transactionLoader, transactionTypesLoader } from "@/graphql/loaders";

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
          transactionTypes: transactionTypesLoader,
          condition: conditionsLoader,
          conditionReasonField: conditionReasonFieldLoader,
          conditionType: conditionTypesLoader,
          transactionFieldEntries: transactionFieldEntriesLoader,
          fieldEntries: fieldEntriesLoader
      },
  }),
});

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };