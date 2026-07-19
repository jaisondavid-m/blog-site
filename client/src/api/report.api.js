import api from "./axios.js"

export async function reportPost(uuid, reason, description = "") {

    try {
        const res = await api.post(`/api/posts/${uuid}/report`, {
            reason,
            description,
        })
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        if (err.response?.status === 403) {
            return {
                success: false,
                error: err.response?.data?.error || "You can't report your own post",
            }
        }
        if (err.response?.status === 409) {
            return {
                success: false,
                error: "You'vs already reported this post",
            }
        }
        return {
            success: false,
            error: err.response?.data?.error || "Failed to report post"
        }
    }

}