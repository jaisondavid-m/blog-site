import api from "./axios"

export const registerUser = async (data) => {
    try {
        const response = await api.post("/api/auth/register",{
            first_name: data.first_name,
            last_name: data.last_name,
            username: data.username,
            email: data.email,
            password: data.password,
        })

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        return {
            success: false,
            error:
                error.response?.data?.error ||
                error.message ||
                "Registration Failed",
        }
    }
}

export const loginUser = async (data) => {
    try {
        const response = await api.post("/api/auth/login",{
            username: data.username,
            password: data.password,
        })

        return {
            success: true,
            data: response.data,
        }
    } catch (error) {
        return {
            success: false,
            error:
                error.response?.data?.error ||
                error.message ||
                "Login Failed",
        }
    }
}

export const guestLogin = async () => {

    try {
        const response = await api.post("/api/auth/guest")
        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        return {
            success: false,
            error:
                error.response?.data?.error ||
                error.message || 
                "Guest Login Failed",
        }
    }

}

export const logoutUser = async () => {
    try {
        await api.post("/api/auth/logout")
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

export const getMe = async () => {
    try {
        const response = await api.get("/api/auth/me")
        return { success: true , data: response.data }
    } catch {
        return { success: false }
    }
}

export const updateProfile = async (data) => {
    try {
        const res = await api.put("/api/auth/profile",data)
        return { success: true, data: res.data }
    } catch (error) {y
        return { success: false, error: error.response?.data?.error || "Failed to update profile" }
    }
}

export const uploadAvatar = async (file) => {
    try {
        const form = new FormData()
        form.append("avatar",file)
        const res = await api.post("/api/auth/avatar",form, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.error || "Failed to upload avatar image" }
    }
}