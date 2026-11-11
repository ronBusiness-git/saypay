"use client";

import React from "react";

export default function DisclaimerFooter() {
  return (
    <footer className="bg-surface-container-low border-t border-[#DFE5E8] docked full-width bottom mt-auto">
      <div className="w-full px-4 md:px-margin-desktop max-w-[1280px] mx-auto py-space-lg flex flex-col md:flex-row justify-between items-center gap-space-md">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <p className="font-body-sm text-body-sm text-secondary">
            Demo only. SayPay does not guarantee fraud prevention or verify that a merchant is legitimate. PAYPAL SANDBOX — TEST ONLY · No real money.
          </p>
        </div>
        {/* Legal Links */}
        <nav className="flex items-center space-x-6">
          <a className="text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors duration-150" href="#sandbox-docs">
            Sandbox Docs
          </a>
          <a className="text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors duration-150" href="#safety-protocols">
            Safety Protocols
          </a>
          <a className="text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors duration-150" href="#audit-terms">
            Audit Terms
          </a>
          <a className="text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors duration-150" href="#privacy">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
