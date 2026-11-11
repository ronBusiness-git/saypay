import "./globals.css";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";

export const metadata = {
  title: "SayPay — Voice-First Payment Safety Companion",
  description:
    "Say it. Check it. Pay with confidence. AI-powered two-source payment verification with PayPal Sandbox.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="app-shell">
          <Navbar />
          <main className="main-content" id="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
