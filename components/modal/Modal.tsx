import React from "react"
import { BiX } from "react-icons/bi"

export default function Modal({ showing, hide, children, title, isFlex=false }: {
    showing: boolean
    hide: () => void
    children: React.ReactNode
    title:string
    isFlex?: boolean
}) {
    return (
        <div className={`z-[9999] fixed top-0 left-0 bottom-0 right-0 bg-black/40 ${showing ? 'flex' : 'hidden'}
            items-center justify-center`}>
            <div className={`rounded-lg bg-main-bg shadow-md w-[90%] md:w-[600px] max-w-[600px] max-h-[600px] mx-auto
                p-4 md:min-w-[400px] min-h-[400px] overflow-auto ${isFlex ? 'flex flex-col' : 'block'}`}>
                <div className="flex items-center">
                    <p>{title}</p>
                    <button className="p-2 hover:bg-slate-300/40 ml-auto rounded-md transition-colors
                        duration-150" onClick={hide}>
                        <BiX className="text-lg ml-auto" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}