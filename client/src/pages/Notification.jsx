import React, { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Avatar } from "../components/Avatar.jsx"
import { getNotifications, markNotificationRead } from "../api/notification.api.js"
import {
    FiBell, FiRefreshCw, FiAlertCircle, FiInbox,
    FiHeart, FiMessageCircle, FiAtSign,
} from "react-icons/fi"

import NotificationSkeleton from "../components/notifications/NotificationSkeleton.jsx"
import NotificationRow from "../components/notifications/NotificationRow.jsx"

function NotificationsPage() {

    const navigate = useNavigate()

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)

    const fetchNotifications = useCallback(async (isRefresh = false) => {

        if (isRefresh) setRefreshing(true)
        else setLoading(true)

        setError(null)

        const res = await getNotifications()

        if (isRefresh) setRefreshing(false)
        else setLoading(false)

        if (!res.success) {
            setError(res.error)
            return
        }

        setNotifications(res.data.notifications ?? [])

    }, [])

    useEffect(() => {
        fetchNotifications(false)
    }, [fetchNotifications])

    const handleOpen = async (n) => {

        if (!n.is_read) {
            
            setNotifications(prev =>
                prev.map(item => item.uuid === n.uuid ? { ...item, is_read: true } : item )
            )

            await markNotificationRead(`${n.uuid}`)

        }

    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] py-10" >
            <div className="max-w-2xl mx-auto" >
                <div className="mb-7 flex items-center justify-between" >
                    <div>
                        <div className="flex items-center gap-3" >
                            <FiBell size={18} className="text-indigo-500" />
                            <h1 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-gray-900 tracking-tight" >
                                Notifications
                            </h1>
                            {
                                unreadCount > 0 && (
                                    <span className="text-[11px] font-bold text-white bg-indigo-500 rounded-full px-2 py-0.5 leading-none" >
                                        {unreadCount}
                                    </span>
                                )
                            }
                        </div>
                        <p className="text-sm text-gray-400 font-medium" >
                            Mentions and activity on your posts
                        </p>
                    </div>
                    <button
                        onClick={() => fetchNotifications(true)}
                        disabled={refreshing || loading}
                        aria-label="Refresh notifications"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200
                        hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 text-gray-600
                        rounded-xl text-sm font-semibold transition disabled:opacity-50"
                    >
                        <FiRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        {
                            refreshing
                                ? "Refreshing"
                                : "Refresh"
                        }
                    </button>
                </div>

                {
                    loading ? (
                        <div className="flex flex-col gap-3" >
                            {
                                [1, 2, 3, 4].map(i => (
                                    <NotificationSkeleton key={i} />
                                ))
                            }
                        </div>
                    ) : error ? (
                        <div className="text-center bg-white rounded-3xl border border-gray-100 p-12 shadow-sm" >
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4" >
                                <FiAlertCircle size={24} className="text-red-400" />
                            </div>
                            <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-gray-900 mb-2" >
                                Couldn't load notifications
                            </h3>
                            <p className="text-sm text-gray-400 mb-6" >
                                {error}
                            </p>
                            <button
                                onClick={() => fetchNotifications(false)}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm 
                                font-semibold hover:bg-indigo-700 transition"
                            >
                                Try again
                            </button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center bg-white rounded-3xl border border-gray-100 p-12 shadow-sm" >
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4" >
                                <FiInbox size={24} className="text-gray-300" />
                            </div>
                            <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-gray-900 mb-2" >
                                You're all caught up
                            </h3>
                            <p className="text-sm text-gray-400" >
                                New mentions and activity will show up here.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3" >
                            {
                                notifications.map(n => (
                                    <NotificationRow
                                        key={n.uuid}
                                        n={n}
                                        onOpen={handleOpen}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )

}

export default NotificationsPage