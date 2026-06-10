import React from "react"
import { FiCheck, FiX } from "react-icons/fi"

function ToastStack({ toasts, remove }) {
    return (
        <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none" >
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-s-[280px] max-w-[360px]
                        pointer-events-auto animate-[toastIn_0.25s_ease]
                        ${t.type === "success" ? "bg-slate-900 border-slate-800" : "bg-white border-red-100"}`}
                >
                    <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white
                                ${t.type === "success" ? "bg-emerald-500" : "bg-red-500"}
                            `}
                    >
                        {
                            t.type === "success"
                                ? <FiCheck size={11} strokeWidth={3} />
                                : <FiX size={11} strokeWidth={3} />
                        }
                    </div>
                    <div className="flex-1" >
                        <p className={`text-sm font-bold leading-tight ${t.type === "success" ? "text-slate-100" : "text-red-800"}`} >
                            {t.type === "success" ? "Success" : "Error"}
                        </p>
                        <p className={`text-[13px] mt-0.5 leading-snug ${t.type === "success" ? "text-slate-400" : "text-red-600"}`} >
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
            ))
            }
        </div >
    )
}

export default ToastStack