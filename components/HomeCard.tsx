import React from "react";

export default function HomeCard({ children, className }: { 
    children: React.ReactNode
    className: string
}) {
    return (
        <div className={`${className} border border-slate-300 rounded-lg
            text-sm transition-all duration-150 text-center hover:shadow-md`}>
            {children}
        </div>
    )
}