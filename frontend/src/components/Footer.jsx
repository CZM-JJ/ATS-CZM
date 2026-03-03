import { useState } from 'react'

export default function Footer() {
  const year = new Date().getFullYear()
  const [termsOpen, setTermsOpen] = useState(false)

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer-inner">

          {/* Brand column */}
          <div className="sf-brand">
            <div className="sf-logo-wrap">
              <img src="/logoczark.png" alt="Czark Mak Corporation" className="sf-logo" />
            </div>
            <div>
              <p className="sf-company">CZARK MAK CORPORATION</p>
              <p className="sf-tagline">Building careers, one application at a time.</p>
            </div>
          </div>

          {/* Links */}
          <div className="sf-links-col">
            <p className="sf-col-label">Careers</p>
            <ul>
              <li><a href="/apply">Apply for a Position</a></li>
              <li>
                <button type="button" className="sf-link-btn" onClick={() => setTermsOpen(true)}>
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </div>

          <div className="sf-links-col">
            <p className="sf-col-label">Company</p>
            <ul>
              <li><span className="sf-info-item">📍 Philippines</span></li>
              <li><span className="sf-info-item">💼 Czark Mak Corporation</span></li>
            </ul>
          </div>
        </div>

        <div className="sf-bottom">
          <p>© {year} Czark Mak Corporation. All rights reserved.</p>
          <button type="button" className="sf-link-btn sf-terms-inline" onClick={() => setTermsOpen(true)}>
            Privacy &amp; Terms
          </button>
        </div>
      </footer>

      {/* ── Terms Modal ── */}
      {termsOpen && (
        <div className="terms-modal-backdrop" onClick={() => setTermsOpen(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-head">
              <div className="terms-modal-title-wrap">
                <div className="terms-modal-logo">
                  <img src="/logoczark.png" alt="" />
                </div>
                <div>
                  <p className="terms-modal-kicker">Czark Mak Corporation</p>
                  <h2 className="terms-modal-title">Terms &amp; Conditions</h2>
                </div>
              </div>
              <button type="button" className="terms-modal-close" onClick={() => setTermsOpen(false)}>✕</button>
            </div>

            <div className="terms-modal-body">
              <p className="terms-modal-intro">By submitting an application, you confirm that you have read and agree to the following terms.</p>
              <div className="terms-modal-sections">
                {[
                  ['📋', 'Accuracy of Information', 'All information you provide is accurate, truthful, and complete. False or misleading information may result in disqualification or termination of employment.'],
                  ['📞', 'Consent to Contact', 'You consent to being contacted via the email and phone number provided for application updates, interview schedules, and job offer correspondence.'],
                  ['🔒', 'Data Privacy & Confidentiality', 'Your data is used solely for recruitment, accessible only to authorized HR personnel, stored securely, and never sold or shared with unrelated third parties.'],
                  ['📁', 'Document Retention', 'Your application and CV may be retained for up to 2 years from submission to consider you for future openings. After this period, data is securely deleted.'],
                  ['⚖️', 'Your Rights', 'You may request access, correction, or deletion of your data, and may withdraw your application at any time before a final hiring decision.'],
                  ['📄', 'Uploaded Documents', 'Attached files (CV, certificates) are stored securely and reviewed only by authorized HR staff involved in the hiring process.'],
                ].map(([icon, title, body]) => (
                  <div className="terms-modal-section" key={title}>
                    <span className="terms-modal-icon">{icon}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="terms-modal-footer">
              <p>Effective date: March 1, 2026</p>
              <button type="button" className="terms-modal-accept" onClick={() => setTermsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
