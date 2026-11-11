"use client";

import React, { useState } from "react";

export default function AuditLogDrawer({
  isOpen,
  onClose,
  attemptId = "chk_demo_204",
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const events = [
    {
      id: "evt_1",
      step: 1,
      name: "INTENT_CAPTURED",
      actor: "You",
      method: "voice",
      time: "10:42:01",
      detail: "Intent spoken via webkitSpeechRecognition: 'Pay GreenLeaf Demo Store USD 12.50 for invoice GL-204'",
    },
    {
      id: "evt_2",
      step: 1,
      name: "REQUEST_SUBMITTED",
      actor: "You",
      method: "typed",
      time: "10:42:08",
      detail: "Pasted raw merchant text submitted (64 bytes parsed)",
    },
    {
      id: "evt_3",
      step: 2,
      name: "AI_PARSE_OK",
      actor: "SayPay",
      method: "gemini-2.0-flash",
      time: "10:42:09",
      detail: "Structured entities extracted with 100% confidence. No ambiguity.",
    },
    {
      id: "evt_4",
      step: 2,
      name: "SCREENING_RESULT",
      actor: "SayPay",
      method: "deterministic",
      time: "10:42:10",
      detail: "MatchCheck CLEAR: merchant on allowlist, amounts match ($12.50 == $12.50), no duplicate reference.",
    },
    {
      id: "evt_5",
      step: 3,
      name: "REVIEW_OPENED",
      actor: "You",
      method: "button",
      time: "10:42:12",
      detail: "User navigated to Review stage. Read-only summary verified.",
    },
    {
      id: "evt_6",
      step: 4,
      name: "CONFIRM_PROMPTED",
      actor: "SayPay",
      method: "voice_synthesis",
      time: "10:42:14",
      detail: "Spoken prompt: 'Pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204?'",
    },
  ];

  const handleCopyId = () => {
    navigator.clipboard?.writeText(attemptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#DFE5E8] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DFE5E8] flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">history_edu</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-[18px] text-on-surface font-semibold">
                Verification Audit Trail
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-code-sm text-code-sm text-secondary">{attemptId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  {copied ? "Copied!" : "Copy ID"}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#DFE5E8] flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-surface-container-low/50 rounded-xl border border-[#DFE5E8] text-xs text-secondary leading-relaxed">
            Immutable log stored per screening attempt. Every decision, whether CLEAR, REVIEW, or
            BLOCKED, creates an event chain before any PayPal order can be unlocked.
          </div>

          <div className="relative border-l-2 border-[#DFE5E8] ml-4 pl-4 space-y-6 pt-2">
            {events.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary-container border-2 border-white shadow-sm" />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-code-sm text-[12px] font-bold text-on-surface">
                      {evt.name}
                    </span>
                    <span className="font-mono text-[11px] text-secondary">{evt.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-secondary">
                    <span>Actor: <strong className="text-on-surface">{evt.actor}</strong></span>
                    <span>•</span>
                    <span className="font-mono bg-surface-container-low px-1.5 py-0.5 rounded text-on-surface">
                      {evt.method}
                    </span>
                  </div>

                  <p className="text-xs text-secondary font-sans leading-relaxed pt-1">
                    {evt.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DFE5E8] bg-surface-bright flex items-center justify-between">
          <span className="text-[12px] text-secondary font-mono">Status: APPEND_ONLY</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-primary-container text-white rounded-lg font-label-sm text-label-sm font-semibold hover:bg-[#066653] transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
