import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/finnkino'

export const fetchTheatreAreas = async () => {
    const response = await axios.get(`${BASE_URL}/theatre-areas`)
    return response.data
}

export const fetchMoviesFromTheatre = async (areaId: string) => {
    const response = await axios.get(`${BASE_URL}/movies`, {
    params: { areaId },
})
return response.data
}

export const fetchShowtimes = async (areaId: string, date: string) => {
    const response = await axios.get(`${BASE_URL}/showtimes`, {
        params: { areaId, date }
    })
    return response.data
}