import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiZap, FiLogOut, FiMenu, FiX } from "react-icons/fi"
import { useAuth } from "../context/AuthContext.jsx"
import { logoutUser } from "../api/auth.api.js"

function NavBar() {

    const { setUser } = useAuth()

    const navigate = useNavigate()
    const location = useLocation()

    const [mobileOpen, setMobileOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        try {
            setLoading(true)
            await logoutUser()
            setUser(null)
            navigate("/auth?mode=login", { replace: true })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const links = [
        { name: "Home", path: "/home" },
        { name: "Profile", path: "/profile" },
    ]

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-5 lg:px-8" >
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/home" className="flex items-center flex-shrink-0 gap-2" >
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <FiZap className="text-white" size={18} />
                            </div>
                            <span className="text-lg font-bold text-gray-900" >
                                BlogSite
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-8" >

                            {links.map((link) => {
                                const active = location.pathname
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`text-sm font-medium transition-colors duration-200
                                            ${active
                                                ? "text-indigo-600"
                                                : "text-gray-600 hover:text-gray-900"
                                            }
                                        `}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            })}
                        </nav>
                        {/* Desktop Logout */}
                        <div className="hidden md:block">
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-g border border-gray-300 text-gray-700 hovere:bg-gray-50
                                transition disabled:opacity-60"
                            >
                                <FiLogOut size={16} />
                                {loading
                                    ? "Logging out..."
                                    : "LogOut"
                                }
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg
                            text-gray-700 hover:bg-gray-100"
                        >
                            {mobileOpen
                                ? <FiX size={22} />
                                : <FiMenu size={22} />
                            }
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-b border-gray-200 bg-white">
                    <div className="px-5 py-4">
                        <nav className="flex flex-col" >
                            {links.map((link) => {
                                const active = location.pathname === link.path
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`px-3 py-3 rounded-lg text-sm font-medium transition
                                                ${
                                                    active
                                                        ? "bg-indigo-50 text-indigo-600"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }
                                            `}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            })}
                            <div className="mt-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                                    border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                                >
                                    <FiLogOut size={16} />
                                    {loading
                                        ? "Logging out..."
                                        : "Logout"
                                    }
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>

    )

}

export default NavBar