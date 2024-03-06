import { DropDownSearchOption } from "./DropDownSearchOption"
import { PageInfo } from "./paginationTypes"

export interface DropDownFunctionGroup {
    onChange: (e: DropDownSearchOption, name: string) => void
    clear: () => void
    refetch: (search: string, pageInfo?: PageInfo) => Promise<any>
}

export interface DropDownValueFunctionGroup {
    onChange: (e: DropDownSearchOption, objectName:string, index?: number) => void
    clear: (objectName?: string) => void
}

export interface DropDownDisplayGroup {
    title?: string
    name: string
}

export interface DynamicFieldEntries {
    [key: string]: DropDownSearchOption
}