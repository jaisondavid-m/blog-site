import React from "react"

function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
    ) 
}

function PostPageSkeleton() {
    return (
        <div className="max-w-2xl mx-auto px-5 lg:px-8 py-10" >
            <Skeleton className="h-14 w-24 mb-8" />
            <Skeleton className="h-4 w-20 rounded-full mb-6" />
            <Skeleton className="h-9 w-4/5 mb-2" />
            <Skeleton className="h-9 w-3/5 mb-6" />
            <div className="flex items-center gap-3 mb-8" >
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                    <Skeleton className="h-3.5 w-28 mb-1.5" />
                    <Skeleton className="h-3 w-36" />
                </div>
            </div>
            <Skeleton className="h-56 w-full rounded-2xl mb-8" />
            {[1,2,3,4,5].map(i => (
                <Skeleton
                    key={i}
                    className={`h-4 mb-3 ${ i % 3 === 0 ? "w-4/5" : "w-full" }`}
                />
            ))}
        </div>
    )
}

export default PostPageSkeleton