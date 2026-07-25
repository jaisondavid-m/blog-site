import React from "react"

function Section({ title, children }) {

    return (
        <div className="mb-5 last:mb-0" >
            <h3 className="text-[13.5px] font-bold text-gray-900 mb-1.5" >{title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed" >{children}</p>
        </div>
    )

}

export default Section