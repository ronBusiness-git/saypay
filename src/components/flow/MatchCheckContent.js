"use client";

import React from "react";
import Link from "next/link";
import { TONE } from "../../lib/demoFlowData.js";

const RESULT_STYLES = {
  match: {
    chip: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
    icon: "check",
    row: "bg-transparent",
  },
  warn: {
    chip: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
    icon: "warning",
    row: "bg-[#FFFBEB]/70",
  },
  block: {
    chip: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
    icon: "block",
    row: "bg-[#FFF5F5]",
  },
};

const CHECK_RESULT_STYLES = {
  PASS: "bg-[#EAF7F1] text-[#107E3E] border-[#A7F3D0]",
  WARN: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
  FAIL: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

function ReadAloudButton({ text, tone }) {
  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-[10px] border bg-white px-3 py-2 font-label-md text-label-md font-semibold transition-colors hover:bg-white/70 ${tone.text} ${tone.border}`}
    >
      <span className="material-symbols-outlined text-[18px]">volume_up</span>
      Read aloud
    </button>
  );
}

function FieldStatus({ status, label }) {
  const style = RESULT_STYLES[status] || RESULT_STYLES.match;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${style.chip}`}
    >
      <span className="material-symbols-outlined text-[13px]">
        {style.icon}
      </span>
      {label}
    </span>
  );
}

export default function MatchCheckContent({
  state,
  onOpenAuditLog,
  onOpenWhy,
  showHeader = true,
}) {
  const tone = TONE[state.tone] || TONE.clear;
  const isHistorical = state.readOnly;
  const canContinue = state.key === "CLEAR" && !isHistorical;

  return (
    <div className="space-y-5">
      {/* Status hero */}
      <section
        className={`relative overflow-hidden rounded-2xl border-2 p-5 shadow-sm sm:p-6 ${tone.hero}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tone.bg} ${tone.border} ${tone.text}`}
            >
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {state.icon || tone.icon}
              </span>
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold tracking-wider ${tone.chip}`}
                >
                  {state.statusLabel}
                </span>
                <span className="font-code-sm text-code-sm text-secondary">
                  {state.checkId}
                </span>
                {isHistorical && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 font-label-sm text-label-sm text-secondary">
                    <span className="material-symbols-outlined text-[12px]">
                      lock
                    </span>
                    Read-only
                  </span>
                )}
              </div>
              <h2 className={`font-headline-md text-headline-md ${tone.text}`}>
                {state.heroTitle}
              </h2>
              <p className="mt-1 max-w-2xl font-body-md text-body-md text-on-surface/80">
                {state.heroReason}
              </p>
            </div>
          </div>
          <ReadAloudButton
            text={`${state.statusLabel}. ${state.heroReason}`}
            tone={tone}
          />
        </div>

        {state.noOrderNote && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border bg-white/80 px-3.5 py-2.5 ${tone.border}`}
            role="alert"
          >
            <span className={`material-symbols-outlined text-[18px] ${tone.text}`}>
              shield
            </span>
            <p className="font-body-sm text-body-sm font-medium text-on-surface">
              {state.noOrderNote}
            </p>
          </div>
        )}
      </section>

      {/* AI match comparison */}
      <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              compare_arrows
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              1 · AI match comparison
            </h3>
          </div>
          <span className="font-label-sm text-label-sm text-secondary">
            Intent vs payment request
          </span>
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-[#DFE5E8] md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#DFE5E8] bg-[#F7F8FA] font-label-sm text-label-sm text-secondary">
                <th className="px-3 py-2.5 font-semibold">Field</th>
                <th className="px-3 py-2.5 font-semibold">What you said</th>
                <th className="px-3 py-2.5 font-semibold">What the request says</th>
                <th className="px-3 py-2.5 text-right font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F5] font-body-md text-body-md">
              {state.comparison.map((row) => (
                <tr key={row.field} className={RESULT_STYLES[row.status].row}>
                  <td className="px-3 py-3 font-semibold text-on-surface">
                    {row.field}
                  </td>
                  <td className="px-3 py-3 text-on-surface">{row.intent}</td>
                  <td className="px-3 py-3 font-code-md text-[12px] text-on-surface">
                    {row.request}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <FieldStatus status={row.status} label={row.result} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2.5 md:hidden">
          {state.comparison.map((row) => (
            <div
              key={row.field}
              className={`rounded-xl border border-[#DFE5E8] p-3 ${RESULT_STYLES[row.status].row}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  {row.field}
                </span>
                <FieldStatus status={row.status} label={row.result} />
              </div>
              <div className="grid grid-cols-1 gap-1.5 font-body-sm text-body-sm">
                <p className="text-secondary">
                  <span className="font-semibold text-on-surface">You: </span>
                  {row.intent}
                </p>
                <p className="text-secondary">
                  <span className="font-semibold text-on-surface">Request: </span>
                  {row.request}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Screening groups */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">
                verified_user
              </span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                2 · Security
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-secondary">
              5 server rules
            </span>
          </div>

          <div className="space-y-2">
            {state.security.map((check) => (
              <div
                key={check.label}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#DFE5E8] bg-white p-3"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    className={`material-symbols-outlined mt-0.5 text-[18px] ${
                      check.result === "PASS"
                        ? "text-[#107E3E]"
                        : check.result === "WARN"
                          ? "text-[#B45309]"
                          : "text-[#DC2626]"
                    }`}
                  >
                    {check.result === "PASS"
                      ? "check_circle"
                      : check.result === "WARN"
                        ? "warning"
                        : "cancel"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-label-md text-label-md font-semibold text-on-surface">
                      {check.label}
                    </p>
                    <p className="font-body-sm text-body-sm text-secondary">
                      {check.detail}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 font-label-sm text-[10px] font-bold ${CHECK_RESULT_STYLES[check.result]}`}
                >
                  {check.result}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5">
          <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  mark_email_read
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  3 · Spam signals
                </h3>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 font-label-sm text-[10px] font-bold ${CHECK_RESULT_STYLES[state.spam.result]}`}
              >
                {state.spam.result}
              </span>
            </div>
            <p className="font-label-md text-label-md font-semibold text-on-surface">
              {state.spam.title}
            </p>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">
              {state.spam.detail}
            </p>
          </section>

          <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  gpp_maybe
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  4 · Scam signals
                </h3>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 font-label-sm text-[10px] font-bold ${CHECK_RESULT_STYLES[state.scam.result]}`}
              >
                {state.scam.result}
              </span>
            </div>
            <p className="font-label-md text-label-md font-semibold text-on-surface">
              {state.scam.title}
            </p>
            <p className="mt-1 font-body-sm text-body-sm text-secondary">
              {state.scam.detail}
            </p>
          </section>
        </div>
      </div>

      {/* Explanation */}
      <section
        id="why-this-result"
        className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-5"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">
            psychology
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Why this result
          </h3>
          <span className="rounded-full border border-[#DFE5E8] bg-[#F7F8FA] px-2 py-0.5 font-code-sm text-[10px] text-secondary">
            AI explanation · server rules decide
          </span>
        </div>
        <p className="font-body-md text-body-md leading-relaxed text-on-surface">
          {state.explanation}
        </p>

        {Array.isArray(state.remediations) && state.remediations.length > 0 && (
          <div className="mt-3 rounded-xl border border-[#FDE68A] bg-[#FEF3C7]/40 p-3">
            <p className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-[#B45309]">
              What needs to change
            </p>
            <ul className="mt-1.5 space-y-1">
              {state.remediations.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 font-body-sm text-body-sm text-on-surface"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B45309]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Audit notice */}
      <div className="flex flex-col gap-2 rounded-xl border border-[#DFE5E8] bg-surface-container-low/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">
            policy
          </span>
          <p className="font-body-sm text-body-sm text-on-surface">
            This attempt is recorded in the audit log ·{" "}
            <span className="font-code-sm text-[11px] text-secondary">
              {state.checkId}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAuditLog}
          className="inline-flex items-center gap-1 self-start font-label-md text-label-md font-semibold text-primary hover:text-primary-container sm:self-auto"
        >
          View log
          <span className="material-symbols-outlined text-[15px]">
            open_in_new
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
        {state.key === "CLEAR" && (
          <>
            <button
              type="button"
              onClick={onOpenAuditLog}
              className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
            >
              View log
            </button>
            <Link
              href="/new-check"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[17px]">edit</span>
              Edit my intent
            </Link>
            <Link
              href={`/checkout/${state.checkId}`}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
              Continue to review
            </Link>
          </>
        )}

        {state.key === "REVIEW" && (
          <>
            <button
              type="button"
              onClick={onOpenAuditLog}
              className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
            >
              View log
            </button>
            <button
              type="button"
              onClick={onOpenWhy}
              className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
            >
              Why this result?
            </button>
            <Link
              href="/new-check"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-[#B45309] px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-[#92400E]"
            >
              <span className="material-symbols-outlined text-[18px]">
                build
              </span>
              Fix details &amp; re-check
            </Link>
          </>
        )}

        {state.key === "BLOCKED" && (
          <>
            <button
              type="button"
              onClick={onOpenAuditLog}
              className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
            >
              View log
            </button>
            <button
              type="button"
              onClick={onOpenWhy}
              className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
            >
              Why this result?
            </button>
            <Link
              href="/new-check"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-[#DC2626] px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-[#B91C1C]"
            >
              <span className="material-symbols-outlined text-[18px]">
                restart_alt
              </span>
              Correct details &amp; re-run
            </Link>
          </>
        )}

        {isHistorical && (
          <>
            <button
              type="button"
              onClick={onOpenAuditLog}
              className="min-h-[44px] rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-secondary hover:bg-[#F7F8FA]"
            >
              View log
            </button>
            <Link
              href="/history"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[17px]">
                arrow_back
              </span>
              Back to history
            </Link>
            <Link
              href="/new-check"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                replay
              </span>
              Run a similar check
            </Link>
          </>
        )}
      </div>

      {canContinue && (
        <p className="text-right font-body-sm text-body-sm text-secondary">
          Check expires in 15:00 · Nothing is charged until you confirm and
          approve in PayPal.
        </p>
      )}
    </div>
  );
}
