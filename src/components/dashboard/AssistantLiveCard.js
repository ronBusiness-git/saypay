"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const PHASES = [
  {
    key: "listening",
    title: "Listening to you",
    chip: "Voice",
    chipClass: "border-white/25 bg-white/10 text-[#CDEBE3]",
    icon: "mic",
    line: "I want to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204.",
    meta: "Capturing intent · reading only, nothing is charged",
  },
  {
    key: "parsing",
    title: "Reading the payment request",
    chip: "Parsing",
    chipClass: "border-[#BFDBFE]/40 bg-[#1D4ED8]/20 text-[#DBEAFE]",
    icon: "request_quote",
    line: "Request parsed: GreenLeaf Demo Store · GL-204 · USD 12.50.",
    meta: "Untrusted content read as data only",
  },
  {
    key: "comparing",
    title: "Comparing both sources",
    chip: "Comparing",
    chipClass: "border-[#FDE68A]/40 bg-[#B45309]/25 text-[#FDE68A]",
    icon: "compare_arrows",
    line: "Merchant, amount and invoice reference match across both sources.",
    meta: "3 of 3 fields match",
  },
  {
    key: "rules",
    title: "Checking safety rules",
    chip: "Rules",
    chipClass: "border-white/25 bg-white/10 text-[#CDEBE3]",
    icon: "verified_user",
    line: "All 5 server rules passed. Nothing is blocked.",
    meta: "Deterministic rules decide, not the AI",
  },
];

const PHASE_DURATIONS = [1400, 1100, 1200, 1100];

const CHECKLIST = ["Intent captured", "Request parsed", "Fields compared", "Safety rules"];

export default function AssistantLiveCard() {
  const [status, setStatus] = useState("idle");
  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef;
    return () => timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const start = () => {
    clearTimers();
    setStatus(PHASES[0].key);

    let elapsed = 0;
    const next = PHASES.slice(1).map((phase, index) => {
      elapsed += PHASE_DURATIONS[index];
      return window.setTimeout(() => setStatus(phase.key), elapsed);
    });
    elapsed += PHASE_DURATIONS[PHASE_DURATIONS.length - 1];
    next.push(window.setTimeout(() => setStatus("done"), elapsed));
    timersRef.current = next;
  };

  const stop = () => {
    clearTimers();
    setStatus("idle");
  };

  const running = status !== "idle" && status !== "done";
  const done = status === "done";
  const phase = running ? PHASES.find((item) => item.key === status) : null;
  const phaseIndex = running ? PHASES.indexOf(phase) : done ? PHASES.length : -1;

  const statusTitle = done
    ? "Check finished — cleared to review"
    : phase
      ? phase.title
      : "Always on — tap to check a payment";
  const statusMeta = done
    ? "4 of 4 checks passed · nothing was charged"
    : phase
      ? phase.meta
      : "Listening for a request in this sandbox workspace";
  const narration = done
    ? "GreenLeaf Demo Store · USD 12.50 · invoice GL-204 matches. Safe for you to review."
    : phase
      ? phase.line
      : "Hi, I'm SayPay Assist. Say it or tap the orb, and I'll verify the payment before you send money.";

  const orbLabel = done
    ? "Run the live payment check again"
    : running
      ? "Stop the live payment check"
      : "Start a live payment check";

  return (
    <section className="flex flex-col rounded-2xl border border-[#DFE5E8] bg-white p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7F1] text-primary ring-1 ring-[#A7F3D0]">
            <span className="material-symbols-outlined text-[19px]">graphic_eq</span>
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
              AI voice assist
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Always on · payment safety companion
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#EAF7F1] px-2.5 py-1 font-label-sm text-[10px] font-bold uppercase tracking-wider text-[#107E3E]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#107E3E] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#107E3E]" />
          </span>
          Live
        </span>
      </div>

      {/* Live voice console */}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-[#0B3A33] px-5 pb-5 pt-6 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-[#78D8BD]/20 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-8 h-48 w-48 rounded-full bg-[#00A884]/20 blur-2xl"
        />

        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={running ? stop : start}
            aria-label={orbLabel}
            className="group relative flex h-28 w-28 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78D8BD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B3A33]"
          >
            <span className="voice-ring-1 absolute inset-0 rounded-full border border-[#78D8BD]/50" />
            <span className="voice-ring-2 absolute inset-0 rounded-full border border-[#78D8BD]/35" />
            <span
              className={`absolute inset-3 rounded-full transition-colors ${
                running ? "bg-[#0F8A72]/60" : "bg-white/5"
              }`}
            />
            <span
              className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                running
                  ? "bg-[#12A386] text-white shadow-[#12A38666] scale-105"
                  : done
                    ? "bg-[#EAF7F1] text-[#107E3E]"
                    : "bg-[#087F68] text-white group-hover:bg-[#0F8A72]"
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {done ? "check" : running ? "graphic_eq" : "mic"}
              </span>
            </span>
          </button>

          <div className="mt-3 flex h-5 items-end gap-1" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map((bar) => (
              <span
                key={bar}
                className={`wave-bar-${bar} w-[3px] rounded-full ${
                  running ? "bg-[#78D8BD]" : "bg-[#78D8BD]/50"
                }`}
              />
            ))}
          </div>

          <p
            key={status}
            aria-live="polite"
            className="animate-assist-rise mt-3 text-center font-label-lg text-[13px] font-semibold text-white"
          >
            {statusTitle}
          </p>
          <p className="mt-0.5 text-center font-body-sm text-[11px] text-[#BFE6DA]">{statusMeta}</p>

          {running && phase ? (
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-label-sm text-[9px] font-bold uppercase tracking-wider ${phase.chipClass}`}
            >
              <span className="material-symbols-outlined text-[11px]">{phase.icon}</span>
              {phase.chip}
            </span>
          ) : (
            <button
              type="button"
              onClick={start}
              className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 font-label-sm text-[11px] font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78D8BD]"
            >
              <span className="material-symbols-outlined text-[14px]">
                {done ? "refresh" : "touch_app"}
              </span>
              {done ? "Run another check" : "Tap to start a live check"}
            </button>
          )}
        </div>
      </div>

      {/* Narration */}
      <div key={`narration-${status}`} className="animate-assist-rise mt-4 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-white">
          <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
        </span>
        <div className="min-w-0 rounded-2xl rounded-tl-sm border border-[#DFE5E8] bg-[#F7F8FA] px-3 py-2">
          <p className="font-body-sm text-[11.5px] leading-relaxed text-[#15232D]">{narration}</p>
        </div>
      </div>

      {/* Live checklist */}
      <div className="mt-3 rounded-xl border border-[#DFE5E8] bg-white p-3">
        <div className="flex items-center justify-between">
          <p className="font-label-sm text-[9px] font-bold uppercase tracking-wider text-secondary">
            Live check
          </p>
          <span className="font-code-sm text-[10px] text-secondary">
            {done ? "4/4" : `${Math.max(phaseIndex, 0)}/4`}
          </span>
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
          {CHECKLIST.map((item, index) => {
            const itemDone = done || index < phaseIndex;
            const itemActive = !done && index === phaseIndex;
            return (
              <li key={item} className="flex items-center gap-1.5">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    itemDone
                      ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
                      : itemActive
                        ? "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
                        : "border-[#E5E7EB] bg-white text-[#C3CBD1]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[10px]">
                    {itemDone ? "check" : itemActive ? "more_horiz" : "remove"}
                  </span>
                </span>
                <span
                  className={`truncate font-body-sm text-[10.5px] ${
                    itemDone || itemActive ? "font-semibold text-[#15232D]" : "text-secondary"
                  }`}
                >
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Result */}
      {done && (
        <div className="animate-assist-rise mt-3 rounded-xl border border-[#A7F3D0] bg-[#EAF7F1] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-white px-2 py-0.5 font-label-sm text-[9px] font-bold uppercase tracking-wider text-[#107E3E]">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Clear
            </span>
            <span className="font-code-sm text-[10px] text-[#107E3E]">chk_demo_204</span>
          </div>
          <p className="mt-1.5 font-label-md text-label-md font-semibold text-[#15232D]">
            USD 12.50 · GreenLeaf Demo Store
          </p>
          <p className="font-body-sm text-[10.5px] text-secondary">
            Invoice GL-204 · matched on both sources
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Link
              href="/checks/chk_demo_204"
              className="inline-flex min-h-[34px] flex-1 items-center justify-center gap-1 rounded-lg bg-primary-container px-3 font-label-md text-[11px] font-semibold text-white transition-colors hover:bg-[#066653]"
            >
              Review this check
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
            <button
              type="button"
              onClick={start}
              className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg border border-[#DFE5E8] bg-white px-3 font-label-md text-[11px] font-semibold text-secondary transition-colors hover:bg-[#F7F8FA]"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Again
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] px-3 py-2 font-body-sm text-[11px] leading-relaxed text-secondary">
        <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
        The assistant narrates each step, but server rules decide the result. Nothing is charged in this demo.
      </p>
    </section>
  );
}
