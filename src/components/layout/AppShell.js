"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import SandboxBanner from "./SandboxBanner.js";
import DisclaimerFooter from "./DisclaimerFooter.js";
import {
  MobileTabBarSkeleton,
  NavbarSkeleton,
} from "../ui/LoadingSkeletons.js";

const TopNavbar = dynamic(() => import("./TopNavbar.js"), {
  ssr: false,
  loading: () => <NavbarSkeleton />,
});
const MobileTabBar = dynamic(() => import("./MobileTabBar.js"), {
  ssr: false,
  loading: () => <MobileTabBarSkeleton />,
});

export default function AppShell({ children }) {
  const pathname = usePathname();

  // Clean standalone layout for auth pages
  const isStandalone = pathname === "/login" || pathname === "/signup";

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-on-surface">
      {/* 1. Amber Sandbox Strip */}
      <SandboxBanner />

      {/* 2. Top Navigation */}
      <Suspense fallback={<NavbarSkeleton />}>
        <TopNavbar />
      </Suspense>

      {/* 3. Main View Area */}
      <div className="flex-1 w-full pb-16 md:pb-0">
        {children}
      </div>

      {/* 4. Global Footer */}
      <DisclaimerFooter />

      {/* 5. Mobile Bottom Tab Bar */}
      <Suspense fallback={<MobileTabBarSkeleton />}>
        <MobileTabBar />
      </Suspense>
    </div>
  );
}
