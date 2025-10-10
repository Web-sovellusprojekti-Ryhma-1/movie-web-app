import type {ApiResponse} from "../types/api"
import type {UserRecord} from "../types/user"
import {axiosPrivate} from "./Axios.ts"

export const getUserById = async (id: number): Promise<UserRecord> => {
    const {data} = await axiosPrivate.get<ApiResponse<UserRecord>>(`api/user/${id}`)
    return data.data
}

export const deleteUserAccount = async (): Promise<UserRecord | null> => {
    const {data} = await axiosPrivate.delete<ApiResponse<UserRecord | null>>("api/user/deletecurrentuser")
    return data.data
}
