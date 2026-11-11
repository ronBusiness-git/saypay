"use client";

import React from "react";

/**
 * Environment Indicator Badge
 * Mandatory requirement from Technical Specification Section 13:
 * "Visible 'PAYPAL SANDBOX — TEST ONLY' label"
 */
export default function EnvironmentBadge() {
  return (
    <div
      className="environment-badge"
      role="status"
      aria-label="PayPal Sandbox environment indicator"
      title="This application operates exclusively in PayPal Sandbox mode with test accounts. No real money is moved."
    >
      <span className="badge-pulse-dot" aria-hidden="true" />
      <span className="badge-text">PAYPAL SANDBOX — TEST ONLY</span>
    </div>
  );
}
