import React from "react"
import { FiLoader , FiZap } from "react-icons/fi"


function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">

                {/* Logo */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-700 flex items-center justify-center shadow-xl mb-6">
                    <FiZap className="text-white" size={36} />
                </div>

                {/* Spinner */}
                <div className="flex justify-center mb-5">
                    <FiLoader
                        size={34}
                        className="animate-spin text-indigo-600"
                    />
                </div>

                {/* Text */}
                <h2 className="text-2xl font-bold text-gray-900" >
                    Loading...
                </h2>

                <p className="text-gray-500 mt-2">
                    Please wait while we prepare everything for you
                </p>

                {/* Progress Bar */}
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-8 mx-auto">
                    <div className="h-full bg-indigo-600 rounded-full animate-pulse w-2/3" ></div>
                </div>

            </div>
        </div>
    )
}

export default Loading