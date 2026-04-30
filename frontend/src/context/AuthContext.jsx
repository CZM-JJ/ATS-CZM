import { createContext, useContext, useEffect, useState } from 'react'
import { apiBase } from '../utils/apiBase'

const AuthContext = createContext(null)

const PERMISSION_DEFAULTS = {
  canEdit:            ['admin', 'hr_manager', 'hr_supervisor'],
  canDelete:          ['admin', 'hr_manager', 'hr_supervisor'],
  canManagePositions: ['admin', 'hr_manager', 'hr_supervisor'],
  canViewAnalytics:   ['admin', 'hr_manager', 'hr_supervisor'],
  canManageUsers:     ['admin'],
}

export function AuthProvider({ children }) {
  const [token, setToken]           = useState(() => localStorage.getItem('ats_token') || '')
  const [user, setUser]             = useState(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [permissions, setPermissions] = useState(PERMISSION_DEFAULTS)

  // Load user profile
  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    fetch(`${apiBase}/api/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token')
        return res.json()
      })
      .then((profile) => setUser(profile))
      .catch(() => {
        setToken('')
        localStorage.removeItem('ats_token')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  // Load permissions whenever token changes
  useEffect(() => {
    if (!token) { setPermissions(PERMISSION_DEFAULTS); return }
    fetch(`${apiBase}/api/settings/permissions`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setPermissions(data) })
      .catch(() => {}) // silently fall back to defaults
  }, [token])

  const login = (newToken) => {
    localStorage.setItem('ats_token', newToken)
    setToken(newToken)
  }

  const logout = async () => {
    if (token) {
      await fetch(`${apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem('ats_token')
    setToken('')
    setUser(null)
    setPermissions(PERMISSION_DEFAULTS)
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, permissions, setPermissions }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// ── Role helpers ───────────────────────────────────────────────────────────
export function useRole() {
  const { user, permissions } = useAuth()
  const role = user?.role ?? null
  const can  = (perm) => (permissions[perm] ?? PERMISSION_DEFAULTS[perm] ?? []).includes(role)
  return {
    role,
    isAdmin:        role === 'admin',
    isHrManager:    role === 'hr_manager',
    isHrSupervisor: role === 'hr_supervisor',
    isRecruiter:    role === 'recruiter',
    // dynamic permission checks (read from DB-backed permissions)
    canEdit:            can('canEdit'),
    canDelete:          can('canDelete'),
    canManagePositions: can('canManagePositions'),
    canViewAnalytics:   can('canViewAnalytics'),
    canManageUsers:     can('canManageUsers'),
    // generic helper
    hasRole: (...roles) => roles.includes(role),
  }
}

export { PERMISSION_DEFAULTS }
