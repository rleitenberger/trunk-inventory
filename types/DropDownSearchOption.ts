import { PageInfo } from "./paginationTypes"

export interface DropDownSearchOption {
    name: string
    value: string
}

export type PaginatedDropDownSearchOptions = {
    nodes: DropDownSearchOption[]
    pageInfo: PageInfo
}