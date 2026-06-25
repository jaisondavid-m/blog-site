import React from "react"
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi"

function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center" >
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4" >
                <FiAlertCircle size={24} className="text-red-400" />
            </div>
            <p className="text-[15px] font-bold text-gray-700 mb-1" >Something went wrong</p>
            <p className="text-[13px] text-gray-400 mb-5" >{message}</p>
            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm 
                font-semibold transition"
            >
                <FiRefreshCw size={13} />
                Try again
            </button>
        </div>
    )
}

export default ErrorState