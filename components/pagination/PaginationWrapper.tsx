import React from "react";

export default function PaginationWrapper({ children }: {
    children: React.ReactNode
}) {
    return (
        <div>
            {children}
        </div>
    )
}