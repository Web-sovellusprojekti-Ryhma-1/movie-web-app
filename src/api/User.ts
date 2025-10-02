import { axiosPrivate } from './Axios.ts'

export const UserByIdRequest = async (id: number) => {
        const response = await axiosPrivate.get(`api/user/${id}`)
        return response.data
}
