import api from "./axios.js"

export async function getPosts({ page = 1, limit = 10, tag = "" }) {
    try {

        const params = { page, limit }
        if (tag) params.tag = tag

        const res = await api.get("/api/posts", { params })
        return { success: true, data: res.data }

        const incoming = res.data.posts ?? []

        console.log("fetch result:", res)
        console.log("incoming:", res.data.posts)

    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch posts",
        }
    }
}