import api from "./axios"

export const getHealthStatus = async () => {

    try {
        const response = await api.get("/health")
        return {
            success: true,
            data: response.data,
        }
    } catch (error) {
        return {
            success: false,
            error:
                error.response?.data?.message ||
                error.message ||
                "Low Internet! Check Your Internet Connection"
        }
    }

}