import React from "react"

function ReportForm({ REASONS, setReason, setDescription, handleClose, handleSubmit, submitting, reason, description }) {

    return (
        <div>
            <div className="flex flex-col gap-2 mb-4" >
                {REASONS.map((r) => (
                    <label
                        key={r.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[13.5px]
                            font-medium cursor-pointer ${reason === r.value
                                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }
                        `}
                    >
                        <input
                            type="radio"
                            name="report-reason"
                            value={r.value}
                            checked={reason === r.value}
                            onChange={() => setReason(r.value)}
                            className="accent-indigo-600"
                        />
                        {r.label}
                    </label>
                ))}
            </div>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details (optional)"
                rows={3}
                className="w-full text-[13.5px] text-gray-700 border border-gray-200 rounded-xl p-3
                outline-none focus:border-indigo-400 resize-none mb-4"
            />
            <div className="flex gap-2 justify-end" >
                <button
                    onClick={handleClose}
                    className="px-4 py-2 text-[13px] font-semibold text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-2 bg-rose-500 hovre:bg-rose-600 disabled:opacity-50
                    text-white rounded-xl text-[13px] font-semibold transition"
                >
                    {
                        submitting
                            ? "Submitting.."
                            : "Submit Report"
                    }
                </button>
            </div>
        </div>

    )

}

export default ReportForm