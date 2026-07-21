import React, { useEffect, useState } from "react"
import { getPost } from "../../api/post.api.js"
import {
    FiX, FiLoader, FiAlertCircle,
    FiTrash2, FiExternalLink,
    FiTrash, FiCheck
} from "react-icons/fi"
import { adminDeletePost } from "../../api/admin.api.js"
import { dismissReport } from "../../api/report.api.js"

const reasonLabels = {
    spam: "Spam",
    harassment: "Harassment",
    hate_speech: "Hate Speech",
    misinformation: "Misinformation",
    nudity: "Nudity",
    violence: "Violence",
    other: "Other",
}

function ReportDetailModal({ report, onClose, onDeleted, onDismissed }) {

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [dismissing, setDismissing] = useState(false)

    useEffect(() => {

        if (!report) return

        let cancelled = false

        setLoading(true)
        setError(null)
        setPost(null)
        setConfirmingDelete(false)

        getPost(report.post_uuid).then(res => {

            if (cancelled) return
            setLoading(false)

            if (!res.success) {
                setError(res.error)
                return
            }

            setPost(res.data.post)

        })

        return () => { cancelled = true }

    }, [report])

    if (!report) return null

    const handleDelete = async () => {

        setDeleting(true)

        const res = await adminDeletePost(report.post_uuid)

        setDeleting(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        onDeleted(report)

    }

    const handleDismiss = async () => {

        setDismissing(true)

        const res = await dismissReport(report.uuid)

        setDismissing(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        onDismissed(report)

    }

    const canModerate = report.status === "pending"

    return (
        <div className="fixed inset-0 z-50 flex items-center justity-center bg-black/40 px-4" >
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" >
                    <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-gray-900" >
                        Repoort Details
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700"
                    >
                        <FiX size={18} />
                    </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto flex-1" >
                    <div className="mb-5 flex flex-wrap gap-2" >
                        <span className="text-[11px] font-bold uppercase tracking-wide px-2.5
                        py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100" >
                            {reasonLabels[report.reason] || report.reason}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 
                        rounded-full bg-gray-50 text-gray-500 border border-gray-100" >
                            {report.status}
                        </span>
                    </div>
                    <div className="mb-5" >
                        <p className="text-[12px] font-semibold text-gray-400 mb-1" >
                            Reported by
                        </p>
                        <p className="text-sm font-semibold text-gray-800" >
                            {report.reporter_name}
                        </p>
                    </div>
                    {
                        report.description && (
                            <div className="mb-5" >
                                <p className="text-[12px] font-semibold text-gray-400 mb-1" >
                                    Reporter's not
                                </p>
                                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5" >
                                    {report.description}
                                </p>
                            </div>
                        )
                    }

                    <div className="border-t border-gray-100 pt-5" >
                        <p className="text-[12px] font-semibold text-gray-400 mb-2" >
                            Reported post
                        </p>

                        {loading ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-4" >
                                <FiLoader className="animate-spin" size={14} />
                                Loading post...
                            </div>
                        ) : error ? (
                            <div className="flex items-center gap-2 text-rose-500 text-sm py-4" >
                                <FiAlertCircle size={14} />
                                {error}
                            </div>
                        ) : post ? (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4" >
                                <p className="font-bold text-gray-900" >{post.title}</p>
                                {post.excerpt && (
                                    <p className="text-[13px] text-gray-500 mb-2" >
                                        {post.excerpt}
                                    </p>
                                )}
                                <p className="text-[12px] text-gray-400" >
                                    by {post.author_name}
                                </p>
                                <a
                                    href={`/post/${post.uuid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 mt-3"
                                >
                                    <FiExternalLink size={13} />
                                    View full post
                                </a>
                            </div>
                        ) : null}

                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2" >
                        {canModerate && (
                            <button
                                onClick={handleDismiss}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600
                            bg-white border border-gray-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {
                                    dismissing ? (
                                        <FiLoader size={14} className="animate-spin" />
                                    ) : (
                                        <FiCheck size={14} />
                                    )
                                }
                                Dismiss report
                            </button>
                        )}
                        {!confirmingDelete ? (
                            <button
                                onClick={() => setConfirmingDelete(true)}
                                disabled={loading || !post}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm
                                font-semibold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
                            >
                                <FiTrash2 size={14} />
                                Delete post
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 " >
                                <button
                                    onClick={() => setConfirmingDelete(false)}
                                    disabled={deleting}
                                    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm 
                                    font-semibold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50"
                                >
                                    {
                                        deleting ? (
                                            <FiLoader size={14} className="animate-spin" />
                                        ) : (
                                            <FiTrash2 size={14} />
                                        )
                                    }
                                    Confirm Delete
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )

}

export default ReportDetailModal