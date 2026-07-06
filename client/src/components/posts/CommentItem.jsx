import React, { useState } from "react"
import { Avatar } from "../Avatar.jsx"
import CommentInput from "./CommentInput.jsx"
import { updateComment } from "../../api/post.api.js"
import { FiEdit2 } from "react-icons/fi"

function formatDate(iso) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function CommentItem({ comment, postUuid, onReply, currentUserId, depth = 0 }) {

    const [showReplyBox, setShowReplyBox] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(comment.comment_text)
    const [text, setText] = useState(comment.comment_text)
    const [saving, setSaving] = useState(false)

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

    const [firstName, ...rest] = (comment.author_name ?? "").split(" ")
    const lastName = rest.join(" ")

    return (
        <div className="flex gap-3" >
            <Avatar
                firstName={firstName}
                lastName={lastName}
                avatarURL={comment.author_avatar}
                size="w-8 h-8"
                textSize="text-[10px]"
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
                            <button
                                onClick={() => {
                                    setEditText(text)
                                    setIsEditing(true)
                                }}
                                className="ml-auto text-gray-300 hover:text-indigo-500"
                                aria-label="Edit comment"
                            >
                                <FiEdit2 size={12} />
                            </button>
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
                            <p className = "text-[13.5px] text-gray-600 leading-relaxed m-0" >
                                {text}
                            </p>
                        )
                    }

            </div>

            {depth < 4 && (
                <button
                    onClick={() => setShowReplyBox(p => !p)}
                    className="text-[12px] font-semibold text-gray-400 hover:text-indigo-500 mt-1.5 ml-1"
                >
                    Reply
                </button>
            )}

            {showReplyBox && (
                <div className="mt-2" >
                    <CommentInput onSubmit={handleReplySubmit} autoFocus="true" />
                </div>
            )}

            {
                comment.replies?.length > 0 && (
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
                )
            }

        </div>
        </div >
    )

}

export default CommentItem