import  { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../shared/context/Authservice'
import AdminApp from '../admin/App'
import ChefApp from '../chef/App'
import CashierApp from '../cashier/App'
import Login from '../auth/Login'
import FullscreenLoader from '../shared/components/FullscreenLoader'
import ClientApp from '../client/App'
import OfflineClientApp from '../offline-client/App'

export default function RoleRouter() {
  const auth = useContext(AuthContext)
  if (!auth) return <FullscreenLoader message="Initializing…" />

  const { isAuthenticated, role, loading } = auth

  // 👇 Wait until we know whether the user is authenticated
  if (loading) return <FullscreenLoader message="Checking your session…" />

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/:tableNumber/*" element={<OfflineClientApp />} />
        <Route path="/" element={<ClientApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
    {role === 'admin' && (
      <Route path="/*" element={<AdminApp />} />
    )}
    {role === 'chef' && (
      <Route path="/*" element={<ChefApp />} />
    )}
    {role === 'cashier' && (
      <Route path="/*" element={<CashierApp />} />
    )}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  )
}
