import React from "react"
import {
    FiFileText, FiHeart,
    FiEye, FiChevronRight,
} from "react-icons/fi"
import { Link } from "react-router-dom"

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
)

function PostSection({ postsLoading, recentPosts }) {
    return (
        <div className="mt-6 pt-6 border-t border-gray-100" >

            <h3 className="font-['Bricolage_Grotesque'] text-[15px] font-extrabold text-gray-900 mb-4 flex items-center gap-2" >
                <FiFileText size={15} className="text-indigo-500" />
                Recent Posts
            </h3>

            {
                postsLoading ? (
                    <div className="flex flex-col gap-2" >
                        {[1,2,3].map(i => <Skeleton key={i} className="h-14" /> )}
                    </div>
                ) : recentPosts.length === 0 ? (
                    <p className="text-[13px] text-gray-400 text-center py-6" >
                        No posts published Yet
                    </p>
                ) : (
                    <div className="flex flex-col gap-2" >
                        {
                            recentPosts.map(post => (
                                <Link
                                    key={post.uuid}
                                    to={`/post/${post.uuid}`}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0" >
                                        <FiFileText size={14} className="text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0" >
                                        <p className="text-[13.5px] font-semibold text-gray-800 truncate" >
                                            {post.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400 font-medium" >
                                            <span className="flex items-center gap-1" >
                                                <FiHeart size={10} />{post.likes_count ?? 0}
                                            </span>
                                            <span className="flex items-center gap-1" >
                                                <FiEye size={10} />{post.views_count ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                    <FiChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                                </Link>
                            ))
                        }
                    </div>
                )
            }

        </div>
    )
}

export default PostSection