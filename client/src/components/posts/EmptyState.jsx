import React from "react"
import { FiInbox } from "react-icons/fi"

function EmptyState({ tag }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center" >
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center mb-4" >
                <FiInbox size={24} className="text-gray-300" />
            </div>
            <p className="text-[15px] font-bold text-gray-400" >
                {tag ? `No posts tagged "${tag}" yet` : "No posts yet"}
            </p>
            <p className="text-[13px] text-gray-300 mt-1" >
                Check back soon - stories are on their way
            </p>
        </div>
    )
}

export default EmptyState