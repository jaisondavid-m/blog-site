import React from "react"
import { Avatar } from "../Avatar.jsx"

import {
    FiHeart,
    FiMessageCircle,
    FiEye,
} from "react-icons/fi"

const BASE_URL = import.meta.env.VITE_API_URL

function WriterCard({ w, i, goToProfile  }) {
    return (
        <button
            key={w.uuid}
            onClick={() => goToProfile(w.username)}
            className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer
            px-5 py-4 text-left hover:border-indigo-200 hover:shadow-sm transition-all duration-150 active:scale-[0.99]"
        >
            <span className="text-sm font-extrabold text-gray-300 w-5 font-['Bricolage_Grotesque']" >
                {i+1}
            </span>
            <Avatar
                firstName={w.first_name}
                lastName={w.last_name}
                avatarURL={w.avatar_url ? `${BASE_URL}${w.avatar_url}` : ""}
                size="w-12 h-12"
                textSize="text-sm"
            />
            <div className="flex-1 min-w-0" >
                <p className="text-[14.5px] font-bold text-gray-900 truncate" >
                    {w.first_name} {w.last_name}
                </p>
                <p className="text-[12.5px] text-gray-400 font-medium" >
                    @{w.username} · {w.post_counts ?? 0} post{(w.post_counts ?? 0) !== 1 ? "s" : ""}
                </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-gray-400" >
                <span className="flex items-center gap-1 text-[12.5px] font-semibold" >
                    <FiHeart size={13} />
                    {w.total_likes ?? 0}
                </span>
                <span className="flex items-center gap-1 text-[12.5px] font-semibold" >
                    <FiMessageCircle size={13} />
                    {w.total_comments ?? 0}
                </span>
                <span className="flex items-center gap-1 text-[12.5px] font-semibold" >
                    <FiEye size={13} />
                    {w.total_views ?? 0}
                </span>
            </div>
        </button>   
    )
}

export default WriterCard