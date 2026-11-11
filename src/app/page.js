"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Say<span className="text-emerald-400">Pay</span>
        </h1>

        <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
          Powered by Verina AI
        </span>
      </nav>

      <section className="mx-auto flex min-h-[75vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-sm text-emerald-300">
          AI-powered voice payment assistant
        </div>

        <h2 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Your voice.
          <span className="block text-emerald-400">
            Your payment.
          </span>
          Your control.
        </h2>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
          Meet Verina, your intelligent payment assistant.
          Speak naturally, review your payment details,
          and approve securely with PayPal.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            className="rounded-xl bg-emerald-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-emerald-300"
            onClick={() => alert("SayPay demo is coming soon!")}
          >
            Explore SayPay
          </button>

          <a
            href="#how-it-works"
            className="rounded-xl border border-slate-700 px-7 py-4 font-semibold hover:bg-slate-800"
          >
            How it works
          </a>
        </div>

        <div
          id="how-it-works"
          className="mt-24 grid w-full gap-5 text-left md:grid-cols-3"
        >
          {[
            ["01", "Speak", "Tell Verina who you want to pay."],
            ["02", "Review", "Confirm the recipient and amount."],
            ["03", "Approve", "Complete payment securely with PayPal."],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <span className="text-sm text-emerald-400">{number}</span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-7 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SayPay. Powered by Verina AI.
      </footer>
    </main>
  );
}
