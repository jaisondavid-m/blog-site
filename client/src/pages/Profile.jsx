import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    FiUser, FiMail, FiAtSign, FiCalendar, FiEdit2,
    FiShield, FiLoader, FiAlertCircle, FiFileText,
    FiHeart, FiBookmark, FiTrendingUp, FiChevronRight, FiEye,
    FiZap, FiCheckCircle, FiCamera, FiX, FiSave, FiAlertTriangle,
} from "react-icons/fi"
import { getMe, updateProfile, uploadAvatar } from "../api/auth.api.js"
import { useAuth } from "../context/AuthContext.jsx"
import api from "../api/axios.js"
import { getMyPostsOverview, getMyPosts } from "../api/post.api.js"

const initials = (first, last) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"

const avatarGradient = (name = "") => {
    const palettes = [
        "from-indigo-500 to-violet-600",
        "from-sky-500 to-indigo-600",
        "from-emerald-500 to-teal-600",
        "from-orange-400 to-rose-500",
        "from-pink-500 to-fuchsia-500",
        "from-amber-400 to-orange-500"
    ]
    const idx = (name.charCodeAt(0) || 0) % palettes.length
    return palettes[idx]
}

const BASE_URL = "https://json.hackclub.app"

const StatCard = ({ icon: Icon, label, value, accent }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200" >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`} >
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-900 font-['Bricolage_Grotesque'] leading-none">{value}</p>
                <p className="text-[12.5px] text-gray-500 mt-0.5 font-medium" >
                    {label}
                </p>
            </div>
        </div>
    )

}

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0" >
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0" >
            <Icon size={14} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0" >
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-0.5" >{label}</p>
            <p className="text-[14.5px] text-gray-800 font-semibold truncate" >
                {value || "-"}
            </p>
        </div>
    </div>
)

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
)

const Field = ({ label, value, onChange, error }) => (
    <div>
        <label className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1 block">
            {label}
        </label>
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-gray-800 outline-none transition
                ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-indigo-400"}`}
        />
        {error && <p className="text-[11px] text-red-500 mt-1 font-semibold" >{error}</p>}
    </div>
)

// --- Edit Profile Modal -----------------------------------------------

function EditProfileModal({ user, onClose, onSaved }) {

    const [form, setForm] = useState({
        first_name: user?.FirstName || "",
        last_name: user?.LastName || "",
        username: user?.Username || "",
    })

    const [avatarFile, setAvatarFile] = useState(null)

    const [avatarPreview, setAvatarPreview] = useState(
        user?.AvatarURL ? `${BASE_URL}${user.AvatarURL}` : null
    )

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({})
    const fileRef = useRef()

    const handleAvatarChange = (e) => {

        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be under 2MB")
            return
        }
        const allowed = ["image/jpeg", "image/png", "image/webp"]

        if (!allowed.includes(file.type)) {
            setError("Only JPG, PNG, or WEBP images allowed")
            return
        }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        setError(null)
    }

    const validate = () => {
        const errs = {}
        if (!form.first_name.trim()) errs.first_name = "Required"
        if (!form.last_name.trim()) errs.last_name = "Required"
        if (!form.username.trim()) errs.username = "Required"
        else if (!/^[a-zA-Z0-9_]{3,30}/.test(form.username))
            errs.username = "3-30 chars, letters/numbers/underscore only"
        return errs
    }

    const handleSave = async () => {

        setError(null)

        const errs = validate()

        if (Object.keys(errs).length) { setFieldErrors(errs); return }

        setFieldErrors({})
        setSaving(true)

        try {

            if (avatarFile) {
                const res = await uploadAvatar(avatarFile)
                if (!res.success) { setError(res.error); setSaving(false); return }
            }

            const res = await updateProfile(form)
            if (!res.success) {
                setError(res.error)
                setSaving(false)
                return
            }

            const meRes = await getMe()
            if (meRes.success) {
                onSaved(meRes.data.user)
            }
            onClose()
        } catch {
            setError("Something went wrong. Please try again later/")
        } finally {
            setSaving(false)
        }
    }

    const gradient = avatarGradient(user?.FirstName)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md relative overflow-hidden" >
                <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
                <div className="p-7" >
                    <div className="flex items-center justify-between mb-6" >
                        <div>
                            <h2 className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-gray-900" >Edit Profile</h2>
                            <p className="text-xs text-gray-400 mt-0.5" >
                                Update your personal information
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition"
                        >
                            <FiX size={15} />
                        </button>
                    </div>
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center mb-7" >
                        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()} >
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-2xl object-cover shadow-md"
                                />
                            ) : (
                                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`} >
                                    <span className="text-white text-3xl font-extrabold font-['Bricolage_Grotesque'] select-none" >
                                        {initials(form.first_name, form.last_name)}
                                    </span>
                                </div>
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" >
                                <FiCamera size={20} className="text-white" />
                            </div>
                            {/* Badge */}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md border-2 border-white" >
                                <FiCamera size={12} className="text-white" />
                            </div>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <p className="text-[11px] text-gray-400 mt-3 font-medium" >
                            Click avatar to change · JPG, PNG, WEBP · Max 2MB
                        </p>
                    </div>
                    {/* Fields */}
                    <div className="space-y-4" >
                        <div className="grid grid-cols-2 gap-3" >
                            <Field
                                label="First Name"
                                value={form.first_name}
                                onChange={v => setForm({ ...f, first_name: v })}
                                error={fieldErrors.first_name}
                            />
                            <Field
                                label="Last Name"
                                value={form.last_name}
                                onChange={v => setForm(f => ({ ...f, last_name: v }))}
                                error={fieldErrors.last_name}
                            />
                        </div>
                        <Field
                            label="Username"
                            value={form.username}
                            onChange={v => setForm(f => ({ ...f, username: v }))}
                            error={fieldErrors.username}
                        />
                        {error && (
                            <p className="text-xs text-red-500 font-semibold flex items-center gap-1" >
                                <FiAlertTriangle size={12} /> {error}
                            </p>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition flex items-center  justify-center gap-2"
                        >
                            {saving && <FiLoader size={14} className="animate-spin" />}
                            {saving ? "Saving..." : <><FiSave size={14} />Save Changes</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

}

function Profile() {

    const { user: ctxUser, setUser } = useAuth()
    const navigate = useNavigate()

    const [user, setLocal] = useState(ctxUser ?? null)
    const [loading, setLoading] = useState(!ctxUser)
    const [error, setError] = useState(null)

    const [otpModal, setOtpModal] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpSending, setOtpSending] = useState(false)
    const [otpVerifying, setOtpVerifying] = useState(false)
    const [otpError, setOtpError] = useState(null)
    const [otpSuccess, setOtpSuccess] = useState(false)
    const [otpExpiry, setOtpExpiry] = useState(null)
    const [timeLeft, setTimeLeft] = useState(120)
    const [editOpen, setEditOpen] = useState(false)
    const [overview, setOverview] = useState(null)
    const [recentPosts, setRecentPosts] = useState([])
    const [recentLoading, setRecentLoading] = useState(true)

    const handleSendOTP = async () => {

        setOtpSending(true)
        setOtpError(null)

        try {

            const res = await api.get("/api/auth/send-verification-otp")

            if (res.data) {
                setOtpExpiry(Date.now() + 120_000)
                setTimeLeft(120)
                setOtpModal(true)
                setOtp("")
                setOtpSuccess(false)
            }

        } catch (err) {
            setOtpError(err.response?.data?.error || "Failed to send OTP")
        } finally {
            setOtpSending(false)
        }
    }

    const handleVerifyOTP = async () => {

        setOtpVerifying(true)
        setOtpError(null)

        try {
            await api.post("/api/auth/verify-email", { otp })
            setOtpSuccess(true)
            setLocal(prev => ({ ...prev, EmailVerified: true }))
            setUser(prev => ({ ...prev, EmailVerified: true }))
            setTimeout(() => setOtpModal(false), 1500)
        } catch (err) {
            setOtpError(err.response?.data?.error)
        } finally {
            setOtpVerifying(false)
        }

    }

    const handleProfileSaved = (updatedUser) => {
        setLocal(updatedUser)
        setUser(updatedUser)
    }

    useEffect(() => {
        if (ctxUser) {
            setLocal(ctxUser)
            return
        }
        let cancelled = false
            ; (async () => {
                setLoading(true)
                const res = await getMe()
                if (cancelled) return
                if (res.success) {
                    setLocal(res.data.user)
                    setUser(res.data.user)
                } else {
                    setError("Could not load profile. Please sign in again.")
                }
                setLoading(false)
            })()
        return () => { cancelled = true }
    }, [ctxUser, setUser])

    useEffect(() => {

        if (!otpModal || !otpExpiry) return

        const interval = setInterval(() => {
            const secs = Math.max(0, Math.round((otpExpiry - Date.now()) / 1000))
            setTimeLeft(secs)
            if (secs === 0) setOtpModal(false)
        }, 1000)
        return () => clearInterval(interval)
    }, [otpModal, otpExpiry])

    useEffect(() => {
        let cancelled = false
            ; (async () => {
                const res = await getMyPostsOverview()
                if (!cancelled && res.success) {
                    setOverview(res.data.overview)
                }
            })()
    }, [])

    useEffect(() => {

        let cancelled = false

            ; (async () => {
                setRecentLoading(true)
                const res = await getMyPosts({ page: 1, limit: 3 })
                if (!cancelled) {
                    if (res.success) {
                        setRecentPosts(res.data.posts ?? [])
                    }
                    setRecentLoading(false)
                }
            })()

        return () => { cancelled = true }

    }, [])

    const gradient = avatarGradient(user?.FirstName)

    if (loading) return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
            <div className="max-w-4xl mx-auto px-5 py-12" >
                <div className="bg-white rounded-3xl border border-gray-100 p-9" >
                    <Skeleton className="w-24 h-24 rounded-2xl mx-auto mb-4" />
                    <Skeleton className="h-5 w-32 mx-auto mb-2" />
                    <Skeleton className="h-3.5 w-24 mx-auto mb-8" />
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 mb-3" />)}
                </div>
                <div className="flex flex-col gap-6" >
                    <div className="grid grid-cols-2 gap-4" >
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
                    </div>
                    <Skeleton className="flex-1 rounded-3xl" />
                </div>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Plus_Jakarta_Sans']">
            <div className="text-center bg-white bg-white rounded-3xl border border-gray-100 p-12 shadow-sm max-w-sm" >
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4" >
                    <FiAlertCircle size={24} className="text-red-500" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold text-gray-900 mb-2" >Something went wrong</h3>
                <p className="text-sm text-gray-500 mb-6" >{error}</p>
                <button
                    onClick={() => navigate("/auth?mode-login", { replace: true })}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Sign in again
                </button>
            </div>
        </div>
    )

    const displayName = user ? `${user.FirstName} ${user.LastName}` : "-"

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
                .fade-up-1 { animation-delay: 0.05s; }
                .fade-up-2 { animation-delay: 0.1s; }
                .fade-up-3 { animation-delay: 0.15s; }
            `}</style>
            <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
                <div className="bg-white border-b border-gray-100" >
                    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-6 flex items-center justify-between" >
                        <div>
                            <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >My Profile</h1>
                            <p className="text-sm text-gray-400 mt-0.5" >
                                Manage your account details
                            </p>
                        </div>
                        <button
                            onClick={() => setEditOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white duration-150
                            text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            <FiEdit2 size={14} />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => navigate("/my-posts")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white duration-150
                            text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            <FiFileText size={14} />
                            My Posts
                        </button>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8" >
                    <div className="grid md:grid-cols-[300px_1fr] gap-6 items-start" >
                        <div className="fade-up bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" >
                            <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
                            <div className="px-7 pt-7 pb-7" >
                                <div className="flex flex-col items-center mb-6" >
                                    <div className="relative mb-4" >
                                        {user?.AvatarURL ? (
                                            <img
                                                src={`${BASE_URL}${user.AvatarURL}`}
                                                alt={displayName}
                                                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                                            />
                                        ) : (
                                            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`} >
                                                <span className="text-white text-3xl font-extrabold font-['Bricolage_Grotesque'] select-none" >
                                                    {initials(user?.FirstName, user?.LastName)}
                                                </span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setEditOpen(true)}
                                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md border-2 border-white hover:bg-indigo-700 transition"
                                        >
                                            <FiEdit2 size={12} className="text-white" />
                                        </button>
                                    </div>
                                    <h2 className="font-['Bricolage_Grotesque'] text-[20px] font-extrabold text-gray-900 tracking-tight text-center leading-tight" >
                                        {displayName}
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1 font-medium" >@{user?.Username}</p>
                                    {/* <div className="mt-3 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1" >
                                        <FiCheckCircle size={11} className="text-emerald-500" />
                                        <span className="text-[11px] font-bold text-emerald-600 tracking-wide" >Active Account</span>
                                    </div> */}
                                    <div
                                        className={`mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 border ${user?.EmailVerified
                                            ? "bg-emerald-50 border-emerald-100"
                                            : "bg-amber-50 border-amber-100"
                                            }`}
                                    >
                                        <FiCheckCircle
                                            size={11}
                                            className={
                                                user?.EmailVerified
                                                    ? "text-emerald-500"
                                                    : "text-amber-500"
                                            }
                                        />
                                        <span
                                            className={`text-[11px] font-bold tracking-wide ${user?.EmailVerified
                                                ? "text-emerald-600"
                                                : "text-amber-600"
                                                }`}
                                        >
                                            {user?.EmailVerified ? "Verified" : "Not Verified"}
                                        </span>
                                    </div>
                                    {!user?.EmailVerified && (
                                        <button
                                            onClick={handleSendOTP}
                                            disabled={otpSending}
                                            className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition"
                                        >
                                            {otpSending ? <FiLoader size={12} className="animate-spin" /> : <FiMail size={12} />}
                                            {otpSending ? "Sending..." : "Verify Now"}
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <InfoRow icon={FiUser} label="Full Name" value={displayName} />
                                    <InfoRow icon={FiAtSign} label="Username" value={user?.Username} />
                                    <InfoRow icon={FiMail} label="Email" value={user?.Email} />
                                    <InfoRow icon={FiShield} label="Account ID" value={user?.UUID?.slice(0, 16) + "…"} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5" >
                            <div className="fade-up fade-up-1 grid grid-cols-2 gap-4" >
                                <StatCard icon={FiFileText} label="Post Written" value={overview?.total_posts ?? "..."} accent="bg-indigo-500" />
                                <StatCard icon={FiHeart} label="Likes Received" value={overview?.total_likes ?? "..."} accent="bg-rose-500" />
                                <StatCard icon={FiEye} label="Total Views" value={overview?.total_views ?? "..."} accent="bg-emerald-500" />
                            </div>
                            <div className="fade-up fade-up-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-7" >
                                <div className="flex items-center justify-between mb-5" >
                                    <h3 className="font-['Bricolage_Grotesque'] text-[17px] font-extrabold text-gray-900 mb-5 flex items-center gap-2" >
                                        <FiZap size={16} className="text-indigo-500" />
                                        Recent Activity
                                    </h3>
                                    {
                                        recentPosts.length > 0 && (
                                            <button
                                                onClick={() => navigate("/my-posts")}
                                                className="text-[12.5px] font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                                            >
                                                View all
                                                <FiChevronRight size={12} />
                                            </button>
                                        )
                                    }
                                </div>

                                {
                                    recentLoading ? (
                                        <div className="flex flex-col gap-3" >
                                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
                                        </div>
                                    ) : recentPosts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-center" >
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4" >
                                                <FiFileText size={22} className="text-gray-300" />
                                            </div>
                                            <p className="text-[14px] font-bold text-gray-400" >No Posts Yet</p>
                                            <p className="text-[12.5px] text-gray-300 mt-1" >Your published stories will appear here</p>
                                            <button
                                                onClick={() => navigate("/write")}
                                                className="mt-5 flex items-center gap-1.5 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                                            >
                                                Write your first Post
                                                <FiChevronRight size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2" >
                                            {
                                                recentPosts.map(post => (
                                                    <div
                                                        key={post.uuid}
                                                        onClick={() => navigate(`/post/${post.uuid}`)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                                                    >
                                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0" >
                                                            <FiFileText size={14} className="text-indigo-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0" >
                                                            <p className="text-[13.5px] font-semibold text-gray-800 truncate" >
                                                                {post.title}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400 font-medium" >
                                                                <span className="flex items-center gap-1" >
                                                                    <FiHeart size={10} />{post.likes_count ?? 0}
                                                                </span>
                                                                <span className="flex items-center gap-1" >
                                                                    <FiEye size={10} />{post.views_count ?? 0}
                                                                </span>
                                                                <span
                                                                    className={`px-1.5 py-0.5 rounded-full font-bold ${
                                                                        post.status === "published"
                                                                        ? "bg-emerald-50 text-emerald-600"
                                                                        : "bg-amber-50 text-amber-600" 
                                                                    }`}
                                                                >
                                                                    {post.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <FiChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                                                    </div>  
                                                ))
                                            }
                                            <button
                                                onClick={() => navigate("/my-posts")}
                                                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200
                                                text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 text-[13px] font-semibold transition"
                                            >
                                                Sell all posts
                                                <FiChevronRight size={13} />
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {otpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" >
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm mx-4 relative" >
                        <button
                            onClick={() => setOtpModal(false)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition text-xl font-bold"
                        >
                            ✕
                        </button>
                        {otpSuccess ? (
                            <div className="flex flex-col items-center py-4" >
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4" >
                                    <FiCheckCircle size={26} className="text-emerald-500" />
                                </div>
                                <h3 className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-gray-900" >Verified!</h3>
                                <p className="text-sm text-gray-400 mt-1" >Your email is now verified</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-col items-center mb-6" >
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4" >
                                        <FiMail size={24} className="text-indigo-500" />
                                    </div>
                                    <h3 className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-gray-900" >Enter OTP</h3>
                                    <p className="text-sm text-gray-400 mt-1 text-center" >
                                        A 6-digit code was sent to<br />
                                        <span className="font-semibold text-gray-700">{user?.Email}</span>
                                    </p>
                                    <p className="text-[11.5px] text-amber-600 bg-amber-50 border bordre-amber-100 rounded-lg px-3 py-2 mt-3 text-center leading-snug" >
                                        Don't see it? Check your spam/junk folder - the code is sent from <span className="font-semibold" >jaison7373@gmail.com</span>
                                    </p>
                                </div>
                                {/* Count down */}
                                <div className={`text-center text-xs font-bold mb-4 ${timeLeft <= 30 ? "text-red-500" : "text-gray-400"}`} >
                                    Expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                                </div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000000"
                                    className="w-full text-center text-2xl font-extrabold tracking-[0.5em] border-2 border-gray-200 focus:border-indigo-400 rounded-2xl py-4 outline-none
                                    transition font-['Bricolage_Grotesque'] mb-4"
                                />
                                {otpError && (
                                    <p className="text-xs text-red-500 text-center mb-3 font-semibold" >{otpError}</p>
                                )}
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={otp.length !== 6 || otpVerifying}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl
                                    font-semibold text-sm transition flex items-center justify-center gap-2"
                                >
                                    {otpVerifying && <FiLoader size={14} className="animate-spin" />}
                                    {otpVerifying ? "Verifying..." : "Verify Email"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {editOpen && (
                <EditProfileModal
                    user={user}
                    onClose={() => setEditOpen(false)}
                    onSaved={handleProfileSaved}
                />
            )}
        </>
    )

}

export default Profile