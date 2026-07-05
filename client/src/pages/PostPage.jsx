import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Avatar } from "../components/Avatar.jsx"
import { AvatarGradient } from "../components/AvatarGradient.jsx"
import { getPost, toggleBookmarkApi, toggleLike as toggleLikeApi } from "../api/post.api.js"

import PostPageSkeleton from "../components/posts/PostPageSkeleton.jsx"
import StatPill from "../components/posts/StatPill.jsx"

import {
    FiArrowLeft, FiHeart, FiMessageCircle, FiShare,
    FiEye, FiLoader, FiAlertCircle, FiCalendar, FiClock,
    FiBookmark
} from "react-icons/fi"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

function PostPage() {

    const { uuid } = useParams()
    const navigate = useNavigate()

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [copied, setCopied] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)


    useEffect(() => {

        let cancelled = false
        setLoading(true)
        setError(null)

        getPost(uuid).then(res => {

            if (cancelled) return

            setLoading(false)

            if (!res.success) {
                setError(res.error)
                return
            }

            const p = res.data.post

            setPost(p)
            setLiked(p.is_liked)
            setLikeCount(p.likes_count)
            setBookmarked(p.is_bookmarked)

        })

        return () => { cancelled = true }

    }, [uuid])

    useEffect(() => {

        if (!post) return

        const timer = setTimeout(() => {
            document.querySelectorAll(".prose-content img").forEach(img => {
                if (!img.complete || img.naturalWidth === 0) {
                    img.style.display = "none"
                }
                img.onerror = () => {
                    img.style.display = "none"
                }
            })
        },100)

        return () => clearTimeout(timer)

    }, [post])

    const toggleLike = async () => {

        const prevLiked = liked
        const prevCount = likeCount

        setLiked(p => !p)
        setLikeCount(p => prevLiked ? p - 1 : p + 1)

        const res = await toggleLikeApi(uuid)

        if (!res.success) {
            setLiked(prevLiked)
            setLikeCount(prevCount)
            return
        }

        setLiked(res.data.liked)
        setLikeCount(res.data.likes_count)

    }

    const toggleBookmark = async () => {

        const prev = bookmarked

        setBookmarked(p => !p)

        const res = await toggleBookmarkApi(uuid)

        if (!res.success) {
            setBookmarked(prev)
            return 
        }

        setBookmarked(res.data.bookmarked)

    }

    const handleShare = () => {
        navigator.clipboard?.writeText(window.location.href).catch(() => { })
        setCopied(true)
        setTimeout(() =>
            setCopied(false)
            , 2000)
    }

    const formatDate = (iso) => {
        if (!iso) return ""
        return new Date(iso).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
        })
    }

    const estimateReadTime = (content = "") => {
        const words = content.trim().split(/\s+/).length
        return `${Math.max(1, Math.round(words / 200))} min read`
    }

    const gradient = AvatarGradient(post?.author_name?.split(" ")[0] ?? "")

    if (loading) return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
            <PostPageSkeleton />
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] flex items-center justify-center" >
            <div className="text-center bg-white rounded-3xl border border-gray-100 p-12 shadow-sm max-w-sm mx-4" >
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4" >
                    <FiAlertCircle size={24} className="text-red-400" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold text-gray-900 mb-2" >
                    Post not found
                </h3>
                <p className="text-sm text-gray-400 mb-6" >
                    {error}
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Back to home
                </button>
            </div>
        </div>
    )

    const [firstName, ...rest] = (post.author_name ?? "").split(" ")
    const lastName = rest.join(" ")
    const readTime = estimateReadTime(post.content)


    const avatarSrc = post.author_avatar ? `${BASE_URL}${post.author_avatar}` : null
    const coverSrc = post.cover_image ? `${BASE_URL}${post.cover_image}` : null

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap')
                    @keyframes fadeUp {
                        from { opacity:0; transform:translateY(14px); }
                        to   { opacity:1; transform:translateY(0); }
                    }
                    .fade-up {
                        animation: fadeUp 0.4s cubic-bezier(0.22,1,0,36,1) both;
                    }
                    .fade-up-1 {
                        animation-delay: 0.05s;
                    }
                    .fade-up-2 {
                        animation-delay: 0.1s;
                    }
                    .prose-content p{
                        margin-bottom: 1.25rem;
                        line-height: 1.8;
                        color: #374151;
                        font-size: 16px;
                    }
                    .prose-content h1 {
                        font-size: 1.75em;
                        font-weight: 800;
                        margin: 2rem 0 0.75rem;
                        color: #111827;
                        font-family: 'Bricolage Grotesque','sans-serif';
                    }
                    .prose-content h2 {
                        font-size: 1.35rem;
                        font-weight: 700;
                        margin: 1.75rem 0 0.6rem;
                        color: #111827;
                        font-family: 'Bricolage Grotesque','sans-serif';
                    }
                    .prose-content h3 {
                        font-size: 1.1rem;
                        font-weight: 700;
                        margin: 1.5rem 0 0.5rem;
                        color: #111827;
                    }
                    .prose-content ul{
                        list-style: disc;
                        padding-left: 1.5rem;
                        margin-bottom: 1.25rem;
                        color: #374151;
                    }
                    .prose-content ol {
                        list-style: decimal;
                        padding-left: 1.5rem;
                        margin-bottom: 1.25rem;
                        color: #374151;
                    }
                    .prose-content li {
                        margin-bottom: 0.4rem;
                        line-height: 1.7;
                        font-size: 16px;
                    }
                    .prose-content a {
                        color: #4f46e5;
                        text-decoration: underline;
                    }
                    .prose-content blockquote {
                        border-left: 3px solid #e0e7ff;
                        padding-left: 1.25rem;
                        margin: 1.5rem 0;
                        color: #4f46e5;
                        font-family: monospace;
                    }
                    .prose-content code {
                        background: #1e1e2e;
                        border-radius: 14px;
                        padding: 2px 6px;
                        font-size: 14px;
                        color: #4f46e5;
                        font-family: monospace;
                    }
                    .prose-content pre {
                        background: #1e1e2e;
                        border-radius: 14px;
                        padding: 1.25rem;
                        margin-bottom: 1.5rem;
                        overflow-x: auto;
                    }
                    .prose-content pre code {
                        background: none;
                        color: #cdd6f4;
                        padding: 0;
                        font-size: 14px;
                    }
                    .prose-content hr {
                        border: none;
                        border-top: 1px solid #f3f4f6;
                        margin: 2rem
                    }
                    .prose-content img {
                        max-width: 100%;
                        border-radius: 12px;
                        margin: 1rem 0;
                    }
                    .prose-content img[alt]::before {
                        display: none;
                    }
                    .prose-content img[src=""] {
                        display: none;
                    }
                `}
            </style>
            <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100" >
                    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between" >
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
                        >
                            <FiArrowLeft size={15} />
                            Back
                        </button>
                        <div className="flex items-center gap-2" >
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold
                                    transition-all duration-150 active:scale-95 border
                                        ${liked
                                        ? "bg-rose-50 text-rose-500 border-rose-100"
                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-rose-50 hover:text-rose-400 hover:border-rose-100"
                                    }
                                    `}
                            >
                                <FiHeart
                                    size={13}
                                    style={{
                                        fill: liked ? "currentColor" : "none"
                                    }}
                                />
                                {likeCount}
                            </button>
                            <button
                                onClick={handleShare}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold
                                    border transition-all duration-150 active:scale-95
                                        ${copied
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-100"
                                    }
                                    `}
                            >
                                <FiShare size={13} />
                                {copied ? "Copied!" : "Share"}
                            </button>
                            <button
                                onClick={toggleBookmark}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold
                                    transition-all duration-150 active:scale-95 border
                                        ${
                                            bookmarked
                                                ? "bg-amber-50 text-amber-500 border-amber-500"
                                                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-amber-50 hover:text-amber-400 hover:border-amber-100"
                                        }
                                    `}
                            >
                                <FiBookmark
                                    size={13}
                                    style={{
                                        fill: bookmarked
                                            ? "currentColor"
                                            : "none"
                                    }}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <article className="max-w-2xl mx-auto px-5 lg:px-8 py-10" >
                    <div className="fade-up mb-5" >
                        <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full
                        bg-indigo-50 text-indigo-500 border border-indigo-100" >
                            {post.tag || "General"}
                        </span>
                    </div>
                    <h1 className="fade-up font-['Bricolage_Grotesque'] text-[32px] leading-tight font-extrabold text-gray-900 tracking-tight mb-4" >
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="fade-up text-[17px] text-gray-500 leading-relaxed mb-6 font-medium" >
                            {post.excerpt}
                        </p>
                    )}

                    {/* Author + meta row */}
                    <div className="fade-up fade-up-1 flex items-center justify-between mb-8 pb-6 border-b border-gray-100" >
                        <div className="flex items-center gap-3" >
                            <Avatar
                                firstName={firstName}
                                lastName={lastName}
                                avatarURL={avatarSrc}
                                size="w-10 h-10"
                                textSize="text-xs"
                            />
                            <div>
                                <p className="text-[14px] font-bold text-gray-900 leading-tight" >
                                    {post.author_name}
                                </p>
                                <p className="text-[12px] text-gray-400 font-medium" >
                                    {formatDate(post.published_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3" >
                            <StatPill icon={FiClock} value={readTime} />
                            <StatPill icon={FiEye} value={post.views_count} />
                        </div>
                    </div>

                    {
                        coverSrc && (
                            <div className="fade-up fade-up-1 mb-8" >
                                <img
                                    src={coverSrc}
                                    alt={post.title}
                                    className="w-full rounded-2xl object-cover max-h-80 shadow-sm"
                                />
                            </div>
                        )
                    }

                    <div
                        className="fade-up fade-up-2 prose-content"
                        dangerouslySetInnerHTML={{
                            __html: post.content.replace(
                                /src="\/uploads\//g,
                                `src="${BASE_URL}/uploads"`
                            )
                        }}
                    />

                    <div className="mt-12 pt-6 border-t border-gray-100 flex items-center gap-3" >
                        <button
                            onClick={toggleLike}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                                transition-all duration-150 active:scale-95 border
                                    ${liked
                                    ? "bg-rose-50 text-rose-500 border-rose-100"
                                    : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-rose-50 hover:text-rose-400 hover:border-rose-100"
                                }
                                `}
                        >
                            <FiHeart size={14} style={{ fill: liked ? "currentColor" : "none" }} />
                            {liked ? "Liked" : "Like"} · {likeCount}
                        </button>
                        <button
                            onClick={handleShare}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                                border transition-all duration-150 active:scale-95
                                    ${copied
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-100"
                                }
                                `}
                        >
                            <FiShare size={14} />
                            {copied ? "Link copied!" : "Share"}
                        </button>
                    </div>
                </article>
            </div>
        </>
    )

}

export default PostPage