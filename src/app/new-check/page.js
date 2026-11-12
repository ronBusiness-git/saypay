"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  speakSoftly,
  stopSpeaking,
  createSpeechRecognizer,
} from "@/lib/voice.js";
import { useDemoSession } from "@/lib/demoAuth.js";

export default function SayPayAssistPage() {
  const router = useRouter();
  const session = useDemoSession();

  // Conversation State
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm SayPay Assist. Tell me what bill you'd like to pay, or ask me to show your unpaid invoices.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Right Panel / Context State
  const [panelView, setPanelView] = useState("default"); // 'default' | 'invoices' | 'payment' | 'receipt'
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [activePayment, setActivePayment] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [isExecutingPayment, setIsExecutingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const recognizerRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Initial load: fetch unpaid invoices
  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {}
      }
    };
  }, []);

  async function fetchUnpaidInvoices() {
    try {
      const res = await fetch("/api/invoices?status=UNPAID");
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        setUnpaidInvoices(data.invoices);
      }
    } catch (err) {
      console.warn("Failed to fetch unpaid invoices:", err);
    }
  }

  // Toggle voice recognition
  function toggleListening() {
    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setIsSpeaking(false);

    const rec = createSpeechRecognizer({
      onTranscript: (transcript) => {
        setInputText(transcript);
      },
      onStateChange: (state) => {
        setIsListening(state === "listening");
      },
      onError: () => {
        setIsListening(false);
      },
    });

    if (rec) {
      recognizerRef.current = rec;
      try {
        rec.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Failed to start recognizer:", err);
        setIsListening(false);
      }
    } else {
      alert("Speech recognition is not supported in this browser. Please type your message.");
    }
  }

  // Send message to assistant
  async function handleSendMessage(overrideText = null, selectedInvoiceId = null) {
    const textToSend = (overrideText !== null ? overrideText : inputText).trim();
    if (!textToSend && !selectedInvoiceId) return;

    // Stop listening if currently active
    if (isListening && recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {}
      setIsListening(false);
    }

    const newMessages = [
      ...messages,
      {
        role: "user",
        content: textToSend || `Prepare invoice ${selectedInvoiceId}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setMessages(newMessages);
    setInputText("");
    setIsThinking(true);
    setPaymentError(null);

    try {
      const payload = {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        context: selectedInvoiceId ? { selectedInvoiceId } : {},
      };

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsThinking(false);

      const assistantReply =
        data.reply || "I'm ready. How else can I assist you with this payment?";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      // Speak softly if voice enabled
      if (voiceEnabled) {
        setIsSpeaking(true);
        speakSoftly(assistantReply, {
          onEnd: () => setIsSpeaking(false),
        });
      }

      // Handle panel state transitions based on AI decision
      if (data.action === "show_invoices") {
        setPanelView("invoices");
        if (data.data?.invoices) {
          setUnpaidInvoices(data.data.invoices);
        }
      } else if (data.action === "prepare_payment" && data.data?.payment) {
        setActivePayment(data.data.payment);
        setPanelView("payment");
      } else if (data.action === "show_history") {
        // Can route to history or show summary
      }
    } catch (err) {
      console.error("Assistant request failed:", err);
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I ran into a temporary error. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }

  // 1-Click Pay with PayPal Sandbox Execution (Human Authorization)
  async function handleExecutePayment() {
    if (!activePayment || !activePayment.checkId) return;

    setIsExecutingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create PayPal Order
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: activePayment.checkId }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(orderData.error || "Failed to create PayPal order");
      }

      const orderId = orderData.orderId;

      // 2. Capture PayPal Order
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId: activePayment.checkId, orderId }),
      });

      const captureData = await captureRes.json();
      if (!captureRes.ok) {
        throw new Error(captureData.error || "Failed to capture PayPal payment");
      }

      // 3. Success! Set receipt
      const receipt = {
        transactionId: captureData.transactionId,
        captureId: captureData.captureId,
        amount: activePayment.amount,
        currency: activePayment.currency,
        merchantName: activePayment.merchantName,
        invoiceId: activePayment.invoiceId,
        date: new Date().toLocaleString(),
      };

      setCompletedReceipt(receipt);
      setPanelView("receipt");
      setIsExecutingPayment(false);

      // Re-fetch unpaid invoices list
      fetchUnpaidInvoices();

      // Assistant confirms verbally
      const verbalConfirm = `Payment of ${activePayment.amount} dollars to ${activePayment.merchantName} has been completed successfully via PayPal.`;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: verbalConfirm,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (voiceEnabled) {
        speakSoftly(verbalConfirm);
      }
    } catch (err) {
      console.error("Payment execution error:", err);
      setPaymentError(err.message || "Payment processing failed. Please try again.");
      setIsExecutingPayment(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#1E293B]">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003087] to-[#0070BA] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#0F172A] tracking-tight">SayPay</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold">
                  Assist
                </span>
              </div>
              <p className="text-xs text-[#64748B]">PayPal Conversational AI Safety Gateway</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening
                  ? "bg-red-500 animate-ping"
                  : isSpeaking
                  ? "bg-emerald-500 animate-pulse"
                  : isThinking
                  ? "bg-amber-500 animate-bounce"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-[#334155]">
              {isListening
                ? "Listening..."
                : isSpeaking
                ? "Speaking (Soft Voice)"
                : isThinking
                ? "Verifying with Safety Engine..."
                : "SayPay Ready"}
            </span>
          </div>

          {/* Voice Mute Toggle */}
          <button
            onClick={() => {
              if (voiceEnabled) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              voiceEnabled
                ? "border-[#0070BA]/30 bg-[#F0F9FF] text-[#0070BA]"
                : "border-[#E2E8F0] bg-white text-[#94A3B8]"
            }`}
            title={voiceEnabled ? "Mute Voice Output" : "Enable Soft Voice Output"}
          >
            <span className="text-sm">{voiceEnabled ? "🔊" : "🔇"}</span>
            <span className="hidden sm:inline">{voiceEnabled ? "Soft Voice ON" : "Voice Muted"}</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-full bg-[#0070BA] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {session?.initials || "JD"}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-[#0F172A]">{session?.name || "John Doe"}</p>
              <p className="text-[#64748B] text-[10px]">{session?.email || "buyer@saypay.app"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main 2-Panel Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conversational AI Agent (7 Cols) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[760px] overflow-hidden">
          {/* Conversation Header */}
          <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0070BA]/10 flex items-center justify-center text-[#0070BA]">
                🛡️
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">Conversation with SayPay</h2>
                <p className="text-xs text-[#64748B]">Speak or type natural payment requests</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    role: "assistant",
                    content: "Hello! How can I assist you with your payments today?",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ]);
                setPanelView("default");
                setActivePayment(null);
                setCompletedReceipt(null);
              }}
              className="text-xs text-[#64748B] hover:text-[#0F172A] font-medium"
            >
              Clear chat
            </button>
          </div>

          {/* Chat Messages Scroll Area */}
          <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#003087] to-[#0070BA] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
                    SP
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0070BA] text-white rounded-br-none shadow-sm"
                      : "bg-[#F1F5F9] text-[#1E293B] rounded-bl-none border border-[#E2E8F0]/60"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div
                    className={`text-[10px] mt-1.5 flex items-center gap-2 ${
                      msg.role === "user" ? "text-blue-100 justify-end" : "text-[#94A3B8]"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.role === "assistant" && voiceEnabled && (
                      <button
                        onClick={() => speakSoftly(msg.content)}
                        className="hover:text-[#0070BA] transition-colors"
                        title="Replay voice"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
                    {session?.initials || "ME"}
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#003087] to-[#0070BA] text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
                  SP
                </div>
                <div className="bg-[#F1F5F9] text-[#64748B] rounded-2xl rounded-bl-none px-4 py-3 text-sm border border-[#E2E8F0]/60 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0070BA] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#0070BA] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0070BA] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs">Checking safety rules...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="px-6 py-2.5 bg-[#F8FAFC] border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[#64748B] font-medium flex-shrink-0">Suggestions:</span>
            <button
              onClick={() => handleSendMessage("Show my unpaid bills")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#334155] hover:border-[#0070BA] hover:text-[#0070BA] transition-colors flex-shrink-0 shadow-2xs font-medium"
            >
              📄 Show my unpaid bills
            </button>
            <button
              onClick={() => handleSendMessage("Pay invoice GL-1042")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#334155] hover:border-[#0070BA] hover:text-[#0070BA] transition-colors flex-shrink-0 shadow-2xs font-medium"
            >
              ☕ Pay GreenLeaf ($12.50)
            </button>
            <button
              onClick={() => handleSendMessage("Pay TechNova invoice TN-2210")}
              className="px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#334155] hover:border-[#0070BA] hover:text-[#0070BA] transition-colors flex-shrink-0 shadow-2xs font-medium"
            >
              ⌨️ Pay TechNova ($49.99)
            </button>
          </div>

          {/* Input & Voice Controls */}
          <div className="p-4 bg-white border-t border-[#E2E8F0]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30 ring-4 ring-red-100"
                    : "bg-[#0070BA] text-white hover:bg-[#005ea6] shadow-md shadow-[#0070BA]/20"
                }`}
                title={isListening ? "Stop listening" : "Tap to Speak with SayPay"}
              >
                <span className="text-xl">{isListening ? "⏹️" : "🎙️"}</span>
              </button>

              {/* Text Input Field */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening to your voice..."
                      : "Type a request (e.g. 'Pay GreenLeaf' or 'Show my invoices')..."
                  }
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070BA] focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-2 p-2 text-[#0070BA] disabled:text-[#CBD5E1] hover:scale-105 transition-all"
                >
                  <span className="text-lg font-bold">➔</span>
                </button>
              </div>
            </form>
            {isListening && (
              <p className="text-center text-xs text-red-500 font-medium mt-2 animate-pulse">
                🔴 Listening... Speak naturally. Tap microphone button when finished.
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Dynamic Action Canvas (5 Cols) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[760px] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#0F172A]">
                {panelView === "default" && "Step-by-Step Overview"}
                {panelView === "invoices" && "Pending Invoices"}
                {panelView === "payment" && "Human Review & Confirm"}
                {panelView === "receipt" && "Payment Confirmation"}
              </span>
            </div>
            {panelView !== "default" && (
              <button
                onClick={() => setPanelView("default")}
                className="text-xs text-[#0070BA] hover:underline font-medium"
              >
                Back to overview
              </button>
            )}
          </div>

          {/* Dynamic Content Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* VIEW 1: DEFAULT / HOW IT WORKS */}
            {panelView === "default" && (
              <div className="space-y-6">
                <div className="rounded-xl p-5 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-[#BAE6FD]">
                  <h3 className="font-bold text-[#0369A1] text-base mb-1">
                    AI Intent + Human Authorization
                  </h3>
                  <p className="text-xs text-[#0C4A6E] leading-relaxed">
                    SayPay lets you pay invoices simply by speaking or typing. Our MatchCheck safety
                    engine cross-verifies all amounts and recipients with deterministic accuracy.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                    How it works in 3 clean steps:
                  </h4>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]">
                    <div className="w-7 h-7 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#0F172A]">Say</h5>
                      <p className="text-xs text-[#64748B]">
                        Speak or type your intent: &quot;Pay GreenLeaf coffee invoice&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]">
                    <div className="w-7 h-7 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#0F172A]">Review</h5>
                      <p className="text-xs text-[#64748B]">
                        SayPay safety engine verifies recipient, amount, reference, and duplicate rules.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]">
                    <div className="w-7 h-7 rounded-lg bg-[#0070BA] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#0F172A]">Pay</h5>
                      <p className="text-xs text-[#64748B]">
                        You click &quot;Pay with PayPal&quot; to authorize. Money moves securely via PayPal Sandbox.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Unpaid Invoices List */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Ready to Pay ({unpaidInvoices.length})
                    </span>
                    <button
                      onClick={() => setPanelView("invoices")}
                      className="text-xs text-[#0070BA] hover:underline font-medium"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {unpaidInvoices.slice(0, 3).map((inv) => (
                      <div
                        key={inv.invoiceId}
                        className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#0070BA] bg-white transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">{inv.merchantName}</p>
                          <p className="text-[11px] text-[#64748B]">
                            {inv.invoiceId} • {inv.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#0F172A]">${inv.amount}</p>
                          <button
                            onClick={() => handleSendMessage(null, inv.invoiceId)}
                            className="text-[11px] text-[#0070BA] font-semibold group-hover:underline"
                          >
                            Pay this ➔
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: UNPAID INVOICES LIST */}
            {panelView === "invoices" && (
              <div className="space-y-4">
                <p className="text-xs text-[#64748B]">
                  Select an invoice below or tell SayPay which one you want to pay:
                </p>

                <div className="space-y-3">
                  {unpaidInvoices.map((inv) => (
                    <div
                      key={inv.invoiceId}
                      className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#0070BA] bg-white shadow-2xs transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0F172A]">{inv.merchantName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">{inv.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-[#94A3B8]">
                            <span>Ref: {inv.invoiceId}</span>
                            <span>•</span>
                            <span>Due in {new Date(inv.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-extrabold text-[#0F172A]">
                            ${inv.amount} <span className="text-xs font-medium text-[#64748B]">{inv.currency}</span>
                          </div>
                          <button
                            onClick={() => handleSendMessage(null, inv.invoiceId)}
                            className="mt-2 px-3 py-1.5 rounded-lg bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            Review & Pay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 3: PREPARED PAYMENT CARD (MATCHCHECK VERIFIED) */}
            {panelView === "payment" && activePayment && (
              <div className="space-y-5">
                {/* Verified Header Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-[#CBD5E1]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      MATCHCHECK CLEAR
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">
                      Ref: {activePayment.invoiceId}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B]">Paying to verified merchant:</p>
                  <h3 className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                    {activePayment.merchantName}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">{activePayment.description}</p>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-[#64748B]">Total Amount</span>
                    <span className="text-2xl font-black text-[#0070BA]">
                      ${activePayment.amount}{" "}
                      <span className="text-sm font-semibold text-[#64748B]">{activePayment.currency}</span>
                    </span>
                  </div>
                </div>

                {/* Deterministic Safety Verification Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Safety Rules Passed
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                      <span>✓</span>
                      <div>
                        <p className="font-semibold text-[11px]">Recipient Verified</p>
                        <p className="text-[10px] text-emerald-600">Active merchant in registry</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                      <span>✓</span>
                      <div>
                        <p className="font-semibold text-[11px]">Amount Matched</p>
                        <p className="text-[10px] text-emerald-600">${activePayment.amount} exact</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                      <span>✓</span>
                      <div>
                        <p className="font-semibold text-[11px]">Invoice Reference</p>
                        <p className="text-[10px] text-emerald-600">{activePayment.invoiceId}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                      <span>✓</span>
                      <div>
                        <p className="font-semibold text-[11px]">No Duplicate</p>
                        <p className="text-[10px] text-emerald-600">Fresh transaction</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Banner if any */}
                {paymentError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <p className="font-semibold">Payment failed:</p>
                    <p>{paymentError}</p>
                  </div>
                )}

                {/* HUMAN CONFIRMATION BUTTON: PAY WITH PAYPAL */}
                <div className="pt-2">
                  <button
                    onClick={handleExecutePayment}
                    disabled={isExecutingPayment}
                    className="w-full py-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-base shadow-lg shadow-[#0070BA]/25 flex items-center justify-center gap-3 transition-all transform active:scale-98 disabled:opacity-50"
                  >
                    {isExecutingPayment ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authorizing with PayPal Sandbox...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="font-black text-lg">PayPal</span>
                        <span>Pay ${activePayment.amount} with PayPal</span>
                      </span>
                    )}
                  </button>
                  <p className="text-center text-[11px] text-[#64748B] mt-2">
                    🔒 Authorized by human confirmation via PayPal Sandbox Gateway.
                  </p>
                </div>
              </div>
            )}

            {/* VIEW 4: COMPLETED RECEIPT */}
            {panelView === "receipt" && completedReceipt && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-2xl shadow-sm mb-3">
                    ✓
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A]">Payment Completed!</h3>
                  <p className="text-xs text-[#64748B]">PayPal Sandbox Capture Succeeded</p>
                </div>

                <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Paid To</span>
                    <span className="font-bold text-[#0F172A]">{completedReceipt.merchantName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Amount</span>
                    <span className="font-black text-emerald-700 text-sm">
                      ${completedReceipt.amount} {completedReceipt.currency}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Invoice ID</span>
                    <span className="font-mono text-[#0F172A]">{completedReceipt.invoiceId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Transaction ID</span>
                    <span className="font-mono text-[11px] text-[#0F172A]">{completedReceipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-[#64748B]">Capture ID</span>
                    <span className="font-mono text-[11px] text-[#0F172A]">{completedReceipt.captureId}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Timestamp</span>
                    <span className="text-[#0F172A]">{completedReceipt.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setPanelView("invoices");
                      setActivePayment(null);
                      setCompletedReceipt(null);
                    }}
                    className="w-full py-3 rounded-xl bg-[#0070BA] text-white text-xs font-bold hover:bg-[#005ea6] transition-colors shadow-sm"
                  >
                    Pay Another Invoice
                  </button>
                  <Link
                    href="/"
                    className="block text-center w-full py-3 rounded-xl border border-[#CBD5E1] text-[#334155] text-xs font-bold hover:bg-[#F8FAFC] transition-colors"
                  >
                    View in Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
