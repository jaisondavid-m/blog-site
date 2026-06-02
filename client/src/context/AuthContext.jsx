import { createContext , useContext , useState , useEffect } from "react"
import { getMe } from "../api/auth.api.js" 

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

    const [user, setUser] = useState(undefined)

    useEffect(() => {

        let mounted = true

        const fetchUser = async () => {

            try {

                const res = await getMe()

                if (!mounted) return

                setUser(
                    res.success
                        ? res.data.user
                        : null
                )

            } catch {
                
                if (!mounted) return

                setUser(null)

            }

        }

        fetchUser()

        // getMe().then((res) => {
        //     setUser(res.success ? res.data.user : null)
        // })

        return () => {
            mounted = false
        }

    },[])

    return (
        <AuthContext.Provider value={{ user , setUser }} >
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)