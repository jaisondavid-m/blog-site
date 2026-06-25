import React from "react"

const TAGS = ["All", "Tech", "Design", "Business", "Science", "Health", "Culture"]

function TagFilter({ active, onChange }) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" >
            {TAGS.map(tag => {
                const value = tag === "All" ? "" : tag.toLowerCase()
                const isActive = active === value
                return (
                    <button
                        key={tag}
                        onClick={() => onChange(value)}
                        className={`flex-shrink-0 text-[12px] font-bold tracking-widest uppercase
                            px-3.5 py-1.5 rounded-full border transition-all duration-150
                                ${
                                    isActive
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50"
                                }
                            `}
                    >
                        {tag}
                    </button>
                )
            })}
        </div>
    )
}

export default TagFilter