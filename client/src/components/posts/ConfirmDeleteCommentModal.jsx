import React from "react"

function ConfirmDeleteCommentModal({
    open,
    title = "Are you sure?",
    description = "",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}) {

    if (!open) return null

    return (
        <div
            className="fixed inset-0 x-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl shadow-xl w-full max-w-sm p-5"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-[15px] font-bold text-gray-800 mb-1" >
                    {title}
                </h3>
                {
                    description && (
                        <p className="text-[13px] text-gray-500 mb-4 leading-relaxeed" >
                            {description}
                        </p>
                    )
                }
                <div className="flex justify-end gap-2 mt-2" >
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                        {
                            loading
                                ? "Deleting..."
                                : confirmLabel
                        }
                    </button>   
                </div>
            </div>
        </div>
    )

}

export default ConfirmDeleteCommentModal