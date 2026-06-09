import React , { useState , useCallback , useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight,
    FiArrowLeft, FiCheck, FiAlertCircle, FiLoader, FiX,
    FiShield, FiZap, FiCheckCircle
} from "react-icons/fi"
import api from "../api/axios.js"


const STEPS = {
    FIND_ACCOUNT:  "find_account",
    VERIFY_OTP: "verify_otp",
    RESET_PASSWORD: "reset_password",
    SUCCESS: "success",
}

const PASSWORD_RULES = [
    { id: "length" , label: "At Least 8 characters" , test: (p) => p.length >= 8 },
    { id: "upper" , label: "One uppercase letter" , test: (p) => /[A-Z]/.test(p) },
    { id: "number" , label: "One number" , test: (p) => /\d/.test(p) },
    { id: "special", label: "One special character", test: (p) => /[!@#$%^&*()_=\-=\[\]{};'":,.<>?]/.test(p) }
]

const STRENGTH_META = [
    { label: "Very Weak" , barClass: "bg-red-50" , badgeClass: "bg-red-50 text-red-600" },
    { label: "Weak" , barClass: "bg-orange-500" , badgeClass: "bg-orange-50 text-orange-600" },
    { label: "Fair" , barClass: "bg-yellow-500" , badgeClass: "bg-yellow-600" },
    { label: "Strong" , barClass: "bg-green-500" , badgeClass: "bg-green-50 text-green-600" }
]

const ToastStack = ({ toasts, remove }) => (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none" >
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[280px] max-w-[360px] pointer-events-none animate-[toastIn_0.25s_ease]
                        ${t.type === "success" ? "bg-slate-900 border-slate-800" : "bg-white border-red-100"}
                    `}
            >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white
                    ${t.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} 
                >
                    {t.type === "success"
                        ? <FiCheck size={11} strokeWidth={3} />
                        : <FiX size={11} strokeWidth={3} />
                    }
                </div>
                <div className="flex-1" >
                    <p className={`text-sm font-bold leading-tight ${t.type === "success" ? "text-slate-100" : "text-red-600"}`} >
                        {t.type === "success" ? "Success" : "Error"}
                    </p>
                    <p className={`text-[13px] mt-0.5 leading-snug ${t.type === "success" ? "text-slate-400" : "text-red-600"}`} >
                        {t.message}
                    </p>
                </div>
                <button
                    onClick={() => remove(t.id)}
                    className={`p-0.5 flex items-center transition-colors
                        ${t.type === "success" ? "text-slate-500 hover:text-slate-300" : "text-red-300 hover:text-red-500" }
                    `}
                >
                    <FiX size={14} />
                </button>
            </div>
        ))}
    </div>
)

const Field = ({ label, icon: Icon, type="text", value, onChange, onnBlur, touched, error, autoComplete, rightEl, hint }) => {

    const [focused, setFocused] = useState(false)
    const hasVal = value?.toString().length > 0
    const floated = focused || hasVal
    const showErr = error && touched

    return (
        <div className="mb-0.5" >
            <div className={`relative rounded-2xl border-[1.5px] transition-all duration-200
                    ${showErr
                        ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.88)] bg-red-50/30"
                        : focused
                            ? "border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.10)] bg-white"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }
                `} >
                    <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200
                            ${showErr ? "text-red-400" : focused ? "text-indigo-500" : "text-gray-400"}
                        `} 
                    >
                        <Icon size={16} />
                    </div>
                    <label
                        className={`absolute left-11 pointer-events-none transition-all duration-200 font-['Plus_Jakarta_Sans']
                                ${floated
                                    ? "top-2 text-[10.5px] font-bold tracking-widest uppercase"
                                    : "top-1/2 -translate-y-1/2 text-[14px] font-normal"
                                }
                                ${showErr ? "text-red-400" : focused ? "text-indigo-500" : "text-gray-400"}
                            `}
                    >
                        {label}
                    </label>
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => {
                            setFocused(false);
                            onBlur?.()
                        }}
                        autoComplete={autoComplete}
                        className={`w-full bg-transparent border-none outline-none rounded-2xl text-[15px] text-gray-900
                                font-['Plus_Jakarta_Sans'] transition-all duration-200
                                ${floated ? "pt-6 pb-2.5 pl-11" : "py-[18px] pl-11"}
                                ${rightEl ? "pr-12" : "pr-4"}
                            `}
                    />
                    {rightEl && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10" >
                            {rightEl}
                        </div>
                    )}
            </div>
            {showErr ? (
                <p className="mt-1.5 ml-1 text-[12px] text-red-500 font-medium flex items-center gap-1">
                    <FiAlertCircle size={11} /> {error}
                </p>
            ) : hint ? (
                <p className="mt-1.5 ml-1 text-[11.5px] text-gray-400" >{hint}</p>
            ) : null}
        </div>
    )
}

const TogglePw = ({ show, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide Password" : "Show Password"}
        className="text-gray-400 hover:text-indigo-500 transition-colors duration-150 p-1 rounded-md flex items-center"
    >
        {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
    </button>
)

const PasswordStrength = ({ password }) => {

    if (!password) return null
    const score = PASSWORD_RULES.filter((r) => r.test(password)).length
    const meta = STRENGTH_META[score-1] || STRENGTH_META[0]

    return (
        <div className="mt-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100" >
            <div className="flex gap-1.5 mb-3" >
                {[0,1,2,3].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 
                                ${i < score ? meta.barClass : "bg-gray-200"}
                            `}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center mb-3" >
                <span className="text-xs text-gray-500 font-semibold" >Password Strength</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.badgeClass}`} >
                    {meta.label}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5" >
                {PASSWORD_RULES.map((rule) => {
                    
                    const ok = rule.test(password)

                    return (
                        <div
                            key={rule.id}
                            className="flex items-center gap-1.5"
                        >
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
                                ${
                                    ok ? "bg-emerald-500" : "bg-gray-200"
                                }`} 
                            >
                                {ok && <FiCheck size={9} strokeWidth={3} className="text-white" />}
                            </div>
                            <span
                                className={`text-[11.5px] transition-colors duration-200
                                    ${
                                        ok ? "text-gray-800 font-medium" : "text-gray-400"
                                    }`}
                            >
                                {rule.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const SubmitBtn = ({ loading, label, loadingLabel, onClick, disabled }) => (
    <button
        type={onClick ? "button" : "submit"}
        onClick={onClick}
        disabled={loading || disabled}
        className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2
        transition-all disabled:opacity-60"
    >
        {
            loading
                ? <><FiLoader size={17} className="animate-spin" /> {loadingLabel}</>
                : <>{label} <FiArrowRight/></>
        }
    </button>
)

const StepDots = ({ current }) => {

    const steps = [STEPS.FIND_ACCOUNT, STEPS.VERIFY_OTP, STEPS.RESET_PASSWORD]

    return (
        <div className="flex items-center justify-center gap-2 mb-2" >
            {steps.map((s,i) => {
                const idx = steps.indexOf(current)
                const done = i < idx
                const active = s === current
                return (
                    <React.Fragment key={s} >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300
                                ${done ? "bg-emerald-500 text-white"
                                    : active ? "bg-indigo-600 text-white shadow-[0_0_0_4px_rgba(99,102,241,0.15)]"
                                    : "bg-gray-100 text-gray-400"
                                }
                            `}
                        >
                            {done ? <FiCheck size={12} strokeWidth={3} /> : i + 1 }
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-px w-8 transition-all duration-300 
                                    ${i < idx ? "bg-emerald-400" : "bg-gray-200"}
                                `} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

function ForgetPassword() {

    const navigate = useNavigate()

    const [step, setStep] = useState(STEPS.FIND_ACCOUNT)
    const [loading, setLoading] = useState(false)
    const [toasts, setToasts] = useState([])
    const [panelKey, setPanelKey] = useState(0)

    const [email, setEmail] = useState("")
    const [emailTouched, setEmailTouched] = useState(false)
    const [emailError, setEmailError] = useState(null)
    const [foundUser, setFoundUser] = useState(null)

    const [otp, setOtp] = useState("")
    const [otpError, setOtpError] = useState(null)
    const [resetToken, setResetToken] = useState("")
    const [otpExpiry, setOtpExpiry] = useState(null)
    const [timeLeft, setTimeLeft] = useState(120)
    const [resending, setResending] = useState(false)

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [pwTouched, setPwTouched] = useState(false)
    const [confTouched, setConfTouched] = useState(false)
    const [pwError, setPwError] = useState(null)
    const [confError, setConfError] = useState(null)
    const [showPw, setShowPw] = useState(false)
    const [showConf, setShowConf] = useState(false)

    const addToast = useCallback((message, type) => {
        const id = Date.now()
        setToasts((p) => [...p, { id, message, type }])
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)),5000)
    },[])

    const removeToast = useCallback((id) => [
        setToasts((p) => p.filter((t) => t.id !== id))
    ],[])

    const goToStep = (next) => {
        setStep(next)
        setPanelKey((k) => k +1)
    }

    useEffect(() => {
        if (step !== STEPS.VERIFY_OTP || !otpExpiry) return
        const interval = setInterval(() => {
            const secs = Math.max(0, Math.round((otpExpiry - Date.now()) / 1000))
            setTimeLeft(secs)
        },1000)
        return () => clearInterval(interval)
    },[step,otpExpiry])

    const validateEmail = () => {
        if (!email.trim()) return "Email address is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address"
        return null
    }

    const handleFindAccount = async (e) => {

        e.preventDefault()

        setEmailTouched(true)

        const err = validateEmail()

        if (err) {
            setEmailError(err)
            return
        }

        setEmailError(null)
        setLoading(true)

        try {
            const res = await api.post("/api/auth/forgot-password/find-account", {
                email: email.trim(),
            })
            setFoundUser(res.data)
            goToStep(STEPS.VERIFY_OTP)
        } catch (err) {
            const msg = err.response?.data?.error || "No account found with that email address."
            addToast(msg, "error")
            setEmailError(msg)
        } finally {
            setLoading(false)
        }
    }

    const sendOTP = async (isResend = false) => {

        if (isResend) {
            setResending(true)
        } else {
            setLoading(true)
        }

        setOtpError(null)

        try {
            await api.post("/api/auth/forgot-password/send-otp", {
                user_id: foundUser.user_id,
            })
            setOtpExpiry(Date.now() + 120_000)
            setTimeLeft(120)
            setOtp("")
            if (isResend) {
                addToast("A new OTP has been sent to your email.", "success")
            }
        } catch (err) {

            const msg = err.response?.data?.error || "Failed to send OTP. Please try again later"
            addToast(msg,"error")

        } finally {
            if (isResend) {
                setResending(false)
            } else {
                setLoading(false)
            }
        }
    }

    useEffect(() => {

        if (step === STEPS.VERIFY_OTP && foundUser && !otpExpiry) {
            sendOTP(false)
        }

    },[step, foundUser])

    const handleVerifyOTP = async () => {

        if (otp.length !== 6) return

        setLoading(true)
        setOtpError(null)

        try {
            const res = await api.post("/api/auth/forgot-password/verify-otp", {
                user_id: foundUser.user_id,
                otp,
            })
            setResetToken(res.data.reset_token)
            goToStep(STEPS.RESET_PASSWORD)
        } catch (err) {
            setOtpError(err.response?.data?.error || "Invalid or expired OTP.")
        } finally {
            setLoading(false)
        }
    }

    const validatePasswords = () => {

        let ok = true

        if (!password) {
            setPwError("Password is required");
            ok = false
        } else if (password.length < 8 ) {
            setPwError("Minimum 8 characters")
            ok = false
        } else {
            setPwError(null)
        }

        if (!confirmPassword) {
            setConfError("Please confirm your password")
            ok = false
        } else if (confirmPassword !== password) {
            setConfError("Password don't match")
            ok = false
        } else [
            setConfError(null)
        ]

        return ok
    }

    const handleResetPassword = async (e) => {

        e.preventDefault()

        setPwTouched(true)
        setConfTouched(true)

        if (!validatePasswords()) return

        setLoading(true)

        try {
            await api.post("/api/auth/forgot-password/reset",{
                reset_token: resetToken,
                new_password: password,
            })
            goToStep(STEPS.SUCCESS)
        } catch (err) {
            addToast(err.response?.data?.error || "Failed to reset password. Please start over.","error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <ToastStack toasts={toasts} remove={removeToast} />
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                ::placeholder { color: transparent; }
                input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #f9fafb inset !important; -webkit-text-fill-color: #111827 !important! }
                @keyframes toastIn {
                    from {
                        opacity:0; transform:translateX(20px)
                    }
                    to {
                        opacity:1; transform:translateX(0)
                    }
                }
                @keyframes panelIn {
                    from {
                        opacity:0; transform:translateY(14px);
                    }
                    to {
                        opacity:1; transform:translateY(0);
                    }
                }
                .panel-enter {
                    animation: panelIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
                }
                `}
            </style>
            <div className="min-h-screen flex font-['Plus_Jakarta_Sans'] bg-slate-50" >
                {/* Left Panel */}
                <aside className="hidden lg:flex w-[440px] flex-shrink-0 flex-col justify-between bg-[#0a0f1e] px-11 py-11 relative overflow-hidden" >
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse at 30% 20%, rgba(99, 102,241,0.18) 0%, transparent 60%), radial(ellipse at 80% 80%, rgba(79,70,229,0.12) 0%, transparent 55%)"
                        }}
                    />
                    <div
                        className="absolute -top-20 -right-20 w-72 h-72 border border-indigo-500/10 rounded-full pointer-events-none"
                    />
                    <div
                        className="absolute bottom-16 -left-14 w-56 h-56 border border-indigo-500/8 rounded-full pointer-events-nonne"
                    />

                    <div className="relative" >
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-14" >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center" >
                                <FiZap size={20} className="text-white" />
                            </div>
                            <span className="text-[20px] font-extrabold text-slate-50 tracking-tight font-['Bricolage_Grotesdque']" >
                                Blog-Site
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-full px-3 py-1.5 mb-5" >
                            <FiShield size={11} className="text-indigo-400" />
                            <span className="text-[11.5px] font-bold text-indigo-400 tracking-widest uppercase" >
                                Account Recovery
                            </span>
                        </div>
                        <h1 className="font-['Bricolage_Grotesque'] text-[38px] font-extrabold text-slate-50 leading-[1.12] tracking-tight mb-4" >
                            Recover Your{" "}
                            <span className="bg-gradient-to-r from-indigo-300 to-indigo-300 bg-clip-text text-transparent" >
                                Account. 
                            </span>
                        </h1>
                        <p className="text-[15.5px] text-slate-500 leading-relaxed" >
                            Follow the steps to verify your identity and create a new password securely.
                        </p>

                        {/* Steps guide */}
                        <div className="mt-10 space-y-5" >
                            {[
                                { n: 1, title: "Enter your email" , desc: "We'll look up your account" },
                                { n: 2, title: "Verify with OTP" , desc: "Enter the 6-digit code we email you" },
                                { n: 3, title: "Set a new password" , desc: "Choose a strong, secure password" },
                            ].map(({ n, title, desc }) => (
                                <div
                                    key={n}
                                    className="flex gap-3.5 items-start"
                                >
                                    <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/20 flex
                                        items-center justify-center flex-shrink-0 text-[12px] font-bold text-indigo-400" 
                                    >
                                        {n}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-100" >{title}</p>
                                        <p className="text-[13px] text-slate-500 mt-0.5" >{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Right Panel */}
                <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto" >
                    <div className="w-full max-w-[460px]" >
                        
                        {/* Back to login */}
                        {step !== STEPS.SUCCESS && (
                            <button
                                onClick={() => navigate("/auth?mode=login")}
                                className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 hover:text-indigo-600 transition-colors mb-6"
                            >
                                <FiArrowLeft size={14} /> Back to Sign in
                            </button>
                        )}

                        {/* Step dots */}
                        {step !== STEPS.SUCCESS && <StepDots current={step} />}

                        {/* -- Animated panel -- */}
                        <div key={panelKey} className="panel-enter" >

                            {/* Step 1 - Find account */}
                            {step === STEPS.FIND_ACCOUNT && (
                                <>
                                    <div className="mb-7" >
                                        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-extrabold text-gray-900 tracking-tight mb-1.5" >
                                            Find your account
                                        </h2>
                                        <p className="text-[15px] text-gray-500 leading-relaxed" >
                                            Enter your registered email address and we'll send you a one-time code.
                                        </p>
                                    </div>
                                    <form onSubmit={handleFindAccount} noValidate className="flex flex-col gap-2.5" >
                                        <Field
                                            label="Email address"
                                            icon={FiMail}
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value)
                                                setEmailError(null)
                                            }}
                                            onBlur={() => setEmailTouched(true)}
                                            touched={emailTouched}
                                            error={emailError}
                                            autoComplete="email"
                                        />
                                        <SubmitBtn
                                            loading={loading}
                                            label="Send reset code"
                                            loadingLabel="Searching..."
                                        />
                                    </form>
                                </>
                            )}

                            {/* Step 2 - Verify OTP */}
                            {step === STEPS.VERIFY_OTP && (
                                <>
                                    <div className="mb-7" >
                                        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-extrabold text-gray-900 tracking-tight mb-1.5" >
                                            Check your email
                                        </h2>
                                        <p className="text-[15px] text-gray-500 leading-relaxed">
                                            We sent a 6-digit code to{" "}
                                            <span className="font-semibold text-gray-700" >
                                                {foundUser?.masked_email ?? "your email"}
                                            </span>
                                            . Enter it below to continue.
                                        </p>        
                                    </div>

                                    {/* Countdown */}
                                    <div className={`text-center text-xs font-bold mb-4 
                                        ${timeLeft <= 30 ? "text-red-500" : "text-gray-400"}
                                        `} 
                                    >
                                        {
                                            timeLeft > 0
                                                ? <>Expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</>
                                                : <span className="text-red-500" >OTP expired - please resend</span>
                                        }
                                    </div>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(e.target.value.replace(/\D/g,""))
                                            setOtpError(null)
                                        }}
                                        placeholder="000000"
                                        className="w-full text-center text-3xl font-extrabold tracking-[0.5em] border-2 border-gray-200
                                        focus:border-indigo-400 rounded-2xl py-5 outline-none transition font-['Bricolage_Grotesque'] mb-2"
                                    />

                                    {otpError && (
                                        <p className="text-xs text-red-500 text-center mb-3 font-semibold flex items-center justify-center gap-1" >
                                            <FiAlertCircle size={11}  /> {otpError}
                                        </p>
                                    )}

                                    <SubmitBtn
                                        loading={loading}
                                        label="Verify OTP"
                                        loadingLabel="Verfying..."
                                        onClick={handleVerifyOTP}
                                        disabled={otp.length !== 6 || timeLeft === 0}
                                    />

                                    <div className="mt-5 flex items-center justify-between text-[13px]" >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPanelKey((k) => k + 1)
                                                setStep(STEPS.FIND_ACCOUNT)
                                            }}
                                            className="text-gray-400 hover:text-gray-600 font-medium transition-colors flex items-center gap-1"
                                        >
                                            <FiArrowLeft size={13} /> Wrong Email?
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => sendOTP(true)}
                                            disabled={resending || timeLeft > 90 }
                                            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-40 flex items-center gap-1"
                                        >
                                            {resending && <FiLoader size={12} className="animate-spin" />}
                                            Resend code
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Step 3 - Reset Password */}
                            {step === STEPS.RESET_PASSWORD && (
                                <>
                                    <div className="mb-7" >
                                        <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-extrabold text-gray-900 tracking-tight mb-1.5" >
                                            Set a new password
                                        </h2>
                                        <p className="text-[15px] text-gray-500 leading-relaxed" >
                                            Choose a strong password you haven't used before.
                                        </p>
                                    </div>
                                    <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-2.5" >
                                        <div>
                                            <Field
                                                label="New Password"
                                                icon={FiLock}
                                                type={showPw ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value)
                                                    setPwError(null)
                                                }}
                                                onBlur={() => setPwTouched(true)}
                                                touched={pwTouched}
                                                error={pwError}
                                                autoComplete="new-password"
                                                rightEl={<TogglePw show={showPw} onToggle={() => setShowPw((p) => !p )} />}
                                            />
                                            <PasswordStrength password={password} />
                                        </div>
                                        <Field
                                            label="Confirm New Password"
                                            icon={FiLock}
                                            type={showConf ? "text" : "password" }
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value)
                                                setConfError(null)
                                            }}
                                            onBlur={() => setConfTouched(true)}
                                            touched={confTouched}
                                            error={confError}
                                            autoComplete="new-password"
                                            rightEl={<TogglePw show={showConf} onToggle={() => setShowConf((p) => !p)} />}
                                        />
                                        <SubmitBtn
                                            loading={loading}
                                            label="Reset Password"
                                            loadingLabel="Resetting..."
                                        />
                                    </form>
                                </>
                            )}

                            {/* Step 4 - Success */}
                            {step === STEPS.SUCCESS && (
                                <div className="flex flex-col items-center text-center py-8" >
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6" >
                                        <FiCheckCircle size={36} className="text-emerald-500" />
                                    </div>
                                    <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-extrabold text-gray-900 tracking-tight mb-2" >
                                        Password Reset!
                                    </h2>
                                    <p className="text-[15px] text-gray-500 mb-8 max-w-xs" > 
                                        Your password has been updated successfully. You can now sign in with your new password. 
                                    </p>
                                    <button
                                        onClick={() => navigate("/auth?mode=login")}
                                        className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Sign in now <FiArrowRight/>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ForgetPassword