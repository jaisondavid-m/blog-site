import React from "react"
// import STEPS from "../../data/Recovery_steps"

const STEPS = {
    EMAIL: "email",
    OTP: "otp",
    RESET: "reset",
    DONE: "done",
}

const STEP_ORDER = [STEPS.EMAIL, STEPS.OTP, STEPS.RESET]

function StepDots({ current }) {
    const idx = STEP_ORDER.indexOf(current)
    return (
        <div className="flex items-center justify-center gap-2 mb-8" >
            {
                STEP_ORDER.map((s,i) => (
                    <React.Fragment key={s} >
                        <div
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200
                                ${i <= idx ? "bg-indigo-600" : "bg-gray-200"}
                                ${i === idx ? "ring-4 ring-indigo-100" : ""}
                                `}
                        />
                        {
                            i < STEP_ORDER.length - 1 && (
                                <div
                                    className={`w-8 h-[2px] rounded-full transition-all duration-300 
                                            ${
                                                i < idx
                                                    ? "bg-indigo-600"
                                                    : "bg-gray-200"
                                            }
                                        `}
                                />
                            )
                        }
                    </React.Fragment>
                ))
            }
        </div>
    )
}

export default StepDots