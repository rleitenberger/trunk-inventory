export interface DropDownSearchOption {
    name: string
    value: string
}

export type PageInfo = {
    hasNextPage: boolean
    endCursor: string
}

export type PaginatedDropDownSearchOptions = {
    nodes: DropDownSearchOption[]
    pageInfo: PageInfo
}