"use client";

import React from "react";
import Link from "next/link";

const buttonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 20px",
  borderRadius: 10,
  border: "1px solid transparent",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#F7F8FA",
          color: "#15232D",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main
          role="alert"
          style={{
            width: "100%",
            maxWidth: 620,
            background: "#FFFFFF",
            border: "1px solid #DFE5E8",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 18px 50px -28px rgba(21,35,45,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              padding: "12px 20px",
              background: "#FEF7F7",
              borderBottom: "1px solid #FECACA",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                border: "1px solid #FECACA",
                background: "#FEE2E2",
                padding: "4px 10px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#B91C1C",
              }}
            >
              Application error
            </span>
            <span style={{ fontSize: 11, color: "#5A6B75" }}>
              Sandbox data is safe · nothing charged
            </span>
          </div>

          <div style={{ padding: "28px 24px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              SayPay could not start
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#5A6B75",
              }}
            >
              The application shell failed to load. This is a sandbox preview,
              so no payment was created or captured.
            </p>

            {error?.digest && (
              <p
                style={{
                  margin: "14px 0 0",
                  display: "inline-block",
                  border: "1px solid #DFE5E8",
                  borderRadius: 8,
                  background: "#F7F8FA",
                  padding: "6px 10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#15232D",
                }}
              >
                Error ref: {error.digest}
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 22,
              }}
            >
              <button
                type="button"
                onClick={reset}
                style={{
                  ...buttonBase,
                  background: "#087F68",
                  color: "#FFFFFF",
                }}
              >
                Try again
              </button>
              <Link
                href="/"
                style={{
                  ...buttonBase,
                  background: "#FFFFFF",
                  border: "1px solid #DFE5E8",
                  color: "#15232D",
                  textDecoration: "none",
                }}
              >
                Reload dashboard
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
