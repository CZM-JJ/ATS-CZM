import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Parse "YYYY-MM-DD" → { year, month (0-based), day }
function parseValue(val) {
  if (!val) return null
  const [y, m, d] = val.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

// Format date object back to "YYYY-MM-DD"
function formatValue(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Display format: "February 2, 2026"
function displayDate(val) {
  const p = parseValue(val)
  if (!p) return ''
  return `${MONTHS[p.month]} ${p.day}, ${p.year}`
}

// Build calendar grid for a given month/year
function buildGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells = []
  // leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false })
  }
  // current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true })
  }
  // trailing days to fill last row
  const trailing = 42 - cells.length
  for (let d = 1; d <= trailing; d++) {
    cells.push({ day: d, current: false })
  }
  return cells
}

const YEAR_RANGE_BACK = 100
const YEAR_RANGE_FORWARD = 10

export default function DatePicker({ name, value, onChange, required, placeholder = 'Select date', defaultYearOffset = 0 }) {
  const today = new Date()
  const parsed = parseValue(value)
  const defaultYear = today.getFullYear() + defaultYearOffset

  const [open, setOpen]           = useState(false)
  const [viewYear, setViewYear]   = useState(parsed?.year  ?? defaultYear)
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth())
  const [popupStyle, setPopupStyle] = useState({})

  const rootRef    = useRef(null)
  const triggerRef = useRef(null)

  // Compute popup position from the trigger's bounding rect
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const popupH = 380 // approximate popup height

    const top = spaceBelow >= popupH
      ? rect.bottom + window.scrollY + 8
      : rect.top  + window.scrollY - popupH - 8

    setPopupStyle({
      position: 'absolute',
      top,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 320),
      zIndex: 99999,
    })
  }, [])

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year)
      setViewMonth(parsed.month)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate on open, scroll, resize
  useEffect(() => {
    if (!open) return
    calcPosition()
    window.addEventListener('scroll', calcPosition, true)
    window.addEventListener('resize', calcPosition)
    return () => {
      window.removeEventListener('scroll', calcPosition, true)
      window.removeEventListener('resize', calcPosition)
    }
  }, [open, calcPosition])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      const popup = document.getElementById('dp-portal-popup')
      if (
        rootRef.current && !rootRef.current.contains(e.target) &&
        popup && !popup.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectDay = useCallback((day) => {
    const newVal = formatValue(viewYear, viewMonth, day)
    onChange({ target: { name, value: newVal } })
    setOpen(false)
  }, [viewYear, viewMonth, name, onChange])

  const clearDate = useCallback(() => {
    onChange({ target: { name, value: '' } })
  }, [name, onChange])

  const goToToday = useCallback(() => {
    const newVal = formatValue(today.getFullYear(), today.getMonth(), today.getDate())
    onChange({ target: { name, value: newVal } })
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setOpen(false)
  }, [name, onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const cells = buildGrid(viewYear, viewMonth)

  const isToday = (day, current) =>
    current &&
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear()

  const isSelected = (day, current) =>
    current && parsed &&
    day === parsed.day &&
    viewMonth === parsed.month &&
    viewYear === parsed.year

  const yearOptions = []
  for (let y = today.getFullYear() + YEAR_RANGE_FORWARD; y >= today.getFullYear() - YEAR_RANGE_BACK; y--) {
    yearOptions.push(y)
  }

  const popup = (
    <div id="dp-portal-popup" className="dp-popup" style={popupStyle} role="dialog" aria-label="Date picker">
      {/* Header */}
      <div className="dp-header">
        <button type="button" className="dp-nav-btn" onClick={prevMonth} aria-label="Previous month">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className="dp-header-selects">
          <select
            className="dp-select"
            value={viewMonth}
            onChange={e => setViewMonth(Number(e.target.value))}
            aria-label="Month"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            className="dp-select"
            value={viewYear}
            onChange={e => setViewYear(Number(e.target.value))}
            aria-label="Year"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button type="button" className="dp-nav-btn" onClick={nextMonth} aria-label="Next month">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="dp-dow-row">
        {DAYS_OF_WEEK.map(d => (
          <span key={d} className="dp-dow">{d}</span>
        ))}
      </div>

      {/* Date grid */}
      <div className="dp-grid">
        {cells.map((cell, idx) => {
          const sel     = isSelected(cell.day, cell.current)
          const todayEl = isToday(cell.day, cell.current)
          let cls = 'dp-day'
          if (!cell.current) cls += ' dp-day--dim'
          if (sel)           cls += ' dp-day--selected'
          else if (todayEl)  cls += ' dp-day--today'
          return (
            <button
              key={idx}
              type="button"
              className={cls}
              onClick={() => cell.current && selectDay(cell.day)}
              tabIndex={cell.current ? 0 : -1}
              aria-label={cell.current ? `${MONTHS[viewMonth]} ${cell.day}, ${viewYear}` : undefined}
              aria-pressed={sel}
              aria-disabled={!cell.current}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="dp-footer">
        <button type="button" className="dp-footer-btn dp-footer-btn--clear" onClick={clearDate}>
          Clear
        </button>
        <button type="button" className="dp-footer-btn dp-footer-btn--today" onClick={goToToday}>
          Today
        </button>
      </div>
    </div>
  )

  return (
    <div className="dp-root" ref={rootRef}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={`input input-bordered input-lg dp-trigger${open ? ' dp-trigger--open' : ''}${!value ? ' dp-trigger--empty' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="dp-trigger-icon" width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        <span className="dp-trigger-text">
          {value ? displayDate(value) : placeholder}
        </span>
        <svg className={`dp-trigger-chevron${open ? ' dp-trigger-chevron--up' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Hidden native input keeps form value + required validation */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Portal — renders outside any stacking context */}
      {open && createPortal(popup, document.body)}
    </div>
  )
}
