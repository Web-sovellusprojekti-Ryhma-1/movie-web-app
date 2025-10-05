import axios from "axios";
import type { ExtendedTmdbMovie } from "../helpers/movieHelpers";
// korjasin tiedostoa ja linkityksen takaisin backendiin
const BASE_URL = "http://localhost:3001/api/tmdb";

export interface TmdbGenre {
    id: number;
    name: string;
}

export interface TmdbMovie {
    id: number;
    title: string;
    overview: string;
    release_date?: string;
    poster_path: string | null;
    vote_average: number;
    genre_ids?: number[];
}

export interface TmdbPagedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export type SearchMoviesParams = {
    query: string;
    page?: number;
    include_adult?: boolean;
    year?: number; // primary_release_year
};

export async function searchMovies(params: SearchMoviesParams) {
    const {query, page = 1, include_adult = false, year} = params;
    const response = await axios.get<TmdbPagedResponse<TmdbMovie>>(`${BASE_URL}/search`, {
        params: {
            query,
            page,
            include_adult,
            primary_release_year: year,
        },
    });
    return response.data;
}

export type DiscoverMoviesParams = {
    page?: number;
    with_genres?: number[]; // comma-separated
    "primary_release_date.gte"?: string; // YYYY-MM-DD
    "primary_release_date.lte"?: string; // YYYY-MM-DD
    "vote_average.gte"?: number;
    "vote_average.lte"?: number;
    sort_by?:
        | "popularity.desc"
        | "popularity.asc"
        | "primary_release_date.desc"
        | "primary_release_date.asc"
        | "vote_average.desc"
        | "vote_average.asc"
        | "original_title.asc"
        | "original_title.desc";
};

export async function discoverMovies(params: DiscoverMoviesParams = {}) {
    const response = await axios.get<TmdbPagedResponse<TmdbMovie>>(`${BASE_URL}/discover/movie`, {
        params: {
            ...params,
            with_genres: params.with_genres?.join(","),
        },
    });
    return response.data;
}

export async function getGenres() {
    try {
        const response = await axios.get<{ genres: TmdbGenre[] }>(`${BASE_URL}/genres`);
        console.log("Fetched genres from backend:", response.data.genres); // Debugging
        return response.data.genres;
    } catch (error) {
        console.error("Error fetching genres from backend:", error);
        throw error;
    }
}

export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342") {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : "https://placehold.co/342x500?text=No+Image";
}

export const getMovieDetails = async (id: string): Promise<ExtendedTmdbMovie> => {
    try {
        console.log("Fetching movie details for ID:", id); // Log the ID being fetched
        const response = await axios.get<ExtendedTmdbMovie>(`${BASE_URL}/movie/${id}`);
        console.log("Raw backend response:", response.data); // Log the raw response from the backend

        // Ensure genres are included in the response
        const movieDetails = {
            ...response.data,
            genres: response.data.genres || [],
        };

        console.log("Processed movie details:", movieDetails); // Debugging
        return movieDetails;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        throw error;
    }
};

export const fetchPopularMovies = async () => {
    try {
        const response = await axios.get<TmdbPagedResponse<TmdbMovie>>(`${BASE_URL}/popular`)
        return response.data
    } catch (error) {
        console.error("Error fetching popular movies:", error)
        throw error
    }
}

// titlen mukaan elokuvan haku jotta voidaan käyttää title -> id navigointia finnkinoapin kanssa
export const searchMovieByTitle = async (title: string) => {
  try {
    const response = await axios.get<TmdbPagedResponse<TmdbMovie>>(`${BASE_URL}/search`, {
      params: { query: title, page: 1, include_adult: false },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching for movie by title:", error);
    throw error;
  }
};

export const fetchMovieById = async (id: number) => {
  try {
    const response = await axios.get<TmdbMovie>(`${BASE_URL}/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie by ID:", error);
    throw error;
  }
};
