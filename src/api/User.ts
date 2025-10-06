import { axiosPrivate } from './Axios.ts'

export const UserByIdRequest = async (id: number) => {
        const response = await axiosPrivate.get(`api/user/${id}`)
        return response.data
}

export const DeleteUserAccount = async () => {
        const response = await axiosPrivate.delete("api/user/deletecurrentuser")
        return response.data
}