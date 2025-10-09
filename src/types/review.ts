export interface ReviewType {
    user_id: number
    user_email: string
    title: string
    body: string
    rating: number
    tmdb_id: number
    reviewed_at: string
}

export interface PostReviewType {
  review: {
    title: string
    body: string
    rating: number
    tmdb_id: number
  }
}