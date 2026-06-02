import React from "react"
import { Navigate , Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import Loading from "./Loading.jsx"

function PublicRoute() {

    const { user } = useAuth()

    if (user === undefined) {
        return <Loading/>
    }

    if (user) {
        return (
            <Navigate
                to="/home"
                replace
            />
        )
    }

    return <Outlet/>

}

export default PublicRoute