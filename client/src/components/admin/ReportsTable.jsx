import React from "react"

import {
    FiFileText, FiLoader
} from "react-icons/fi"

const reasonLabel = {
    spam: "Spam",
    harassment: "Harassment",
    hate_speech: "Hate Speech",
    misinformation: "Misinformation",
    nudity: "Nudity",
    violence: "Violence",
    other: "Other",
}

const statusStyles = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    reviewed: "bg-emerald-50 text-emerald-600 border-emerald-100"
}

function formatDate(iso) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    })
}

function ReportsTable({ loading, reports, onSelect }) {

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm font-medium" >
                <FiLoader className="animate-spin" size={16} />
                Loading reports...
            </div>
        )
    }

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2" >
                <FiFileText size={22} />
                <p className="text-sm font-medium" >No reports found</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm" >
            <table className="w-full text-sm" >
                <thead>
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100" >
                        <th className="px-5 py-3" >Post</th>
                        <th className="px-5 py-3" >Reporter</th>
                        <th className="px-5 py-3" >Reason</th>
                        <th className="px-5 py-3" >Status</th>
                        <th className="px-5 py-3" >Date</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        reports.map(r => (
                            <tr
                                key={r.uuid}
                                onClick={() => onSelect(r)}
                                className="border-b border-gray-50 last:border-0 hover:bg-indigo-50/40 cursor-pointer transition"
                            >
                                <td className="px-5 py-3.5 font-semibold text-gray-800 max-w-xs truncate" >
                                    {r.post_title}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600" >
                                    {r.reporter_name}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600" >
                                    {reasonLabel[r.reason] || r.reason}
                                </td>
                                <td className="px-5 py-3.5" >
                                    <span className={`text-[11px] font-bold uppercase trakcing-wide px-2.5 py-1 rounded-full border
                                            ${statusStyles[r.status] || "bg-gray-50 text-gray-500 border-gray-100"}
                                        `} >
                                        {r.status}
                                    </span> 
                                </td>
                                <td className="px-5 py-3.5 text-gray-400 text-[13px]" >
                                    {formatDate(r.created_at)}
                                </td>
                            </tr>   
                        ))
                    }
                </tbody>
            </table>
        </div>
    )

}

export default ReportsTable