'use client';

import { TransactionUpdate } from "@/types/dbTypes";
import { useEffect, useMemo } from "react";
import { ucFirst } from "@/lib/util";
import { TransactionUpdateLog, TransactionUpdateLogKey } from "@/types/queryTypes";

const TransactionUpdates = ({ transactionId, updates }: {
    transactionId: string;
    updates?: TransactionUpdate[];
}) => {

    useEffect(() => {
        if (updates?.length) {
            return;
        }

        const getUpdates = async(): Promise<void> => {
            //implementation
        }

        getUpdates();
    }, [updates]);

    const getBgColor = (updateType: string) => {
        switch (updateType) {
            case 'create':
                return 'bg-green-500';
            case 'delete':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    }

    return (
        <div className="grid grid-cols-12">
            <div className="col-span-12 font-medium text-lg mb-2">Logs</div>
            {updates?.map((e: TransactionUpdate, index: number) => {
                const bgClassname:string = index % 2 ? 'bg-gray-200' : 'bg-slate-300/20';

                const parsed = JSON.parse(e.changes);
                const date = new Date(parseInt(e.created, 10));
                const formatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                return (
                    <div key={e.transaction_update_id} className={`${bgClassname} col-span-12 text-sm p-2`}>
                        <div className="text-slate-700 font-medium mb-1 flex items-center gap-5">
                            <span>{e.user?.name}</span>
                            <span className="text-xs text-slate-500 font-semibold">{formatted}</span>
                            <span className={`text-xs py-[2px] px-2 rounded-md text-white ml-auto ${getBgColor(e.update_type)}`}>{ucFirst(e.update_type)}d</span>
                        </div>
                        <FormattedChanges transactionUpdateId={e.transaction_update_id} changes={parsed} />
                    </div>
                )                
            })}
        </div>
    )
}

const FormattedChanges = ({ transactionUpdateId, changes }: {
    transactionUpdateId: string;
    changes: TransactionUpdateLog;
}) => {
    const keys = useMemo<TransactionUpdateLogKey[]>((): TransactionUpdateLogKey[] => {
        return Object.keys(changes) as TransactionUpdateLogKey[];
    }, [changes]);

    return (
        <div className="grid grid-cols-12 gap-2">
            {keys?.map((e: TransactionUpdateLogKey, index: number) => {
                const objs: string[]|number[] = changes[e];

                return (
                    <div key={`${transactionUpdateId}-${e}`} className={`col-span-12 sm:col-span-6 md:col-span-4 md:pl-2
                        md:border-l-2 md:border-slate-300`}>
                        <span className="text-xs font-semibold">{ucFirst(e)}</span>
                        <div className={`flex items-center gap-1 flex-wrap`}>
                            <span className="text-slate-600">{objs[0]}</span>
                            {objs.length > 1 && (
                                <>
                                    <span>-{'>'}</span>
                                    <span className="font-medium">{objs[1]}</span>
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default TransactionUpdates;