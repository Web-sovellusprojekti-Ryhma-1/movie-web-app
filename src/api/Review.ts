import { axiosPrivate } from './Axios.ts'

interface ReviewType {
    review: {title: string, body: string, rating: number, tmdb_id: number}
}

export const ReviewByMovieId = async (id: number) => {
        const response = await axiosPrivate.get(`api/review/movie/${id}`)
        return response.data
}

export const ReviewByUserId = async (id: number) => {
        const response = await axiosPrivate.get(`api/review/user/${id}`)
        return response.data
}

export const AllReviewsByTmdbId = async (id: number) => {
        const response = await axiosPrivate.get(`api/review/movie/${id}`)
        return response.data
}

export const PostReview = async (reviewData: ReviewType) => {
        const response = await axiosPrivate.post(`api/review`, reviewData)
        return response.data
}

export const DeleteReview = async (id: number) => {
        const response = await axiosPrivate.delete(`api/review/${id}`)
        return response.data
}