"use client";

import React from "react";

export default function SandboxBanner() {
  return (
    <div className="bg-[#FEF3C7] border-b border-[#FCD34D] px-4 py-1.5 text-center shadow-2xs">
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-[#92400E]">
        <span>⚡</span>
        <span>PAYPAL DEVELOPER SANDBOX</span>
        <span className="opacity-50">·</span>
        <span className="font-medium text-[#78350F]">SayPay AI Safety Gateway Active</span>
      </div>
    </div>
  );
}
