"use client";

import React from "react";
import { FLOW_STAGES, TONE } from "../../lib/demoFlowData.js";

export default function FlowStepper({
  stage = 1,
  status = "In progress",
  tone = "clear",
  auditCount = 0,
  onOpenAuditLog,
}) {
  const toneStyle = TONE[tone] || TONE.clear;

  return (
    <section
      aria-label="Payment safety flow"
      className="w-full bg-surface-container-lowest border border-[#DFE5E8] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
            Payment safety flow
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-label-sm text-label-sm font-semibold ${toneStyle.chip}`}
          >
            <span className="material-symbols-outlined text-[13px]">
              {toneStyle.icon}
            </span>
            {status}
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            Stage {stage} of 4
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenAuditLog}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#DFE5E8] bg-[#F7F8FA] px-2.5 py-1.5 font-label-sm text-label-sm text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[15px] text-primary">
            history_edu
          </span>
          Audit · {auditCount} events
        </button>
      </div>

      {/* Four-stage tracking line */}
      <div className="relative mt-5">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 rounded-full bg-[#E5E7EB]" />
        <div
          className="absolute left-[12.5%] top-5 h-0.5 rounded-full bg-[#78D8BD] transition-all duration-500"
          style={{ width: `${((Math.min(stage, 4) - 1) / 3) * 75}%` }}
        />

        <ol className="relative grid grid-cols-4">
          {FLOW_STAGES.map((item) => {
            const isComplete = item.number < stage;
            const isCurrent = item.number === stage;
            const isFuture = item.number > stage;

            let circleClass =
              "bg-white border-[#DFE5E8] text-secondary opacity-70";
            if (isComplete) {
              circleClass = "bg-[#EAF7F1] border-[#A7F3D0] text-[#107E3E]";
            }
            if (isCurrent) {
              circleClass = `${toneStyle.solid} border-transparent text-white shadow-sm`;
            }
            if (isCurrent && tone === "review") {
              circleClass =
                "bg-[#B45309] border-transparent text-white shadow-sm";
            }
            if (isCurrent && tone === "neutral") {
              circleClass =
                "bg-[#6B7280] border-transparent text-white shadow-sm";
            }

            return (
              <li
                key={item.number}
                className="flex min-w-0 flex-col items-center text-center"
              >
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${circleClass}`}
                >
                  {isComplete ? (
                    <span className="material-symbols-outlined text-[18px]">
                      check
                    </span>
                  ) : isFuture ? (
                    <span className="material-symbols-outlined text-[17px]">
                      lock
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#78D8BD] animate-pulse" />
                  )}
                </span>

                <span
                  className={`mt-1.5 truncate max-w-full font-label-md text-[11px] sm:text-label-md ${
                    isCurrent
                      ? "font-bold text-on-surface"
                      : isComplete
                        ? "font-semibold text-on-surface"
                        : "font-medium text-secondary"
                  }`}
                >
                  {item.title}
                </span>
                <span className="hidden sm:block font-body-sm text-body-sm text-secondary/80">
                  {item.subtitle}
                </span>
                {isCurrent && (
                  <span
                    className={`mt-1 hidden sm:inline-flex max-w-full truncate rounded-full border px-2 py-0.5 font-label-sm text-[10px] font-semibold ${toneStyle.chip}`}
                  >
                    {status}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Audit rail */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#DFE5E8] pt-3">
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="material-symbols-outlined text-[16px] text-outline">
            lock_clock
          </span>
          <span className="font-body-sm text-body-sm">
            {auditCount > 0
              ? `${auditCount} event${auditCount === 1 ? "" : "s"} recorded for this attempt`
              : "Audit log starts when you submit"}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenAuditLog}
          className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary hover:text-primary-container transition-colors"
        >
          View log
          <span className="material-symbols-outlined text-[14px]">
            arrow_forward
          </span>
        </button>
      </div>
    </section>
  );
}
