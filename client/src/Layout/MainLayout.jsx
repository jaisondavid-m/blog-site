import React from "react"
import { Outlet } from "react-router-dom"
import NavBar from "../components/NavBar.jsx"
import Footer from "../components/Footer.jsx"

function MainLayout() {

    return (
        <div className="flex flex-col min-h-screen" >
            <NavBar/>
            <main className="flex-1" >
                <Outlet/>
            </main>
            <Footer/>
        </div>
    )

}

export default MainLayout