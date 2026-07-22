import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createPost, getPost, updatePost } from "../api/post.api.js"
import {
    FiArrowLeft, FiSend, FiSave, FiLoader,
    FiAlertCircle, FiCheckCircle, FiImage,
    FiX, FiBold, FiItalic, FiList, FiCode,
} from "react-icons/fi"
import Field from "../components/posts/Field.jsx"

import ToastStack from "../components/ToastStack.jsx"
import ToolBarBtn from "../components/posts/ToolBarBtn.jsx"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

const TAGS = ["Tech", "Design", "Business","Science", "Health", "Culture", "Testing"]

function WritePage() {

    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [tag, setTag] = useState("")
    const [coverURL, setCoverURL] = useState("")
    const [status, setStatus] = useState("draft")

    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [toasts, setToasts] = useState([])

    const [searchParams] = useSearchParams()
    const editUuid = searchParams.get("edit")
    const isEditing = Boolean(editUuid)
    const [loadingPost, setLoadingPost] = useState(isEditing)

    const contentRef = useRef(null)

    const validate = () => {

        const e = {}
        
        if (!title.trim()) {
            e.title = "Title is required"
        }

        if (!content.trim()) {
            e.content = "Content is required"
        }

        return e
    }

    const showToast = (message, type = "success") => {

        const id = Date.now()
        setToasts(p => [...p, { id, message, type }])
        setTimeout(() => 
            setToasts(p => p.filter(t => t.id !== id))
        ,3500)

    }

    const removeToast = (id) =>
        setToasts(p => p.filter(t => t.id !== id))

    const handleSubmit = async (submitStatus) => {

        const e = validate()

        if (Object.keys(e).length) {
            setErrors(e)
            return
        }

        setErrors({})
        setSaving(true)

        const payload = {
            title: title.trim(),
            excerpt: excerpt.trim(),
            content: contentRef.current?.innerHTML ?? content,
            tag: tag.toLowerCase(),
            cover_image: coverURL.trim(),
            status: submitStatus,
        }

        const res = isEditing
            ? await updatePost(editUuid, payload)
            : await createPost(payload)

        setSaving(false)

        if (!res.success) {
            showToast(res.error || "Failed to save post", "error")
            return
        }

        if (isEditing) {
            showToast("Post updated!", "success")
            if (submitStatus === "published") {
                navigate(`/post/${editUuid}`)
            }
        } else if (submitStatus === "published") {
            navigate(`/post/${res.data.uuid}`)
        } else {
            showToast("Draft saved!", "success")
        }
    }

    const exec = (command, value = null) => {
        contentRef.current?.focus()
        document.execCommand(command, false, value)
    }

    useEffect(() => {

        if (!editUuid) return

        let cancelled = false

        const loadPost = async () => {

            setLoadingPost(true)
            const res = await getPost(editUuid)
            setLoadingPost(false)

            if (cancelled) return

            if (!res.success) {
                showToast(res.error || "Failed to load post", "error")
                return
            }

            const p = res.data.post

            setTitle(p.title || "")
            setExcerpt(p.title || "")
            setContent(p.content || "")
            setTag(p.tag || "")
            setCoverURL(p.cover_image || "")
            setStatus(p.status || "draft")

            if (contentRef.current) {
                contentRef.current.innerHTML = p.content || ""
            }
        }

        loadPost()

        return () => { cancelled = true }

    },[editUuid])

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                    @keyframes fadeUp {
                        from {
                            opacity:0;
                            transform:translateY(10px)
                        }
                        to {
                            opacity:1;
                            transform:translateY(0)
                        }
                    }
                    .fade-up {
                        animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36) both;
                    }
                    #post-content:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events:none;
                    }
                    #post-content:focus { outline: none }
                    #post-content:p {
                        margin-bottom: 1rem;
                        line-height: 1.8;
                    }
                    #post-content h1 {
                        font-size: 1.6rem;
                        font-weight: 800;
                        margin:1.5rem 0 0.5rem;
                        font-family:'Bricolage Grotesque',sans-serif;
                    }
                    #post-content h2 {
                        font-size: 1.4rem;
                        font-weight: 700;
                        margin:1.25rem 0 0.4rem;
                        font-family:'Bricolage Grotesque',sans-serif;
                    }
                    #post-content ul {
                        list-style:disc;
                        padding-left:1.5rem;
                        margin-bottom:1rem;
                    }
                    #post-content li {
                        margin-bottom:0.3rem;
                        line-height: 1.7;
                    }
                    #post-content code {
                        background:#f3f4f6;
                        border-radius:4px;
                        padding:2px 6px;
                        font-family:monospace;
                        font-size:14px;
                        color:#4f46e5;
                    }
                    #post-content blockquote {
                        border-left: 3px solid #e0e7ff;
                        padding-left:1rem;
                        color:#6b7280;
                        font-style:italic;
                        margin:1rem 0;
                    }
                    #post-content a {
                        color: #4ff6e5;
                        text-decoration:underline;
                    }
                    #post-content img {
                        max-width:100%;
                        border-radius:10px;
                        margin:0.75rem 0;
                    }
                `}
            </style>
            <ToastStack toasts={toasts} remove={removeToast} />
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100" >
                <div className="max-w-3xl mx-auto px-5 lg:px-6 py-4 flex items-center justify-between" >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
                    >
                        <FiArrowLeft size={15} />
                        Back
                    </button>
                    <div className="flex items-center gap-2" >
                        <button
                            onClick={() => handleSubmit("draft")}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
                            border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900
                            disabled:opacity-50 transition-all duration-150"
                        >
                            {
                                saving
                                    ? <FiLoader size={13} className="animate-spin" />
                                    : <FiSave size={13} className="" />
                            }
                        </button>
                        <button
                            onClick={() => handleSubmit("published")}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
                            bg-indigo-600 hover:bg-indigo-700 text-white 
                            disabled:opacity-50 transition-all duration-150 shadow-sm"
                        >
                            {
                                saving
                                    ? <FiLoader size={13} className="animate-spin" />
                                    : <FiSend size={13} />
                            }
                            Publish
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Form */}
            <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10 fade-up" >
                <div className="mb-8" >
                    <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >
                        { isEditing ? "Edit post" : "Write a post" }
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium" >
                        { isEditing ? "Update your story" : "Share your story with the community"}
                    </p>
                </div>
                <div className="flex flex-col gap-6" >
                    <Field label="Title" required error={errors.title} >
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Give your post a great title..."
                            className={`w-full px-4 py-3 rounded-2xl border text-[15px] font-semibold text-gray-900
                                placeholder:text-gray-300 placeholder:font-normal
                                focus:outline-none transition-colors
                                font-['Bricolage_Grotesque']
                                ${
                                    errors.title
                                        ? "border-rose-300 focus:border-rose-400"
                                        : "border-gray-200 focus:border-indigo-400"
                                }
                                `}
                        />
                    </Field>
                    <Field label="Excerpt" >
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            placeholder="A short summary that appers on the feed"
                            rows={2}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-[14px] text-gray-700 leading-relaxed
                            placeholder:text-gray-300 focus:outline-none focus:border-indigo-400 transition-colors resize-none
                            "
                        />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4" >
                    <Field label="Tag" >
                        <div className="relative" >
                            <select
                                value={tag}
                                onChange={e => setTag(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-[14px] text-gray-700
                                focus:outline-none focus:border-indigo-400 transition-colors appearance-none bg-white cursor-pointer"
                            >
                                <option value="">No tag</option>
                                {TAGS.map(t => (
                                    <option key={t} value={t.toLowerCase()} >{t}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" >
                                    <path d="M2 414 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </Field>
                    <Field label="Cover Image URL" >
                        <div className="relative" >
                            <FiImage size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                value={coverURL}
                                onChange={e => setCoverURL(e.target.value)}
                                placeholder="https://..."
                                className="w-full pl-9 pr-4 py-3 rounded-3xl border border-gray-200 text-[14px] text-gray-700
                                placeholder:text-gray-300 focus:outline-none focus:border-indigo-400 transition-colors"
                            />
                        </div>
                    </Field>    
                </div>

                {
                    coverURL && (
                        <div className="relative" >
                            <img
                                src={coverURL}
                                alt="Cover preview"
                                className="w-full max-h-56 object-cover rounded-2xl border border-gray-100 shadow-sm"
                                onError={e => e.target.style.display = "none"}
                            />
                            <button
                                onClick={() => setCoverURL("")}
                                className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-xl
                                flex items-center justify-center text-gray-500 hover:text-gray-800
                                border border-gray-200 shadow-sm transition"
                            >
                                <FiX size={12} />
                            </button>
                        </div>
                    )
                }

                <Field label="Content" required error={errors.content} >
                    <div className={`rounded-2xl border overflow-hidden transition-colors 
                            ${
                                errors.content
                                    ? "border-rose-300"
                                    : "border-gray-200 focus-within:border-indigo-400"
                            }
                        `} 
                    >
                        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50" >
                            <ToolBarBtn icon={FiBold} label="Bold" onClick={() => exec("bold")} />
                            <ToolBarBtn icon={FiItalic} label="Italic" onClick={() => exec("italic")} />
                            <ToolBarBtn icon={FiList} label="Bullet list" onClick={() => exec("insertUnorderedList")} />
                            <ToolBarBtn icon={FiCode} label="Inline code" onClick={() => exec("formatBlock", "code")} />
                            <div className="w-px h-4 bg-gray-200 mx-1" />
                            <button
                                type="button"
                                onClick={() => exec("formatBlock", "h2")}
                                className="px-2 h-8 text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100
                                rounded-lg transition-colors"
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => exec("formatBlock", "h3")}
                                className="px-2 h-8 text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                H3
                            </button>
                            <button
                                type="button"
                                onClick={() => exec("formatBlock", "blockquote")}
                                className="px-2 h-8 text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                " "
                            </button>
                        </div>
                        <div
                            id="post-content"
                            ref={contentRef}
                            contentEditable
                            suppressContentEditableWarning
                            data-placeholder="Start writing your post..."
                            onInput={e => setContent(e.currentTarget.innerHTML)}
                            className="min-h-[320px] px-5 py-4 text-[15px] text-gray-700 leading-relaxed"
                        />
                    </div>
                </Field>
                <div className="flex items-center justify-end gap-3 pt-2 pb-8" >
                    <button
                        onClick={() => handleSubmit("draft")}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                        border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900
                        disabled:opacity-50 transition-all duration-150"
                    >
                        {
                            saving
                                ? <FiLoader size={13} className="animate-spin" />
                                : <FiSave size={13} />
                        }
                        Save as draft
                    </button>
                    <button
                        onClick={() => handleSubmit("published")}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                        bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 transition-all duration-150"
                    >
                        {
                            saving
                                ? <FiLoader size={13} className="animate-spin" />
                                : <FiSend size={13} />
                        }
                        { isEditing ? "Update post" : "Publish post" }
                    </button>
                </div>
            </div>

        </>
    )
}


export default WritePage