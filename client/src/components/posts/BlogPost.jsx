import React , { useState } from "react"
import { AvatarGradient } from "../AvatarGradient.jsx"
import { Avatar } from "../Avatar.jsx"
import CommentInput from "./CommentInput.jsx"
import { FiBookmark, FiHeart, FiMessageCircle, FiMoreHorizontal, FiShare } from "react-icons/fi"

function BlogPost({ post, onShare }) {

    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post.likes)
    const [saved, setSaved] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState(post.comments)

    const gradient = AvatarGradient(post.author.firstName)

    const toggleLike = () => {
        setLiked(p => !p)
        setLikeCount(p => liked ? p-1 : p+1)
    }

    const toggleSave = () => {
        setSaved(p => !p)
    }

    const handleShare = () => {
        navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`).catch(() => {})
        onShare()
    }

    const addComment = (text) => {
        setComments(prev => [
            ...prev,
            {
                id: `local-${Date.now()}`,
                author: { firstName: "You" , lastName: "", username: "you",avatarURL: null },
                text,
                postedAt: "Just now",
            },
        ])
    }

    return (
        <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" >

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
                        <button>
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
                        onClick={toggleLike}
                        aria-label={liked ? "Unlike" : "Like"}
                        aria-pressed={liked}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                            transition-all duration-150 active:scale-95
                                ${
                                    liked
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
                        onClick={() => setShowComments(p => !p)}
                        aria-label="Toggle comments"
                        aria-expanded={showComments}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-95
                                ${
                                    showComments
                                        ? "bg-indigo-50 text-indigo-500 border border-indigo-100"
                                        : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-100"
                                }
                            `}
                    >
                        <FiMessageCircle size={14} />
                        {comments.length}
                    </button>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-1" >
                        <button
                            onClick={handleShare}
                            aria-label="Share post"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                                bg-gray-50 text-gray-500 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-100 transition-all duration-150 active:scale-95`}
                        >
                            <FiShare size={14} />
                            Share
                        </button>
                        {/* <button>
                            <FiBookmark/>
                        </button> */}
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-5 pt-4 border-t border-gray-50" >
                        {comments.length === 0 && (
                            <p className="text-[13px] text-gray-400 mb-3" >
                                No comments yet. Be the first!
                            </p>
                        )}
                        <div className="flex flex-col gap-3 mb-1" >
                            {comments.map(c => (
                                <div key={c.id} className="flex gap-3">
                                    <Avatar
                                        firstName={c.author.name}
                                        lastName={c.author.lastName}
                                        avatarURL={c.author.avatarURL}
                                        size="w-8 h-8"
                                        textSize="text-[10px]"
                                    />
                                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3" >
                                        <div className="flex items-baseline gap-2 mb-1" >
                                            <span className="text-[13px] font-bold text-gray-800" >
                                                {c.author.firstName} {c.author.lastName}
                                            </span>
                                            <span className="text-[11px] text-gray-400" >
                                                {c.postedAt}
                                            </span>
                                        </div>
                                        <p className="text-[13.5px] text-gray-600 leading-relaxed m-0" >
                                            {c.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <CommentInput onSubmit={addComment} />
                    </div>
                )}
            </div>

        </article>
    )

}

export default BlogPost