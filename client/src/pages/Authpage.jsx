import React, { useState, useEffect, useRef, useCallback } from "react"
import { registerUser, loginUser } from "../api/auth.api.js"

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
    { label: "Very Weak", barClass: "#ef4444", badgeClass: "#fef2f2" },
    { label: "Weak", barClass: "#f97316", badgeClass: "#fff7ed" },
    { label: "Fair", barClass: "#eab308", badgeClass: "#fefce8" },
    { label: "Strong", barClass: "#22c55e", badgeClass: "#f0fdf4" },
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
        ["username", "password"].forEach((key) => {
            const err = validators[key]?.(fields[key], fields)
            if (err) errors[key] = err
        })
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
const ToggglePw = ({ show , onToggle }) => {
    <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide Password" : "Show Password"}
        className="text-gray-400 hover:text-indigo-500 transition-colors duration-150 p-1 rounded-md flex items-center"
    >
        {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
    </button>
}

/** Password Strength meter */
const PasswordStrength = ({ password }) => {

    if (!password) return null
    const score = PASSWORD_RULES.filter((r) => r.test(password).length)
    const meta = STRENGTH_META[score-1] || STRENGTH_META[0]

    return (
        <div className="mt-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
            {/** Bars */}
            <div className="flex gap-1.5 mb-3">
                {[0,1,2,3].map((i) => (
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

const ToastStack = ({ toasts , remove }) => (
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