import React from "react"

function PostSkeleton() {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse" > 
            <div className="px-7 pt-6 pb-6" >
                <div className="flex items-center gap-3 mb-5" >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="flex-1" >
                        <div className="h-3.5 w-28 bg-gray-100 rounded-lg mb-1.5" />
                        <div className="h-3 w-56 bg-gray-100 rounded-lg" />
                    </div>
                    <div className="h-5 w-16 bg-gray-100 rouned-full" />
                </div>
                <div className="h-5 w-4/5 bg-gray-100 rounded-lg mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded-lg mb-1.5" />
                <div className="h-4 w-3/4 bg-gray-100 rounded-lg mb-5" />
                <div className="flex gap-2 pt-4 border-t border-gray-50" >
                    <div className="h-8 w-16 bg-gray-100 rounded-xl" />
                    <div className="h-8 w-16 bg-gray-100 rounded-xl" />
                    <div className="h-8 w-20 bg-gray-100 rounded-xl ml-auto" />
                </div>
            </div>
        </div>
    )
}

export default PostSkeleton