import React, { useState } from "react"
import { FiAlertCircle } from "react-icons/fi"

function Feild({ label, icon: Icon, type = "text", value, onChange, error, autoComplete, rightEl, hint, autoFocus, maxLength, inputMode }) {

    const [focused, setFocused] = useState(false)
    const hasVal = value?.toString().length > 0
    const floated = focused || hasVal
    const showErr = !!error

    return (
        <div className="mb-0.5" >
            <div
                className={`relative rounded-2xl border-[1.5px] transition-all duration-200
                        ${
                            showErr
                                ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.08)] bg-red-50/30"
                                : focused 
                                    ? "border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.10)] bg-white"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"

                        }
                    `}
            >
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200
                        ${
                            showErr
                                ? "text-red-400"
                                : focused
                                    ? "text-indigo-500"
                                    : "text-gray-400"
                        }
                    `} >
                    <Icon size={16} />
                </div>
                <label
                    className={`absolute left-11 pointer-events-none transition-all duration-200 font-['Plus_Jakarta_Sans']
                            ${
                                floated
                                    ? "top-2 text-[10.5px] font-bold tracking-widest uppercase"
                                    : "top-1/2 -translate-y-1/2 text-[14px] font-normal"
                            }
                            ${
                                showErr
                                    ? "text-red-400"
                                    : focused
                                        ? "text-indigo-500"
                                        : "text-gray-400"
                            }
                        `}
                >
                    {label}
                </label>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    inputMode={inputMode}
                    className={`w-full bg-transparent border-none outline-none rouned-2xl text-[15px] text-gray-900
                            font-['Plus_Jakarta_Sans'] transition-all duration-200
                            ${
                                floated
                                    ? "pt-6 pb-2.5 pl-11"
                                    : "py-[18px] pl-11"
                            }
                            ${
                                rightEl
                                    ? "pr-12"
                                    : "pr-4"
                            }
                        `}
                />
                {
                    rightEl && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10" >
                            {rightEl}
                        </div>
                    )
                }
            </div>
            {showErr ? (
                <p className="mt-1.5 ml-1 text-[12px] text-red-500 font-medium flex items-center gap-1" >
                    <FiAlertCircle size={11} />{error}
                </p>
            ) : hint ? (
                <p className="mt-1.5 ml-1 text-[11.5px] text-gray-400 flex items-center gap-1" >
                    {hint}
                </p>
            ) : null}
        </div>
    )

}

export default Feild