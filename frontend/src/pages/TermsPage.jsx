import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="terms-page">
      <div className="terms-page-inner">

        {/* Header */}
        <div className="terms-page-header">
          <div className="terms-page-logo">
            <img src="/logoczark.png" alt="Czark Mak Corporation" />
          </div>
          <div>
            <p className="terms-page-kicker">Czark Mak Corporation</p>
            <h1 className="terms-page-title">Terms & Conditions</h1>
            <p className="terms-page-date">Effective date: March 1, 2026</p>
          </div>
        </div>

        {/* Intro */}
        <div className="terms-page-intro">
          By submitting an application to Czark Mak Corporation, you acknowledge that you have read, understood, and agree to the terms outlined in this document. These terms govern the collection, use, and storage of your personal information as part of our recruitment process.
        </div>

        {/* Sections */}
        <div className="terms-page-sections">

          <section className="terms-page-section">
            <div className="terms-page-section-icon">📋</div>
            <div>
              <h2>1. Accuracy of Information</h2>
              <p>You confirm that all information you provide in your application — including personal details, educational background, work history, and supporting documents — is accurate, truthful, and complete to the best of your knowledge.</p>
              <p>Providing false or misleading information may result in the immediate disqualification of your application or, if discovered after employment, termination of your contract.</p>
            </div>
          </section>

          <section className="terms-page-section">
            <div className="terms-page-section-icon">📞</div>
            <div>
              <h2>2. Consent to Contact</h2>
              <p>By submitting your application, you consent to being contacted by Czark Mak Corporation or its authorized representatives via the email address and phone number you have provided. Communication may include:</p>
              <ul className="terms-page-list">
                <li>Application status updates</li>
                <li>Interview schedules and invitations</li>
                <li>Requests for additional information or documents</li>
                <li>Job offer correspondence</li>
              </ul>
            </div>
          </section>

          <section className="terms-page-section">
            <div className="terms-page-section-icon">🔒</div>
            <div>
              <h2>3. Data Privacy & Confidentiality</h2>
              <p>Czark Mak Corporation is committed to protecting your personal information. The data you provide will be:</p>
              <ul className="terms-page-list">
                <li>Used solely for recruitment and employment evaluation purposes</li>
                <li>Accessible only to authorized HR personnel and hiring managers</li>
                <li>Stored securely and protected against unauthorized access</li>
                <li>Never sold, traded, or disclosed to unrelated third parties without your consent</li>
              </ul>
            </div>
          </section>

          <section className="terms-page-section">
            <div className="terms-page-section-icon">📁</div>
            <div>
              <h2>4. Document Retention</h2>
              <p>Your application data and submitted documents (including your résumé/CV) may be retained for a period of up to <strong>two (2) years</strong> from the date of submission. This allows us to consider you for future openings that match your profile.</p>
              <p>After this period, your data will be securely deleted unless you have been hired, in which case it becomes part of your employee record in accordance with applicable labor laws.</p>
            </div>
          </section>

          <section className="terms-page-section">
            <div className="terms-page-section-icon">⚖️</div>
            <div>
              <h2>5. Your Rights</h2>
              <p>Under applicable data privacy laws, you have the right to:</p>
              <ul className="terms-page-list">
                <li>Request access to the personal data we hold about you</li>
                <li>Request correction of inaccurate or outdated information</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Withdraw your application at any time before a final hiring decision</li>
              </ul>
              <p>To exercise any of these rights, please contact our HR department directly.</p>
            </div>
          </section>

          <section className="terms-page-section">
            <div className="terms-page-section-icon">📄</div>
            <div>
              <h2>6. Uploaded Documents</h2>
              <p>Any files you attach (résumé, CV, certificates) are stored securely on our servers. These documents are only reviewed by authorized HR staff involved in the hiring process. We do not share your documents with any external parties.</p>
            </div>
          </section>

          <section className="terms-page-section">
            <div className="terms-page-section-icon">🔄</div>
            <div>
              <h2>7. Changes to These Terms</h2>
              <p>Czark Mak Corporation reserves the right to update these Terms and Conditions at any time. Any material changes will be reflected with an updated effective date. Continued use of our application portal after changes constitutes acceptance of the revised terms.</p>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="terms-page-footer">
          <p>If you have any questions about these terms, contact our HR department before submitting your application.</p>
          <Link to="/apply" className="terms-page-back-btn">
            ← Back to Application Form
          </Link>
        </div>

      </div>
    </div>
  )
}
