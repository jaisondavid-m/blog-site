import api from "./axios.js"

export const findAccount = async (email) => {
    try {
        const response = await api.post("/api/auth/forgot-password/find-account", {
            email,
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
                "Could not find an account with that email",
        }
    }
}

export const sendResetOTP = async (userId) => {
    try {
        const response = await api.post("/api/auth/forget-password/send-otp",{
            user_id: userId,
        })
        return {
            success: true,
            data: response.data,
        }
    } catch(error) {
        return {
            success: false,
            error:
                error.response?.data?.error ||
                error.message ||
                "Failed to send verification code",
        }
    }
}

export const verifyResetOTP = async (userId, otp) => {
    try {
        const response = await api.post("/api/auth/forgot-password/verify-otp", {
            user_id: userId,
            otp,
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
                "Invalid or expired code",
        }
    }
}

export const resetPassword = async (resetToken , newPassword) => {
    try {
        const response = await api.post("/api/auth/forget-password/reset", {
            reset_token: resetToken,
            new_password: newPassword,
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
                "Failed to reset password",
        }
    }
}