"use client";

import React from "react";

export default function SandboxBanner() {
  return (
    <div className="sticky top-0 z-50 bg-[#FEF3C7] border-b border-[#FCD34D] px-4 md:px-margin-desktop py-1.5 text-center shadow-sm">
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[#B45309] text-[18px]">warning</span>
        <span className="font-label-md text-label-md text-[#B45309] font-medium tracking-wide">
          PAYPAL SANDBOX — TEST ONLY · No real money
        </span>
        <span className="hidden md:inline-block text-[#B45309] opacity-60">|</span>
        <span className="hidden md:inline-block font-body-sm text-body-sm text-[#B45309]">
          SayPay Safety Gateway Active
        </span>
      </div>
    </div>
  );
}
