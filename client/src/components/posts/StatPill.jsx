import React from "react"

function StatPill({ icon: Icon, value, label }) {
    return (
        <div className="flex items-center gap-1.5 text-gray-400" >
            <Icon size={13} />
            <span className="text-[12.5px] font-semibold" >
                {value}
            </span>
            {
                label && (
                    <span className="text-[12px]" >
                        {label}
                    </span>
                )
            }
        </div>
    )
}

export default StatPill