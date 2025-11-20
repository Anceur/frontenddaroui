import React, { useCallback, useMemo, useState,useContext  } from 'react'
import { useNavigate } from 'react-router-dom'
import login from '../shared/api/Login'
import { AuthContext } from '../shared/context/Authservice'
interface LoginFormState {
  username: string
  password: string
}

export default function Login(): JSX.Element {

  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormState>({ username: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const isDisabled = useMemo(() => !form.username || !form.password, [form.username, form.password])
  const auth = useContext(AuthContext)
  const { isAuthenticated, role, loading,setIsAuthenticated } = auth

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const data = await login(form.username, form.password)
      setIsAuthenticated(true)
      navigate('/')
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Login failed. Please check your credentials.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [form.username, form.password, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow border" style={{ borderColor: '#F3F4F6' }}>
        <div className="p-6 border-b" style={{ borderColor: '#F3F4F6' }}>
          <h1 className="text-xl font-semibold" style={{ color: '#111827' }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Sign in to continue</p>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="px-3 py-2 rounded text-sm" style={{ background: '#FEF2F2', color: '#991B1B' }}>{error}</div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: '#374151' }} htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
              placeholder="your.username"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: '#374151' }} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
              <input type="checkbox" className="h-4 w-4" />
              Remember me
            </label>
            <a className="text-sm" style={{ color: '#4F46E5' }} href="#">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isDisabled || isSubmitting}
            className="w-full py-2 rounded font-semibold disabled:opacity-50"
            style={{ background: '#111827', color: 'white' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="px-6 pb-6 text-center text-sm" style={{ color: '#6B7280' }}>
          By signing in, you agree to our <a href="#" style={{ color: '#4F46E5' }}>Terms</a>.
        </div>
      </div>
    </div>
  )
}


