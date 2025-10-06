import {axiosPrivate} from './Axios.ts'

export const GetUserFavorites = async (id: number) => {
    const response = await axiosPrivate.get(`api/favorite/user/${id}`)
    return response.data
}

export const PostFavorite = async (tmdb_id: number) => {
        const response = await axiosPrivate.post(`api/favorite`, {tmdb_id})
        return response.data
}

export const DeleteFavorite = async (id: number) => {
    const response = await axiosPrivate.delete(`api/favorite/${id}`)
    return response.data
}
