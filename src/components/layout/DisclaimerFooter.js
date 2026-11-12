"use client";

import React, { useEffect, useState } from "react";

const LEGAL_CONTENT = {
  copyright: {
    title: "Copyright",
    icon: "copyright",
    paragraphs: [
      "© 2026 SayPay. All rights reserved.",
      "SayPay, the SayPay mark and the Echo voice companion are original work created for this PayPal Sandbox demonstration. The interface, copy, illustrations and deterministic MatchCheck rules may not be reproduced or redistributed without written permission.",
      "PayPal and the PayPal logo are trademarks of PayPal, Inc. They appear here only to identify the sandbox integration used for testing. SayPay is not affiliated with, endorsed by or sponsored by PayPal.",
      "Material Symbols icons and the Inter and JetBrains Mono typefaces are used under their respective open-source licences.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    icon: "gavel",
    paragraphs: [
      "This application is a demonstration running entirely in the PayPal Sandbox. No real money, cards or bank accounts are involved, and no payment obligation is created.",
      "SayPay does not verify that a merchant is legitimate and does not guarantee fraud prevention. Every result shown is a simulation of a safety check and must not be treated as financial, legal or security advice.",
      "Demo data, invoices, checks and audit history may be reset or deleted at any time without notice. Do not enter real personal, banking or payment information.",
      "By continuing to use the demo you accept that the software is provided \"as is\", without warranty of any kind, and that SayPay is not liable for any loss arising from its use.",
      "These terms may be updated as the demo evolves; the version shown here is the one currently in effect.",
    ],
  },
};

function LegalModal({ kind, onClose }) {
  const content = LEGAL_CONTENT[kind];

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#15232D]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="animate-assist-rise w-full max-w-lg overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_24px_60px_-18px_rgba(15,29,39,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#DFE5E8] bg-[#F7F8FA] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF7F1] text-primary-container">
              <span className="material-symbols-outlined text-[18px]">
                {content.icon}
              </span>
            </span>
            <h2
              id="legal-modal-title"
              className="font-headline-sm text-headline-sm font-semibold text-on-surface"
            >
              {content.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            autoFocus
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4">
          {content.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="font-body-sm text-body-sm leading-relaxed text-secondary"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#DFE5E8] px-5 py-3">
          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary">
            <span className="material-symbols-outlined text-[14px] text-[#B45309]">
              science
            </span>
            PayPal Sandbox demo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[36px] items-center rounded-lg bg-primary-container px-4 font-label-md text-label-md font-semibold text-white transition-colors hover:bg-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DisclaimerFooter() {
  const [openModal, setOpenModal] = useState(null);

  return (
    <footer className="mt-auto w-full border-t border-[#DFE5E8] bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row md:px-margin-desktop">
        <button
          type="button"
          onClick={() => setOpenModal("copyright")}
          className="font-body-sm text-body-sm text-secondary transition-colors hover:text-primary"
        >
          © 2026 SayPay. All rights reserved.
        </button>

        <nav className="flex items-center gap-2 font-label-sm text-label-sm text-secondary">
          <button
            type="button"
            onClick={() => setOpenModal("terms")}
            className="transition-colors hover:text-primary hover:underline underline-offset-2"
          >
            Terms &amp; Conditions
          </button>
        </nav>
      </div>

      {openModal && (
        <LegalModal kind={openModal} onClose={() => setOpenModal(null)} />
      )}
    </footer>
  );
}
