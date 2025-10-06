import axios from "axios";

// Axios instance with baseurl and headers set up 
export const axiosPrivate = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {'Content-Type': 'application/json'}
})

axiosPrivate.interceptors.request.use(function (config) {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    
    if (!config.headers) {
      config.headers = {}
    }

    if (user) {
        config.headers.Authorization =  `Bearer ${user.token}`;
    }

    return config;
});