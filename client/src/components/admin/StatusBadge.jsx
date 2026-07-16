import React from "react"

function StatusBadge({ status }) {

    const styles = {
        active: "bg-emerald-50 text-emerald-600 border-emerald-100",
        suspended: "bg-amber-50 text-amber-600 border-amber-100",
        banned: "bg-red-50 text-red-600 border-red-100"
    }

    return (
        <span className={`text-[11px] font-bold uppercase tracking-wide
        px-2.5 py-1 rounded-full border ${styles[status] || "bg-gray-50 text-gray-500 border-gray-100"}`} >
            {status}
        </span>
    )
}

export default StatusBadge