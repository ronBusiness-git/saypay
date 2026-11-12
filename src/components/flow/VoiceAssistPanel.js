"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import EchoAvatar from "../EchoAvatar.js";
import { speakSoftly, stopSpeaking } from "../../lib/voice.js";

function VoiceStatusPill({ listening, speaking, voiceEnabled, isThinking, isMuted }) {
  if (!voiceEnabled || isMuted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FFF5F5] px-2.5 py-1 font-label-sm text-label-sm font-semibold text-[#DC2626]">
        <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
        {isMuted ? "Muted" : "Voice off"}
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

export default function VoiceAssistPanel({
  stage = 1,
  greeting = "Hi, I’m Echo. Tell me what bill you’d like to pay, or select an invoice to verify and settle.",
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
  const [isMuted, setIsMuted] = useState(false);
  const [input, setInput] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: greeting },
  ]);

  const continuousListeningRef = useRef(false);
  const isRunningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isThinkingRef = useRef(false);
  const isMutedRef = useRef(false);
  const recognitionRef = useRef(null);

  const pauseTimerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, listening, speaking, isThinking, mode]);

  // Safe Start helper to prevent InvalidStateError on SpeechRecognition
  const safeStart = useCallback(() => {
    if (typeof window === "undefined") return;
    if (stage === 3) return; // Requirement 3: Don't turn mic on in Stage 3 Payment review
    if (isMutedRef.current || !voiceEnabled) return;
    if (isSpeakingRef.current || isThinkingRef.current) return;
    if (isRunningRef.current) return;

    const recognizer = recognitionRef.current;
    if (!recognizer) return;

    try {
      recognizer.start();
    } catch (err) {
      // Ignore if browser reports recognition already started
      if (err.name !== "InvalidStateError") {
        console.warn("Speech recognition start notice:", err?.message || err);
      }
    }
  }, [voiceEnabled, stage]);

  // Safe Stop helper
  const safeStop = useCallback(() => {
    const recognizer = recognitionRef.current;
    if (!recognizer) return;
    try {
      recognizer.stop();
    } catch {}
  }, []);

  // Requirement 3: Ensure mic is paused/stopped in Stage 3 (PayPal Payment side)
  useEffect(() => {
    if (stage === 3) {
      continuousListeningRef.current = false;
      safeStop();
      setListening(false);
    }
  }, [stage, safeStop]);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isRunningRef.current = true;
      setListening(true);
    };

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

      // Control words: pause listening if user says "wait", "stop", "hold on", "pause"
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

      // Auto-execute after 1.25s of silence (Task 6)
      if (combined.length > 2) {
        pauseTimerRef.current = setTimeout(() => {
          setLiveTranscript("");
          safeStop();
          handleUserText(combined, true);
        }, 1250);
      }
    };

    recognition.onerror = (event) => {
      const errType = event?.error;
      // Benign errors: do not cancel continuous listening session
      if (errType === "no-speech" || errType === "aborted") {
        return;
      }
      console.warn("Speech recognition notice:", errType);
    };

    recognition.onend = () => {
      isRunningRef.current = false;
      // Automatically resume if continuous listening is on and not muted/speaking
      if (
        continuousListeningRef.current &&
        !isMutedRef.current &&
        !isSpeakingRef.current &&
        !isThinkingRef.current
      ) {
        setTimeout(safeStart, 250);
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      continuousListeningRef.current = false;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      try {
        recognition.abort();
      } catch {}
      stopSpeaking();
    };
  }, [safeStart, safeStop]);

  // Echo speaks softly with natural voice
  const speak = (text) => {
    if (!voiceEnabled || isMutedRef.current) return;

    // Pause recognition while Echo speaks to prevent Echo talking to itself
    isSpeakingRef.current = true;
    setSpeaking(true);
    safeStop();

    speakSoftly(text, {
      onEnd: () => {
        isSpeakingRef.current = false;
        setSpeaking(false);
        // Requirement 2 & 3: Only auto-resume if continuousListening is explicitly active, not muted, and not in payment stage
        if (continuousListeningRef.current && !isMutedRef.current && stage !== 3) {
          setTimeout(safeStart, 300);
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
      const fallback =
        "I'm sorry, I didn't catch that. I'm happy to help you check or pay your invoices. Could you please repeat that?";
      setMessages((current) => [...current, { role: "assistant", text: fallback }]);
      if (useVoice) speak(fallback);
      return;
    }

    // Check control words like "stop", "wait", "hold on", "pause"
    if (/^(wait|stop|hold on|pause)$/i.test(trimmed)) {
      continuousListeningRef.current = false;
      safeStop();
      setListening(false);
      const pauseMsg = "Paused. I'm waiting for your instruction whenever you're ready.";
      setMessages((current) => [...current, { role: "assistant", text: pauseMsg }]);
      if (useVoice) speak(pauseMsg);
      return;
    }

    // Check closing words (Requirement 2: no retriggering)
    if (
      /^(no|no thanks|that's all|nothing|bye|goodbye|cancel|all good|ok thanks bye|thanks bye|thank you|thanks)$/i.test(
        trimmed
      )
    ) {
      continuousListeningRef.current = false;
      safeStop();
      setListening(false);
      const byeMsg =
        "Glad I could help! Feel free to tap my avatar whenever you need assistance.";
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
    isThinkingRef.current = true;
    setIsThinking(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      const data = await res.json();
      isThinkingRef.current = false;
      setIsThinking(false);

      // Requirement 3: If preparing payment, stop microphone and require manual click
      if (data.action === "prepare_payment") {
        continuousListeningRef.current = false;
        safeStop();
        setListening(false);
      }

      const reply = data.reply || "I've checked that for you.";

      // Synchronous Voice & Text Rendering
      setMessages((current) => [
        ...current,
        { role: "assistant", text: reply },
      ]);

      if (useVoice) {
        speak(reply);
      }

      onAssistantResult?.(data);
    } catch (err) {
      console.warn("Echo assistant call error:", err);
      isThinkingRef.current = false;
      setIsThinking(false);
      const fallback = "I encountered a brief connection error. Please try again.";
      setMessages((current) => [
        ...current,
        { role: "assistant", text: fallback },
      ]);
      if (useVoice) speak(fallback);
    }
  };

  // Toggle main microphone
  const handleOrbClick = () => {
    if (!voiceEnabled) {
      focusManual();
      return;
    }

    if (listening) {
      // User tapped to finish recording
      continuousListeningRef.current = false;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      safeStop();
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
    isMutedRef.current = false;
    setIsMuted(false);
    continuousListeningRef.current = true;
    setLiveTranscript("");
    safeStart();
  };

  // Toggle Mute button (Task 5)
  const handleToggleMute = () => {
    if (isMuted) {
      isMutedRef.current = false;
      setIsMuted(false);
      setMode("voice");
      continuousListeningRef.current = true;
      safeStart();
    } else {
      isMutedRef.current = true;
      setIsMuted(true);
      continuousListeningRef.current = false;
      safeStop();
      setListening(false);
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
    safeStop();
    setListening(false);
    stopSpeaking();
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleManualFocus = () => {
    setMode("manual");
    if (continuousListeningRef.current) {
      continuousListeningRef.current = false;
      safeStop();
      setListening(false);
    }
  };

  const isLive = voiceEnabled && !isMuted && (listening || speaking || isThinking);
  const visibleSuggestions = suggestions.slice(0, 2);

  const statusTitle = !voiceEnabled
    ? "Voice is paused"
    : isMuted
    ? "Microphone is muted"
    : listening
    ? "Listening hands-free…"
    : speaking
    ? "Echo is speaking…"
    : isThinking
    ? "Thinking & evaluating…"
    : stage === 3
    ? "MatchCheck verified · ready for payment"
    : "Tap Echo to speak";

  const statusHint = !voiceEnabled
    ? disabledMessage
    : isMuted
    ? "Tap Mute in the header to start listening again."
    : stage === 3
    ? "Human authorization required. Review the details on the right and click 'Pay with PayPal'."
    : listening
    ? liveTranscript || "Speak naturally — it sends when you pause. Say 'wait' to hold on."
    : speaking
    ? "Listening resumes as soon as Echo finishes."
    : isThinking
    ? "Cross-checking deterministic MatchCheck rules."
    : role === "seller"
    ? "Try: “Create invoice for buyer@saypay.app for 3 items $45”"
    : "Try: “Pay GreenLeaf coffee invoice” or “Show unpaid bills”";

  return (
    <section
      className={`overflow-hidden rounded-2xl transition-all duration-300 ${
        listening && !isMuted
          ? "bg-[#EAF7F1] ring-2 ring-[#087F68]/40 border border-[#78D8BD] shadow-[0_4px_24px_rgba(8,127,104,0.12)]"
          : "bg-surface-container-lowest border border-[#DFE5E8] shadow-[0_1px_3px_rgba(21,35,45,0.04),0_4px_12px_rgba(21,35,45,0.03)]"
      }`}
    >
      {/* Assistant header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#DFE5E8] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-[#DFE5E8] transition-all duration-300 ${
              isLive ? "ring-2 ring-[#78D8BD]" : ""
            }`}
          >
            <EchoAvatar priority />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                isMuted ? "bg-[#DC2626]" : isLive ? "animate-pulse bg-[#107E3E]" : "bg-[#107E3E]"
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-label-lg text-label-lg font-bold text-on-surface">
              Echo
            </p>
            <p className="truncate font-body-sm text-body-sm text-secondary">
              {role === "seller" ? "Merchant invoice voice companion" : "Autonomous voice payment companion"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute button (Task 5) */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            aria-pressed={isMuted}
            className={`inline-flex min-h-[28px] items-center rounded-lg border px-2 py-1 font-label-sm text-label-sm font-semibold transition-colors ${
              isMuted
                ? "border-[#FECACA] bg-[#FFF5F5] text-[#DC2626] hover:bg-[#FEE2E2]"
                : "border-[#DFE5E8] bg-white text-secondary hover:text-on-surface hover:bg-[#F7F8FA]"
            }`}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>

          <VoiceStatusPill
            listening={listening}
            speaking={speaking}
            isThinking={isThinking}
            voiceEnabled={voiceEnabled}
            isMuted={isMuted}
          />
        </div>
      </div>

      {/*
        Voice / manual stage — the active side takes 3/4 of the height while
        the idle side keeps 1/4, with a smooth flex-grow transition.
      */}
      <div className="flex h-[470px] flex-col">
        {/* Voice panel */}
        <div
          className="flex min-h-0 flex-col overflow-hidden transition-[flex-grow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ flexGrow: mode === "voice" ? 3 : 1, flexBasis: 0 }}
        >
          <div className="flex items-center gap-3.5 border-b border-[#F0F3F5] px-4 py-3.5">
            <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center">
              {isLive && (
                <>
                  <span className="voice-ring-1 absolute inset-2 rounded-full border border-[#087F68]/30" />
                  <span className="voice-ring-2 absolute inset-2 rounded-full border border-[#78D8BD]/40" />
                  <span className="voice-orbit absolute inset-0 rounded-full border-2 border-dashed border-[#78D8BD]/70" />
                  <span className="voice-orbit-reverse absolute -inset-1 rounded-full border border-dotted border-[#087F68]/35" />
                </>
              )}
              <button
                type="button"
                onClick={handleOrbClick}
                aria-label={
                  voiceEnabled
                    ? listening
                      ? "Stop listening"
                      : "Speak to Echo"
                    : "Voice input is disabled"
                }
                aria-pressed={listening && !isMuted}
                className={`relative h-14 w-14 overflow-hidden rounded-full bg-white ring-2 transition-all duration-300 focus:outline-none focus-visible:ring-[#087F68] focus-visible:ring-offset-2 ${
                  isLive
                    ? "assist-live-avatar ring-[#78D8BD]"
                    : isMuted
                    ? "ring-[#FECACA] opacity-70"
                    : voiceEnabled
                    ? "assist-breathe ring-[#DFE5E8] hover:ring-[#78D8BD]"
                    : "cursor-not-allowed opacity-50 grayscale ring-[#DFE5E8]"
                }`}
              >
                <EchoAvatar sizes="56px" />
                <span
                  className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    isMuted ? "bg-[#DC2626]" : isLive ? "animate-pulse bg-[#107E3E]" : "bg-[#107E3E]"
                  }`}
                />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate font-label-lg text-label-lg font-semibold text-on-surface">
                  {statusTitle}
                </p>
                <div aria-hidden="true" className="flex h-6 shrink-0 items-center gap-[3px]">
                  {[10, 16, 22, 14, 20, 12, 18].map((height, index) => (
                    <span
                      key={index}
                      className={`w-1 rounded-full transition-colors duration-300 ${
                        isLive
                          ? `voice-live-bar ${isThinking ? "bg-[#C08A2E]" : "bg-[#087F68]"}`
                          : "bg-[#CDD9D5]"
                      }`}
                      style={{
                        height: `${height}px`,
                        animationDelay: `${index * 0.09}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1 line-clamp-2 font-body-sm text-body-sm text-secondary">
                {listening && !isMuted && liveTranscript ? (
                  <>
                    {liveTranscript}
                    <span className="animate-caret text-primary">|</span>
                  </>
                ) : (
                  statusHint
                )}
              </p>
              {listening && !isMuted && (
                <button
                  type="button"
                  onClick={handleOrbClick}
                  className="mt-2 inline-flex min-h-[30px] items-center gap-1 rounded-lg border border-[#A7F3D0] bg-white px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-[#BA1A1A] hover:bg-[#FEF2F2] transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">stop</span>
                  Finish &amp; Send
                </button>
              )}
            </div>
          </div>

          {/* Expanded voice content — hidden when the panel collapses to 1/4 */}
          {mode === "voice" && (
            <>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3"
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
                          Echo
                        </span>
                      )}
                      {message.text}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-xl border border-[#DFE5E8] bg-[#F7F8FA] px-3 py-2 text-xs text-secondary">
                      <span className="material-symbols-outlined animate-spin text-[14px] text-primary">
                        progress_activity
                      </span>
                      Evaluating safety rules…
                    </div>
                  </div>
                )}
              </div>

              {visibleSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-[#F0F3F5] px-4 py-2.5">
                  {visibleSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        handleUserText(suggestion, voiceEnabled && !isMuted && mode === "voice")
                      }
                      className="rounded-full border border-[#DFE5E8] bg-white px-2.5 py-1 text-left font-label-sm text-label-sm text-secondary transition-colors hover:border-[#A7F3D0] hover:bg-[#EAF7F1] hover:text-primary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Manual entry panel — expands to 3/4 when the input is focused */}
        <div
          className="flex min-h-0 flex-col border-t border-[#DFE5E8] bg-[#F7F8FA] p-3 transition-[flex-grow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ flexGrow: mode === "manual" ? 3 : 1, flexBasis: 0 }}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
              Manual entry
            </span>
            <span className="truncate font-body-sm text-[11px] text-secondary">
              Enter sends · Shift+Enter adds a line
            </span>
          </div>

          <div className="relative min-h-0 flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={handleManualFocus}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label={role === "seller" ? "Type an invoice instruction" : "Type a payment request"}
              placeholder={
                role === "seller"
                  ? "Create invoice for buyer@saypay.app for $45..."
                  : "Type your payment intent or request..."
              }
              className="h-full min-h-[44px] w-full resize-none rounded-[10px] border border-[#DFE5E8] bg-white py-2.5 pl-2.5 pr-24 font-body-md text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-[#EAF7F1]"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send message"
              className="absolute bottom-2 right-2 inline-flex h-[32px] items-center gap-1.5 rounded-lg bg-primary-container px-3 font-label-md text-label-md font-semibold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
              <span className="material-symbols-outlined text-[15px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
