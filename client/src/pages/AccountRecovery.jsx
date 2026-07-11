import React, { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { findAccount, sendResetOTP, verifyResetOTP, resetPassword } from "../api/recover.api.js"
import { STEPS } from "../data/Recovery_steps.js"
import ToastStack from "../components/ToastStack.jsx"
import StepDots from "../components/recovery/StepDots.jsx"
import { FiZap } from "react-icons/fi"

const RESEND_COOLDOWN = 60

function AccountRecovery() {

    const navigate = useNavigate()

    const [step, setStep] = useState()
    const [loading, setLoading] = useState(false)
    const [toasts, setToasts] = useState([])
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    const [maskedEmail, setMaskEmail] = useState("")
    const [userId, setuserId] = useState(null)
    const [resetToken, setResetToken] = useState("")
    const [otp, setOtp] = useState("")
    const [cooldown, setCooldown] = useState(0)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPw, setShowPw] = useState(false)
    const [showConfPw, setShowConfPw] = useState(false)

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now()
        setToasts((p) => [...p, { id, message, type }])
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000)
    },[])

    const removeToast = useCallback((id) => {
        setToasts((p) => p.filter((t) => t.id !== id))
    },[])

    useEffect(() => {
        if (cooldown <= 0) return 
        const t = setInterval(() => {
            setCooldown((c) => Math.max(0, c - 1))
        }, 1000);
    },[cooldown])

    const handleFindAccount = async (e) => {

        e.preventDefault()
        setError("")

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Enter a valid email address")
            return
        }

        setLoading(true)

        const found = await findAccount(email.trim())

        if (!found.success) {
            setLoading(false)
            setError(found.error)
            return
        }

        setMaskEmail(found.data.masked_email)
        setuserId(found.data.user_id)

        const sent = await sendResetOTP(found.data.user_id)
        setLoading(false)

        if (!sent.success) {
            addToast(sent.error, "error")
            return
        }

        setCooldown(RESEND_COOLDOWN)
        addToast("Verification code sent", "success")
        setStep(STEPS.OTP)

    }

    const handleResend = async () => {
        if (cooldown > 0 || !userId) return 
        setLoading(true)
        const sent = await sendResetOTP(userId)
        setLoading(false)
        if (!sent.success) {
            addToast(sent.error, "error")
            return
        }
        setCooldown(RESEND_COOLDOWN)
        addToast("A new code was sent to your email", "success")
    }

    const handleVerifyOtp = async (e) => {

        e.preventDefault()
        setError("")

        if (!otp.trim() || otp.trim().length < 4) {
            setError("Enter the code we sent you")
            return
        }

        setLoading(true)

        const result = await verifyResetOTP(userId, otp.trim())

        setLoading(false)

        if (!result.success) {
            setError(result.error)
            return 
        }

        setResetToken(result.data.reset_token)
        addToast("Code verified", "success")
        setStep(STEPS.RESET)
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError("")

        if (newPassword.length < 8) {
            setError("Password must be at least 8 charcters")
            return 
        }

        if (newPassword !== confirmPassword) {
            setError("Password don't match")
            return
        }

        setLoading(true)
        const result = await resetPassword(resetToken, newPassword)
        setLoading(false)

        if (!result.success) {
            addToast(result.error, "error")
            setError(result.error)
            return 
        }

        setStep(STEPS.DONE)

    }

    const goBack = () => {
        setError("")
        if (step === STEPS.OTP) setStep(STEPS.EMAIL)
        else if (step === STEPS.RESET) setStep(STEPS.OTP)
        else navigate("/auth")
    }

    return (
        <div>
            <ToastStack toasts={toasts} remove={removeToast} />
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
                    ::placeholder {
                        color: transparent;
                    }
                    @keyframes panelIn {
                        from {
                            opacity:0;
                            transform:translateY(14px);
                        }
                        to {
                            opacity:1;
                            transform:translateY(0);
                        }
                    }
                    .panel-enter {
                        animation: panelIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
                    }
                `}
            </style>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']" >
                <div className="w-full max-w-[440px]" >
                    <div className="flex items-center justify-center gap-3 mb-8" >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center" >
                            <FiZap size={20} className="text-white" />
                        </div>
                        <span className="text-[20px] font-extrabold text-gray-900 tracking-tight font-['Bricolage_Grotesque']" >
                            Blog-Site
                        </span>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8" >
                        {step !== STEPS.DONE && (
                            <StepDots current={step} />
                        )}
                        <div
                            key={step}
                            className="panel-enter"
                        >

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default AccountRecovery