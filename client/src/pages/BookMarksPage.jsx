import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
    FiBookmark, FiChevronDown,
    FiLoader, FiArrowLeft,
} from "react-icons/fi"
import { getBookmarks } from "../api/post.api.js"
import BlogPost from "../components/posts/BlogPost.jsx"
import PostSkeleton from "../components/posts/PostSkeleton.jsx"
import ErrorState from "../components/posts/ErrorState.jsx"
import EmptyState from "../components/posts/EmptyState.jsx"
import NormalisePost from "../components/posts/NormalisePost.jsx"
import ToastStack from "../components/ToastStack.jsx"

function BookMarksPage() {

    const navigate = useNavigate()
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, steLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [toasts, setToasts] = useState([])

    const LIMIT = 10

    const addToast = useCallback((message, type = "success") => {

        const id = Date.now()

        setToasts(p => [...p, { id, message, type }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)),4000)

    },[])

    const removeToast = useCallback((id) => {
        setToasts(p => p.filter(t => t.id !== id))
    },[])

    const fetchBookmarks = useCallback(async (pageNum, append = false) => {

        if (!append) setLoading(true)
        else steLoadingMore(true)

        setError(null)

        const res = await getBookmarks({ page: pageNum, limit: LIMIT })

        if (!append) setLoading(false)
        else steLoadingMore(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        const incoming = (res.data.posts ?? []).map(p => ({
            ...NormalisePost(p),
            isBookmarked: true,
        }))

        setPosts(prev => append ? [...prev, ...incoming] : incoming)
        setHasMore(incoming.length === LIMIT)

    },[])

    useEffect(() => {
        fetchBookmarks(1,false)
    },[fetchBookmarks])

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchBookmarks(nextPage, true)
    }

    const handleUnbookmark = (uuid) => {
        setPosts(prev => prev.filter(p => p.uuid !== uuid))
    }

    return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
            <ToastStack toasts={toasts} remove={removeToast} />
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
                        <FiBookmark size={18} className="text-amber-500" />
                        <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >
                            Your Bookmarks
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-medium" >
                        Posts you've saved to read later
                    </p>
                </div>

                {
                    loading
                        ? (
                            <div className="flex flex-col gap-5" >
                                {[1,2,3].map(i => <PostSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                            <ErrorState message={error} onRetry={() => fetchBookmarks(1, false)} />
                        ) : posts.length === 0 ? (
                            <EmptyState tag="" message="No bookmarks yet" />
                        ) : (
                            <>
                                <div className="flex flex-col gap-5" >
                                    {
                                        posts.map(post => (
                                            <BlogPost
                                                key={post.uuid}
                                                post={post}
                                                onShare={() => addToast("Link copied to clipboard")}
                                                onUnbookmark = {() => handleUnbookmark(post.uuid)}
                                            />
                                        ))
                                    }
                                </div>

                                {hasMore && (
                                    <div className="flex justify-center mb-8" >
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200
                                            hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50
                                            text-gray-600 rounded-2xl text-sm font-semibold transition-all duration-150 shadow-sm"
                                        >
                                            {
                                                loadingMore
                                                    ? <><FiLoader size={14} className="animate-spin" /> Loading...</>
                                                    : <><FiChevronDown size={14} /> Load More</>
                                            }
                                        </button>
                                    </div>
                                )}
                            </>
                        )
                }
            </div>
        </div>
    )

}

export default BookMarksPage