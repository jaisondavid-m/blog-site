import React from "react"
import {
    FiAlertCircle, 
    FiLoader
} from "react-icons/fi"
function ConfirmDeleteModal({ title, onConfirm, onCancel, deleting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm p-7" >
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4" >
                    <FiAlertCircle size={20} className="text-red-500" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-gray-900 mb-1" >
                    Delete this Post?
                </h3>
                <p className="text-sm text-gray-400 mb-6" >
                    "{title}" will be permanently removed. This can't be undone.
                </p>
                <div className="flex gap-3" >
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50
                        text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                    >   
                        {
                            deleting && (
                                <FiLoader size={13} className="animate-spin" />
                            )
                        }
                        {
                            deleting
                                ? "Deleting..."
                                : "Delete"
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeleteModal