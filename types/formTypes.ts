import React from "react"

export interface EditableTextArgs {
    label: string
    val: string
    fn: InputFunctionGroup
}

export interface InputFunctionGroup {
    onSave: (value: string) => Promise<boolean>
}

export type ModalFnArgs<T> = {
    hide: () => void
    onSave?: (response: T|null) => void
}

export interface TypedModalArgs<T> {
    fn: ModalFnArgs<T>
    showing:boolean
    children: React.ReactNode
    obj: T|null
}

export type TransferType = 'transfer'|'remove'|'pull'|'return';