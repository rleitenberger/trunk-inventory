import { PageInfo } from "./paginationTypes"

export interface DropDownSearchOption {
    name: string
    value: any
}

export type PaginatedDropDownSearchOptions = {
    nodes: DropDownSearchOption[]
    pageInfo: PageInfo
}