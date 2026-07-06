import React from "react"

function estimateReadTime(excerpt = "") {
    const words = excerpt.trim().split(/\s+/).length
    const mins = Math.max(1, Math.round(words/200))
    return `${mins} min read`
}

function formatDate(iso) {
    if (!iso) return ""
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function NormalisePost(raw) {

    const [firstName,  ...rest] = (raw.author_name ?? "").split(" ")
    const lastName = rest.join(" ")

    return {
        id: raw.id,
        uuid: raw.uuid,
        title: raw.title,
        excerpt: raw.excerpt,
        tag: raw.tag,
        coverImage: raw.cover_image,
        readTime: estimateReadTime(raw.excerpt),
        publishedAt: formatDate(raw.published_at),
        likes_count: raw.likes_count ?? 0,
        commentsCount: raw.comments_count ?? 0,
        comments: null,
        author: {
            firstName,
            lastName,
            username: raw.author_name?.toLowerCase().replace(/\s+/g, "") ?? "",
            avatarURL: raw.author_avatar || null,
        },
        isLiked: Boolean(raw.is_liked),
        isBookmarked: Boolean(raw.is_bookmarked),
        viewsCount: raw.views_count,
    }
}

export default NormalisePost