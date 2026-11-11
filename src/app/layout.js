import "./globals.css";

export const metadata = {
  title: "SayPay — Voice-First Payment Safety Companion",
  description: "Say it. Check it. Pay with confidence. AI-powered two-source payment verification with PayPal Sandbox.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

