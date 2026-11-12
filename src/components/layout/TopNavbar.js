"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SayPayLogo from "../SayPayLogo.js";

export default function TopNavbar({ onOpenDemoLab, onOpenSettings }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";
  const isHistory = pathname.startsWith("/history") || pathname.startsWith("/transactions") || pathname.startsWith("/checks");

  return (
    <header className="bg-surface-container-lowest border-b border-[#DFE5E8] shadow-sm sticky top-0 z-40">
      <div className="w-full px-4 md:px-margin-desktop max-w-[1280px] mx-auto flex items-center justify-between h-16">
        {/* Brand & Left Navigation Links */}
        <div className="flex items-center gap-8">
          <Link aria-label="SayPay Dashboard" className="flex items-center focus:outline-none" href="/">
            <SayPayLogo />
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              className={`font-label-md text-label-md pb-1 flex items-center gap-1.5 transition-colors duration-150 ${
                isDashboard
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-secondary hover:text-on-surface"
              }`}
              href="/"
            >
              Dashboard
            </Link>
            <Link
              className={`font-label-md text-label-md pb-1 transition-colors duration-150 ${
                isHistory
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-secondary hover:text-on-surface"
              }`}
              href="/history"
            >
              History
            </Link>
            <button
              onClick={onOpenDemoLab}
              className="text-secondary font-label-md text-label-md hover:text-on-surface flex items-center gap-1.5 pb-1 transition-colors duration-150 focus:outline-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">science</span>
              Demo Lab
            </button>
          </nav>
        </div>

        {/* Trailing Action Controls */}
        <div className="flex items-center gap-3">
          {/* Non-clickable Demo Workspace badge */}
          <div className="relative group hidden sm:flex items-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF5FF] text-secondary text-label-sm font-label-sm border border-[#BFDBFE] cursor-default select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              Demo Workspace
            </span>
            <div className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-inverse-surface text-inverse-on-surface text-[11px] font-label-sm px-2 py-1 rounded shadow-md pointer-events-none z-50">
              Single demo workspace, no login
            </div>
          </div>

          {/* Trailing Icon Actions */}
          <button
            onClick={onOpenDemoLab}
            aria-label="Open Demo Lab"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors duration-150"
            title="Demo Lab"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">science</span>
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors duration-150"
            title="Settings"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          {/* Primary Emerald Action Button */}
          <Link
            href="/new-check"
            className="min-h-[44px] bg-primary-container text-white px-5 rounded-[10px] font-label-md text-label-md flex items-center gap-1.5 hover:bg-[#066653] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            + New Payment Check
          </Link>
        </div>
      </div>
    </header>
  );
}
