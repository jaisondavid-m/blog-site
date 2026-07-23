import axios from "axios"

const api = axios.create({
    baseURL: "https://json.hackclub.app",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export default api