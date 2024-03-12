'use client';

import React, { useMemo } from 'react';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useSession } from "next-auth/react";

const httpLink = new HttpLink({
    uri: '/api/graphql'
});

export const ApolloProviderWrapper = ({ children}: {
    children: React.ReactNode
}) => {

    const { data: session, status } = useSession();
    console.log(session);

    const client = useMemo((): ApolloClient<object> => {
        const authMiddleware = setContext(async (operation, { headers }) => {
            console.log(status);
            const token = '';

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
    }, [status]);

    return <ApolloProvider client={client}>{children}</ApolloProvider>
}