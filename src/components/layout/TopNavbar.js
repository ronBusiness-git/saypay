"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SayPayLogo from "../SayPayLogo.js";
import { signOutDemo, useDemoSession } from "../../lib/demoAuth.js";

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useDemoSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isDashboard = pathname === "/";
  const isHistory =
    pathname.startsWith("/history") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/checks") ||
    pathname.startsWith("/receipt");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutDemo();
      router.push("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Full-screen logout overlay covering navbar and viewport */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#087F68] border-t-transparent" />
            <div>
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                Signing out…
              </h3>
              <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                Clearing secure session and returning to login
              </p>
            </div>
          </div>
        </div>
      )}

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
          </nav>
        </div>

        {/* Trailing Controls: User Info and Logout */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#DFE5E8] bg-[#F7F8FA] py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#A7F3D0] bg-[#EAF7F1] text-[11px] font-bold text-primary">
                  {session.initials || "JD"}
                </span>
                <span className="hidden lg:block leading-tight text-left">
                  <span className="block font-label-md text-label-md font-semibold text-on-surface">
                    {session.name}
                  </span>
                  <span className="block font-code-sm text-[10px] text-secondary">
                    {session.role === "seller" ? "Merchant Account" : "Buyer Account"}
                  </span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-[10px] border border-[#DFE5E8] bg-white px-3 font-label-md text-label-md font-semibold text-secondary hover:border-[#FECACA] hover:bg-[#FFF5F5] hover:text-[#DC2626] transition-colors"
                type="button"
                title="Log out"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] bg-primary-container px-4 font-label-md text-label-md font-semibold text-white shadow-sm hover:bg-[#066653]"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  </>
  );
}
