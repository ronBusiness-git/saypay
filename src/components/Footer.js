import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-info">
            <div className="footer-brand">
              <span className="brand-icon">🛡️</span>
              <span className="footer-title">SayPay Companion</span>
            </div>
            <p className="footer-disclaimer">
              <strong>Hackathon MVP Demonstration:</strong> SayPay is a voice-first payment safety
              companion that performs deterministic two-source verification before PayPal Sandbox
              checkout. This is a prototype operating exclusively with test credentials; it is not a
              production payment or fraud guarantee service.
            </p>
          </div>

          <div className="footer-meta">
            <div className="meta-card">
              <span className="meta-label">Environment</span>
              <span className="meta-value status-pill-sandbox">PayPal Sandbox Only</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Architecture</span>
              <span className="meta-value">Two-Source MatchCheck</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">AI Engine</span>
              <span className="meta-value">Google Gemini (Server-side)</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            SayPay MVP &copy; 2026 &bull; Ronald &bull; Subash &bull; Robin
          </p>
          <div className="footer-tags">
            <span className="tag">Next.js App Router</span>
            <span className="tag">MongoDB Atlas</span>
            <span className="tag">PayPal Orders v2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
