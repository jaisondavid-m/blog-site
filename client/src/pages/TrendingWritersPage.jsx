import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
    FiArrowLeft, FiLoader, FiAlertCircle,
    FiTrendingDown, FiHeart, FiMessageCircle, FiEye,
    FiTrendingUp, FiUsers,
    FiChevronDown,
} from "react-icons/fi"

import { getTrendingWriters } from "../api/writer.api.js"
import { Avatar } from "../components/Avatar.jsx"
import WriterSkeleton from "../components/writers/WriterSkeleton.jsx"
import WriterCard from "../components/writers/WriterCard.jsx"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

function TrendingWritersPage() {

    const navigate = useNavigate()

    const [writers, setWriters] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)

    const LIMIT = 10

    const fetchWriters = useCallback(async (pageNum, append = false) => {

        if (!append) setLoading(true)
        else setLoadingMore(true)

        setError(null)

        const res = await getTrendingWriters({ page: pageNum, limit: LIMIT })

        if (!append) setLoading(false)
        else setLoadingMore(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        const incoming = res.data.writers ?? []

        setWriters(prev =>
            append ? [...prev, ...incoming] : incoming
        )

        setHasMore(incoming.length === LIMIT)

    }, [])

    useEffect(() => {
        fetchWriters(1, false)
    }, fetchWriters)

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchWriters(nextPage, true)
    }

    const goToProfile = (username) => {
        navigate(`/u/${username}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
            <div className="max-w-2xl mx-auto px-5 lg:px-8 py-10" >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-6"
                >
                    <FiArrowLeft size={15} />
                    Back
                </button>
                <div className="mb-7" >
                    <div className="flex items-center gap-2 mb-1" >
                        <FiTrendingDown size={18} className="text-indigo-500" />
                        <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >
                            Trending Writers
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-medium" >
                        Most engaged authors on the platform right now
                    </p>
                </div>
                {
                    loading ? (
                        <div className="flex flex-col gap-3" >
                            {
                                [1, 2, 3, 4, 5].map(i => (
                                    <WriterSkeleton key={i} />
                                ))
                            }
                        </div>
                    ) : error ? (
                        <div className="text-center bg-white rounded-3xl border border-gray-100 p-12 shadow-sm" >
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4" >
                                <FiAlertCircle size={14} className="text-red-500" />
                            </div>
                            <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-gray-900 mb-2" >
                                Something went wrong
                            </h3>
                            <p className="text-sm text-gray-500 mb-6" >
                                {error}
                            </p>
                            <button
                                onClick={() => fetchWriters(1, false)}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold
                                hover:bg-indigo-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : writers.length === 0 ? (
                        <div className="text-center bg-white rounded-3xl border border-gray-300 p-12 shadow-sm" >
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4" >
                                <FiUsers size={20} className="text-gray-300" />
                            </div>
                            <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-gray-900 mb-2" >
                                No trending writers yet
                            </h3>
                            <p className="text-sm text-gray-500" >
                                Check back once more posts starting getting engagement
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex flex-col gap-3" >
                                {writers.map((w, i) => (
                                    <WriterCard key={w.uuid} w={w} i={i} goToProfile={goToProfile} />
                                ))}
                            </div>
                            {
                                hasMore && (
                                    <div className="flex justify-center mt-6" >
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border-gray-200
                                            hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50
                                            text-gray-600 rounded-2xl text-sm font-semibold transition-all duration-150
                                            disabled:opacity-50 shadow-sm"
                                        >
                                            {
                                                loadingMore
                                                    ? (
                                                        <div>
                                                            <FiLoader size={14} className="animate-spin" /> Loading
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <FiChevronDown size={14} /> Load More
                                                        </div>
                                                    )
                                            }
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )

}

export default TrendingWritersPage