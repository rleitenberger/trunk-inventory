import { PageInfo } from "./paginationTypes"

export interface DropDownSearchOption {
    name: string
    value: any
    id?: string
}

export type PaginatedDropDownSearchOptions = {
    nodes: DropDownSearchOption[]
    pageInfo: PageInfo
}