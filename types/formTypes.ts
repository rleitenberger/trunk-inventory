import React from "react"
import { Condition } from "./dbTypes"
import { ZCustomer } from "./zohoTypes"

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
    onSave?: (response: T|null) => void,
}

export interface TypedModalArgs<T> {
    fn: ModalFnArgs<T>
    showing:boolean
    children: React.ReactNode
    obj: T|null
}

export type TransferType = 'transfer'|'remove'|'pull'|'return';

export interface FieldEntry {
    field_name: string;
    field_type: string;
    title?: string;
    conditions?:Condition[];
}

export interface FieldEntryValue {
    field_name: string;
    value: string;
}

export type SalesOrderLinkKey = 'orgId'|'customer'|'salesOrder';

export type SalesOrderLinkOptions = {
    [key in SalesOrderLinkKey]: string|ZCustomer|null;
}

export interface SalesOrderInput {
    salesorder_id: string|null;
    salesorder_number: string|null;
    organizationId: string;
}