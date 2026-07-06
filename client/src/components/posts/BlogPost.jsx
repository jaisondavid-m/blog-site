import React, { useState, useEffect } from "react"
import { AvatarGradient } from "../AvatarGradient.jsx"
import { Avatar } from "../Avatar.jsx"
import CommentInput from "./CommentInput.jsx"
import { toggleLike as toggleLikeApi, toggleBookmarkApi, getComments, createComment } from "../../api/post.api.js"
import { FiBookmark, FiHeart, FiMessageCircle, FiMoreHorizontal, FiShare } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function BlogPost({ post, onShare }) {

    const navigate = useNavigate()
    const [liked, setLiked] = useState(post.isLiked ?? false)
    const [likeCount, setLikeCount] = useState(post.likes_count ?? 0)
    // const [saved, setSaved] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState(null)
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0)
    const [saved, setSaved] = useState(post.isBookmarked ?? false)

    const goToPost = () => {
        navigate(`/post/${post.uuid}`)
    }

    const stop = (fn) => (e) => {
        e.stopPropagation()
        fn()
    }

    const gradient = AvatarGradient(post.author.firstName)

    const toggleLike = async () => {

        const prevLiked = liked
        const prevCount = likeCount

        setLiked(p => !p)
        setLikeCount(p => prevLiked ? p - 1 : p + 1)

        const res = await toggleLikeApi(post.uuid)

        if (!res.success) {
            setLiked(prevLiked)
            setLikeCount(prevCount)
            return
        }

        setLiked(res.data.liked)
        setLikeCount(res.data.likes_count)
    }

    const toggleSave = async () => {

        const prev = saved

        setSaved(p => !p)

        const res = await toggleBookmarkApi(post.uuid)

        if (!res.success) {
            setSaved(prev)
            return
        }

        setSaved(res.data.bookmarked)
    }

    const handleShare = () => {
        navigator.clipboard?.writeText(`${window.location.origin}/post/${post.uuid}`).catch(() => { })
        onShare()
    }

    const addComment = async (text) => {

        const res = await createComment(post.uuid, text)

        if (!res.success) return

        setComments(prev => [
            ...(prev ?? []),
            {
                id: res.data.id,
                uuid: res.data.uuid,
                author: "You",
                comment_text: text,
                created_at: new Date().toISOString(),
                replies: [],
            },
        ])
        setCommentsCount(c => c + 1)
    }

    useEffect(() => {

        if (!showComments || comments !== null) return

        setCommentsLoading(true)

        getComments(post.uuid).then(res => {
            setCommentsLoading(false)
            if (res.success) setComments(res.data.comments ?? [])
        })

    }, [showComments])

    return (
        <article
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
            onClick={goToPost}
        >

            {/* Gradient accent bar */}
            {/* <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} /> */}

            <div className="px-7 pt-6 pb-6" >
                {/* Author row */}
                <div className="flex items-center justify-between mb-5" >
                    <div className="flex items-center gap-3" >
                        <Avatar
                            firstName={post.author.firstName}
                            lastName={post.author.lastName}
                            avatarURL={post.author.avatarURL}
                            size="w-10 h-10"
                            textSize="text-xs"
                        />
                        <div>
                            <p className="text-[14px] font-bold text-gray-900 font-['Plus_Jakarta_Sans'] leading-tight" >
                                {post.author.firstName} {post.author.lastName}
                            </p>
                            <p className="text-[12px] text-gray-400 font-medium">
                                @{post.author.username} · {post.publishedAt} · {post.readTime}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2" >
                        <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full
                                bg-indigo-50 text-indigo-500 border border-indigo-100"
                        >
                            {post.tag}
                        </span>
                        <button onClick={(e) => e.stopPropagation()} >
                            <FiMoreHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {/* Title + excerpt */}
                <h2 className="font-['Bricolage_Grotesque'] text-[20px] font-extrabold text-gray-900 tracking-tight leading-snug mb-2" >
                    {post.title}
                </h2>
                <p className="text-[14.5px] text-gray-500 leading-relaxed mb-5" >
                    {post.excerpt}
                </p>

                {/* Action bar */}
                <div className="flex items-center gap-1 pt-4 border-t border-gray-50" >

                    {/* Like */}
                    <button
                        onClick={stop(toggleLike)}
                        aria-label={liked ? "Unlike" : "Like"}
                        aria-pressed={liked}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                            transition-all duration-150 active:scale-95
                                ${liked
                                ? "bg-rose-50 text-rose-500 border border-rose-100"
                                : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-rose-50 hover:text-rose-400 hover:border-rose-100"
                            }
                            `}
                    >
                        <FiHeart size={14} style={{ fill: liked ? "currentColor" : "none" }} />
                        {likeCount}
                    </button>

                    {/* Comment */}
                    <button
                        onClick={stop(() => setShowComments(p => !p))}
                        aria-label="Toggle comments"
                        aria-expanded={showComments}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-95
                                ${showComments
                                ? "bg-indigo-50 text-indigo-500 border border-indigo-100"
                                : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-100"
                            }
                            `}
                    >
                        <FiMessageCircle size={14} />
                        {commentsCount}
                    </button>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-1" >
                        <button
                            onClick={stop(handleShare)}
                            aria-label="Share post"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                                bg-gray-50 text-gray-500 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-100 transition-all duration-150 active:scale-95`}
                        >
                            <FiShare size={14} />
                            Share
                        </button>
                        <button
                            onClick={stop(toggleSave)}
                            aria-label={saved ? "Remove bookmark" : "Bookmark"}
                            aria-pressed={saved}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                                transition-all duration-150 active:scale-95
                                    ${saved
                                    ? "bg-amber-50 text-amber-500 border border-amber-100"
                                    : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-amber-50 hover:text-amber-400 hover:border-amber-100"
                                }
                                `}
                        >
                            <FiBookmark
                                size={14}
                                style={{
                                    fill: saved ? "currentColor" : "none"
                                }}
                            />
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-5 pt-4 border-t border-gray-50" onClick={(e) => e.stopPropagation()} >
                        {comments === null || commentsLoading ? (
                            <p className="text-[13px] text-gray-400 mb-3" >
                                Loading comments...
                            </p>
                        ) : comments.length === 0 ? (
                            <p className="text-[13px] text-gray-400 mb-3" >
                                No comments yet. Be the first!
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3 mb-1" >
                                {comments.map(c => (
                                    <div key={c.id} className="flex gap-3">
                                        <Avatar
                                            firstName={c.author_name?.split(" ")[0]}
                                            lastName={c.author_name?.split(" ").slice(1).join(" ")}
                                            avatarURL={c.author_avatar}
                                            size="w-8 h-8"
                                            textSize="text-[10px]"
                                        />
                                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3" >
                                            <div className="flex items-baseline gap-2 mb-1" >
                                                <span className="text-[13px] font-bold text-gray-800" >
                                                    {c.author_name}
                                                </span>
                                                <span className="text-[11px] text-gray-400" >
                                                    {c.created_at}
                                                </span>
                                            </div>
                                            <p className="text-[13.5px] text-gray-600 leading-relaxed m-0" >
                                                {c.comment_text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <CommentInput onSubmit={addComment} />
                    </div>
                )}
            </div>

        </article>
    )

}

export default BlogPost