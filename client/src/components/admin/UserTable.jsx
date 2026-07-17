import React from "react"
import {
    FiUser, FiUserX, FiUserCheck,
    FiSlash, FiTrash2, FiLoader,
    FiUsers
} from "react-icons/fi"

import { Avatar } from "../Avatar.jsx"
import StatusBadge from "./StatusBadge.jsx"

import { suspendUser, unsuspendUser, banUser } from "../../api/admin.api.js"
import ConfirmModal from "./ConfirmModal.jsx"

function UserTable({ loading, users, setConfirmAction }){

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" >
            {loading ? (
                <div className="p-10 flex justify-center" >
                    <FiLoader className="animate-spin text-indigo-500" size={22} />
                </div>
            ) : users.length === 0 ? (
                <div className="p-12 flex flex-col items-center text-center" >
                    <FiUsers size={28} className="text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-400" >
                        No users found
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto" >
                    <table className="w-full text-sm" >
                        <thead>
                            <tr className="border-b border-gray-100 text-left text-[11px]
                                        uppercase tracking-wide text-gray-400" 
                            >
                                <th className="px-5 py-3 font-bold" >User</th>
                                <th className="px-5 py-3 font-bold" >Email</th>
                                <th className="px-5 py-3 font-bold" >Role</th>
                                <th className="px-5 py-3 font-bold" >Status</th>
                                <th className="px-5 py-3 font-bold text-right" >Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                users.map(u => (
                                    <tr key={u.uuid} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60" >
                                        <td className="px-5 py-3" >
                                            <div className="flex items-center gap-3" >
                                                <Avatar
                                                    firstName={u.first_name}
                                                    lastName={u.last_name}
                                                    size="w-8 h-8"
                                                    textSize="text-[10px]"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-[13.5px]" >
                                                        {u.first_name} {u.last_name}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400" >
                                                        @{u.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-[13px]" >
                                            {u.email}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-[13px] capitalize" >
                                            {u.role}
                                        </td>
                                        <td className="px-5 py-3" >
                                            <StatusBadge status={u.account_status} />
                                        </td>
                                        <td className="px-5 py-3" >
                                            <div className="flex items-center justify-end gap-1.5" >
                                                {u.role === "admin" ? (
                                                    <span className="text-[11px] text-gray-400 font-semibold pr-2" >
                                                        Protected
                                                    </span>
                                                ) : (
                                                    <>
                                                        {
                                                            u.account_status === "suspended" ? (
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: "unsuspend", user: u }) }
                                                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300
                                                                    hover:text-emerald-600 hover:bg-emerald-50 transition"
                                                                    title="Unsuspend"
                                                                >
                                                                    <FiUserCheck size={14} />
                                                                </button>
                                                            ) : u.account_status === "active" && (
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: "suspend", user: u }) }
                                                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-amber-300 
                                                                    hover:text-amber-600 hover:bg-amber-50 transition"
                                                                    title="suspend"
                                                                >
                                                                    <FiUserX size={14} />
                                                                </button>
                                                            )
                                                        }
                                                        {
                                                            u.account_status === "banned" ? (
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: "unban", user: u }) }
                                                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-emarld-300
                                                                    hover:text-emerald-600 hover:bg-emerald-50 transition"
                                                                    title="Unban"
                                                                >
                                                                    <FiUserCheck size={14} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setConfirmAction({ type: "ban", user: u }) }
                                                                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300
                                                                    hover:text-red-600 hover:bg-red-50 transition"
                                                                    title="Ban"
                                                                >
                                                                    <FiSlash size={14} />
                                                                </button>
                                                            )
                                                        }

                                                        <button
                                                            onClick={() => setConfirmAction({ type: "delete", user: u }) }
                                                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300
                                                                hover:text-red-600 hover:bg-red-50 transition"
                                                                title="Delete"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )

}

export default UserTable