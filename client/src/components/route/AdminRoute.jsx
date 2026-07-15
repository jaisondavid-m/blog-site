import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext.jsx"

function AdminRoute() {

    const { user } = useAuth()

    if (user === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center" >
                <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animation-spin" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to='/auth?mode=login' replace />
    }

    if (user.Role !== "admin") {
        return <Navigate to="/home" replace />
    }

    return <Outlet />

}

export default AdminRoute