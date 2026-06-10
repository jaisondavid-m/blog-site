import React from "react"

export const AvatarGradient = (name = "") => {
    const palettes = [
        "from-indigo-500 to-violet-600",
        "from-sky-500 to-indigo-600",
        "from-emerald-500 to-teal-600",
        "from-orange-400 to-rose-500",
        "from-pink-500 to-fuchsia-500",
        "from-amber-400 to-orange-500",
    ]
    return palettes[(name.charCodeAt(0) || 0) % palettes.length]
}