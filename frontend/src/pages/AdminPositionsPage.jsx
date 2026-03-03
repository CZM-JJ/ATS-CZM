import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/AdminLayout'

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const emptyForm = {
  title: '',
  description: '',
  location: '',
  salary_min: '',
  salary_max: '',
  is_active: true,
}

function AdminPositionsPage() {
  const { token } = useAuth()

  const [positions, setPositions]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [total, setTotal]           = useState(0)

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null) // null = adding new
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState(null)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  // Toggle loading
  const [togglingId, setTogglingId] = useState(null)

  const loadPositions = async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/positions?page=${p}&per_page=20`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const payload = await res.json()
      setPositions(payload.data || [])
      setPage(payload.meta?.current_page ?? payload.current_page ?? 1)
      setLastPage(payload.meta?.last_page ?? payload.last_page ?? 1)
      setTotal(payload.meta?.total ?? payload.total ?? 0)
    } catch {
      setError('Failed to load positions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    loadPositions(page)
  }, [token, page])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (position) => {
    setEditing(position)
    setForm({
      title: position.title ?? '',
      description: position.description ?? '',
      location: position.location ?? '',
      salary_min: position.salary_min ?? '',
      salary_max: position.salary_max ?? '',
      is_active: position.is_active ?? true,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim(),
        salary_min: form.salary_min !== '' ? Number(form.salary_min) : null,
        salary_max: form.salary_max !== '' ? Number(form.salary_max) : null,
        is_active: form.is_active,
      }
      const url    = editing ? `${apiBase}/api/positions/${editing.id}` : `${apiBase}/api/positions`
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        const msg = payload?.message || Object.values(payload?.errors || {})?.[0]?.[0] || 'Failed to save.'
        setFormError(msg)
        return
      }
      const saved = await res.json()
      if (editing) {
        setPositions((prev) => prev.map((p) => (p.id === saved.id ? saved : p)))
      } else {
        setPositions((prev) => [saved, ...prev])
        setTotal((t) => t + 1)
      }
      closeModal()
    } catch {
      setFormError('An unexpected error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (position) => {
    setTogglingId(position.id)
    try {
      const res = await fetch(`${apiBase}/api/positions/${position.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !position.is_active }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setPositions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch {
      setError('Failed to toggle status.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`${apiBase}/api/positions/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setTotal((t) => t - 1)
      setDeleteTarget(null)
    } catch {
      setError('Failed to delete position.')
    } finally {
      setDeleting(false)
    }
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return '—'
    const fmt = (n) => `₱${Number(n).toLocaleString()}`
    if (min && max) return `${fmt(min)} – ${fmt(max)}`
    if (min) return `From ${fmt(min)}`
    return `Up to ${fmt(max)}`
  }

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <AdminLayout pageTitle="Positions">

      {/* ── Welcome ── */}
      <div className="admin-welcome">
        <div className="admin-welcome-text">
          <h2>Positions 📋</h2>
          <p>Manage job openings shown on the application form. Only <strong>active</strong> positions appear to applicants.</p>
        </div>
        <span className="admin-welcome-date">{todayLabel}</span>
      </div>

      {/* ── Main card ── */}
      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h2>All positions</h2>
            <p>{total} position{total !== 1 ? 's' : ''} total</p>
          </div>
          <button type="button" className="btn apply-submit btn-sm" onClick={openAdd}>
            + Add position
          </button>
        </div>

        {error && <div className="admin-alert error">{error}</div>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Salary Range</th>
                <th>Status</th>
                <th style={{ width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} style={{ opacity: 1 - i * 0.12 }}>
                    {[140, 100, 120, 60, 120].map((w, j) => (
                      <td key={j}>
                        <div style={{
                          height: '14px', borderRadius: '6px', width: `${w}px`,
                          background: 'linear-gradient(90deg,rgba(200,164,65,.08) 25%,rgba(200,164,65,.18) 50%,rgba(200,164,65,.08) 75%)',
                          backgroundSize: '800px 100%',
                          animation: `shimmer 1.4s ease-in-out infinite`,
                          animationDelay: `${i * 0.07}s`,
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : positions.length ? (
                positions.map((pos) => (
                  <tr key={pos.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f2c20' }}>{pos.title}</div>
                      {pos.description && (
                        <div style={{ fontSize: '0.78rem', color: '#6b7870', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pos.description}
                        </div>
                      )}
                    </td>
                    <td>{pos.location}</td>
                    <td>{formatSalary(pos.salary_min, pos.salary_max)}</td>
                    <td>
                      <button
                        type="button"
                        className={`admin-chip positions-toggle ${pos.is_active ? 'hired' : 'withdrawn'}`}
                        disabled={togglingId === pos.id}
                        onClick={() => handleToggleActive(pos)}
                        title={pos.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {togglingId === pos.id ? '…' : pos.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={() => openEdit(pos)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost positions-delete-btn"
                          onClick={() => setDeleteTarget(pos)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">📋</div>
                      <p>No positions yet</p>
                      <span>Click "Add position" to create your first job opening.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="admin-table-footer">
            <span>{total} total</span>
            <div className="admin-table-actions">
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Previous</button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Page {page} of {lastPage}</span>
              <button className="btn btn-sm btn-outline" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="positions-modal-backdrop" onClick={closeModal}>
          <div className="positions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="positions-modal-head">
              <h3>{editing ? 'Edit position' : 'Add position'}</h3>
              <button type="button" className="positions-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form className="positions-form" onSubmit={handleSave}>
              <div className="positions-form-row">
                <label>
                  <span>Job title *</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Software Engineer"
                    className="input input-bordered"
                  />
                </label>
                <label>
                  <span>Location *</span>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Makati, Remote"
                    className="input input-bordered"
                  />
                </label>
              </div>
              <label>
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional — brief description of the role"
                  className="positions-textarea"
                />
              </label>
              <div className="positions-form-row">
                <label>
                  <span>Min salary (₱)</span>
                  <input
                    name="salary_min"
                    type="number"
                    min="0"
                    value={form.salary_min}
                    onChange={handleChange}
                    placeholder="e.g. 30000"
                    className="input input-bordered"
                  />
                </label>
                <label>
                  <span>Max salary (₱)</span>
                  <input
                    name="salary_max"
                    type="number"
                    min="0"
                    value={form.salary_max}
                    onChange={handleChange}
                    placeholder="e.g. 60000"
                    className="input input-bordered"
                  />
                </label>
              </div>
              <label className="positions-toggle-label">
                <span>Active (visible on apply form)</span>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="positions-checkbox"
                />
              </label>
              {formError && <div className="admin-alert error">{formError}</div>}
              <div className="positions-modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn apply-submit btn-sm" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="positions-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="positions-modal positions-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="positions-modal-head">
              <h3>Delete position?</h3>
              <button type="button" className="positions-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <p style={{ margin: '0 0 1.5rem', color: '#4b5a51', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This cannot be undone. Existing applicants who applied for this position will not be affected.
            </p>
            <div className="positions-modal-footer">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-sm positions-delete-confirm-btn"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}

export default AdminPositionsPage
