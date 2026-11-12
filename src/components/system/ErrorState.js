"use client";

import React from "react";
import Link from "next/link";

export default function ErrorState({
  error,
  reset,
  eyebrow = "Recovery",
  title = "This screen hit an unexpected error",
  description = "The page could not finish loading. Nothing was charged and your sandbox data is unchanged. You can retry safely.",
  secondaryHref = "/",
  secondaryLabel = "Back to dashboard",
}) {
  return (
    <main className="mx-auto flex w-full max-w-[820px] flex-1 items-center px-4 py-12 md:px-margin-desktop">
      <div className="w-full overflow-hidden rounded-2xl border border-[#DFE5E8] bg-white shadow-[0_1px_3px_rgba(21,35,45,0.04),0_18px_50px_-28px_rgba(21,35,45,0.35)]">
        <div className="flex flex-col gap-2 border-b border-[#FECACA] bg-[#FEF7F7] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#FECACA] bg-[#FEE2E2] px-2.5 py-1 font-label-sm text-[10px] font-bold uppercase tracking-wider text-[#B91C1C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            {eyebrow}
          </span>
          <span className="inline-flex items-center gap-1 font-code-sm text-[11px] text-secondary">
            <span className="material-symbols-outlined text-[14px] text-[#107E3E]">
              shield
            </span>
            Sandbox data is safe · nothing charged
          </span>
        </div>

        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#FECACA]">
              <span className="material-symbols-outlined text-[26px]">
                error
              </span>
            </span>
            <div className="min-w-0">
              <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
                {title}
              </h1>
              <p className="mt-2 max-w-prose font-body-md text-body-md text-secondary">
                {description}
              </p>

              {error?.digest && (
                <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg border border-[#DFE5E8] bg-[#F7F8FA] px-2.5 py-1.5">
                  <span className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Error ref
                  </span>
                  <code className="font-code-sm text-code-sm text-on-surface">
                    {error.digest}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Try again
            </button>
            <Link
              href={secondaryHref}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-5 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                arrow_back
              </span>
              {secondaryLabel}
            </Link>
          </div>

          <div className="mt-7 grid gap-2 border-t border-[#F0F3F5] pt-5 sm:grid-cols-3">
            {[
              { icon: "lock", text: "No payment was started" },
              { icon: "history", text: "Demo history is intact" },
              { icon: "restart_alt", text: "Retrying is safe" },
            ].map((tip) => (
              <div
                key={tip.text}
                className="flex items-center gap-2 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] px-3 py-2.5"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {tip.icon}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  {tip.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
