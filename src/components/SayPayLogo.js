"use client";

import React from "react";

export default function SayPayLogo({ className = "h-8 w-auto", showWordmark = true }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SayPay Shield Emblem */}
      <svg
        className="h-8 w-8 flex-shrink-0"
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SayPay Shield Logo"
      >
        {/* Shield Outer Outline */}
        <path
          d="M50 8C68 18 84 21 88 23C90 48 88 78 50 106C12 78 10 48 12 23C16 21 32 18 50 8Z"
          fill="#FFFFFF"
          stroke="#0F243A"
          strokeWidth="11"
          strokeLinejoin="round"
        />
        {/* Waveform Bars */}
        {/* Bar 1 */}
        <rect x="25" y="49" width="7" height="17" rx="3.5" fill="#00A884" />
        {/* Bar 2 */}
        <rect x="36" y="38" width="7" height="39" rx="3.5" fill="#00A884" />
        {/* Bar 3 */}
        <rect x="47" y="27" width="7" height="61" rx="3.5" fill="#00A884" />
        {/* Bar 4 */}
        <rect x="58" y="38" width="7" height="39" rx="3.5" fill="#00A884" />
        {/* Green Checkmark */}
        <path
          d="M62 55L71 64L84 46"
          stroke="#10B981"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className="font-bold tracking-tight text-2xl flex items-center select-none font-sans">
          <span className="text-[#0F243A]">Say</span>
          <span className="text-[#00A884]">Pay</span>
        </span>
      )}
    </div>
  );
}
