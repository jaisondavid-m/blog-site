import React from "react"
import { STATUS_STYLES } from "../../data/Status_Styles.js"
import { 
    FiEdit2, FiTrash2, FiEye, FiHeart, FiMessageCircle,
    FiArchive, FiGlobe
} from "react-icons/fi"
import FormatDate from "../../utils/FormatDate.js"

function MyPostRow({ post, onEdit, onView, onDelete, onToggleStatus, busy }) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4" >
            <div className="flex items-start justify-between gap-4" >
                <div className="min-w-0 cursor-pointer" onClick={onView} >
                    <div className="flex items-center gap-2 mb-2" >
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5  py-1 
                            rounded-full border ${STATUS_STYLES[post.status] || STATUS_STYLES.draft}`} >
                            {post.Status}
                        </span>
                        <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100" >
                            { post.tag || "General" }
                        </span>
                    </div>
                    <h3 className="font-['Bricolage_Grotesque'] text-[17px] font-extrabold text-gray-900 truncate" >
                        { post.title }
                    </h3>
                    <p className="text-[13px] text-gray-400 mt-1 line-clamp-2" >
                        { post.excerpt }
                    </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0" >
                    <button
                        onClick={onEdit}
                        aria-label="Edit post"
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400
                        hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition"
                    >
                        <FiEdit2 size={14} />
                    </button>
                    <button
                        onClick={onDelete}
                        aria-label="Delete post"
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400
                        hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50" >
                <div className="flex items-center gap-4 text-[12.5px] text-gray-400 font-medium" >
                    <span className="flex items-center gap-1" >
                       <FiEye size={13} />  {post.views_count}
                    </span>
                    <span className="flex items-center gap-1" >
                        <FiHeart size={13} /> {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1" >
                        <FiMessageCircle size={13} /> {post.comments_count}
                    </span>
                    <span>
                        {FormatDate(post.published_at || post.created_at)}
                    </span>
                </div>
                {
                    post.status !== "archived" && (
                        <button
                            onClick={onToggleStatus}
                            disabled={busy}
                            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-500 hover:text-indigo-600 
                            transition disabled:opacity-50"
                        >
                            {
                                post.status === "published"
                                    ? <><FiArchive size={13} /> Unpublish</>
                                    : <><FiGlobe size={13} /> Publish</>
                            }
                        </button>
                    )
                }
            </div>
        </div>
    )
}

export default MyPostRow