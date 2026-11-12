"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileTabBar() {
  const pathname = usePathname();

  // Hidden on checkout flow as per Blueprint 3.3, and on the standalone login screen
  if (pathname.startsWith("/checkout") || pathname === "/login") {
    return null;
  }

  const isHome = pathname === "/";
  const isNewCheck = pathname === "/new-check";
  const isHistory = pathname.startsWith("/history") || pathname.startsWith("/transactions");

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-[#DFE5E8] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-4 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            isHome ? "text-primary font-semibold" : "text-secondary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[11px] font-label-sm mt-0.5">Home</span>
        </Link>

        {/* New Check (Centre, Raised) */}
        <Link
          href="/new-check"
          className="flex flex-col items-center -mt-5"
          aria-label="Start New Payment Check"
        >
          <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center shadow-lg hover:bg-[#066653] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[24px]">mic</span>
          </div>
          <span className={`text-[11px] font-label-sm mt-1 ${isNewCheck ? "text-primary font-semibold" : "text-secondary"}`}>
            New Check
          </span>
        </Link>

        {/* History */}
        <Link
          href="/history"
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            isHistory ? "text-primary font-semibold" : "text-secondary hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">history</span>
          <span className="text-[11px] font-label-sm mt-0.5">History</span>
        </Link>
      </div>
    </nav>
  );
}
