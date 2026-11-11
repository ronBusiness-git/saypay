"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>🛡️ Two-Source Payment Safety Companion</span>
        </div>
        <h1 className="hero-title">
          Say it. Check it. <br />
          <span className="hero-gradient-text">Pay with confidence.</span>
        </h1>
        <p className="hero-subtitle">
          SayPay captures your intended payment by voice or text, parses the merchant&apos;s request,
          runs deterministic <strong>MatchCheck</strong> rules, and safeguards your checkout on
          PayPal Sandbox.
        </p>

        <div className="hero-actions">
          <Link href="/new-check" className="btn btn-primary btn-lg">
            <span>🎙️ Start New Payment Check</span>
          </Link>
          <Link href="/history" className="btn btn-secondary btn-lg">
            <span>📜 View Past Checks</span>
          </Link>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="pillars-grid">
        <div className="card pillar-card">
          <div className="pillar-icon">🗣️</div>
          <h2 className="pillar-title">1. Voice-First Intent</h2>
          <p className="pillar-desc">
            State your intent naturally (&quot;Pay $12.50 to GreenLeaf for invoice GL-204&quot;) or type it in.
            Gemini structures your exact expectations.
          </p>
        </div>

        <div className="card pillar-card">
          <div className="pillar-icon">📋</div>
          <h2 className="pillar-title">2. Paste Merchant Request</h2>
          <p className="pillar-desc">
            Paste the raw message or invoice received from the seller. Treated as untrusted data to
            thwart prompt injection and hidden fee tampering.
          </p>
        </div>

        <div className="card pillar-card">
          <div className="pillar-icon">⚖️</div>
          <h2 className="pillar-title">3. Deterministic MatchCheck</h2>
          <p className="pillar-desc">
            Exact integer minor unit comparisons (cents), currency validation, trusted merchant
            allowlist, and duplicate payment blocking. Zero AI guessing for safety.
          </p>
        </div>

        <div className="card pillar-card">
          <div className="pillar-icon">💳</div>
          <h2 className="pillar-title">4. PayPal Sandbox Checkout</h2>
          <p className="pillar-desc">
            Only verified <strong>CLEAR</strong> checks unlock PayPal Orders v2 creation. Server
            enforces authoritative amounts before buyer approval and capture.
          </p>
        </div>
      </section>
    </div>
  );
}
