import { createContext , useContext , useState , useEffect } from "react"
import { getMe } from "../api/auth.api.js" 

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

    const [user, setUser] = useState(undefined)

    useEffect(() => {
        getMe().then((res) => {
            setUser(res.success ? res.data.user : null)
        })
    },[])

    return (
        <AuthContext.Provider value={{ user , setUser }} >
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)