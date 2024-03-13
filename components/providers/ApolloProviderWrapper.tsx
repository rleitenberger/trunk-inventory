'use client';

import React, { useMemo } from 'react';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useSession } from "next-auth/react";
import { headers } from 'next/headers';

const httpLink = new HttpLink({
    uri: '/api/graphql'
});

export const ApolloProviderWrapper = ({ children, token }: {
    children: React.ReactNode;
    token: string;
}) => {

    const client = useMemo((): ApolloClient<object> => {
        const authMiddleware = setContext(async (operation, { headers }) => {

            return {
                headers: {
                    ...headers,
                    authorization: `Bearer ${token}`
                }
            }
        });

        return new ApolloClient({
            link: from([authMiddleware, httpLink]),
            cache: new InMemoryCache()
        });
    }, [token]);

    return <ApolloProvider client={client}>{children}</ApolloProvider>
}