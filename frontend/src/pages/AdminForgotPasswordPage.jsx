import { useState } from 'react'
import { NavLink } from 'react-router-dom'

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

function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) { setError(await extractError(response)); return }
      setSent(true)
    } catch { setError('Unable to send reset link. Please try again.') }
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
          <h2 className="rp-visual-title">Forgot your password?</h2>
          <p className="rp-visual-sub">No worries — enter your email and we'll send you a secure reset link right away.</p>
          <ul className="rp-tips">
            <li>📧 Check your inbox after submitting</li>
            <li>⏱ Link expires after 60 minutes</li>
            <li>🔒 Only works once per request</li>
            <li>🚫 Check spam if you don't see it</li>
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="rp-form-panel">
        <div className="rp-form-wrap">

          {sent ? (
            <div className="rp-success-state">
              <div className="rp-success-icon">📬</div>
              <h2 className="rp-success-title">Check your inbox!</h2>
              <p className="rp-success-text">
                We sent a password reset link to <strong>{email}</strong>.<br />
                It may take a minute to arrive — check your spam folder too.
              </p>
              <div className="fp-resend-wrap">
                <span className="fp-resend-hint">Didn't get it?</span>
                <button
                  type="button"
                  className="fp-resend-btn"
                  onClick={() => { setSent(false); setError(null) }}
                >
                  Try again
                </button>
              </div>
              <NavLink to="/admin" className="rp-back-link" style={{ marginTop: '1rem' }}>← Back to Sign In</NavLink>
            </div>
          ) : (
            <>
              <div className="rp-form-header">
                <div className="rp-form-icon">🔐</div>
                <h1 className="rp-form-title">Reset Password</h1>
                <p className="rp-form-sub">Enter your account email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="rp-form">
                <div className="rp-field">
                  <label className="rp-label">Email address <span className="rp-required">*</span></label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon">✉️</span>
                    <input
                      className="rp-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@czarkmak.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && <div className="rp-alert rp-alert-error">⚠ {error}</div>}

                <button type="submit" className="rp-submit" disabled={loading}>
                  {loading && <span className="rp-spinner" />}
                  {loading ? 'Sending link...' : 'Send Reset Link'}
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

export default AdminForgotPasswordPage
