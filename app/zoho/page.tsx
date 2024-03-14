'use client';

import Loader from "@/components/Loader";
import BoxTimer from "@/components/form/BoxTimer";
import useOrganization from "@/components/providers/useOrganization";
import { useRouter, useSearchParams } from "next/navigation";
import { GetServerSidePropsContext } from "next/types";
import { ParsedUrlQuery } from "querystring";
import React, { useEffect, useState } from "react";

export default function ZohoInventory () {
    const params= useSearchParams();
    const orgId = useOrganization();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

    useEffect(() => {
        const code = params.get('code');
        const location = params.get('location');
        const server = params.get('accounts-server');

        if (!code || !location || !server || !orgId){
            return;
        }

        const getTokens = async (): Promise<void> => {
            const res = await fetch('/api/zoho/inventory/auth', {
                method: 'POST',
                body: JSON.stringify({
                    code: code,
                    server: server,
                    location: location,
                    organizationId: orgId
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = await res.json();
            if (json?.error){
                setError(json.error);
            } else {
                setError('');
            }
            setIsLoading(false);


            if (json.updated){
                
            }
        }

        getTokens();

    }, []);

    const router = useRouter();

    const redirectUserBack = () => {
        router.push('/admin/items');
    }

    return isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
                <Loader size="lg" />
            </div>
        ) : (
            <div>
                {error && (
                    <div className="p-4 rounded-md bg-red-500/20 text-red-600 font-medium flex flex-col items-center justify-center text-sm">
                        Error: {error}
                        {error === 'invalid_code' && (
                            <div>The authorization code expired. Please try again.</div>
                        )}
                    </div>
                )}
                {isRedirecting && (
                    <BoxTimer delay={5} onDelayReached={redirectUserBack}
                        note="Your Zoho account has been authorized & linked. You will be automatically redirected" />
                )}
            </div>
        )
}