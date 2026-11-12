"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SayPayLogo from "../SayPayLogo.js";
import { signOutDemo, useDemoSession } from "../../lib/demoAuth.js";

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useDemoSession();
  const isDashboard = pathname === "/";
  const isHistory =
    pathname.startsWith("/history") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/checks");

  const handleLogout = async () => {
    await signOutDemo();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0] shadow-2xs sticky top-0 z-40">
      <div className="w-full px-4 md:px-8 max-w-[1280px] mx-auto flex items-center justify-between h-16">
        {/* Brand & Left Navigation Links */}
        <div className="flex items-center gap-8">
          <Link aria-label="SayPay Dashboard" className="flex items-center focus:outline-none" href="/">
            <SayPayLogo />
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              className={`text-sm font-semibold pb-1 flex items-center gap-1.5 transition-colors ${
                isDashboard
                  ? "text-[#0070BA] border-b-2 border-[#0070BA]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
              href="/"
            >
              Dashboard
            </Link>
            <Link
              className={`text-sm font-semibold pb-1 transition-colors ${
                isHistory
                  ? "text-[#0070BA] border-b-2 border-[#0070BA]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
              href="/history"
            >
              History
            </Link>
          </nav>
        </div>

        {/* Trailing Controls: Ask SayPay CTA + User Profile */}
        <div className="flex items-center gap-3">
          {/* Prominent Ask SayPay Button */}
          <Link
            href="/new-check"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-[#003087] to-[#0070BA] hover:from-[#00256B] hover:to-[#005ea6] text-white text-xs font-bold shadow-md shadow-[#0070BA]/20 hover:scale-102 transition-all active:scale-98"
          >
            <span className="text-sm">🎙️</span>
            <span>Ask SayPay</span>
          </Link>

          {session ? (
            <div className="flex items-center gap-3 pl-2 border-l border-[#E2E8F0]">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0070BA] text-[11px] font-bold text-white">
                  {session.initials || "JD"}
                </span>
                <span className="hidden lg:block leading-tight text-left">
                  <span className="block text-xs font-bold text-[#0F172A]">
                    {session.name}
                  </span>
                  <span className="block text-[10px] text-[#64748B]">
                    {session.role === "seller" ? "Merchant" : "Buyer"}
                  </span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#64748B] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                type="button"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005ea6] transition-colors shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
