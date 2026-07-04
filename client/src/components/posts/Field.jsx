import React from "react"
import { FiAlertCircle } from "react-icons/fi"

function Field({ label, required, error, children }) {
    return (
        <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1.5" >
                {label}{required && <span className="text-rose-400" >*</span>}
            </label>
            {children}
            {error && (
                <p className="text-[11.5px] text-rose-500 font-semibold mt-1 flex items-center gap-1" >
                    <FiAlertCircle size={11} />{error}
                </p>
            )}
        </div>
    )
}

export default Field