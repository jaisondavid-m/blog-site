import React, { useState } from "react"
import { Avatar } from "../Avatar.jsx"
import CommentInput from "./CommentInput.jsx"
import ConfirmDeleteCommentModal from "./ConfirmDeleteCommentModal.jsx"
import { updateComment, deleteComment, toggleCommentLike } from "../../api/post.api.js"
import { FiEdit2, FiTrash2, FiHeart } from "react-icons/fi"

// import ConfirmDeleteCommentModal from "./ConfirmDeleteCommentModal.jsx"

function formatDate(iso) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function countAllReplies(comment) {
    if (!comment.replies || comment.replies.length === 0) return 0
    return comment.replies.reduce((sum, r) => sum + 1 + countAllReplies(r), 0)
}

function CommentItem({ comment, postUuid, onReply, onDelete, currentUserId, depth = 0 }) {

    const [showReplies, setShowReplies] = useState(false)
    const [showReplyBox, setShowReplyBox] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(comment.comment_text)
    const [text, setText] = useState(comment.comment_text)
    const [saving, setSaving] = useState(false)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const [liked, setLiked] = useState(comment.liked ?? false)
    const [likesCount, setLikesCount] = useState(comment.likes_count ?? 0)
    const [likeBusy, setLikeBusy] = useState(false)

    const totalReplies = countAllReplies(comment)

    const isOwner = currentUserId != null && comment.user_id === currentUserId

    const handleReplySubmit = async (text) => {
        await onReply(text, comment.id)
        setShowReplyBox(false)
    }

    const handleSaveEdit = async () => {

        if (!editText.trim() || editText === text) {
            setIsEditing(false)
            return
        }
        setSaving(false)

        const res = await updateComment(comment.uuid, editText.trim())
        setSaving(false)

        if (!res.success) return

        setText(editText.trim())
        setIsEditing(false)

    }

    const handleDeleteConfirm = async () => {

        setDeleting(true)

        const res = await deleteComment(comment.uuid)

        setDeleting(false)

        if (!res.success) {
            setShowDeleteModal(false)
            return
        }

        setShowDeleteModal(false)
        onDelete?.(comment.id)

    }

    const handleToggleLike = async () => {

        if (likeBusy) return

        setLikeBusy(true)

        const prevLiked = liked
        const prevCount = likesCount

        setLiked(!prevLiked)
        setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)

        const res = await toggleCommentLike(comment.uuid)

        setLikeBusy(false)

        if (!res.success) {
            setLiked(prevLiked)
            setLikesCount(prevCount)
            return
        }

        setLiked(res.data.liked)
        setLikesCount(res.data.likes_count)

    }

    const [firstName, ...rest] = (comment.author_name ?? "").split(" ")
    const lastName = rest.join(" ")

    return (
        <div className="flex gap-3" >
            <Avatar
                firstName={firstName}
                lastName={lastName}
                avatarURL={comment.author_avatar}
                size={depth > 0 ? "w-6 h-6" : "w-8 h-8"}
                textSize="text-[9px]"
            />
            <div className="flex-1" >
                <div className="bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3" >
                    <div className="flex items-baseline gap-2 mb-1" >
                        <span className="text-[13px] font-bold text-gray-800" >
                            {comment.author_name}
                        </span>
                        <span className="text-[11px] text-gray-400" >
                            {formatDate(comment.created_at)}
                        </span>
                        {isOwner && !isEditing && (
                            <div className="ml-auto flex items-center gap-2" >
                                <button
                                    onClick={() => {
                                        setEditText(text)
                                        setIsEditing(true)
                                    }}
                                    className="text-gray-300 hover:text-indigo-500"
                                    aria-label="Edit comment"
                                >
                                    <FiEdit2 size={12} />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-gray-300 hover:text-red-500"
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {
                        isEditing ? (
                            <div className="mt-1" >
                                <textarea
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    rows={2}
                                    className="w-full text-[13.5px] text-gray-700 border border-gray-200 rounded-xl p-2
                                    outline-none focus:border-indigo-400 resize-none"
                                />
                                <div className="flex gap-2 mt-1.5" >
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        className="text-[12px] font-semibold text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                                    >
                                        {
                                            saving
                                                ? "Saving..."
                                                : "Save"
                                        }
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="text-[12px] font-semibold text-gray-400 hover:text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[13.5px] text-gray-600 leading-relaxed m-0" >
                                {text}
                            </p>
                        )
                    }

                </div>

                {depth < 4 && (
                    <div className="flex items-center gap-3 mt-1.5 ml-1" >
                        <button
                            onClick={handleToggleLike}
                            disabled={likeBusy}
                            aria-label={liked ? "Unlike comment" : "Like comment"}
                            className={`flex items-center gap-1 text-[12px] font-semibold transition-colors
                                ${liked
                                    ? "text-red-500"
                                    : "text-gray-500 hover:text-red-500"
                                }
                            `}
                        >
                            <FiHeart size={12} className={liked ? "fill-red-500" : ""} />
                            {
                                likesCount > 0 && (
                                    <span>
                                        {likesCount}
                                    </span>
                                )
                            }
                        </button>
                        <button
                            onClick={() => setShowReplyBox(p => !p)}
                            className="text-[12px] font-semibold text-gray-400 hover:text-indigo-500 mt-1.5 ml-1"
                        >
                            Reply
                        </button>
                    </div>
                )}

                {showReplyBox && (
                    <div className="mt-2" >
                        <CommentInput onSubmit={handleReplySubmit} autoFocus="true" />
                    </div>
                )}

                {
                    comment.replies?.length > 0 && (
                        <div className="mt-2" >
                            {
                                !showReplies ? (
                                    <button
                                        onClick={() => setShowReplies(true)}
                                        className="flex items-center gap-2 text-[12.5px] font-bold text-indigo-500
                                        hover:text-indigo-700 ml-1 transition-colors"
                                    >
                                        <span className="w-5 h-px bg-indigo-300" />
                                        View {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setShowReplies(false)}
                                            className="flex items-center gap-2 text-[12.5px] font-bold text-gray-400
                                            hover:text-gray-600 mb-2.5 ml-1 transition-colors"
                                        >
                                            <span className="w-5 h-px bg-gray-300" />
                                            Hide {totalReplies === 1 ? "reply" : "replies"}
                                        </button>
                                        <div className="flex flex-col gap-3 mt-3 pl-4 border-l-2 border-gray-100" >
                                            {
                                                comment.replies.map(r => (
                                                    <CommentItem
                                                        key={r.id}
                                                        comment={r}
                                                        postUuid={postUuid}
                                                        onReply={onReply}
                                                        currentUserId={currentUserId}
                                                        depth={depth + 1}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </>
                                )
                            }
                        </div>

                    )
                }

                <ConfirmDeleteCommentModal
                    open={showDeleteModal}
                    title="Delete comment?"
                    description="This will permanently remove your comment. This can't be undone."
                    confirmLabel="Delete"
                    loading={deleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                />

            </div>
        </div >
    )

}

export default CommentItem