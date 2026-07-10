import React from "react"

function NotificationSkeleton() {

    return (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-gray-100 bg-white animate-pulse" >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1" >
                <div className="h-3 bg-gray-100 rounded-md w-3/4 mb-2" />
                <div className="h-2.5 bg-gray-100 rounded-md w-1/4" />
            </div>
        </div>
    )

}

export default NotificationSkeleton