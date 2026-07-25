import React, { useEffect, useState } from "react"
import { FiFileText, FiShield, FiX } from "react-icons/fi"

import TermsContent from "./TermsContent.jsx"
import PrivacyContent from "./PrivacyContent.jsx"

const TABS = [
    { key: "terms", label: "Terms of Service", icon: FiFileText },
    { key: "privacy", label: "Privacy Policy", icon: FiShield },
]

const LAST_UPDATED = "July 25, 2026"

function TermsModal({ open, initialTab = "terms", onClose, onAgree }) {

    const [tab, setTab] = useState(initialTab)

    useEffect(() => {
        if (open) setTab(initialTab)
    },[open, initialTab])

    useEffect(() => {
        if (!open) return 
        const onKey = (e) => e.key === "Escape" && onClose?.()
        document.addEventListener("keydown", onKey)
    },[open, onClose])

    if (!open) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']"
        >
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl border border-gray-100
            shadow-2xl flex flex-col overflow-hidden" >
                <div className="flex items-center justify-between px-6 pt-6 pb-6 border-b border-gray-50" >
                    <div>
                        <h2 className="font=['Bricolage_Grotesque'] text-[20px] font-extrabold text-gray-900 tracking-tight" >
                            Legal
                        </h2>
                        <p className="text-[12.5px] text-gray-400 font-medium mt-0.5" >
                            Last updated {LAST_UPDATED}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="flex gap-1.5 px-6 pt-4" >
                    {TABS.map(({ key, label, icon: Icon }) => {
                        const active = tab === key
                        return (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all
                                        ${
                                            active
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                        }
                                    `}
                            >
                                <Icon size={13} />
                                {label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5" >
                    {tab === "terms" ? <TermsContent/> : <PrivacyContent/>}
                </div>

                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-50 bg-gray-50/60" >
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white"
                    >     
                        Close
                    </button>
                    {onAgree && (
                        <button
                            onClick={onAgree}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-indigo-600
                            hover:bg-indigo-700 shadow-sm transition-all"
                        >
                            I agree
                        </button>
                    )}
                </div>  

            </div>
        </div>
    )

}

export default TermsModal