import { useState, useEffect, createContext } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { API } from '../api/API'
import logout from '../api/logout'
import fetchuser from '../api/user'
interface AuthContextType {
  isAuthenticated: boolean
  role: string | null
  setIsAuthenticated: (value: boolean) => void
  setRole: (value: string | null) => void
  handleLogout: () => Promise<void>
  loading: boolean | null
  user: string | null
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface Props {
  children: ReactNode
}

export default function AuthService({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setloading] = useState<boolean | null>(null);

  const [user, setUser] = useState<string | null>(null)
  // Check authentication status
  useEffect(() => {
    const fetchuserdata=async ()=>{
      try {
        const response=await fetchuser();
        setUser(response.username)
      } catch (error) {
        console.log(error)
      }
    }
    const fetchAuth = async () => {
      try {
        setloading(true)
        await axios.get(`${API}/is-authenticated`, { withCredentials: true })
        setIsAuthenticated(true)
        setloading(false)
      } catch (err) {
        setIsAuthenticated(false)
        setloading(false)
      }
    }
    fetchuserdata()
    fetchAuth()
  }, [user])

  // Fetch user role when authenticated
  useEffect(() => {
    const fetchRole = async () => {
      if (!isAuthenticated) {
        setRole(null)
        return
      }
      try {
        setloading(true)
        const res = await axios.get(`${API}/role/`, { withCredentials: true })
        setRole(res.data.role)
        setloading(false)
      } catch (err) {
        console.error(err)
        setIsAuthenticated(false)
        setRole(null)
        setloading(false)
      }
    }
    fetchRole()
  }, [isAuthenticated,user])

  // Logout function (shared everywhere)
  const handleLogout = async () => {
    try {
      setloading(true)
      await logout()
      setloading(false)
    } catch (error) {
      console.error(error)
      setloading(false)
    } finally {
      setloading(false)
      setIsAuthenticated(false)
      setRole(null)
    }
  }
useEffect(() => {
  if (!isAuthenticated) return

  const interval = setInterval(async () => {
    try {
      // Call your backend endpoint that verifies if the access token is still valid
      // Silent check - no loading state to avoid UI interruptions
      await axios.get(`${API}/is-authenticated`, { withCredentials: true })
      // If valid → do nothing
    } catch (err) {
      console.warn("Access token expired or invalid.")
      // Only set loading when actually logging out
      setloading(true)
      await handleLogout()
      setloading(false)
    }
  }, 300000) // every 5 minutes (increased from 60 seconds to reduce frequency)

  // Cleanup on component unmount
  return () => clearInterval(interval)
}, [isAuthenticated, handleLogout])
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, setIsAuthenticated, setRole, handleLogout,loading,user}}
    >
      {children}
    </AuthContext.Provider>
  )
}
