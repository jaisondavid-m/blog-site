import api from "./axios.js"

export async function getAdminUsers({ page = 1, limit = 20, search = "", status = "", role = "" } = {}) {
    try {

        const params = { page, limit }
        if (search) params.search = search
        if (status) params.status = status
        if (role)   params.role = role

        const res = await api.get("/api/admin/users", { params })
        return {
            success: true,
            data: res.data,
        }

    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch users",
        }
    }
}