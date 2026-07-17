import React from "react"
import { FiLoader } from "react-icons/fi"

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel, loading }) {

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" >
                <h3 className="text-lg font-bold text-gray-900" >{title}</h3>
                <p className="mt-2 text-sm text-gray-600" >{message}</p>
                <div className="mt-6 flex justify-end gap-3" >
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700
                        hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white disabled:opacity-60 flex items-center gap-2
                            ${
                                danger
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                            }
                            `}
                    >
                        {
                            loading && (
                                <FiLoader
                                    size={14}
                                    className="animate-spin"
                                />
                            )
                        }
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )

}

export default ConfirmModal