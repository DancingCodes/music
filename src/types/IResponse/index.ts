export interface IResponse<T> {
    status: number,
    data: T,
    message: string
}

export interface IPagingParams {
    pageNo: number;
    pageSize: number;
}

export interface IPagingResponse<T> {
    total: number;
    list: T[],
    loading: boolean,
    hasMore: boolean
}