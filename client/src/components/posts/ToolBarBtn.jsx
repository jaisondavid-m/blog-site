import React from "react"

function ToolBarBtn({ icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            title={label}
            onClick={onClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
            hover:bg-gray-100 hover:text-gray-700 transition-colors duration-100"
        >
            <Icon size={14} />
        </button>
    )
}

export default ToolBarBtn