'use client';

import React, { useMemo } from 'react';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const ApolloProviderWrapper = ({ children, token }: {
    children: React.ReactNode;
    token: string;
}) => {
    
   
    const client = useMemo((): ApolloClient<object> => {
        const httpLink = new HttpLink({
            uri: '/api/graphql',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return new ApolloClient({
            link: httpLink,
            cache: new InMemoryCache()
        });
    }, [token]);

    return <ApolloProvider client={client}>{children}</ApolloProvider>
}