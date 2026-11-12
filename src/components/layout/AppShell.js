"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useDemoSession } from "../../lib/demoAuth.js";
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
  const router = useRouter();
  const session = useDemoSession();
  const [mounted, setMounted] = useState(false);

  // Clean standalone layout for auth pages
  const isStandalone = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route Protection (Requirement 7): Unauthenticated users cannot access protected routes
  useEffect(() => {
    if (mounted && !isStandalone && !session) {
      router.replace("/login");
    }
  }, [mounted, isStandalone, session, router]);

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        {children}
      </div>
    );
  }

  // Guard against unauthenticated viewing of protected routes
  if (mounted && !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] p-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#087F68] border-t-transparent mb-3" />
        <p className="font-label-md text-label-md font-semibold text-on-surface">
          Authenticating session…
        </p>
        <p className="font-body-sm text-body-sm text-secondary">
          Redirecting to login. Please sign in to continue.
        </p>
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
