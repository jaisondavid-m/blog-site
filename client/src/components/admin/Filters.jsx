import React from "react"
import { FiSearch } from "react-icons/fi"

function Filters({ searchInput, setSearchInput,status, setStatus, role, setRole,  handleSearchSubmit }) {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 bg-white border 
        border-gray-100 rounded-xl px-3 py-2" 
        >
            <form
                onSubmit={handleSearchSubmit}
                className="flex-1 min-w-[200px] flex items-center gap-2 bg-gray-50 border 
                border-gray-200 rounded-lg px-3 py-2"
            >
                <FiSearch size={14} className="text-gray-400" />
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search name, username, email..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                />
            </form>
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-sm font-semibold text-gray-600 bg-white border
                border-gray-200 rounded-lg px-3 py-2 outline-none"
            >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
            </select>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-sm font-semibold text-gray-600 bg-white border
                border-gray-200 rounded-lg px-3 py-2 outline-none"
            >
                <option value="">All</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
            </select>
        </div>
    )
}

export default Filters