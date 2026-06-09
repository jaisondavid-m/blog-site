import React, { useState, useEffect, useRef, useCallback } from "react"
import { replace, useSearchParams, useNavigate } from "react-router-dom"
import { registerUser, loginUser , getMe } from "../api/auth.api.js"
import { useAuth } from "../context/AuthContext.jsx"

import {

    FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight,
    FiCheck, FiAlertCircle, FiLoader, FiX, FiGithub,
    FiShield, FiZap, FiTrendingUp, FiUsers, FiStar,
    FiChevronRight, FiInfo

} from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { SiDiscord } from "react-icons/si"

const VIEWS = { LOGIN: "login", REGISTER: "register" }

const PASSWORD_RULES = [
    { id: "length", label: "At least 8 Charcters", test: (p) => p.length >= 8 },
    { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "number", label: "One number", test: (p) => /\d/.test(p) },
    { id: "special", label: "One Special Character", test: (p) => /[!@#$%^&*()_+\-=\[\]{};'":,.<>\/?]/.test(p) },
]

const STRENGTH_META = [
    { label: "Very Weak", barClass: "bg-red-500", badgeClass: "bg-red-50 text-red-600" },
    { label: "Weak", barClass: "bg-orange-500", badgeClass: "bg-orange-50 text-orange-600" },
    { label: "Fair", barClass: "bg-yellow-500", badgeClass: "bg-yellow-50 text-yellow-600" },
    { label: "Strong", barClass: "bg-green-500", badgeClass: "bg-green-50 text-green-600" },
]

const validators = {
    first_name: (v) => !v.trim() ? "First name is required" : v.trim().length < 2 ? "Too short" : null,
    last_name: (v) => !v.trim() ? "Last name is required" : null,
    username: (v) => !v.trim() ? "Username is required" : v.length < 3 ? "Min 3 characters" : !/^[a-zA-Z0-9_]+$/.test(v) ? "Letters, numbers & underscores only" : null,
    email: (v) => !v.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email" : null,
    password: (v) => !v ? "Password is required" : v.length < 8 ? "Minimum 8 characters" : null,
    confirm_password: (v, fields) => !v ? "Please Confirm your password" : v !== fields.password ? "Password don't match" : null,
}

const validateForm = (view, fields) => {

    const errors = {}

    if (view === VIEWS.REGISTER) {
        ["first_name", "last_name", "username", "email", "password", "confirm_password"].forEach((key) => {
            const err = validators[key]?.(fields[key], fields);
            if (err) errors[key] = err
        })
        if (!fields.agreed) errors.agreed = "You must agree to continue"
    } else {
        if (!fields.username?.trim()) errors.username = "Username or email is required"
        if (!fields.password) errors.password = "Password is required"
        // ["username", "password"].forEach((key) => {
        //     const err = validators[key]?.(fields[key], fields)
        //     if (err) errors[key] = err
        // })
    }
    return errors
}

/*----------------------------------------------
    HOOKS
------------------------------------------------ */

const useField = (initial) => {
    const [value, setValue] = useState(initial)
    const [touched, setTouched] = useState(false)
    const onChange = useCallback((e) => {
        setValue(e.target.type === "checkbox" ? e.target.checked : e.target.value)
    }, [])
    const onBlur = useCallback(() => setTouched(true), [])
    return { value, touched, onChange, onBlur, setValue, setTouched }
}

/*-----------------------------------------------
    SUB-COMPONENTS
-------------------------------------------------*/

/** Floating-label input with icon, error state and optional right element */
const Feild = ({ label, icon: Icon, type = "text", name, field, error, autoComplete, rightEl, hint }) => {

    const [focused, setFocused] = useState(false)
    const hasVal = field.value?.toString().length > 0
    const floated = focused || hasVal
    const showErr = error && field.touched

    return (
        <div className="mb-0.5">
            {/* <ToastStack
                toasts={toasts}
                remove={removeToast}
            /> */}
            <div
                className={`relative rounded-2xl border-[1.5px] transition-all duration-200
                    ${showErr ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68.68,0.08)] bg-red-50/30"
                        : focused ? "border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.10)] bg-white"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
            >

                {/** Leading Icon */}
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200
                                ${showErr ? "text-red-400" : focused ? "text-indigo-500" : "text-gray-400"}`}
                >
                    <Icon size={16} />
                </div>

                {/** Floating Label */}
                <label
                    className={`absolute left-11 pointer-events-none transition-all duration-200 font-['Plus_Jakarta_Sans']
                                ${floated
                            ? "top-2 text-[10.5px] font-bold tracking-widest uppercase"
                            : "top-1/2 -translate-y-1/2 text-[14px] font-normal"}
                                ${showErr ? "text-red-400" : focused ? "text-indigo-500" : "text-gray-400"}
                                }
                            `}
                >
                    {label}
                </label>
                <input
                    type={type}
                    name={name}
                    value={field.value}
                    onChange={field.onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false)
                        field.onBlur()
                    }}
                    autoComplete={autoComplete}
                    className={`w-full bg-transparen border-none outline-none rounded-2xl text-[15px] text-gray-900
                            font-['Plus_Jakarta_Sans'] transition-all duration-200
                            ${floated ? "pt-6 pb-2.5 pl-11" : "py-[18px] pl-11"}
                            ${rightEl ? "pr-12" : "pr-4"}
                            `}
                />
                {/* Right Element */}
                {rightEl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                        {rightEl}
                    </div>
                )}
            </div>
            {/* Error / hint */}
            {showErr ? (
                <p className="mt-1.5 ml-1 text-[12px] text-red-500 font-medium flex items-center gap-1">
                    <FiAlertCircle size={11} /> {error}
                </p>
            ) : hint ? (
                <p className="mt-1.5 ml-1 text-[11.5px] text-gray-400 flex items-center gap-1">
                    <FiInfo size={11} /> {hint}
                </p>
            ) : null}
        </div>
    )
}

/** Password show/hide toggle */
const TogglePw = ({ show, onToggle }) => {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={show ? "Hide Password" : "Show Password"}
            className="text-gray-400 hover:text-indigo-500 transition-colors duration-150 p-1 rounded-md flex items-center"
        >
            {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
    )
}

/** Password Strength meter */
const PasswordStrength = ({ password }) => {

    if (!password) return null
    const score = PASSWORD_RULES.filter((r) => r.test(password)).length;
    const meta = STRENGTH_META[score - 1] || STRENGTH_META[0]

    return (
        <div className="mt-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
            {/** Bars */}
            <div className="flex gap-1.5 mb-3">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < score ? meta.barClass : "bg-gray-200"}`} />
                ))}
            </div>
            {/* Score Label */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500 font-semibold">Password Strength</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>{meta.label}</span>
            </div>
            {/* Rule CheckList */}
            <div className="grid grid-cols-2 gap-1.5">
                {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(password)
                    return (
                        <div key={rule.id} className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                                            ${ok ? "bg-emerald-500" : "bg-gray-200"}
                            `}>
                                {ok && <FiCheck size={9} strokeWidth={3} className="text-white" />}
                            </div>
                            <span className={`text-[11.5px] transition-colors duration-200 ${ok ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                {rule.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )

}

/* Toast Stack */

const ToastStack = ({ toasts, remove }) => (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[280px] max-w-[360px]
                    pointer-events-none animate-[toastIn_0.25s_ease]
                    ${t.type === "success" ? "bg-slate-900 border-slate-800" : "bg-white border-red-100"}
                `}
            >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white
                        ${t.type === "success" ? "bg-emerald-500" : "bg-red-500"}
                    `}>
                    {t.type === "success" ? <FiCheck size={11} strokeWidth={3} /> : <FiX size={11} strokeWidth={3} />}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-bold leading-tight ${t.type === "success" ? "text-slate-100" : "text-red-800"}`}>
                        {t.type === "success" ? "Success" : "Error"}
                    </p>
                    <p className={`text-[13px] mt-0.5 leading-snug ${t.type === "success" ? "text-slate-400" : "text-red-600"}`}>
                        {t.message}
                    </p>
                </div>
                <button
                    onClick={() => remove(t.id)}
                    className={`p-0.5 flex items-center transition-colors ${t.type === "success" ? "text-slate-500 hover:text-slate-300" : "text-red-300 hover:text-red-500"}`}
                >
                    <FiX size={14} />
                </button>
            </div>
        ))}
    </div>
)

/* Social Button */

const SocialBtn = ({ icon: Icon, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center justify-center gap-2 py-3 px-4 bg-white border-[1.5px] border-gray-200 rounded-xl
        text-[13.5px] font-semibold text-gray-700 font-['Plus_Jakarta_Sans']
        hover:bg-gray-50 hover:border-gray-300 hoverr:-translate-y-0.5 hover:shadow-sm
        transition-all duration-150 active:scale-[0.98]"
    >
        <Icon size={18} />
        {label}
    </button>
)

{/**Divider */ }
const Divider = ({ label }) => (
    <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">{label}</span>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
)

/* Primary Submit Button */
const SubmitBtn = ({ loading, label, loadingLabel }) => (
    <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
    >
        {loading
            ? <><FiLoader size={17} className="animate-spin" /> {loadingLabel}</>
            : <>{label} <FiArrowRight /></>
        }
    </button>
)

/* InLine Link-Button */
const LinkBtn = ({ children, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
            {children}
        </button>
    )

}

/* Left-Panel feature row */
const Feature = ({ icon: Icon, title, desc }) => (
    <div className="flex gap-3.5 items-start">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 text-indigo-400">
            <Icon size={17} />
        </div>
        <div>
            <p className="text-[14px] font-bold text-slate-100 m-0">{title}</p>
            <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5">{desc}</p>
        </div>
    </div>
)



/*===================================================
    MAIN PAGE
===================================================*/

function AuthPage() {

    const { setUser } = useAuth()

    const [searchParams, setSearchParams] = useSearchParams()
    const mode = searchParams.get("mode")
    const [view, setView] = useState(
        mode === "register" ? VIEWS.REGISTER : VIEWS.LOGIN
    )
    const [loading, setLoading] = useState(false)
    const [toasts, setToasts] = useState([])
    const [errors, setErrors] = useState({})
    const [panelKey, setPanelKey] = useState(0)

    /* Register fields */
    const firstName = useField("")
    const lastName = useField("")
    const regUsername = useField("")
    const regEmail = useField("")
    const regPassword = useField("")
    const confirmPassword = useField("")
    const [agreed, setAgreed] = useState(false)
    const [agreedTouched, setAgreedTouched] = useState(false)
    const [showRegPw, setShowRegPw] = useState(false)
    const [showConfPw, setShowConfPw] = useState(false)

    /* Login Fields */
    const logUsername = useField("")
    const logPassword = useField("")
    const [remember, setRemember] = useState(false)
    const [showLogPw, setShowLogPw] = useState(false)

    /* Toast helper */
    const addToast = useCallback((message, type) => {
        const id = Date.now()
        setToasts((p) => [...p, { id, message, type }])
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((p) => p.filter((t) => t.id !== id))
    }, [])

    /* View Switch */
    const switchView = (next) => {
        if (next === view) return
        setErrors({})
        setView(next)
        setSearchParams({
            mode: next
        })
        setPanelKey((k) => k + 1)
    }

    /* Touch helpers */
    const touchAll = (...fields) => fields.forEach((f) => f.setTouched(true))

    const navigate = useNavigate()

    /* Handlers */
    const handleRegister = async (e) => {

        e.preventDefault()

        const data = {
            first_name: firstName.value, last_name: lastName.value,
            username: regUsername.value, email: regEmail.value,
            password: regPassword.value, confirm_password: confirmPassword.value,
            agreed,
        }

        const errs = validateForm(VIEWS.REGISTER, data)
        touchAll(firstName, lastName, regUsername, regEmail, regPassword, confirmPassword)
        setAgreedTouched(true)
        if (Object.keys(errs).length) {
            setErrors(errs)
            return
        }
        setErrors({})
        setLoading(true)
        const result = await registerUser(data)
        setLoading(false)
        if (result.success) {
            const meRes = await getMe()
            if (meRes.data.user) {
                setUser(meRes.data.user)
            }
            addToast("Account created! Welcome", "success")
            // switchView(VIEWS.LOGIN)
            navigate("/home",{ replace: true }) //navigate to home page after register
        } else {
            addToast(result.error || "Registration failed. Please try again.", "error")
        }
    }

    const handleLogin = async (e) => {

        e.preventDefault()

        const data = { username: logUsername.value, password: logPassword.value }
        const errs = validateForm(VIEWS.LOGIN, data)

        touchAll(logUsername, logPassword)

        if (Object.keys(errs).length) {
            setErrors(errs)
            return
        }

        setLoading(true)

        const result = await loginUser(data)

        setLoading(false)

        if (result.success) {
            const meRes = await getMe()
            if (meRes.success) {
                setUser(meRes.data.user)
            }
            addToast("Signed in successfully!", "success")
            navigate("/home", { replace: true } )
        } else {
            addToast(result.error || "Invalid credentials. Please try again.", "error")
        }

    }
    useEffect(() => {
        const mode = searchParams.get("mode")
        if (mode === "register") {
            setView(VIEWS.REGISTER)
        } else {
            setView(VIEWS.LOGIN)
        }
    }, [searchParams])
    /* Render */
    return (
        <>
            <ToastStack
                toasts={toasts}
                remove={removeToast}
            />
            {/* Google + keyframes */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                ::placeholder { color: transparent; }
                input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #f9fafb inset !important; -webkit-text-fill-color: #111827 !important; }
                @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
                @keyframes panelIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
                .panel-enter { animation: panelIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
                input[type="checkbox"] { accent-color: #6366f1; }
            `}</style>
            <div className="min-h-screen flex font-['Plus_Jakarta_Sans'] bg-slate-50">
                {/* ══════════ LEFT PANEL  ══════════  */}
                <aside className="hidden lg:flex w-[440px] flex-shrink-0 flex-col justify-between bg-[#0a0f1e] px-11 py-11 relative overflow-hidden">
                    {/* Radial glows */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.18) 0%,transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(79.70,229,0.12) 0%, transparent 55%)" }}
                    />
                    <div className="absolute -top-20 -right-20 w-72 h-72 border border-indigo-500/10 rounded-full pointer-events-none" />
                    <div className="absolute bottom-16 -left-14 w-56 h-56 border border-indigo-500/8 rounded-full pointer-events-none" />

                    {/* Top Section */}
                    <div className="relative">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-14">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                                <FiZap size={20} className="text-white" />
                            </div>
                            <span className="text-[20px] font-extrabold text-slate-50 tracking-tight font-['Bricolage_Grotesque']">
                                Blog-Site
                            </span>
                        </div>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-full px-3 py-1.5 mb-5">
                            <FiStar size={11} className="text-indigo-400" />
                            <span className="text-[11.5px] font-bold text-indigo-400 tracking-widest uppercase">Trusted by Our Team(me)</span>
                        </div>

                        {/* Headline */}
                        <h1 className="font-['Bricolage_Grotesque'] text-[38px] font-extrabold text-slate-50 leading-[1.12] tracking-tight mb-4">
                            Discover Storis{" "}
                            <span className="bg-gradient-to-r from-indigo-300 to-indigo-300 bg-clip-text text-transparent">
                                That Matter.
                            </span>
                        </h1>
                        <p className="text-[15.5px] text-slate-500 leading-relaxed mb-10">
                            Read, write and share insightful blogs with a growing community of writers.
                        </p>
                    </div>
                </aside>
                {/* RIGHT PANEL */}
                <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                    <div className="w-full max-w-[460px]">
                        {/* Tab Switcher */}
                        <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-9 border border-gray-200">
                            {[
                                { key: VIEWS.LOGIN, label: "Sign in" },
                                { key: VIEWS.REGISTER, label: "Create Account" },
                            ].map(({ key, label }) => {
                                const active = view === key
                                return (
                                    <button
                                        key={key}
                                        onClick={() => switchView(key)}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-[14px] font-bold font-['Plus_Jakarta_Sans']
                                                transition-all duration-200 cursor-pointer border-none
                                                ${active
                                                ? "bg-white text-gray-900 shadow-md"
                                                : "bg-transparent text-gray-500 hover:text-gray-700"
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Animated Panel */}
                        <div key={panelKey} className="panel-enter">

                            {/* ==== Login View ==== */}
                            {view === VIEWS.LOGIN && (
                                <>
                                    <div className="mb-7">
                                        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-extrabold text-gray-900 tracking-tight mb-1.5">Welcome Back !</h2>
                                        <p className="text-[15px] text-gray-500 leading-relaxed">
                                            Sign in to your account to continue
                                        </p>
                                    </div>
                                    <form onSubmit={handleLogin} noValidate className="flex flex-col gap-2.5">
                                        <Feild
                                            label="Username or Email"
                                            icon={FiUser}
                                            name="username"
                                            field={logUsername}
                                            error={errors.username}
                                            autoComplete="username"
                                        />
                                        <Feild
                                            label="Password"
                                            icon={FiLock}
                                            type={showLogPw ? "text" : "password"}
                                            name="password"
                                            field={logPassword}
                                            error={errors.password}
                                            autoComplete="current-password"
                                            rightEl={<TogglePw show={showLogPw} onToggle={() => setShowLogPw((p) => !p)} />}
                                        />

                                        {/* Remember + Forget */}
                                        <div className="flex justify-between items-center pt-1 pb-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-[13.gpx] text-gray-600 font-medium select-none">
                                                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                                Remember me for 30 days
                                            </label>
                                            <LinkBtn
                                                onClick={() => {
                                                    navigate("/recover")
                                                }}
                                            >Forget Password?</LinkBtn>
                                        </div>
                                        <SubmitBtn loading={loading} label="Sign in" loadingLabel="Sigining in..." />
                                    </form>
                                    <p className="text-center text-[14px] text-gray-500 mt-6">
                                        New to {" "}
                                        <LinkBtn onClick={() => switchView(VIEWS.REGISTER)} >
                                            Create a free account <FiChevronRight size={13} className="inline mb-0.5" />
                                        </LinkBtn>
                                    </p>
                                </>
                            )}

                            {/* ==== REGISTER VIEW ==== */}
                            {view === VIEWS.REGISTER && (
                                <>
                                    <div className="mb-7">
                                        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-extrabold text-gray-900 tracking-tight mb-1.5">
                                            Create your account
                                        </h2>
                                        <p className="text-[15px] text-gray-500 leading-relaxed">
                                            Free Forever. No credit card required.
                                        </p>
                                    </div>
                                    <form onSubmit={handleRegister} noValidate className="flex flex-col gap-2.5">

                                        {/* Name row */}
                                        <div className="grid md:grid-cols-2 gap-2.5">
                                            <Feild label="First name" icon={FiUser} name="first_name" field={firstName} error={errors.first_name} autoComplete="given-name" />
                                            <Feild
                                                label="Last name"
                                                icon={FiUser}
                                                name="last_name"
                                                field={lastName}
                                                autoComplete="family-name"
                                            />
                                            <Feild
                                                label="Username"
                                                icon={FiUser}
                                                name="username"
                                                field={regUsername}
                                                error={errors.username}
                                                autoComplete="username"
                                                hint="Letters, numbers & underscores only"
                                            />
                                            <Feild
                                                label="Email address"
                                                icon={FiMail}
                                                type="email"
                                                name="email"
                                                field={regEmail}
                                                error={errors.email}
                                                autoComplete="email"
                                            />
                                            <div>
                                                <Feild
                                                    label="Password"
                                                    icon={FiLock}
                                                    type={showRegPw ? "text" : "password"}
                                                    name="password"
                                                    field={regPassword}
                                                    error={errors.password}
                                                    autoComplete="new-password"
                                                    rightEl={<TogglePw show={showRegPw} onToggle={() => setShowRegPw((p) => !p)} />}
                                                />
                                                <PasswordStrength password={regPassword.value} />
                                            </div>
                                            <Feild
                                                label="Confirm password"
                                                icon={FiLock}
                                                type={showConfPw ? "text" : "password"}
                                                name="confirm_password"
                                                field={confirmPassword}
                                                error={errors.confirm_password}
                                                autoComplete="new-password"
                                                rightEl={<TogglePw show={showConfPw} onToggle={() => setShowConfPw((p) => !p)} />}
                                            />
                                        </div>
                                        <label className="flex items-start gap-2 text-sm text-gray-600">
                                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                                            <span>
                                                I agree to the Terms of Service and Privacy Policy
                                            </span>
                                        </label>
                                        {errors.agreed && (
                                            <p className="text-red-500 text-xs">
                                                {errors.agreed}
                                            </p>
                                        )}
                                        <SubmitBtn loading={loading} label="Create my account" loadingLabel="Creating account..." />
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )

}

export default AuthPage