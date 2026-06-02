import React from "react"
import { Link } from "react-router-dom"
import { FiHome , FiArrowLeft , FiAlertTriangle } from "react-icons/fi"

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
                {/* Error Icon */}
                <div className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-8">
                    <FiAlertTriangle
                        size={48}
                        className="text-red-500"
                    />
                </div>
                {/* Error Code */}
                <h1 className="text-8xl md:text-9xl font-black text-gray-900 tracking-tight">
                    404
                </h1>
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-4">
                    Page Not Found
                </h2>
                {/* Description */}
                <p className="text-gray-500 text-lg mt-4 leading-relaxed">
                    The page you're looking for doesn't exist,
                    may have been moved, or the URL might be incorrect
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

                    <Link
                        to="/home"
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <FiHome/>
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <FiArrowLeft/>
                        Go Back
                    </button>

                </div>
            </div>
        </div>
    )
}

export default NotFoundPage