import { Navigate } from 'react-router-dom'
import { useAuth, useRole } from '../context/AuthContext'

const AccessDenied = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f7f5',
    gap: '1rem',
    textAlign: 'center',
    padding: '2rem',
  }}>
    <div style={{ fontSize: '3rem' }}>🔒</div>
    <h2 style={{ margin: 0, color: '#0f2c20', fontSize: '1.4rem', fontWeight: 700 }}>Access Denied</h2>
    <p style={{ margin: 0, color: '#6b7280', maxWidth: '340px' }}>
      You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
    </p>
    <a href="/admin" style={{ marginTop: '0.5rem', color: '#0f3d2e', fontWeight: 600, textDecoration: 'underline', fontSize: '0.9rem' }}>
      ← Back to Dashboard
    </a>
  </div>
)

export default function ProtectedRoute({ children, roles, permission }) {
  const { token, user, isLoading } = useAuth()
  const roleData = useRole()

  if (isLoading) {
    return (
      <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#4b5a51', padding: '4rem', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '120px', height: '12px', margin: '0 auto 0.75rem' }} />
          <div className="skeleton" style={{ width: '80px', height: '12px', margin: '0 auto' }} />
        </div>
      </div>
    )
  }

  if (!token) return <Navigate to="/admin/login" replace />

  // Dynamic permission check (reads from DB-backed permissions)
  if (permission && user && !roleData[permission]) return <AccessDenied />

  // Static role list check (fallback / hard overrides)
  if (roles && user && !roles.includes(user.role)) return <AccessDenied />

  return children
}
