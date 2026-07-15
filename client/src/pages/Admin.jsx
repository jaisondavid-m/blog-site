import React, { useCallback, useState } from "react"
import { getAdminUsers } from "../api/admin.api"

function Admin() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    const [page, seetPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [search, setSearch]  =useState("")
    const [searchInput, setSearchInput] = useState("")
    const [status, setStatus] = useState("")
    const [role, setRole] = useState("")
    
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

    return (
        <div>
            Admin page
        </div>
    )

}

export default Admin