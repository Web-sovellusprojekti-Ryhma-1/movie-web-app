import axios from "axios";

const BASE_URL = "http://localhost:3001/api/finnkino";
const MATCH_BASE_URL = "http://localhost:3001/api/match";

export interface FinnkinoTheatreArea {
    ID: string | number;
    Name: string;
}

export interface FinnkinoTheatreAreasResponse {
    TheatreAreas: {
        TheatreArea: FinnkinoTheatreArea[];
    };
}

export interface FinnkinoMatchPayload {
    tmdbId?: number;
    tmdb_id?: number;
    title?: string;
    originalTitle?: string;
    original_title?: string;
    releaseDate?: string;
    release_date?: string;
    runtime?: number;
    voteAverage?: number;
    vote_average?: number;
    posterPath?: string;
    poster_path?: string;
    overview?: string;
    genres?: Array<{id?: number; name?: string} | string>;
    rawTmdb?: unknown;
    rawTMDB?: unknown;

    [key: string]: unknown;
}

export interface FinnkinoMatchResponse {
    finnkinoEventId: string;
    finnkinoEvent?: unknown;
    match?: FinnkinoMatchPayload | null;
    candidates?: FinnkinoMatchPayload[];
}

export const fetchTheatreAreas = async <T = FinnkinoTheatreAreasResponse>() => {
    const response = await axios.get<T>(`${BASE_URL}/theatre-areas`);
    return response.data;
};

export const fetchMoviesFromTheatre = async <T>(areaId: string) => {
    const response = await axios.get<T>(`${BASE_URL}/movies`, {
        params: {areaId},
    });
    return response.data;
};

export const fetchShowtimes = async <T>(areaId: string, date: string) => {
    const response = await axios.get<T>(`${BASE_URL}/showtimes`, {
        params: {areaId, date},
    });
    return response.data;
};

export const fetchFinnkinoMatch = async <T = FinnkinoMatchResponse>(eventId: string) => {
    const response = await axios.get<T>(`${MATCH_BASE_URL}/finnkino/${eventId}`);
    return response.data;
};
