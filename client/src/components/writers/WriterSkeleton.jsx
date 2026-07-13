import React from "react"

function WriterSkeleton() {
    return (
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4" >
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2" >
                <div className="h-3.5 w-32 bg-gray-100 rounded-md animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded-md animate-pulse" />
            </div>
        </div>
    )
}

export default WriterSkeleton