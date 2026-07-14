import React, { useState, useCallback, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import BlogPost from "../components/posts/BlogPost.jsx"
import ToastStack from "../components/ToastStack.jsx"
import { DUMMY_POST } from "../data/DummyData.js"
import {
    FiZap, FiLoader, FiAlertCircle,
    FiRefreshCw, FiInbox, FiChevronDown,
    FiEdit, FiTrendingUp,
    FiBookmark,
} from "react-icons/fi"

import { getPosts, getTrendingPosts } from "../api/post.api.js"
import TagFilter from "../components/posts/TagFilter.jsx"
import PostSkeleton from "../components/posts/PostSkeleton.jsx"
import ErrorState from "../components/posts/ErrorState.jsx"
import EmptyState from "../components/posts/EmptyState.jsx"
import NormalisePost from "../components/posts/NormalisePost.jsx"

function Home() {

    // const posts = DUMMY_POST
    const navigate = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams()
    const isTrending = searchParams.get("trending") === "true"

    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [activeTag, setActiveTag] = useState("")
    const [toasts, setToasts] = useState([])

    const [limit, setLimit] = useState(5)
    const [days, setDays] = useState(100)

    const LIMIT = 10

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now()
        setToasts(p => [...p, { id, message, type }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(p => p.filter(t => t.id !== id))
    }, [])

    const fetchPosts = useCallback(async (pageNum, tag, append = false) => {

        if (!append) setLoading(true)
        else setLoadingMore(true)

        setError(null)

        const res = isTrending
            ? await getTrendingPosts({ page: pageNum, limit: limit, days: days })
            : await getPosts({ page: pageNum, limit: limit, tag })

        if (!append) setLoading(false)
        else setLoadingMore(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        const incoming = (res.data.posts ?? []).map(NormalisePost)
        setPosts(prev => append ? [...prev, ...incoming] : incoming)
        setHasMore(incoming.length === limit)
    }, [isTrending, limit, days])

    // useEffect(() => {
    //     setPosts([])
    //     fetchPosts(1, activeTag, false)
    // },[isTrending, activeTag])

    const handleLoadMore = () => {
        const nextPage = page + 1
        if (!loadingMore && hasMore) fetchPosts(nextPage, activeTag, true)
    }

    const handleShare = useCallback(() => {
        addToast("Link copied to clipboard", "success")
    }, [addToast])

    const handleTagChange = (tag) => {
        setActiveTag(tag)
    }

    const toggleTrending = () => {

        const next = new URLSearchParams(searchParams)
        if (isTrending) {
            next.delete("trending")
        } else {
            next.set("trending", "true")
            next.delete("tag")
        }

        setSearchParams(next)

    }

    useEffect(() => {
        setPage(1)
        setPosts([])
        setHasMore(true)
        fetchPosts(1, activeTag, false)
    }, [activeTag, limit, days, fetchPosts])

    const goToPage = (newPage) => {
        if (newPage < 1) return
        setPage(newPage)
        fetchPosts(newPage, activeTag, false)
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none }
                @keyframes toastIn {
                    from {
                        opacity:0;
                        transform:translateX(20px);
                    }
                    to {
                        opacity:1;
                        transform:translateX(0)
                    }
                }
                ::placeholder {
                    color: #9ca3af
                }
                .post-enter {
                    animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both;
                }
            `}</style>

            <ToastStack toasts={toasts} remove={removeToast} />

            <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
                <div className="max-w-2xl mx-auto px-5 lg:px-8 py-10" >

                    {/* Page header */}
                    <div className="mb-6 flex items-center justify-between" >
                        <div className="" >
                            <div className="flex items-center gap-2 mb-1" >
                                <FiZap size={18} className="text-indigo-500" />
                                <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >
                                    {isTrending ? "Latest posts" : "Latest posts"}
                                </h1>
                            </div>
                            <p className="text-sm text-gray-400 font-medium" >
                                Stories from the community
                            </p>
                        </div>
                        <div className="flex items-center gap-2" >
                            <button
                                onClick={() => navigate("/write")}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 shadow-sm
                        hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"

                            >
                                <FiEdit size={14} />
                                Write a Post
                            </button>
                            <button
                                onClick={() => navigate("/bookmarks")}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200
                            hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 text-gray-600
                            rounded-xl text-sm font-semibold transition"
                            >
                                <FiBookmark
                                    size={14}
                                />
                                Bookmarks
                            </button>
                            <button
                                onClick={toggleTrending}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition
                                    ${isTrending
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                                    }
                                `}
                            >
                                <FiTrendingUp size={14} />
                                Trending
                            </button>
                        </div>

                    </div>

                    {
                        !isTrending && (
                            <div className="mb-7" >
                                <TagFilter active={activeTag} onChange={handleTagChange} />
                            </div>
                        )
                    }

                    <div className="flex flex-wrap items-center gap-4 mb-6 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm" >
                        <div className="flex items-center gap-2" >
                            <label className="text-xs font-semibold text-gray-400" >Per Page</label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="text-sm font-semibold text-gray-600 bg-white border border-gray-200
                                rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            >
                                {[5, 10, 20, 50].map(n => (
                                    <option key={n} value={n} >{n}</option>
                                ))}
                            </select>
                        </div>
                        {isTrending && (
                            <div className="flex items-center gap-2" >
                                <label className="text-xs font-semibold text-gray-400" >TimeFrame</label>
                                <select
                                    value={days}
                                    onChange={(e) => setDays(Number(e.target.value))}
                                    className="text-sm font-semibold text-gray-600 bg-white border border-gray-200
                                    rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value={365}>This year</option>
                                    <option value={90}>Last 3 months</option>
                                    <option value={30}>This month</option>
                                    <option value={7}>This week</option>
                                    <option value={1}>Today</option>
                                </select>
                            </div>
                        )}
                        {!loading && !error && (
                            <span>
                                Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {/* Feed */}
                    {loading ? (
                        <div className="flex flex-col gap-5" >
                            {[1, 2, 3].map(i => (
                                <PostSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <ErrorState message={error} onRetry={() => fetchPosts(1, activeTag, false)} />
                    ) : posts.length === 0 ? (
                        <EmptyState tag={activeTag} />
                    ) : (
                        <>
                            <div className="flex flex-col gap-5" >
                                {posts.map((post, i) => (
                                    <div
                                        key={post.uuid}
                                        className="post-enter"
                                        style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}
                                    >
                                        <BlogPost
                                            post={post}
                                            onShare={handleShare}
                                        />
                                    </div>

                                ))}
                            </div>

                            {/* Load more */}
                            {hasMore && 0 && (
                                <div className="flex justify-center mb-8" >
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200
                                        hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50
                                        text-gray-600 rounded-2xl text-sm font-semibold transition-all duration-150
                                        disabled:opacity-50 shadow-sm"
                                    >
                                        {
                                            loadingMore
                                                ? <><FiLoader size={14} className="animate-spin" /> Loading...</>
                                                : <><FiChevronDown size={14} /> Load more</>
                                        }
                                    </button>
                                </div>
                            )}

                            {/* {!hasMore && posts.length > 0 && 0 && (
                                <p className="text-center text-[12.5px] text-gray-300 font-medium mb-8" >
                                    You've reached the end · {posts.length} post{posts.length !== 1 ? "s" : ""}
                                </p>
                            )} */}

                            <div className="flex mt-5 items-center justify-center gap-4 mb-8" >
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1 || loading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200
                                    hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50
                                    text-gray-600 rounded-xl text-sm font-semibold transition-all duration-150
                                    disabled:opacity-40"
                                >
                                    Prev
                                </button>
                                <div className="flex items-center gap-1.5" >
                                    <span className="text-sm font-medium text-gray-400" >
                                        Page {page}
                                    </span>
                                    <button
                                        onClick={() => goToPage(page + 1)}
                                        disabled={!hasMore || loading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200
                                    hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50
                                    text-gray-600 rounded-xl text-sm font-semibold transition-all duration-150
                                    disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
    )
}

export default Home