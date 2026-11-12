"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VoiceStatusBar({ onQuickCheck }) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [promptText, setPromptText] = useState(
    "“I want to pay GreenLeaf Demo Store USD 12.50 for invoice GL-204”"
  );

  const toggleMic = () => {
    setIsListening(!isListening);
  };

  const handleCheck = () => {
    if (onQuickCheck) {
      onQuickCheck(promptText);
    } else {
      router.push("/new-check");
    }
  };

  return (
    <section className="space-y-5">
      {/* Dashboard Title & Voice Status Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Payment Safety Dashboard
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Voice-assisted screening and intent verification before PayPal Sandbox checkout.
          </p>
        </div>

        {/* VoiceStatusPill Badge */}
        <div className="inline-flex items-center gap-3 px-3.5 py-2 bg-[#EAF7F1] border border-[#A7F3D0] rounded-full self-start md:self-auto shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107E3E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#107E3E]"></span>
          </span>
          <div className="flex items-center gap-1">
            <span className="font-label-md text-label-md text-[#107E3E] font-semibold">
              Voice Assistant: {isListening ? "Listening..." : "Active"}
            </span>
          </div>
          {/* Animated Audio Wave Pulses */}
          <div className="flex items-center gap-0.5 h-4 ml-1 px-1.5 py-0.5 bg-white/80 rounded border border-[#A7F3D0]">
            <div className={`w-1 bg-primary-container rounded-full ${isListening ? "wave-bar-1" : "h-2"}`}></div>
            <div className={`w-1 bg-primary-container rounded-full ${isListening ? "wave-bar-2" : "h-3"}`}></div>
            <div className={`w-1 bg-primary-container rounded-full ${isListening ? "wave-bar-3" : "h-1.5"}`}></div>
            <div className={`w-1 bg-primary-container rounded-full ${isListening ? "wave-bar-4" : "h-2.5"}`}></div>
          </div>
        </div>
      </div>

      {/* Quick Action Voice Prompt Input Bar */}
      <div className="bg-surface-container-lowest border border-[#DFE5E8] rounded-[16px] p-2.5 shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)] flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-3 w-full flex-1 px-3">
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-sm ${
              isListening
                ? "bg-[#DC2626] text-white animate-pulse"
                : "bg-[#EAF7F1] text-primary-container hover:bg-[#d2ffef]"
            }`}
            title="Click to toggle voice simulation"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
          <div className="flex-1 min-w-0">
            <label className="sr-only" htmlFor="voice-demo-input">
              Voice payment command
            </label>
            <input
              id="voice-demo-input"
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-on-surface font-body-md text-body-md focus:ring-0 truncate"
              placeholder="e.g. I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#DFE5E8]">
          <button
            type="button"
            onClick={handleCheck}
            className="w-full sm:w-auto h-[44px] px-5 bg-primary-container hover:bg-[#066653] text-on-primary font-label-md text-label-md font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98] shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Check Payment</span>
          </button>
        </div>
      </div>
    </section>
  );
}
