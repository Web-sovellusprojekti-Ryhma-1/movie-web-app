import axios from "axios";

// Axios instance with baseurl and headers set up 
export const axiosPrivate = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {'Content-Type': 'application/json'}
})