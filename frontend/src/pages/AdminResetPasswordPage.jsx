import { useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const extractError = async (response) => {
  try {
    const payload = await response.json()
    if (payload?.message) return payload.message
    if (payload?.errors) {
      const firstKey = Object.keys(payload.errors)[0]
      if (firstKey) return payload.errors[firstKey][0]
    }
  } catch { return null }
  return 'Unable to complete the request. Please try again.'
}

function getStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

function StrengthBar({ password }) {
  const score = getStrength(password)
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#e53e3e', '#d97706', '#2563eb', '#16a34a']
  if (!password) return null
  return (
    <div className="rp-strength">
      <div className="rp-strength-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rp-strength-bar" style={{ background: i <= score ? colors[score] : '#e2e8f0' }} />
        ))}
      </div>
      <span className="rp-strength-label" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  )
}

function AdminResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const token = query.get('token') || ''
  const email = query.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!token || !email) { setError('Reset link is missing required details.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (getStrength(password) < 2) { setError('Password is too weak. Add uppercase letters, numbers or symbols.'); return }
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password, password_confirmation: confirmPassword }),
      })
      if (!response.ok) { setError(await extractError(response)); return }
      setDone(true)
      setTimeout(() => navigate('/admin'), 3000)
    } catch { setError('Unable to reset password. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="rp-shell">

      {/* Left visual panel */}
      <div className="rp-visual">
        <div className="rp-orb rp-orb-1" />
        <div className="rp-orb rp-orb-2" />
        <div className="rp-visual-content">
          <div className="rp-logo-wrap">
            <img src="/logoczark.png" alt="Czark Mak" className="rp-logo" />
          </div>
          <h2 className="rp-visual-title">Secure your account</h2>
          <p className="rp-visual-sub">Choose a strong password to protect your ATS account.</p>
          <ul className="rp-tips">
            <li>✅ At least 8 characters</li>
            <li>✅ One uppercase letter</li>
            <li>✅ One number</li>
            <li>✅ One special character</li>
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="rp-form-panel">
        <div className="rp-form-wrap">

          {done ? (
            <div className="rp-success-state">
              <div className="rp-success-icon">🔓</div>
              <h2 className="rp-success-title">Password Updated!</h2>
              <p className="rp-success-text">
                Your password has been changed successfully.<br />Redirecting you to sign in...
              </p>
              <div className="rp-redirect-bar"><div className="rp-redirect-fill" /></div>
              <NavLink to="/admin" className="rp-back-link">Go to Sign In →</NavLink>
            </div>
          ) : (
            <>
              <div className="rp-form-header">
                <div className="rp-form-icon">🔑</div>
                <h1 className="rp-form-title">Reset Password</h1>
                <p className="rp-form-sub">Setting new password for <strong>{email || 'your account'}</strong></p>
              </div>

              <form onSubmit={handleSubmit} className="rp-form">

                {/* New password */}
                <div className="rp-field">
                  <label className="rp-label">New Password <span className="rp-required">*</span></label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon">🔒</span>
                    <input
                      className="rp-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <StrengthBar password={password} />
                </div>

                {/* Confirm password */}
                <div className="rp-field">
                  <label className="rp-label">Confirm Password <span className="rp-required">*</span></label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon">🔒</span>
                    <input
                      className={`rp-input ${
                        confirmPassword && confirmPassword !== password ? 'rp-input-mismatch'
                        : confirmPassword && confirmPassword === password ? 'rp-input-match' : ''
                      }`}
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowConfirm(p => !p)}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <span className="rp-match-hint rp-match-hint--err">⚠ Passwords do not match</span>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <span className="rp-match-hint rp-match-hint--ok">✓ Passwords match</span>
                  )}
                </div>

                {error && <div className="rp-alert rp-alert-error">⚠ {error}</div>}

                <button type="submit" className="rp-submit" disabled={loading}>
                  {loading && <span className="rp-spinner" />}
                  {loading ? 'Updating password...' : 'Update Password'}
                </button>

                <NavLink to="/admin" className="rp-back-link">← Back to Sign In</NavLink>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default AdminResetPasswordPage
