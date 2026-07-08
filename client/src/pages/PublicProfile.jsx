import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"

import { getUserProfile } from "../api/post.api.js"
import { useAuth } from "../context/AuthContext.jsx"

import {
    FiAtSign, FiCalendar, FiFileText, FiAlertCircle,
    FiArrowLeft, FiUserX, FiEdit2,
} from "react-icons/fi"

import { AvatarGradient } from "../components/AvatarGradient.jsx"
import StatCard from "../components/StatCard.jsx"
import Loading from "../components/Loading.jsx"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

const intials = (first, last) => 
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"

const formatJoinDate = (isoStr) => {

    if (!isoStr) return "-"

    try {
        return new Date(isoStr).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
    } catch {
        return "-"
    }

}

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
)

function PublicProfile() {

    const { username } = useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {

        let cancelled = false

        setLoading(true)
        setError(null)
        setNotFound(false)

        getUserProfile(username).then(res => {

            if (cancelled) return 

            if (!res.success) {
                if (res.notFound) setNotFound(true)
                else setError(res.error)
                setLoading(false)
                return
            }

            const p = res.data.profile

            if (p.is_owner) {
                navigate("/profile", { replace: true })
                return 
            }

            setProfile(p)
            setLoading(false)
        })

        return () => { cancelled = true }

    }, [username, navigate])

    const displayName = profile ? `${profile.first_name} ${profile.last_name}` : "-"
    const gradient = AvatarGradient(profile?.first_name)

    if (loading) return (
        <div className="" >
            <Loading/>
        </div>
    )

    if (notFound) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Plus_Jakarta_Sans']" >
            <div className="text-center bg-white rounded-3xll border border-gray-100 p-12 shadow-sm max-w-sm" >
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4" >
                    <FiUserX size={14} className="text-gray-300" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold text-gray-900 mb-2" >
                    User not found
                </h3>
                <p className="text-sm text-gray-500 mb-6" >
                    @{username} doesn't exist or is no longer available
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Back to Home
                </button>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Plus_Jakarta_Sans']" >
            <div className="text-center bg-white rounded-3xl border border-gray-100 p-12 shadow-sm max-w-sm" >
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4" >
                    <FiAlertCircle size={24} className="text-red-500" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold text-gray-900 mb-2" >
                    Something went wrong
                </h3>
                <p className="text-sm text-gray-500 mb-6" >{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold
                    hover:bg-indigo-700 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    )

    if (!profile) return null

    return (
        <div className="min-h-scrreen bg-gray-50 font-['Plus_Jakarta_Sans']" >
            <div className="max-w-2xl mx-auto px-5 lg:px-8 py-10" >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-6"
                >
                    <FiArrowLeft size={15} />
                    Back
                </button>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" >
                    <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
                    <div className="flex flex-col items-center my-6" >
                        {
                            profile.avatar_url ? (
                                <img
                                    src={`${BASE_URL}${profile.avatar_url}`}
                                    alt={displayName}
                                    className="w-24 h-24 rounded-2xl object-cover shadow-lg mb-4"
                                />
                            ) : (
                                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`} >
                                    <span className="text-white text-3xl font-extrabold font-['Bricolage_Grotesque'] select-none" >
                                        {intials(profile.first_name, profile.last_name)}
                                    </span>
                                </div>
                            )
                        }

                        <h2 className="font-['Bricolage_Grotesque'] text-[22px] font-extrabold text-gray-900 tracking-tight text-center leading-tight" >
                            {displayName}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1 font-medium flex items-center gap-1" >
                            <FiAtSign size={12} />
                            {profile.username}
                        </p>
                        <p className="text-[12.5px] text-gray-400 mt-2 flex items-center gap-1.5" >
                            <FiCalendar size={12} />
                            Joined {formatJoinDate(profile.created_at)}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4" >
                        <StatCard
                            icon={FiFileText}
                            label="Posts Published"
                            value={profile.posts_counts ?? 0}
                            accent="bg-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default PublicProfile