import React, { useState } from "react"
import { FiSend } from "react-icons/fi"

function CommentInput({ onSubmit }) {

    const [text, setText] = useState("")

    const submit = () => {
        if (!text.trim()) return
        onSubmit(text.trim())
        setText("")
    }

    return (
        <div className="flex gap-2 items-end mt-3" >
            <div className={`flex-1 relative rounded-2xl border-[1.5px] transition-all duration-200
                    ${text 
                        ? "border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.10)] bg-white"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }
                `} 
            >
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            submit()
                        }
                    }}
                    placeholder="Write a comment..."
                    rows={1}
                    className="w-full bg-transparent border-none outline-none rounded-2xl text-[14px] text-gray-900
                    font-['Plus_Jakarta_Sans'] resize-none py-3 px-4 leading-relaxed placeholder:text-gray-400"
                />
            </div>
            <button
                onClick={submit}
                disabled={!text.trim()}
                aria-label="Post comment"
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150
                        ${
                            text.trim()
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95"
                                : "bg-gray-100 text-gray-300 cursor-default"
                        }
                    `}
            >
                <FiSend size={15} />
            </button>
        </div>
    )

}

export default CommentInput