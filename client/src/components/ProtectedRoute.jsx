import React from "react"
import { Navigate , Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import LoadingPage from "../components/Loading.jsx"


function ProtectedRoute() {
    
    const { user } = useAuth()

    if (user === undefined) {
        return (
            <LoadingPage/>
            // <div>Loading...</div>
        )
    }

    if (!user) {
        return <Navigate to="/auth?mode=login" replace />
    }

    return <Outlet/>

}

export default ProtectedRoute