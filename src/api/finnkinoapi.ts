import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/finnkino'

export const fetchTheatreAreas = async <T>() => {
    const response = await axios.get<T>(`${BASE_URL}/theatre-areas`)
    return response.data
}

export const fetchMoviesFromTheatre = async <T>(areaId: string) => {
    const response = await axios.get<T>(`${BASE_URL}/movies`, {
    params: { areaId },
})
return response.data
}

export const fetchShowtimes = async <T>(areaId: string, date: string) => {
    const response = await axios.get<T>(`${BASE_URL}/showtimes`, {
        params: { areaId, date }
    })
    return response.data
}