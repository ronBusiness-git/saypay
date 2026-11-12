"use client";

import React from "react";
import SayPayLogo from "../SayPayLogo.js";

/**
 * Reusable loading screen with SayPay's teal/emerald design system.
 * Use for page transitions, route loading, step processing, or modal actions.
 */
export default function LoadingScreen({
  message = "Loading...",
  subtext = "Preparing secure payment environment",
  fullscreen = false,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
      {/* Animated Sound & Safety Orb */}
      <div className="relative flex h-20 w-20 items-center justify-center mb-6">
        <span className="voice-ring-1 absolute inset-0 rounded-full border border-[#78D8BD]/50 animate-ping opacity-75" />
        <span className="voice-ring-2 absolute inset-2 rounded-full border border-[#087F68]/30 animate-pulse" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0B3A33] to-[#087F68] shadow-lg shadow-[#087F68]/20 ring-4 ring-[#EAF7F1]">
          <span className="material-symbols-outlined text-[26px] text-white animate-spin">
            progress_activity
          </span>
        </span>
      </div>

      <h3 className="font-headline-sm text-headline-sm font-semibold text-[#15232D]">
        {message}
      </h3>
      {subtext && (
        <p className="mt-1.5 font-body-sm text-body-sm text-secondary">
          {subtext}
        </p>
      )}

      {/* Animated Wave Bars */}
      <div className="mt-6 flex h-6 items-end gap-1.5" aria-hidden="true">
        {["h-2", "h-4", "h-6", "h-3", "h-5", "h-2"].map((height, i) => (
          <span
            key={i}
            className={`w-1 rounded-full bg-[#087F68] animate-pulse ${height}`}
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F8FA]/90 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-16 flex items-center justify-center">
      {content}
    </div>
  );
}
