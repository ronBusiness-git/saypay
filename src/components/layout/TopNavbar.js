"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SayPayLogo from "../SayPayLogo.js";
import { signOutDemo, useDemoSession } from "../../lib/demoAuth.js";

export default function TopNavbar({ onOpenDemoLab, onOpenSettings }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useDemoSession();
  const isDashboard = pathname === "/";
  const isHistory = pathname.startsWith("/history") || pathname.startsWith("/transactions") || pathname.startsWith("/checks");
  const isLogin = pathname === "/login";

  const handleLogout = () => {
    signOutDemo();
    router.push("/login");
  };

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
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors duration-150"
            title="Settings"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#DFE5E8] bg-[#F7F8FA] py-1 pl-1 pr-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#A7F3D0] bg-[#EAF7F1] text-[11px] font-bold text-primary">
                  {session.initials}
                </span>
                <span className="hidden lg:block leading-tight">
                  <span className="block font-label-md text-label-md font-semibold text-on-surface">
                    {session.name}
                  </span>
                  <span className="block font-code-sm text-[10px] text-secondary">
                    {session.email}
                  </span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-3.5 font-label-md text-label-md font-semibold text-secondary transition-colors hover:border-[#FECACA] hover:bg-[#FFF5F5] hover:text-[#DC2626] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FECACA]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log out
              </button>
            </div>
          ) : isLogin ? (
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] border border-[#DFE5E8] bg-white px-4 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] bg-primary-container px-5 font-label-md text-label-md font-semibold text-white shadow-sm transition-all hover:bg-[#066653] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
