import React, { useCallback, useEffect, useState } from "react"

import Filters from "../components/admin/Filters.jsx"
import UserTable from "../components/admin/UserTable.jsx"

import {
    getAdminUsers, suspendUser, unsuspendUser,
    banUser, unbanUser, deleteUser,
} from "../api/admin.api"

import ConfirmModal from "../components/admin/ConfirmModal.jsx"

import { FiAlertCircle, FiRefreshCw, FiShield } from "react-icons/fi"

function Admin() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [search, setSearch]  =useState("")
    const [searchInput, setSearchInput] = useState("")
    const [status, setStatus] = useState("")
    const [role, setRole] = useState("")

    const [confirmAction, setConfirmAction] = useState(null)
    
    const fetchUsers = useCallback(async (pageNum = 1) => {

        setLoading(true)
        setError(null)

        const res = await getAdminUsers({ page: pageNum, limit: 20, search, status, role })

        setLoading(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        setUsers(res.data.users ?? [])
        setPagination(res.data.pagination ?? null)

    },[search, status, role])

    useEffect(() => {
        setPage(1)
        fetchUsers(1)
    },[search, status, role, fetchUsers])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setSearch(searchInput.trim())
    }

    const goToPage = (p) => {
        if (p < 1) return 
        setPage(p)
        fetchUsers(p)
    }

    const runAction = async () => {

        if (!confirmAction) return 

        const { type, user } = confirmAction

        setActionLoading(true)

        const actionMap = {
            suspend: suspendUser,
            unsuspend: unsuspendUser,
            ban: banUser,
            unban: unbanUser,
            delete: deleteUser,
        }

        const res = await actionMap[type](user.uuid)

        setActionLoading(false)

        if (!res.success) {
            setError(res.error)
            setConfirmAction(null)
            return
        }

        setConfirmAction(null)

        if (type === "delete") {
            setUsers(prev => prev.filter(u => u.uuid !== user.uuid))
        } else {
            const newStatus = type === "suspend" ? "suspended" : type === "ban" ? "banned" : "active"
            setUsers(prev =>
                prev.map(u => u.uuid === user.uuid ? { ...u, account_status: newStatus } : u )
            )
        }

    }

    const actionCopy = {
        suspend: {
            title: "Suspend user?",
            label: "Suspend",
            danger: false,
            msg: (u) => `${u.username} will be temporarily blocked from signing in.`,
        },
        unsuspend: {
            title: "Reactivate user?",
            label: "Reactivate",
            danger: false,
            msg: (u) => `${u.username}'s account will be set back to active.`,
        },
        ban: {
            title: "Ban user?",
            label: "Ban",
            danger: true,
            msg: (u) => `${u.username} will be permanently banned. This can be reversed later.`,
        },
        unban: {
            title: "Unban user?",
            label: "Unban",
            danger: false,
            msg: (u) => `${u.username}'s account will be restored to active.`
        },
        delete: {
            title: "Delete user?",
            label: "Delete",
            danger: true,
            msg: (u) => `${u.username}'s account will be soft-deleted. This cannot be undone from this page.`
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']" >
            <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10" >
                <div className="flex items-center justify-between mb-6" >
                    <div>
                        <div className="flex items-center gap-2 mb-1" >
                            <FiShield size={18} className="text-indigo-500" />
                            <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold
                            text-gray-900 tracking-tight" >
                                User Management
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 font-medium" >
                            { pagination ? `${pagination.total} total users` : "Loading..."  }
                        </p>
                    </div>
                    <button
                        onClick={() => fetchUsers(page)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 
                        rounded-xl text-sm font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-600
                        hover:bg-indigo-50 transition"
                    >
                        <FiRefreshCw size={14} />
                        Refresh
                    </button>
                </div>
                <Filters
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    status={status}
                    setStatus={setStatus}
                    role={role}
                    setRole={setRole}
                    handleSearchSubmit={handleSearchSubmit}
                />

                {error && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border
                    border-red-100 rounded-xl text-sm text-red-600" >
                        <FiAlertCircle size={14} />
                        {error}
                    </div>
                )}

                <UserTable
                    loading={loading}
                    users={users}
                    setConfirmAction={setConfirmAction}
                />

            </div>

            {
                confirmAction && (
                    <ConfirmModal
                        title={actionCopy[confirmAction.type].title}
                        message={actionCopy[confirmAction.type].msg(confirmAction.user)}
                        confirmLabel={actionCopy[confirmAction.type].label}
                        danger={actionCopy[confirmAction.type].danger}
                        loading={actionLoading}
                        onConfirm={runAction}
                        onCancel={() => setConfirmAction(null)}
                    />
                )
            }

        </div>
    )

}

export default Admin