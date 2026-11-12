"use client";

import React, { useEffect, useRef, useState } from "react";
import { speakSoftly, stopSpeaking } from "../../lib/voice.js";

function VoiceStatusPill({ listening, speaking, voiceEnabled, isThinking }) {
  if (!voiceEnabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-1 font-label-sm text-label-sm text-secondary">
        <span className="material-symbols-outlined text-[13px]">mic_off</span>
        Mic off
      </span>
    );
  }

  const active = listening || speaking || isThinking;
  return (
    <span
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-label-sm text-label-sm font-semibold transition-colors duration-300 ${
        isThinking
          ? "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
          : active
          ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
          : "border-[#DFE5E8] bg-[#F7F8FA] text-secondary"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isThinking
            ? "bg-[#B45309] animate-bounce"
            : active
            ? "bg-[#107E3E] animate-pulse"
            : "bg-[#B8C2CC]"
        }`}
      />
      {isThinking
        ? "Processing…"
        : listening
        ? "Listening…"
        : speaking
        ? "Speaking…"
        : "Ready"}
    </span>
  );
}

const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "EN" },
  { code: "es-ES", label: "ES" },
  { code: "fr-FR", label: "FR" },
  { code: "de-DE", label: "DE" },
];

export default function VoiceAssistPanel({
  stage = 1,
  greeting = "Hi, I’m SayPay Assist. Tell me what you want to pay and I’ll verify it with safety rules before anything moves.",
  suggestions = [],
  onTranscript,
  onSuggestion,
  onAssistantResult,
  voiceEnabled = true,
  disabledMessage = "Voice is paused. Use the text box below to continue.",
  initialMode = "voice",
  role = "buyer",
}) {
  const [mode, setMode] = useState(initialMode);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [messages, setMessages] = useState([
    { role: "assistant", text: greeting },
  ]);

  const continuousListeningRef = useRef(false);
  const pauseTimerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, listening, speaking, isThinking]);

  useEffect(() => {
    return () => {
      continuousListeningRef.current = false;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      stopSpeaking();
    };
  }, []);

  const speak = (text) => {
    if (!voiceEnabled) return;
    setSpeaking(true);
    speakSoftly(text, {
      lang: selectedLang,
      onEnd: () => {
        setSpeaking(false);
        // Continuous Voice AI (ChatGPT Astra Style): automatically resume listening if still active
        if (continuousListeningRef.current && voiceEnabled) {
          setTimeout(() => {
            if (continuousListeningRef.current) {
              setListening(true);
              startSpeechRecognition();
            }
          }, 350);
        }
      },
    });
  };

  /**
   * Execute user utterance via real /api/assistant
   */
  const handleUserText = async (text, useVoice) => {
    const trimmed = text.trim();
    if (!trimmed) {
      // Graceful fallback for blank or unintelligible audio (NC-11)
      const fallback = "I'm sorry, I didn't catch that. I'm happy to help you check or pay your invoices. Could you please repeat that?";
      setMessages((current) => [...current, { role: "assistant", text: fallback }]);
      if (useVoice) speak(fallback);
      return;
    }

    // Check control words like "stop", "wait", "hold on", "pause"
    if (/^(wait|stop|hold on|pause)$/i.test(trimmed)) {
      continuousListeningRef.current = false;
      setListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      const pauseMsg = "Paused. I'm waiting for your instruction whenever you're ready.";
      setMessages((current) => [...current, { role: "assistant", text: pauseMsg }]);
      if (useVoice) speak(pauseMsg);
      return;
    }

    // Check goodbye/closing words like "no", "that's all", "bye", "cancel"
    if (/^(no|no thanks|that's all|nothing|bye|cancel|all good)$/i.test(trimmed)) {
      continuousListeningRef.current = false;
      setListening(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      const byeMsg = "Glad I could help! Have a great day. Feel free to tap the microphone anytime you need assistance.";
      setMessages((current) => [...current, { role: "assistant", text: byeMsg }]);
      if (useVoice) speak(byeMsg);
      return;
    }

    onTranscript?.(trimmed, useVoice ? "voice" : "typed");
    onSuggestion?.(trimmed);

    const nextMessages = [
      ...messagesRef.current,
      { role: "user", text: trimmed },
    ];
    setMessages(nextMessages);
    setIsThinking(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
          lang: selectedLang,
        }),
      });

      const data = await res.json();
      setIsThinking(false);

      const reply = data.reply || "I've checked that for you.";
      
      // Synchronous Voice & Text Rendering (NC-06)
      setMessages((current) => [
        ...current,
        { role: "assistant", text: reply },
      ]);

      if (useVoice) {
        speak(reply);
      }

      // Propagate action and data to parent page (e.g. prepare_payment, invoice_created, show_invoices)
      onAssistantResult?.(data);
    } catch (err) {
      console.warn("Assistant call error:", err);
      setIsThinking(false);
      const fallback = "I encountered a brief connection error. Please try again.";
      setMessages((current) => [
        ...current,
        { role: "assistant", text: fallback },
      ]);
      if (useVoice) speak(fallback);
    }
  };

  /**
   * Speech Recognition with silence detection auto-execute and control words
   */
  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return false;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    try {
      // Abort any prior instance
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        setLiveTranscript(combined);

        // Control word check: if user says "stop", "wait", "hold on", "pause"
        const lower = combined.toLowerCase();
        if (
          lower.endsWith("wait") ||
          lower.endsWith("stop") ||
          lower.endsWith("hold on") ||
          lower.endsWith("pause")
        ) {
          if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
          return;
        }

        // Reset silence debounce timer while user continues talking
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

        // Auto-execute after 1.25s of silence when the user finishes speaking
        if (combined.length > 2) {
          pauseTimerRef.current = setTimeout(() => {
            setListening(false);
            setLiveTranscript("");
            try { recognition.stop(); } catch {}
            handleUserText(combined, true);
          }, 1250);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        // Do not abort continuous session on non-fatal errors like no-speech
        if (err.error === "no-speech") {
          // If silence, remain active in continuous listening mode
          return;
        }
        setListening(false);
      };

      recognition.onend = () => {
        // If continuous mode is on and not speaking or thinking, auto-resume
        if (continuousListeningRef.current && !speaking && !isThinking) {
          try {
            recognition.start();
          } catch {}
        } else {
          setListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      return true;
    } catch {
      return false;
    }
  };

  const handleOrbClick = () => {
    if (!voiceEnabled) {
      setMode("manual");
      setTimeout(() => inputRef.current?.focus(), 30);
      return;
    }

    if (listening) {
      // User tapped to finish / stop listening
      continuousListeningRef.current = false;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setListening(false);
      if (liveTranscript.trim()) {
        const text = liveTranscript;
        setLiveTranscript("");
        handleUserText(text, true);
      }
      return;
    }

    stopSpeaking();
    setSpeaking(false);
    setMode("voice");
    continuousListeningRef.current = true;
    setListening(true);
    setLiveTranscript("");

    const started = startSpeechRecognition();
    if (!started) {
      continuousListeningRef.current = false;
      setListening(false);
      alert("Speech recognition is not available on this browser. Please use manual entry.");
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const value = input;
    setInput("");
    handleUserText(value, false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const focusManual = () => {
    setMode("manual");
    continuousListeningRef.current = false;
    setListening(false);
    stopSpeaking();
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  return (
    <section
      className={`overflow-hidden rounded-2xl transition-all duration-300 ${
        listening
          ? "bg-[#EAF7F1] ring-2 ring-[#087F68]/40 border border-[#78D8BD] shadow-[0_4px_24px_rgba(8,127,104,0.12)]"
          : "bg-surface-container-lowest border border-[#DFE5E8] shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]"
      }`}
    >
      {/* Assistant header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#DFE5E8] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF7F1] text-primary-container">
            <span className="material-symbols-outlined text-[20px]">
              graphic_eq
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#107E3E]" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-label-lg text-label-lg font-bold text-on-surface">
              SayPay Assist
            </p>
            <p className="truncate font-body-sm text-body-sm text-secondary">
              {role === "seller" ? "Merchant invoice voice companion" : "Voice-first payment companion"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-language Selector (NC-12) */}
          <div className="flex rounded-lg border border-[#DFE5E8] bg-white p-0.5 text-[11px] font-semibold text-secondary">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLang(lang.code);
                  if (recognitionRef.current) {
                    recognitionRef.current.lang = lang.code;
                  }
                }}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  selectedLang === lang.code
                    ? "bg-[#087F68] text-white"
                    : "text-secondary hover:text-[#15232D]"
                }`}
                title={`Switch to ${lang.label}`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <VoiceStatusPill
            listening={listening}
            speaking={speaking}
            isThinking={isThinking}
            voiceEnabled={voiceEnabled}
          />
        </div>
      </div>

      {/* Top: AI voice assist area */}
      <div
        className={`relative transition-all duration-300 ${
          mode === "voice" ? "px-4 pb-3 pt-5" : "px-4 py-3"
        }`}
      >
        <button
          type="button"
          onClick={handleOrbClick}
          aria-label={
            voiceEnabled
              ? listening
                ? "Stop listening"
                : "Speak to SayPay Assist"
              : "Voice input is disabled"
          }
          aria-expanded={mode === "voice"}
          className={`group relative mx-auto flex items-center justify-center rounded-full transition-all duration-300 ${
            mode === "voice" ? "h-24 w-24" : "h-12 w-12"
          } ${
            listening
              ? "bg-[#087F68] text-white shadow-xl shadow-[#087F68]/30 scale-105"
              : voiceEnabled
              ? "bg-[#EAF7F1] text-primary-container hover:bg-[#087F68] hover:text-white"
              : "bg-[#F3F4F6] text-secondary/60 cursor-not-allowed"
          }`}
        >
          {listening && (
            <>
              <span className="voice-ring-1 absolute inset-0 rounded-full bg-[#087F68]/30 animate-ping" />
              <span className="voice-ring-2 absolute inset-0 rounded-full bg-[#78D8BD]/25" />
            </>
          )}
          <span
            className={`relative material-symbols-outlined ${
              mode === "voice" ? "text-[38px]" : "text-[22px]"
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {listening ? "mic" : speaking ? "volume_up" : "mic"}
          </span>
        </button>

        {mode === "voice" ? (
          <div className="mt-3 text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-2 flex h-7 items-center justify-center gap-1"
            >
              {[1, 2, 3, 4, 5, 6, 5, 4].map((bar, index) => (
                <span
                  key={index}
                  className={`w-1 rounded-full ${
                    listening ? `wave-bar-${bar} bg-[#087F68]` : "h-1.5 bg-[#CDD9D5]"
                  }`}
                />
              ))}
            </div>
            <p className="font-label-lg text-label-lg font-semibold text-on-surface">
              {listening
                ? "Continuous listening… speak naturally"
                : speaking
                ? "SayPay is speaking…"
                : isThinking
                ? "Thinking & evaluating…"
                : voiceEnabled
                ? "Tap mic to speak"
                : "Voice is paused"}
            </p>
            <p className="mx-auto mt-1 max-w-[32ch] font-body-sm text-body-sm text-secondary">
              {listening
                ? liveTranscript || "Auto-executes when you pause. Say 'wait' to pause, or 'no' when done."
                : role === "seller"
                ? "Try: “Create invoice for buyer@saypay.app for 3 items $45”"
                : "Try: “Pay GreenLeaf coffee invoice” or “Show unpaid bills”"}
            </p>
            {listening && (
              <button
                type="button"
                onClick={handleOrbClick}
                className="mt-2 inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#FECACA] bg-white px-3 py-1 font-label-sm text-label-sm font-semibold text-[#BA1A1A] hover:bg-[#FEF2F2] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">stop</span>
                Finish & Send
              </button>
            )}
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="font-body-sm text-body-sm text-secondary">
              Voice is minimised. Tap “Use voice” to expand.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!voiceEnabled) return;
                setMode("voice");
              }}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm font-semibold text-primary hover:bg-[#EAF7F1] disabled:opacity-50"
              disabled={!voiceEnabled}
            >
              <span className="material-symbols-outlined text-[15px]">mic</span>
              Use voice
            </button>
          </div>
        )}
      </div>

      {/* Conversation transcript */}
      <div className="border-t border-[#F0F3F5] px-4 py-3">
        <div
          ref={scrollRef}
          className="max-h-52 space-y-2.5 overflow-y-auto pr-1"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex animate-assist-rise ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[92%] rounded-xl px-3 py-2 font-body-sm text-body-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#EAF7F1] text-on-surface border border-[#A7F3D0]"
                    : "bg-[#F7F8FA] text-on-surface border border-[#DFE5E8]"
                }`}
              >
                {message.role === "assistant" && (
                  <span className="mb-1 flex items-center gap-1 font-label-sm text-[10px] uppercase tracking-wider text-primary">
                    <span className="material-symbols-outlined text-[12px]">
                      auto_awesome
                    </span>
                    SayPay Assist
                  </span>
                )}
                {message.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="rounded-xl px-3 py-2 bg-[#F7F8FA] text-secondary border border-[#DFE5E8] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] animate-spin text-primary">
                  progress_activity
                </span>
                Evaluating safety rules…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-[#F0F3F5] px-4 py-2.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleUserText(suggestion, mode === "voice")}
              className="rounded-full border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm text-secondary hover:border-[#A7F3D0] hover:bg-[#EAF7F1] hover:text-primary transition-colors text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Bottom: manual entry */}
      <div className="border-t border-[#DFE5E8] bg-[#F7F8FA] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
            Manual entry
          </span>
          <button
            type="button"
            onClick={focusManual}
            className={`inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold ${
              mode === "manual" ? "text-primary" : "text-secondary hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">keyboard</span>
            {mode === "manual" ? "Typing…" : "Type instead"}
          </button>
        </div>

        {mode === "manual" ? (
          <div className="animate-assist-rise">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={() => setMode("manual")}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder={role === "seller" ? "Create invoice for buyer@saypay.app for $45..." : "Type your payment intent or request..."}
              className="w-full resize-none rounded-[10px] border border-[#DFE5E8] bg-white p-2.5 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1]"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-body-sm text-[11px] text-secondary">
                Press Enter to send
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg bg-primary-container px-3 py-1 font-label-md text-label-md font-semibold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={focusManual}
            className="flex min-h-[40px] w-full items-center gap-2 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 text-left font-body-sm text-body-sm text-secondary hover:border-[#A7F3D0] hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard</span>
            {role === "seller" ? "Type invoice instruction…" : "Type a payment request…"}
          </button>
        )}
      </div>
    </section>
  );
}
