import { axiosPrivate } from './Axios.ts'

export const UserByIdRequest = async (id: Number) => {
        const response = await axiosPrivate.get(`api/user/${id}`)
        console.log(response)
        return response.data
}
