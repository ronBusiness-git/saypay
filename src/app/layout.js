import { Suspense } from "react";
import "./globals.css";
import AppShell from "../components/layout/AppShell.js";

export const metadata = {
  title: "SayPay — Voice-First Payment Safety Companion",
  description:
    "Say it. Check it. Pay with confidence. AI-powered two-source payment verification with PayPal Sandbox.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/saypay-logo.jpg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-surface-container selection:text-primary">
        <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
