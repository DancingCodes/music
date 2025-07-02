import request from "@/utils/request";
import { type IResponse, type IPagingParams, type IPagingResponse } from '@/types/IResponse'

export interface IMusic {
    id: number,
    name: string,
    picUrl: string,
    artists: { id: number; name: string }[],
    duration: number,
    lyric: string,
    url: string,
}

export interface ISearchMusicParams extends IPagingParams {
    name: string;
}
export interface ISearchMusicResponse extends IPagingResponse<IMusic> { }
export const getMusicList = (data: ISearchMusicParams): Promise<IResponse<ISearchMusicResponse>> => request.post('/music/getMusicList', data)
export const getWYMusicList = (data: ISearchMusicParams): Promise<IResponse<ISearchMusicResponse>> => request.post('/music/getWYMusicList', data)

export interface ISaveWYMusicParams {
    id: number;
}
export const saveWyMusic = (data: ISaveWYMusicParams) => request.post('/music/saveWyMusic', data)
