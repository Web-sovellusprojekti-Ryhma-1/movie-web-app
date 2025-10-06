import type {TmdbMovie} from "../api/tmdb";

// tämä on helpperi tiedosto jossa muutetaan tmdb apista saatu data sopivaan muotoon muille komponenteille käytettäväksi
export interface MovieDetails {
    id: number
    title: string
    releaseDate: string
    overview: string
    posterUrl: string | null
    genres: string[]
    rating: number
    cast: {name: string; character: string}[]
    duration?: string
    director?: string
    originalTitle?: string
}

export interface ExtendedTmdbMovie extends TmdbMovie {
    credits?: {
        cast?: {name: string; character: string}[]
        crew?: {name: string; job: string}[]
    }
    runtime?: number
    success?: boolean
    status_message?: string
    genres?: Array<{id: number; name: string} | string>
}

export function transformTmdbMovie(movie: ExtendedTmdbMovie): MovieDetails {
    console.log("Transforming movie:", movie)
    const genres = Array.isArray(movie.genres)
        ? movie.genres
            .map((genre) => (typeof genre === "string" ? genre : genre?.name))
            .filter((genre): genre is string => Boolean(genre))
        : movie.genre_ids?.map((id) => `Genre ${id}`) || []

    const transformed = {
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date || "Unknown",
        overview: movie.overview,
        posterUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        genres,
        rating: movie.vote_average,
        cast: movie.credits?.cast?.map((c) => ({
            name: c.name,
            character: c.character,
        })) || [],
        duration: movie.runtime ? `${movie.runtime} minutes` : undefined,
        director:
            movie.credits?.crew?.find((crew) => crew.job === "Director")?.name ||
            undefined,
        originalTitle: movie.original_title || undefined,
    };
    console.log("Transformed movie data:", transformed)
    return transformed;
}
