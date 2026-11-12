"use client";

import React, { useEffect, useRef, useState } from "react";

function VoiceStatusPill({ listening, speaking, voiceEnabled }) {
  if (!voiceEnabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-1 font-label-sm text-label-sm text-secondary">
        <span className="material-symbols-outlined text-[13px]">mic_off</span>
        Mic off
      </span>
    );
  }

  const active = listening || speaking;
  return (
    <span
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-label-sm text-label-sm font-semibold ${
        active
          ? "border-[#A7F3D0] bg-[#EAF7F1] text-[#107E3E]"
          : "border-[#DFE5E8] bg-[#F7F8FA] text-secondary"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-[#107E3E] animate-pulse" : "bg-[#B8C2CC]"
        }`}
      />
      {listening ? "Listening..." : speaking ? "Speaking..." : "Ready"}
    </span>
  );
}

export default function VoiceAssistPanel({
  stage = 1,
  greeting = "Hi, I’m SayPay Assist. Tell me what you want to pay and I’ll check it before any money moves.",
  reply = "I’ve captured that. I’ll use it to compare your intent with the payment request.",
  suggestions = [],
  samplePhrase = "I intend to pay USD 12.50 to GreenLeaf Demo Store for invoice GL-204.",
  onTranscript,
  onSuggestion,
  voiceEnabled = true,
  disabledMessage = "Voice is paused. Use the text box below to continue.",
  amountReply,
  merchantReply,
  whyReply,
  actionReply,
  initialMode = "voice",
}) {
  const [mode, setMode] = useState(initialMode);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: greeting },
  ]);

  const timerRef = useRef(null);
  const replyTimerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, listening, speaking]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const buildReply = (text) => {
    const value = text.toLowerCase();
    if (amountReply && /(amount|difference|how much|much)/.test(value)) {
      return amountReply;
    }
    if (merchantReply && /(merchant|recipient|payee|who)/.test(value)) {
      return merchantReply;
    }
    if (whyReply && /(why|flag|review|block|reason|attention)/.test(value)) {
      return whyReply;
    }
    if (actionReply && /(pay|cancel|confirm|continue|next)/.test(value)) {
      return actionReply;
    }
    return reply;
  };

  const respond = (userText, useVoice) => {
    setMessages((current) => [
      ...current,
      { role: "user", text: userText },
    ]);

    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      const answer = buildReply(userText);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: answer },
      ]);
      if (useVoice) speak(answer);
    }, 420);
  };

  const handleUserText = (text, useVoice) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onTranscript?.(trimmed, useVoice ? "voice" : "typed");
    respond(trimmed, useVoice);
    onSuggestion?.(trimmed);
  };

  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return false;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setListening(false);
            handleUserText(transcript, true);
          }
        }
      };

      recognition.onerror = () => {
        finishVoiceCapture();
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      return true;
    } catch {
      return false;
    }
  };

  const finishVoiceCapture = () => {
    setListening(false);
    handleUserText(samplePhrase, true);
  };

  const handleOrbClick = () => {
    if (!voiceEnabled) {
      setMode("manual");
      setTimeout(() => inputRef.current?.focus(), 30);
      return;
    }

    if (listening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      finishVoiceCapture();
      return;
    }

    stopSpeaking();
    setMode("voice");
    setListening(true);

    const started = startSpeechRecognition();
    if (!started) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(finishVoiceCapture, 2100);
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
    stopSpeaking();
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DFE5E8] bg-surface-container-lowest shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]">
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
              Voice-first payment companion
            </p>
          </div>
        </div>
        <VoiceStatusPill
          listening={listening}
          speaking={speaking}
          voiceEnabled={voiceEnabled}
        />
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
              ? "bg-primary-container text-white shadow-lg shadow-primary/20"
              : voiceEnabled
                ? "bg-[#EAF7F1] text-primary-container hover:bg-primary-container hover:text-white"
                : "bg-[#F3F4F6] text-secondary/60 cursor-not-allowed"
          }`}
        >
          {listening && (
            <>
              <span className="voice-ring-1 absolute inset-0 rounded-full bg-primary/25" />
              <span className="voice-ring-2 absolute inset-0 rounded-full bg-primary/20" />
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
                    listening ? `wave-bar-${bar} bg-primary-container` : "h-1.5 bg-[#CDD9D5]"
                  }`}
                />
              ))}
            </div>
            <p className="font-label-lg text-label-lg font-semibold text-on-surface">
              {listening
                ? "Listening… speak now"
                : speaking
                  ? "SayPay is speaking…"
                  : voiceEnabled
                    ? `Tap the mic · stage ${stage}`
                    : "Voice is paused"}
            </p>
            <p className="mx-auto mt-1 max-w-[28ch] font-body-sm text-body-sm text-secondary">
              {listening
                ? "Try: “Why was this flagged?”"
                : voiceEnabled
                  ? "I’ll answer out loud and show the text here."
                  : disabledMessage}
            </p>
            {listening && (
              <button
                type="button"
                onClick={handleOrbClick}
                className="mt-2 inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#FECACA] bg-white px-3 py-1 font-label-sm text-label-sm font-semibold text-[#BA1A1A] hover:bg-[#FEF2F2]"
              >
                <span className="material-symbols-outlined text-[15px]">stop</span>
                Stop listening
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
          className="max-h-44 space-y-2 overflow-y-auto pr-1"
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
          {speaking && (
            <div className="flex items-center gap-1.5 pl-1 font-body-sm text-body-sm text-secondary">
              <span className="material-symbols-outlined text-[14px] text-primary">
                volume_up
              </span>
              Speaking the answer aloud…
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
              className="rounded-full border border-[#DFE5E8] bg-white px-2.5 py-1 font-label-sm text-label-sm text-secondary hover:border-[#A7F3D0] hover:bg-[#EAF7F1] hover:text-primary transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Bottom: manual entry (expands in manual mode) */}
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
              rows={3}
              placeholder="Type your question or payment details…"
              className="w-full resize-none rounded-[10px] border border-[#DFE5E8] bg-white p-3 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1]"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-body-sm text-body-sm text-secondary">
                Answers appear as text in this mode.
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-primary-container px-3 py-1.5 font-label-md text-label-md font-semibold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
                <span className="material-symbols-outlined text-[16px]">
                  send
                </span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={focusManual}
            className="flex min-h-[44px] w-full items-center gap-2 rounded-[10px] border border-[#DFE5E8] bg-white px-3 py-2 text-left font-body-sm text-body-sm text-secondary hover:border-[#A7F3D0] hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard</span>
            Type a question or payment detail…
          </button>
        )}
      </div>
    </section>
  );
}
