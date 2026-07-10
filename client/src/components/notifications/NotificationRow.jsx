import React from "react"
import { FiBell } from "react-icons/fi"
import { NOTIF_META } from "./Notif_meta.js"
import { Avatar } from "../Avatar.jsx"
import TimeAgo from "../../utils/TimeAgo.js"

function NotificationRow({ n, onOpen }) {

    const meta = NOTIF_META[n.type] || {
        icon: FiBell,
        text: "sent you a notification",
        color: "text-gray-500 bg-gray-50 border-gray-100"
    }

    const Icon = meta.icon

    return (
        <button
            onClick={() => onOpen(n)}
            className={`w-full flex text-left items-start gap-3 px-5 py-4 rounded-2xl border transition-all duration-150
                    ${
                        n.is_read
                            ? "bg-white border-gray-100 hover:border-gray-200"
                            : "bg-indigo-50/40 border-indigo-100 hover:border-indigo-200"
                    }
                `}
        >
            <div className="relative flex-shrink-0" >
                <Avatar
                    firstName={n.actor_name?.split(" ")[0]}
                    lastName={n.actor_name?.split(" ").slice(1).join(" ")}
                    avatarURL={n.actor_avatar}
                    size="w-10 h-10"
                    textSize="text-xs"
                />
                <span
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border ${meta.color} flex items-center justify-center`}
                >
                    <Icon size={10} />
                </span>
            </div>
            <div className="flex-1 min-w-0" >
                <p className="text-[13.5px] text-gray-700 leading-snug" >
                    <span className="font-bold text-gray-900" >
                        @{n.actor_username}
                    </span>
                    {" "}{meta.text}
                </p>
                <p className="text-[12px] text-gray-400 font-medium mt-1" >
                    {TimeAgo(n.created_at)}
                </p>
            </div>

            {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
            )}
        </button>
    )

}

export default NotificationRow