import React, { useEffect, useState } from "react"
import { getHealthStatus } from "../api/test.api.js"

function Test() {

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [error, setError] = useState("")

    const fetchHealth = async () => {

        setLoading(true)

        const result = await getHealthStatus()

        if (result.success) {
            setData(result.data)
            setError("")
        } else {
            setError(result.error)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchHealth()
    },[])

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Backend Health Check</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Testing Go Gin API Connection
                    </p>
                </div>
                {
                    loading && (
                        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <p className="text-sm text-zinc-300">
                                Checking server...
                            </p>
                        </div>
                    )
                }
                {
                    error && (
                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        </div>
                    )
                }
                {
                    data && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                                <p className="text-sm text-zinc-300">
                                    Server Status
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-green-400">
                                    {data.status}
                                </h2>
                            </div>
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                <p className="text-sm text-zinc-400">
                                    Database
                                </p>
                                <h2 className="mt-1 text-lg font-medium">
                                    {data.database}
                                </h2>
                            </div>
                        </div>
                    )
                }
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                >
                    Refresh
                </button>
            </div>
        </div>
    )
}

export default Test