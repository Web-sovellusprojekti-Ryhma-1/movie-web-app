export interface ApiResponse<T> {
    status: number
    message: string
    data: T
}

export interface PostgresResult<T> {
    rows: T[]
    rowCount: number

    [key: string]: unknown
}
