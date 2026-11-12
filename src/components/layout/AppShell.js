"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import SandboxBanner from "./SandboxBanner.js";
import DisclaimerFooter from "./DisclaimerFooter.js";
import DemoLabDrawer from "../drawers/DemoLabDrawer.js";
import SettingsDrawer from "../drawers/SettingsDrawer.js";
import AuditLogDrawer from "../drawers/AuditLogDrawer.js";
import SandboxWelcomeModal from "../modals/SandboxWelcomeModal.js";
import {
  MobileTabBarSkeleton,
  NavbarSkeleton,
} from "../ui/LoadingSkeletons.js";

// Dynamically load navigation components without SSR to avoid usePathname prerender issue
const TopNavbar = dynamic(() => import("./TopNavbar.js"), {
  ssr: false,
  loading: () => <NavbarSkeleton />,
});
const MobileTabBar = dynamic(() => import("./MobileTabBar.js"), {
  ssr: false,
  loading: () => <MobileTabBarSkeleton />,
});

export default function AppShell({ children }) {
  const [demoLabOpen, setDemoLabOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-on-surface">
      {/* 1. Amber Sandbox Strip (Always visible, sticky) */}
      <SandboxBanner />

      {/* 2. Desktop Navigation */}
      <Suspense fallback={<NavbarSkeleton />}>
        <TopNavbar
          onOpenDemoLab={() => setDemoLabOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </Suspense>

      {/* 3. Main View Area */}
      <div className="flex-1 w-full pb-16 md:pb-0">
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              onOpenAuditLog: () => setAuditLogOpen(true),
              onOpenDemoLab: () => setDemoLabOpen(true),
            })
          : children}
      </div>

      {/* 4. Global Footer */}
      <DisclaimerFooter />

      {/* 5. Mobile Bottom Tab Bar */}
      <Suspense fallback={<MobileTabBarSkeleton />}>
        <MobileTabBar />
      </Suspense>

      {/* 6. Drawers */}
      <DemoLabDrawer isOpen={demoLabOpen} onClose={() => setDemoLabOpen(false)} />
      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AuditLogDrawer isOpen={auditLogOpen} onClose={() => setAuditLogOpen(false)} />

      {/* 7. Sandbox Welcome Modal (first visit) */}
      <SandboxWelcomeModal />
    </div>
  );
}
