import React from "react"
import { Link } from "react-router-dom"

const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g

function MentionText({ text, className = "" }) {

    if (!text) return null

    const parts = []
    let lastIndex = 0
    let match

    MENTION_REGEX.lastIndex = 0

    while ((match = MENTION_REGEX.exec(text)) !== null) {

        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index))
        }

        const username = match[1]

        parts.push(
            <Link
                key={`${username}-${match.index}`}
                to={`/u/${username}`}
                onClick={(e) => e.stopPropagation()}
                className="text-indigo-600 font-semibold hover:underline"
            >
                @{username}
            </Link>
        )

        lastIndex = match.index + match[0].length

    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
    }

    return (
        <span className={className} >
            {parts}
        </span>
    )

}

export default MentionText