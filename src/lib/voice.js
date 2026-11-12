"use client";

/**
 * SayPay Voice Engine:
 * 1. Clean Speech-to-Text (STT) without interim duplication cascades.
 * 2. Soft, warm, human-like Text-to-Speech (TTS) voice selection.
 */

/**
 * Strips markdown and special symbols so TTS speaks naturally.
 */
export function cleanTextForSpeech(text) {
  if (!text) return "";
  return text
    .replace(/[*_#`~[\]()]/g, "") // markdown symbols
    .replace(/\bUSD\b/g, "dollars")
    .replace(/\$(\d+(?:\.\d{2})?)/g, "$1 dollars") // speak "$12.50" as "12.50 dollars"
    .replace(/https?:\/\/\S+/g, "")
    .trim();
}

/**
 * Soft Text-to-Speech using high-quality natural/neural browser voices.
 */
export function speakSoftly(text, { onStart, onEnd, lang = "en-US" } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // Cancel any prior utterance
  window.speechSynthesis.cancel();

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.05; // Slightly elevated warm pitch, non-robotic
  utterance.volume = 0.95;

  const selectVoice = () => {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return;

    const langPrefix = lang.split("-")[0];

    // Prioritize natural, soft female/warm voices
    const preferredNames = [
      "Samantha", // macOS natural warm voice
      "Google US English", // Chrome high quality
      "Microsoft Jenny Online (Natural)",
      "Microsoft Aria Online (Natural)",
      "Microsoft Zira",
      "Natural",
      "Neural",
      lang,
    ];

    let chosen = null;
    for (const name of preferredNames) {
      chosen = voices.find(
        (v) =>
          (v.name.toLowerCase().includes(name.toLowerCase()) ||
          (v.lang === lang && v.name.includes("Natural"))) &&
          v.lang.startsWith(langPrefix)
      );
      if (chosen) break;
    }

    if (!chosen) {
      chosen = voices.find((v) => v.lang.startsWith(langPrefix));
    }

    if (chosen) {
      utterance.voice = chosen;
    }
  };

  selectVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = selectVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Creates and configures a clean SpeechRecognition instance.
 * Reconstructs transcript across results to guarantee ZERO word repetition.
 */
export function createSpeechRecognizer({ onTranscript, onStateChange, onError }) {
  if (typeof window === "undefined") return null;

  const SpeechRec =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  try {
    const recognizer = new SpeechRec();
    recognizer.lang = "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;

    recognizer.onstart = () => {
      onStateChange?.("listening");
    };

    recognizer.onresult = (event) => {
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
      onTranscript?.(combined, false);
    };

    recognizer.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      onError?.(err);
      onStateChange?.("idle");
    };

    recognizer.onend = () => {
      onStateChange?.("idle");
    };

    return recognizer;
  } catch (err) {
    console.warn("Speech recognition init error:", err);
    return null;
  }
}
