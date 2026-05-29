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