import { axiosPrivate } from './Axios.ts'

export const UserByIdRequest = async (id: Number) => {
        const response = await axiosPrivate.get(`/user/${id}`)
        console.log(response)
        return response.data
}
