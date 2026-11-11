"use client";

import React from "react";

export default function SafetyEngineCard() {
  return (
    <section className="space-y-6">
      {/* 1. Entity Extraction Audit Card */}
      <div className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#DFE5E8] pb-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Entity Extraction Audit
          </h3>
          <span className="font-code-sm text-code-sm text-primary-container bg-surface-container-low px-2 py-0.5 rounded font-medium border border-[#A7F3D0]">
            100% confidence
          </span>
        </div>

        <div className="space-y-3">
          {/* Spoken Intent */}
          <div>
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="font-label-sm text-label-sm font-medium">
                Spoken Intent Transcription
              </span>
              <span className="font-code-sm text-code-sm text-secondary">Audio stream</span>
            </div>
            <div className="p-3 bg-[#F7F8FA] border border-[#DFE5E8] rounded-[10px] font-body-sm text-body-sm text-on-surface leading-relaxed">
              “I want to pay{" "}
              <span className="bg-[#A7F3D0]/60 text-[#006451] font-semibold px-1 rounded">
                GreenLeaf Demo Store
              </span>{" "}
              <span className="bg-[#A7F3D0]/60 text-[#006451] font-semibold px-1 rounded">
                USD 12.50
              </span>{" "}
              for invoice{" "}
              <span className="bg-[#A7F3D0]/60 text-[#006451] font-semibold px-1 rounded">
                GL-204
              </span>
              ”
            </div>
          </div>

          {/* Merchant Payload */}
          <div>
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="font-label-sm text-label-sm font-medium">
                Merchant Payload / Invoice
              </span>
              <span className="font-code-sm text-code-sm text-secondary">Webhook raw</span>
            </div>
            <div className="p-3 bg-[#F7F8FA] border border-[#DFE5E8] rounded-[10px] font-body-sm text-body-sm text-on-surface leading-relaxed">
              Invoice{" "}
              <span className="font-code-sm text-code-sm text-primary font-bold">
                #GL-204
              </span>{" "}
              to GreenLeaf Demo Store · Gross:{" "}
              <span className="font-semibold text-on-surface">USD 12.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Semantic Status Protocol Cards (Design System Showcase) */}
      <div className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] space-y-3">
        <div className="border-b border-[#DFE5E8] pb-2">
          <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
            Safety Policy Engine States
          </h3>
        </div>

        <div className="space-y-2.5">
          {/* CLEAR */}
          <div className="p-3 bg-[#EAF7F1] border border-[#A7F3D0] rounded-[10px] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#107E3E] text-[20px] flex-shrink-0 mt-0.5">
              check_circle
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-[#107E3E] font-bold">CLEAR</span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Deterministic alignment
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                100% parameter match. Safe to proceed to PayPal Sandbox gateway.
              </p>
            </div>
          </div>

          {/* REVIEW */}
          <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-[10px] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#B45309] text-[20px] flex-shrink-0 mt-0.5">
              warning
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-[#B45309] font-bold">REVIEW</span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Discrepancy detected
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                Amount mismatch or altered recipient. Proceed blocked until clarified.
              </p>
            </div>
          </div>

          {/* BLOCKED */}
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[10px] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#DC2626] text-[20px] flex-shrink-0 mt-0.5">
              block
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-[#DC2626] font-bold">BLOCKED</span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Constraint violation
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                Known malicious pattern or sandbox constraint violation. No checkout permitted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
