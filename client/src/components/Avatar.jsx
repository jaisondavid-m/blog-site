import React from "react"
import { AvatarGradient } from "./AvatarGradient.jsx"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

const initials = (first, last) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"

export const Avatar = ({ firstName, lastName, avatarURL, size = "w-9 h-9", textSize = "text-sm" }) => {

    const gradient = AvatarGradient(firstName)

    if (avatarURL) {
        return (
            <img
                src={`${BASE_URL}${avatarURL}`}
                alt={`${firstName} ${lastName}`}
                className={`${size} rounded-xl object-cover flex-shrink-0`}
            />
        )
    }

    return (
        <div className={`${size} rounded-xl bg-gradient-to-br ${gradient} flex items-center
            justify-center flex-shrink-0`} 
        >
            <span className={`text-white ${textSize} font-extrabold font-['Bricolage_Grotesque'] select-none`} >
                {initials(firstName, lastName)}
            </span>
        </div>
    )
}