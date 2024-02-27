import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Loader from "../Loader"
import { PageInfo } from "@/types/paginationTypes"

export default function ScrollableWrapper({ children, maxHeight, className, onReachedScrollEnd=undefined,
    searchQuery, pageInfo }: {
    children: React.ReactNode
    maxHeight: number
    className?: string
    onReachedScrollEnd?: CallableFunction
    searchQuery?: string
    pageInfo?: PageInfo
}) {



    const heightClassName = useMemo(() => {
        return `max-h-[${maxHeight}px]`;
    }, [maxHeight]);




    return (
        <div className={`${heightClassName} ${className} overflow-y-auto`}>
        </div>
    )
}