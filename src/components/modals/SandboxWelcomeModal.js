"use client";

import React, { useState, useEffect } from "react";
import SayPayLogo from "../SayPayLogo.js";

export default function SandboxWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show if not previously acknowledged
    const dismissed = localStorage.getItem("saypay_welcome_dismissed");
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("saypay_welcome_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-[#DFE5E8] z-10 animate-in fade-in zoom-in-95 duration-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#DFE5E8]">
          <SayPayLogo />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            SANDBOX ONLY
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
            Welcome to the SayPay Payment Safety Companion
          </h3>
          <p className="text-sm text-secondary leading-relaxed">
            SayPay is an intelligent verification companion designed to eliminate hidden markups,
            impersonation, and accidental transactions before any PayPal checkout occurs.
          </p>

          <div className="space-y-2.5 pt-2 text-xs text-secondary">
            <div className="flex items-start gap-2.5 p-2.5 bg-surface-bright rounded-lg border border-[#DFE5E8]">
              <span className="material-symbols-outlined text-[#B45309] text-[18px] flex-shrink-0">
                warning
              </span>
              <span>
                <strong>Sandbox Testing Environment:</strong> Operates exclusively with PayPal
                Sandbox test accounts. No real money or live credit cards are used.
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-surface-bright rounded-lg border border-[#DFE5E8]">
              <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                mic
              </span>
              <span>
                <strong>Voice-First Verification:</strong> Voice processing happens in-browser with
                typed fallback. Spoken confirmation unlocks PayPal, but PayPal buyer approval is
                always required.
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-surface-bright rounded-lg border border-[#DFE5E8]">
              <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">
                history_edu
              </span>
              <span>
                <strong>Immutable Audit Trail:</strong> Every screening decision (CLEAR, REVIEW,
                BLOCKED) is permanently logged for complete transparency.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-6 h-[44px] bg-primary-container text-white font-label-md text-label-md font-semibold rounded-[10px] hover:bg-[#066653] transition-colors shadow-sm"
          >
            Got it, Let&apos;s Start
          </button>
        </div>
      </div>
    </div>
  );
}
