import api from "./axios.js"

export async function getTrendingWriters({ page = 1, limit = 10 } = {}) {
    try {
        const res = await api.get("/api/writers/trending", {
            params: { page, limit }
        })
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch trending writers",
        }
    }
}