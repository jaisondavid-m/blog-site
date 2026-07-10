import api from "./axios.js"

export async function getNotifications() {
    try {
        const res = await api.get("/api/notifications")
        return {
            success: true,
            data: res.data
        }
    } catch(err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch notifications",
        }
    }
}

export async function markNotificationRead(uuid) {
    try {
        const res = await api.post(`/api/notifications/${uuid}/read`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to mark notification as read"
        }
    }
}

export async function getUnreadNotificationCounts() {
    try {
        const res = await api.get("/api/notifications/unread-count")
        return {
            success: true,
            data: res.data,
        }
    } catch(err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch count data"
        }
    }
}