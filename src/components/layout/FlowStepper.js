"use client";

import React from "react";

export default function FlowStepper({
  currentStep = 3,
  mode = "STRICT MATCH",
  auditCount = 6,
  onOpenAuditLog,
}) {
  const steps = [
    {
      number: "01",
      title: "Your intent",
      subtitle: "Spoken or typed",
      icon: "check_circle",
    },
    {
      number: "02",
      title: "AI safety match",
      subtitle: "Entity validation",
      icon: "check_circle",
    },
    {
      number: "03",
      title: "Review",
      subtitle: "Awaiting confirm",
      icon: "pending",
    },
    {
      number: "04",
      title: "Confirm",
      subtitle: "Voice passkey",
      icon: "hourglass_empty",
    },
    {
      number: "05",
      title: "Pay",
      subtitle: "Sandbox checkout",
      icon: "schedule",
    },
    {
      number: "06",
      title: "Receipt + log",
      subtitle: "Immutable event",
      icon: "receipt_long",
    },
  ];

  return (
    <section className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
      {/* Stepper Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
          Screening Pipeline Life Cycle
        </span>
        <span className="font-code-sm text-code-sm text-primary px-2.5 py-1 bg-surface-container-low rounded-md border border-[#A7F3D0] font-medium">
          Mode: {mode}
        </span>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pb-4">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          let cardStyle = "bg-surface-container-low/40 border-[#DFE5E8] opacity-75";
          let numColor = "text-secondary";
          let titleColor = "text-on-surface";

          if (isCompleted) {
            cardStyle = "bg-[#EAF7F1] border-[#A7F3D0]";
            numColor = "text-[#107E3E]";
          } else if (isCurrent) {
            cardStyle = "bg-surface-container-lowest border-2 border-primary-container shadow-sm";
            numColor = "text-primary-container font-bold";
            titleColor = "text-primary font-bold";
          }

          return (
            <div
              key={step.number}
              className={`flex flex-col gap-1 p-2.5 rounded-[10px] border transition-all ${cardStyle}`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-code-sm text-code-sm ${numColor}`}>{step.number}</span>
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[#107E3E] text-[16px]">
                    check_circle
                  </span>
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                ) : (
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    {step.icon}
                  </span>
                )}
              </div>
              <span className={`font-label-md text-label-md ${titleColor}`}>{step.title}</span>
              <span className="font-body-sm text-body-sm text-secondary">{step.subtitle}</span>
            </div>
          );
        })}
      </div>

      {/* AuditTrailRail below Stepper */}
      <div className="pt-3 border-t border-[#DFE5E8] flex items-center justify-between">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-[18px] text-primary">history_edu</span>
          <span className="font-label-md text-label-md font-medium text-on-surface">
            Audit log · <span className="text-primary font-bold">{auditCount}</span> events recorded
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenAuditLog}
          className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container transition-colors font-semibold"
        >
          <span>View full telemetry</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}
