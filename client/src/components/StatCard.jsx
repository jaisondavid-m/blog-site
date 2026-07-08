import React from "react"

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="bg-whtie rounded-2xl border border-gray-100 px-5 py-5 flex items-center gap-4 shadow-sm" >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`} >
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-900 font-['Bricolage_Grotesque'] leading-none" >
                    {value}
                </p>
                <p className="text-[12.5px] text-gray-500 mt-0.5 font-medium" >
                    {label}
                </p>
            </div>
        </div>
    )
}

export default StatCard