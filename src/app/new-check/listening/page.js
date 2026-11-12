"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlowPageLayout from "../../../components/flow/FlowPageLayout.js";
import VoiceAssistPanel from "../../../components/flow/VoiceAssistPanel.js";
import { DEMO_PAYMENT } from "../../../lib/demoFlowData.js";

const WORDS = DEMO_PAYMENT.voiceTranscript.split(" ");

const ENTITIES = [
  { label: "Recipient", value: DEMO_PAYMENT.merchant, icon: "storefront" },
  { label: "Amount", value: DEMO_PAYMENT.amount, icon: "payments" },
  { label: "Reference", value: DEMO_PAYMENT.reference, icon: "tag" },
];

const BAR_HEIGHTS = [6, 10, 16, 24, 14, 20, 9, 15, 22, 12, 18, 8];

export default function NewCheckListeningPage({ onOpenAuditLog }) {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [captured, setCaptured] = useState(false);
  const [override, setOverride] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (captured || count >= WORDS.length) return undefined;
    timerRef.current = setTimeout(() => setCount((value) => value + 1), 170);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [count, captured]);

  const transcript = override || WORDS.slice(0, count).join(" ");

  const stopAndUse = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCount(WORDS.length);
    setCaptured(true);
  };

  const handleTranscript = (text) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOverride(text);
    setCaptured(true);
  };

  const listening = !captured;

  return (
    <FlowPageLayout
      stage={1}
      status={listening ? "Listening" : "Captured"}
      tone={listening ? "pending" : "clear"}
      auditCount={1}
      onOpenAuditLog={onOpenAuditLog}
      eyebrow="New payment check · listening"
      title={listening ? "I’m listening — tell me what to pay" : "Here is what I heard"}
      subtitle="Only the transcript is used. Review the captured words before anything is checked or paid."
      badge={
        <>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-bold ${
              listening
                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">
              {listening ? "mic" : "check_circle"}
            </span>
            {listening ? "Listening · up to 8s" : "Transcript captured"}
          </span>
          <span className="font-code-sm text-code-sm text-secondary">
            No audio is stored
          </span>
        </>
      }
      actions={
        <Link
          href="/new-check"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
        >
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          Back to start
        </Link>
      }
      assistant={
        <VoiceAssistPanel
          stage={1}
          greeting="I’m listening. Say who you want to pay, the amount, the currency, and any invoice reference."
          reply="I’ve added that to your transcript. Check the words, then continue when they look right."
          amountReply="I capture amounts as spoken. Say the currency and the number clearly, for example “USD twelve fifty”."
          merchantReply="Say the merchant exactly as it appears on the invoice so I can match the registered payee."
          whyReply="I only use what you actually said. If something is missing I will ask instead of guessing."
          actionReply="Stop the mic when you are done, review the transcript, then run the safety check."
          suggestions={["Pay USD 12.50 to GreenLeaf Demo Store for GL-204", "What should I say?"]}
          samplePhrase={DEMO_PAYMENT.voiceTranscript}
          onTranscript={handleTranscript}
        />
      }
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest p-4 shadow-sm sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {listening && (
                <>
                  <span className="voice-ring-1 absolute inset-0 rounded-full bg-primary/20" />
                  <span className="voice-ring-2 absolute inset-0 rounded-full bg-primary/15" />
                </>
              )}
              <span
                className={`relative flex h-16 w-16 items-center justify-center rounded-full ${
                  listening
                    ? "bg-primary-container text-white shadow-lg shadow-primary/20"
                    : "bg-[#EAF7F1] text-primary-container"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[30px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {listening ? "mic" : "graphic_eq"}
                </span>
              </span>
            </div>

            <div aria-hidden="true" className="mt-4 flex h-10 items-end gap-1">
              {BAR_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className={`w-1.5 rounded-full ${
                    listening
                      ? `wave-bar-${(index % 6) + 1} bg-primary-container`
                      : "bg-[#CDD9D5]"
                  }`}
                  style={listening ? { height } : { height: 6 }}
                />
              ))}
            </div>

            <p className="mt-3 font-label-lg text-label-lg font-bold text-on-surface">
              {listening ? "Listening… speak naturally" : "Capture finished"}
            </p>
            <p className="mt-1 max-w-md font-body-sm text-body-sm text-secondary">
              {listening
                ? "Include the merchant, amount, currency and invoice reference. Tap stop when you are done."
                : "Read the transcript below. You can correct it on the start page before running the check."}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Live transcript
              </span>
              <span className="font-code-sm text-code-sm text-secondary">
                en-US · browser speech
              </span>
            </div>
            <p
              aria-live="polite"
              className="min-h-[64px] font-body-md text-body-md leading-relaxed text-on-surface"
            >
              {transcript}
              {listening && (
                <span className="animate-caret ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-primary-container align-middle" />
              )}
            </p>
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/new-check"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-[#F7F8FA]"
              >
                <span className="material-symbols-outlined text-[17px]">keyboard</span>
                Type instead
              </Link>
              <Link
                href="/new-check"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] px-2 py-2 font-label-md text-label-md font-semibold text-secondary hover:text-primary"
              >
                Cancel
              </Link>
            </div>

            {listening ? (
              <button
                type="button"
                onClick={stopAndUse}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
              >
                <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                Stop &amp; use transcript
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/checks/chk_demo_204")}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] bg-primary-container px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-primary"
              >
                Use this intent
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </button>
            )}
          </div>
        </section>

        {captured && (
          <section className="animate-assist-rise rounded-2xl border border-[#A7F3D0] bg-[#F3FBF7] p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#107E3E]">
                auto_awesome
              </span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Details I recognised
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {ENTITIES.map((entity) => (
                <div
                  key={entity.label}
                  className="rounded-xl border border-[#A7F3D0] bg-white p-3"
                >
                  <p className="flex items-center gap-1 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      {entity.icon}
                    </span>
                    {entity.label}
                  </p>
                  <p className="mt-1 font-code-md text-[12px] font-semibold text-on-surface">
                    {entity.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-body-sm text-body-sm text-secondary">
              These values are checked against the pasted request. Nothing is guessed or filled in
              automatically.
            </p>
          </section>
        )}
      </div>
    </FlowPageLayout>
  );
}
