import React, { useState } from "react"
import {
    FiFlag, FiX, FiCheck, FiAlertCircle
} from "react-icons/fi"
import { reportPost } from "../../api/report.api.js"
import ReportForm from "../posts/ReportForm.jsx"

const REASONS = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "hate_speech", label: "Hate speech" },
    { value: "misinformation", label: "Misinformation" },
]

function ReportPostModal({ open , postUuid, onClose }) {

    const [reason, setReason] = useState("spam")
    const [description, setDescription] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)

    if (!open) return null

    const reset = () => {
        setReason("spam")
        setDescription("")
        setResult(null)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleSubmit = async () => {

        setSubmitting(true)
        const res = await reportPost(postUuid, reason, description.trim())
        setSubmitting(false)

        if (!res.success) {
            setResult({ success: false, message: res.error })
            return
        }

        setResult({ success: true, message: "Reported submitted. Thanks for flagging this." })
        setTimeout(handleClose,1600)

    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-sm p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4" >
                    <div className="flex items-center gap-2" >
                        <FiFlag size={16} className="text-rose-500" />
                        <h3 className="font-['Bricolage_Grotesque'] text-[16px] font-bold text-gray-900" >
                            Report Post
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-300 hover:text-gray-500"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {result ? (
                    <div className={`flex items-start gap-2 text-[13.5px] rounded-xl p-3
                            ${
                                result.success
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-500"
                            }
                        `}
                    >
                        {
                            result.success ? (
                                <FiCheck size={16} className="mt-0.5" />
                            ) : (
                                <FiAlertCircle size={16} className="mt-0.5" />
                            )
                        }
                        <span>{result.message}</span>                        
                    </div>
                ) : (
                    <ReportForm
                        reason={reason}
                        setReason={setReason}
                        description={description}
                        setDescription={setDescription}
                        handleClose={handleClose}
                        handleSubmit={handleSubmit}
                        submitting={submitting}
                        REASONS={REASONS}
                    />
                )}

            </div>
        </div>
    )

}

export default ReportPostModal