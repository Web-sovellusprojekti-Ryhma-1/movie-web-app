import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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

const bearer = import.meta.env.VITE_TMDB_BEARER as string | undefined;
const tmdb = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: bearer
        ? {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: `Bearer ${bearer}`,
        }
        : {
            "Content-Type": "application/json;charset=utf-8",
        },
    params: {
        api_key: import.meta.env.VITE_TMDB_API_KEY,
        language: "en-US",
    },
});

export type SearchMoviesParams = {
    query: string;
    page?: number;
    include_adult?: boolean;
    year?: number; // primary_release_year
};

export async function searchMovies(params: SearchMoviesParams) {
    const {query, page = 1, include_adult = false, year} = params;
    const response = await tmdb.get<TmdbPagedResponse<TmdbMovie>>("/search/movie", {
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
    const response = await tmdb.get<TmdbPagedResponse<TmdbMovie>>("/discover/movie", {
        params: {
            ...params,
            with_genres: params.with_genres?.join(","),
        },
    });
    return response.data;
}

export async function getGenres() {
    const response = await tmdb.get<{genres: TmdbGenre[]}>("/genre/movie/list");
    return response.data.genres;
}

export function getPosterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342") {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : "https://via.placeholder.com/350x400?text=No+Image";
}
