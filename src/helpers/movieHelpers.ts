import type { TmdbMovie } from "../api/tmdb";

// tämä on helpperi tiedosto jossa muutetaan tmdb apista saatu data sopivaan muotoon muille komponenteille käytettäväksi
export interface MovieDetails {
  id: number
  title: string
  releaseDate: string
  overview: string
  posterUrl: string | null
  genres: string[]
  rating: number
  cast: { name: string; character: string }[]
  duration?: string
  director?: string
}

export interface ExtendedTmdbMovie extends TmdbMovie {
  credits?: {
    cast?: { name: string; character: string }[]
    crew?: { name: string; job: string }[]
  }
  runtime?: number
  success?: boolean
  status_message?: string
  genres?: string[]
}

export function transformTmdbMovie(movie: ExtendedTmdbMovie): MovieDetails {
  console.log("Transforming movie:", movie) 
  const transformed = {
    id: movie.id,
    title: movie.title,
    releaseDate: movie.release_date || "Unknown", 
    overview: movie.overview,
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    genres: movie.genre_ids?.map((id) => `Genre ${id}`) || [], 
    rating: movie.vote_average,
    cast: movie.credits?.cast?.map((c) => ({
      name: c.name,
      character: c.character,
    })) || [],
    duration: movie.runtime ? `${movie.runtime} minutes` : undefined, 
    director:
      movie.credits?.crew?.find((crew) => crew.job === "Director")?.name ||
      undefined, 
  };
  console.log("Transformed movie data:", transformed)
  return transformed;
}