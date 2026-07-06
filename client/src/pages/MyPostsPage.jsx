import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
    FiFileText, FiEdit2, FiTrash2, FiEye, FiHeart, FiMessageCircle,
    FiChevronDown, FiLoader, FiArrowLeft, FiPlus, FiGlobe, FiArchive,
    FiAlertTriangle,
} from "react-icons/fi"
import { getMyPosts, deletePost, updatePostStatus } from "../api/post.api.js"
import ToastStack from "../components/ToastStack.jsx"
import { STATUS_TABS } from "../data/Status_Tab.js"
import PostSkeleton from "../components/posts/PostSkeleton.jsx"
import ErrorState from "../components/posts/ErrorState.jsx"
import EmptyState from "../components/posts/EmptyState.jsx"
import MyPostRow from "../components/posts/MyPostRow.jsx"
import ConfirmDeleteModal from "../components/posts/ConfirmDeleteModal.jsx"


function MyPostsPage() {

    const navigate = useNavigate()
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [activeStatus, setActiveStatus] = useState("")
    const [toasts, setToasts] = useState([])
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [busyUuid, setBusyUuid] = useState(null)

    const LIMIT = 10

    const addToast = useCallback((message, type = "success") => {

        const id = Date.now()
        setToasts(p => [...p, { id, message, type }])
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)

    },[])

    const removeToast = useCallback((id) => {
        setToasts(p => p.filter(t => t.id !== id))
    },[])

    const fetchMyPosts = useCallback(async (pageNum, status, append = false) => {

        if (!append) setLoading(true)
        else setLoadingMore(true)

        setError(null)

        const res = await getMyPosts({ page: pageNum, limit: LIMIT, status })

        if (!append) setLoading(false)
        else  setLoadingMore(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        const incoming = res.data.posts ?? []

        setPosts(prev => append ? [...prev, ...incoming] : incoming)
        setHasMore(incoming.length === LIMIT)

    },[])

    useEffect(() => {
        setPage(1)
        setPosts([])
        setHasMore(true)
        fetchMyPosts(1, activeStatus, false)
    }, [activeStatus, fetchMyPosts])

    const handleLoadMore = () => {

        const nextPage = page + 1
        setPage(nextPage)
        fetchMyPosts(nextPage, activeStatus, true)

    }

    const handleDelete = async () => {

        if (!deleteTarget) return

        setDeleting(true)

        const res = await deletePost(deleteTarget.uuid)
        setDeleting(false)

        if (!res.success) {
            addToast(res.error || "Failed to delete post", "error")
            return
        }

        setPosts(prev => prev.filter(p => p.uuid !== deleteTarget.uuid))
        addToast("Post Deleted")
        setDeleteTarget(null)

    }

    const handleToggleStatus = async (post) => {

        const nextStatus = post.status === "published" ? "draft" : "published"

        setBusyUuid(post.uuid)

        const res = await updatePostStatus(post.uuid, nextStatus)
        setBusyUuid(null)

        if (!res.success) {
            addToast(res.error || "Failed to update post", "error")
            return
        }     

        setPosts(prev => prev.map(p => p.uuid === post.uuid ? { ...p, status: nextStatus } : p )) 
        addToast(nextStatus === "published" ? "Post Published" : "Moved to drafts")

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
                <div className="mb-7 flex items-center justify-between" >
                    <div>
                        <div className="flex items-center gap-2 mb-1" >
                            <FiFileText size={18} className="text-indigo-500" />
                            <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 trackinng-tight" >
                                My Posts
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 font-medium" >
                            Manage everything you've written
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/write")}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 shadow-sm hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                    >
                        <FiPlus size={14} />
                        New Post
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-7 overflow-x-auto scrollbar-none" >
                    {
                        STATUS_TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveStatus(tab.key)}
                                className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap border transition
                                        ${
                                            activeStatus === tab.key
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                        }
                                    `}
                            >
                                {tab.label}
                            </button>
                        ))
                    }
                </div>

                {
                    loading ? (
                        <div className="flex flex-col gap-5" >
                            {[1,2,3].map(i => <PostSkeleton key={i} />)}
                        </div>
                    ) : error ? (
                        <ErrorState message={error} onRetry={() => fetchMyPosts(1, activeStatus, false)} />
                    ) : posts.length === 0 ? (
                        <EmptyState tag="" message="No posts here yet" />
                    ) : (
                        <> 
                            <div className="flex flex-col gap-5" >
                                {
                                    posts.map(post => (
                                        <MyPostRow
                                            key={post.uuid}
                                            post={post}
                                            busy={busyUuid === post.uuid}
                                            onView={() => navigate(`/post/${post.uuid}`)}
                                            onEdit={() => navigate(`/write?edit=${post.uuid}`)}
                                            onDelete={() => setDeleteTarget(post)}
                                            onToggleStatus={() => handleToggleStatus(post)}
                                        />
                                    ))
                                }
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mb-8 mt-2" >
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
                                                ? <><FiLoader size={14} className="animmate-spin" /> Loading...</>
                                                : <><FiChevronDown size={14} /> Load more</>
                                        }
                                    </button>
                                </div>
                            )}
                        </>
                    )
                }
            </div>

            {
                deleteTarget && (
                    <ConfirmDeleteModal
                        title={deleteTarget.title}
                        deleting={deleting}
                        onCancel={() => setDeleteTarget(null)}
                        onConfirm={handleDelete}
                    />
                )
            }
        </div>
    )
}

export default MyPostsPage