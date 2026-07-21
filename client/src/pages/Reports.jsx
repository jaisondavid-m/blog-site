import React, { useCallback, useEffect, useState } from "react"
import {
    FiAlertCircle, FiFlag, FiRefreshCw,
} from "react-icons/fi"

import ReportsTable from "../components/admin/ReportsTable"
import ReportDetailModal from "../components/admin/ReportDetailsModal.jsx"

import { getReports } from "../api/admin.api"


function Reports() {

    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("pending")
    const [selectedReport, setSelectedReport] = useState(null)

    const fetchReports = useCallback(async (pageNum = 1) => {

        setLoading(true)
        setError(null)

        const res = await getReports({ page: pageNum, limit: 20, status })

        setLoading(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        setReports(res.data.reports ?? [])

    },[status])

    useEffect(() => {
        setPage(1)
        fetchReports(1)
    },[status, fetchReports])

    const goToPage = (p) => {
        // setReports(prev => prev.filter(r => r.post_id !== report.))
        if (p < 1) return 
        setPage(1)
        fetchReports(p)
    }

    const handleDelete = (report) => {
        setReports(prev => prev.filter(r => r.post_id !== report.post_id))
        setSelectedReport(null)
    }

    const handleDismiss = (report) => {
        setReports(prev => prev.filter(r => r.uuid !== report.uuid))
        setSelectedReport(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 font-['Plus_Jakarta_Sans']" >
            <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10" >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1" >
                            <div className="p-2 rounded-xl bg-indigo-100" >
                                <FiFlag size={18} className="text-indigo-500" />
                            </div>
                            <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >
                                Reported Posts
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 font-medium" >
                            Review and moderate reported content
                        </p>
                    </div>
                    <button
                        onClick={() => fetchReports(page)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200
                        rounded-xl text-sm font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-600
                        hover:bg-indigo-50 transition"
                    >
                        <FiRefreshCw size={14} />
                        Refresh
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-5" >
                    {["pending","reviewed","all"].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition capitalize
                                ${
                                    status === s
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600" 
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {error && (
                    <div
                        className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border
                        border-red-100 rounded-xl text-sm text-red-600"
                    >
                        <FiAlertCircle size={14} />
                        {error}
                    </div>
                )}

                <ReportsTable
                    loading={loading}
                    reports={reports}
                    onSelect={setSelectedReport}
                />

                <div className="flex mt-6 items-center justify-center gap-4" >
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1 || loading}
                        className="px-5 py-2.5 bg-white border border-gray-200 hover:border-indigo-300
                        hover:text-indigo-600 hover:bg-indigo-50 text-gray-600 rounded-xl text-sm font-semibold
                        transition-all duration-150 disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm font-medium text-gray-400" >
                        Page {page}
                    </span>
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={reports.length < 20 || loading}
                        className="px-5 py-2.5 bg-white border border-gray-200 hover:border-indigo-300
                        hover:text-indigo-500 hover:bg-indigo-50 text-gray-600 rounded-xl text-sm font-semibold
                        transition-all duration-150 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

            <ReportDetailModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onDeleted={handleDelete}
                onDismissed={handleDismiss}
            />

        </div>
    )

}

export default Reports