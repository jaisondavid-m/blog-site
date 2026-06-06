import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    FiUser, FiMail, FiAtSign, FiCalendar, FiEdit2,
    FiShield, FiLoader, FiAlertCircle, FiFileText,
    FiHeart, FiBookmark, FiTrendingUp, FiChevronRight,
    FiZap, FiCheckCircle
} from "react-icons/fi"
import { getMe } from "../api/auth.api.js"
import { useAuth } from "../context/AuthContext.jsx"
import api from "../api/axios.js"

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
            await api.post("/api/auth/verify-email",{ otp })
            setOtpSuccess(true)
            setLocal(prev => ({ ...prev, EmailVerified: true }))
            setUser(prev => ({ ...prev, EmailVerified: true }))
            setTimeout(() => setOtpModal(false),1500)
        } catch (err) {
            setOtpError(err.response?.data?.error)
        } finally {
            setOtpVerifying(false)
        }

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
            const secs = Math.max(0, Math.round((otpExpiry-Date.now()) / 1000))
            setTimeLeft(secs)
            if (secs === 0) setOtpModal(false)  
        },1000)
        return () => clearInterval(interval)
    },[otpModal,otpExpiry])

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
                            onClick={() => navigate("/settings")}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white duration-150
                            text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            <FiEdit2 size={14} />
                            Edit Profile
                        </button>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8" >
                    <div className="grid md:grid-cols-[300px_1fr] gap-6 items-start" >
                        <div className="fade-up bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" >
                            <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
                            <div className="px-7 pt-7 pb-7" >
                                <div className="flex flex-col items-center mb-6" >
                                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`} >
                                        <span className="text-white text-3xl font-extrabold font-['Bricolage_Grotesque'] select-none" >
                                            {initials(user?.FirstName, user?.LastName)}
                                        </span>
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
                                            {otpSending ? <FiLoader size={12} className="animate-spin" /> : <FiMail size={12} /> }
                                            { otpSending ? "Sending..." : "Verify Now" }
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
                                <StatCard icon={FiFileText} label="Post Written" value="0" accent="bg-indigo-500" />
                                <StatCard icon={FiHeart} label="Likes Received" value="0" accent="bg-rose-500" />
                                <StatCard icon={FiBookmark} label="Profile Views" value="0" accent="bg-emerald-500" />
                            </div>
                            <div className="fade-up fade-up-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-7" >
                                <h3 className="font-['Bricolage_Grotesque'] text-[17px] font-extrabold text-gray-900 mb-5 flex items-center gap-2" >
                                    <FiZap size={16} className="text-indigo-500" />
                                    Recent Activity
                                </h3>
                                {/* Empty state */}
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
                                </div>
                                {/* Count down */}
                                <div className={`text-center text-xs font-bold mb-4 ${timeLeft <= 30 ? "text-red-500" : "text-gray-400"}`} >
                                    Expires in {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}
                                </div>
                                <input
                                    type="text" 
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g,""))}
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
        </>
    )

}

export default Profile