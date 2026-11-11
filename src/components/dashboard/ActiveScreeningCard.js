"use client";

import React from "react";
import Link from "next/link";

export default function ActiveScreeningCard({
  check = {
    id: "chk_demo_204",
    merchant: "GreenLeaf Demo Store",
    reference: "GL-204",
    initials: "GL",
    amount: "USD 12.50",
    requestAmount: "USD 12.50",
    delta: "$0.00",
    status: "CLEAR",
    rules: [
      { text: "Recipient identity verified in sandbox", status: "PASS" },
      { text: "Amount exact match with authorized quote", status: "PASS" },
      { text: "Purpose & reference validated against invoice GL-204", status: "PASS" },
    ],
  },
}) {
  return (
    <section className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-[#DFE5E8]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[10px] bg-surface-container-low border border-[#DFE5E8] flex items-center justify-center text-primary-container font-headline-sm text-headline-sm font-bold">
            {check.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {check.merchant}
              </h2>
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                title="PayPal Verified Sandbox Merchant"
              >
                verified
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-code-sm text-code-sm text-secondary">{check.id}</span>
              <span className="text-secondary">•</span>
              <span className="font-code-sm text-code-sm bg-surface-container-low px-1.5 py-0.5 rounded text-on-surface font-medium">
                Ref: {check.reference}
              </span>
            </div>
          </div>
        </div>

        {/* Status Chip */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF7F1] text-[#107E3E] border border-[#A7F3D0] rounded-full font-label-sm text-label-sm font-semibold shadow-sm">
          <span className="material-symbols-outlined text-[16px]">shield</span>
          <span>{check.status}</span>
        </span>
      </div>

      {/* Metric Match Display */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-[12px] bg-surface-container-low/40 border border-[#DFE5E8]">
        <div>
          <span className="font-label-sm text-label-sm text-secondary font-medium">
            Spoken Intent Amount
          </span>
          <p className="font-headline-md text-headline-md text-on-surface mt-0.5 font-bold">
            {check.amount}
          </p>
          <span className="font-body-sm text-body-sm text-[#107E3E] flex items-center gap-1 mt-1 font-medium">
            <span className="material-symbols-outlined text-[15px]">check</span> Exact spoken match
          </span>
        </div>

        <div className="border-l border-[#DFE5E8] pl-4">
          <span className="font-label-sm text-label-sm text-secondary font-medium">
            Invoice Request Amount
          </span>
          <p className="font-headline-md text-headline-md text-on-surface mt-0.5 font-bold">
            {check.requestAmount}
          </p>
          <span className="font-body-sm text-body-sm text-secondary mt-1 block">
            Match delta: {check.delta}
          </span>
        </div>
      </div>

      {/* Deterministic Rules Verified Checklist */}
      <div className="space-y-2.5">
        <h3 className="font-label-md text-label-md text-on-surface font-semibold">
          Deterministic Safety Rules
        </h3>
        <div className="space-y-2">
          {check.rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-surface-bright rounded-[10px] border border-[#DFE5E8]"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#107E3E] text-[18px]">
                  verified
                </span>
                <span className="font-body-md text-body-md text-on-surface">{rule.text}</span>
              </div>
              <span className="font-code-sm text-code-sm text-primary font-bold">
                {rule.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Confirmation Callout */}
      <div className="p-3 bg-[#EAF7F1] border border-[#A7F3D0] rounded-[10px] flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-on-surface">
          <span className="material-symbols-outlined text-primary-container text-[22px]">
            record_voice_over
          </span>
          <div>
            <p className="font-label-md text-label-md font-semibold">Voice confirmation ready</p>
            <p className="font-body-sm text-body-sm text-secondary">
              Say <span className="font-semibold text-primary">"Confirm Pay"</span> or click proceed
            </p>
          </div>
        </div>
        <span className="font-code-sm text-code-sm text-[#107E3E] font-medium bg-white px-2 py-1 rounded border border-[#A7F3D0]">
          Awaiting voice...
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/checkout/${check.id}`}
          className="flex-1 h-[44px] bg-primary-container hover:bg-[#066653] text-on-primary font-label-md text-label-md font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">lock_open</span>
          <span>Review & Pay in Sandbox</span>
        </Link>
        <button
          type="button"
          className="px-5 h-[44px] bg-surface-container-lowest border border-[#DFE5E8] text-on-surface hover:bg-surface-container-low font-label-md text-label-md font-medium rounded-[10px] transition-colors active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
