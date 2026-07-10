import React from "react"
import {
    FiAtSign, FiMessageCircle, FiHeart,
} from "react-icons/fi"

export const NOTIF_META = {
    mention_post: {
        icon: FiAtSign,
        text: "mentioned you in a post",
        color: "text-indigo-500 bg-indigo-50 border-indigo-100"
    },
    mention_comment: {
        icon: FiMessageCircle,
        text: "mentioned you in a comment",
        color: "text-indigo-500 bg-indigo-50 border-indigo-100",
    },
    like: {
        icon: FiHeart,
        text: "liked your post",
        color: "text-rose-500 bg-rose-50 border-rose-100",
    },
}