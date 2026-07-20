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

export async function suspendUser(uuid) {

    try {
        const res = await api.post(`/api/admin/users/${uuid}/suspend`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to suspend user"
        }
    }

}

export async function unsuspendUser(uuid) {

    try {
        const res = await api.post(`/api/admin/users/${uuid}/unsuspend`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to unsuspend user"
        }
    }

}

export async function banUser(uuid) {

    try {
        const res = await api.post(`/api/admin/users/${uuid}/ban`)
        return {
            success: true,
            data: res.data,
        }    
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to ban user"
        }
    }

}

export async function unbanUser(uuid) {
    
    try {
        const res = await api.post(`/api/admin/users/${uuid}/unban`)
        return {
            success: true,
            data: res.data,
        }
    } catch(err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to unban user"
        }
    }

}

export async function deleteUser(uuid) {
    
    try {
        const res = await api.delete(`/api/admin/users/${uuid}`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to delete user"
        }
    }

}

export async function getReports({ page = 1, limit = 20, status = "pending" } = {}) {
    try {

        const params = { page, limit }
        if (status) params.status = status

        const res = await api.get("/api/admin/reports", { params })
        return {
            success: true,
            data: res.data,
        }

    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to fetch reports",
        }
    }
}

export async function adminDeletePost(uuid) {
    try {
        const res = await api.delete(`/api/admin/posts/${uuid}`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || "Failed to delete post"
        }
    }
}