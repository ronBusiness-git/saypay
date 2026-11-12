"use client";

import React, { useEffect, useState } from "react";
import { TONE } from "../../lib/demoFlowData.js";

export function ExpiryTimer({ seconds = 900 }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const urgent = remaining <= 120;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 ${
        urgent
          ? "border-[#FDE68A] bg-[#FEF3C7]/60"
          : "border-[#DFE5E8] bg-[#F7F8FA]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`material-symbols-outlined text-[18px] ${
            urgent ? "text-[#B45309]" : "text-secondary"
          }`}
        >
          timer
        </span>
        <p className="font-body-sm text-body-sm text-on-surface">
          This check expires in{" "}
          <span
            className={`font-code-md text-code-md font-bold ${
              urgent ? "text-[#B45309]" : "text-primary"
            }`}
          >
            {minutes}:{secs}
          </span>
        </p>
      </div>
      <span className="hidden font-body-sm text-body-sm text-secondary sm:block">
        Expiry disables every later stage
      </span>
    </div>
  );
}

export function CheckoutSummary({ payment, showSafety = true }) {
  const tone = TONE.clear;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F3F5] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            receipt_long
          </span>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Payment summary
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2 py-0.5 font-code-sm text-[10px] text-secondary">
          <span className="material-symbols-outlined text-[12px]">lock</span>
          Read-only · from server check
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#EAF7F1] font-label-lg text-label-lg font-bold text-primary-container">
              {payment.merchantInitials}
            </span>
            <div>
              <p className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {payment.merchant}
              </p>
              <p className="font-code-sm text-code-sm text-secondary">
                Merchant {payment.merchantId}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2 py-0.5 font-label-sm text-[10px] font-bold text-[#107E3E]">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Approved merchant
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Amount to pay
            </p>
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {payment.amount}
            </p>
            <p className="font-body-sm text-body-sm text-secondary">
              {payment.currency} · invoice {payment.reference}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2.5 rounded-xl border border-[#F0F3F5] bg-[#F7F8FA] p-3 sm:grid-cols-3">
          <div>
            <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Currency
            </dt>
            <dd className="font-code-md text-[12px] font-semibold text-on-surface">
              {payment.currency}
            </dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Reference
            </dt>
            <dd className="font-code-md text-[12px] font-semibold text-on-surface">
              {payment.reference}
            </dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Purpose
            </dt>
            <dd className="font-body-sm text-body-sm text-on-surface">
              {payment.purpose}
            </dd>
          </div>
        </dl>

        {showSafety && (
          <div
            className={`mt-4 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${tone.hero}`}
          >
            <div className="flex items-start gap-2">
              <span className={`material-symbols-outlined text-[20px] ${tone.text}`}>
                verified_user
              </span>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">
                  AI match &amp; safety check passed
                </p>
                <p className="font-body-sm text-body-sm text-secondary">
                  No spam or scam signals · checked at 14:32 UTC
                </p>
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1 self-start rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold sm:self-auto ${tone.chip}`}
            >
              <span className="material-symbols-outlined text-[13px]">
                check_circle
              </span>
              CLEAR
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
