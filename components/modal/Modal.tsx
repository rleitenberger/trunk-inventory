import React from "react"
import { BiX } from "react-icons/bi"

export default function Modal({ showing, hide, children, title }: {
    showing: boolean
    hide: () => void
    children: React.ReactNode
    title:string
}) {
    return (
        <div className={`top-0 left-0 bottom-0 right-0 bg-black/20 ${showing ? 'block' : 'hidden'}`}>
            <div className="rounded-lg bg-main-bg">
                <div className="flex items-center">
                    <p>{title}</p>
                    <BiX className="text-lg ml-auto" />
                </div>
                {children}
            </div>
        </div>
    )
}