import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRole } from '../context/AuthContext'

export default function AdminLayout({ children, pageTitle }) {
  const { user, logout } = useAuth()
  const { isAdmin, canViewAnalytics, canManagePositions, canManageUsers } = useRole()

  const ROLE_LABELS = { admin: 'Administrator', hr_manager: 'HR Manager', hr_supervisor: 'HR Supervisor', recruiter: 'Recruiter' }

  return (
    <section className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <img src="/logoczark.png" alt="Czark Mak" className="admin-brand-logo" />
            <div>
              <p className="admin-kicker">CZARK MAK CORPORATION</p>
              <span className="admin-brand-name">{pageTitle}</span>
            </div>
          </div>
          <nav className="admin-nav">
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
            {canViewAnalytics && (
              <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>
                Analytics
              </NavLink>
            )}
            <NavLink to="/admin/applicants" className={({ isActive }) => (isActive ? 'active' : '')}>
              Applicants
            </NavLink>
            {canManagePositions && (
              <NavLink to="/admin/positions" className={({ isActive }) => (isActive ? 'active' : '')}>
                Positions
              </NavLink>
            )}
            {canManageUsers && (
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                Users
              </NavLink>
            )}
          </nav>
          <div className="admin-profile">
            <div className="admin-avatar" aria-hidden="true">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="admin-name">{user?.name || 'User'}</p>
              <p className="admin-role">{ROLE_LABELS[user?.role] ?? user?.role ?? 'Staff'}</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline admin-logout-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        {children}
      </div>

      <footer className="admin-footer">
        <p>© {new Date().getFullYear()} Czark Mak Corporation · ATS v2.0 · Internal use only</p>
      </footer>
    </section>
  )
}
