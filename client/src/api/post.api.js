import { data } from "react-router-dom"
import api from "./axios.js"

export async function getPosts({ page = 1, limit = 10, tag = "" }) {
    try {

        const params = { page, limit }
        if (tag) params.tag = tag

        const res = await api.get("/api/posts", { params })
        return { success: true, data: res.data }

        // const incoming = res.data.posts ?? []

        // console.log("fetch result:", res)
        // console.log("incoming:", res.data.posts)

    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch posts",
        }
    }
}

export async function getPost(uuid) {
    try {
        const res = await api.get(`/api/posts/${uuid}`)
        return { success: true, data: res.data }
    } catch (err) {
        if (err.response?.status === 404) {
            return { success: false, error: "Post not found" }
        }
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch post",
        }
    }
}

export async function toggleLike(uuid) {
    try {
        const res = await api.post(`/api/posts/${uuid}/like`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to toggle like"
        }
    }
}

export async function toggleBookmarkApi(uuid) {
    try {
        const res = await api.post(`/api/posts/${uuid}/bookmark`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to toggle bookmark"
        }
    }
}

export async function createPost(data) {
    try {
        const res = await api.post("/api/posts", data)
        return { success: true, data: res.data }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to create post"
        }
    }
}

export async function getBookmarks({ page = 1, limit = 10 } = {}) {
    try {
        const res = await api.get("/api/posts/bookmarks", {
            params: { page, limit },
        })
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch bookmarks",
        }
    }
}

export async function getMyPosts({ page = 1, limit = 10, status = "" } = {}) {
    try {

        const params = { page, limit }

        if (status) {
            params.status = status
        }

        const res = await api.get("/api/posts/mine",{ params })

        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch your posts",
        }
    }
}

export async function getMyPostsOverview() {

    try {
        const res = await api.get("/api/posts/mine/overview")
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch overview data"
        }
    }

}

export async function deletePost(uuid) {

    try {
        const res = await api.delete(`/api/posts/${uuid}`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to delete post",
        }
    }

}


export async function updatePostStatus(uuid, status) {

    try {
        const res = await api.put(`/api/posts/${uuid}`, {
            status,
        })
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to update post"
        }
    }

}

export async function updatePost(uuid, data) {
    try {
        const res = await api.put(`/api/posts/${uuid}`, data)
        return { success: true, data:res.data }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to update post"
        }
    }
}

export async function getComments(uuid) {

    try {
        const res = await api.get(`/api/posts/${uuid}/comments`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to load comments",
        }
    }

}

export async function createComment(uuid, commentText, parentCommentId = null) {

    try {
        const res = await api.post(`/api/posts/${uuid}/comments`, {
            comment_text: commentText,
            parent_comment_id: parentCommentId,
        })
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: true,
            error: err.response?.data?.error || "Failed to post comment",
        }
    }

}