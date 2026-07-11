import React, { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BlogPost from "../components/posts/BlogPost.jsx"
import ToastStack from "../components/ToastStack.jsx"
import { DUMMY_POST } from "../data/DummyData.js"
import {
    FiZap, FiLoader, FiAlertCircle,
    FiRefreshCw, FiInbox, FiChevronDown,
    FiEdit,
    FiBookmark,
} from "react-icons/fi"

import { getPosts } from "../api/post.api.js"
import TagFilter from "../components/posts/TagFilter.jsx"
import PostSkeleton from "../components/posts/PostSkeleton.jsx"
import ErrorState from "../components/posts/ErrorState.jsx"
import EmptyState from "../components/posts/EmptyState.jsx"
import NormalisePost from "../components/posts/NormalisePost.jsx"

function Home() {

    // const posts = DUMMY_POST
    const navigate = useNavigate()
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [activeTag, setActiveTag] = useState("")
    const [toasts, setToasts] = useState([])

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

        const res = await getPosts({ page: pageNum, limit: LIMIT, tag })

        if (!append) setLoading(false)
        else setLoadingMore(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        const incoming = (res.data.posts ?? []).map(NormalisePost)
        setPosts(prev => append ? [...prev, ...incoming] : incoming)
        setHasMore(incoming.length === LIMIT)
    }, [])

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchPosts(nextPage, activeTag, true)
    }

    const handleShare = useCallback(() => {
        addToast("Link copied to clipboard", "success")
    }, [addToast])

    const handleTagChange = (tag) => {
        setActiveTag(tag)
    }

    useEffect(() => {
        setPage(1)
        setPosts([])
        setHasMore(true)
        fetchPosts(1, activeTag, false)
    }, [activeTag, fetchPosts])

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
                                    Latest posts
                                </h1>
                            </div>
                            <p className="text-sm text-gray-400 font-medium" >
                                Stories from the community
                            </p>
                        </div>
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
                    </div>


                    <div className="mb-7" >
                        <TagFilter active={activeTag} onChange={handleTagChange} />
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
                            {hasMore && (
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

                            {!hasMore && posts.length > 0 && (
                                <p className="text-center text-[12.5px] text-gray-300 font-medium mb-8" >
                                    You've reached the end · {posts.length} post{posts.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </>
                    )}

                </div>
            </div>
        </>
    )
}

export default Home