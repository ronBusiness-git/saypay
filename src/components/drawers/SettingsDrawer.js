"use client";

import React, { useState } from "react";

export default function SettingsDrawer({ isOpen, onClose }) {
  const [maxAmount, setMaxAmount] = useState("250.00");
  const [language, setLanguage] = useState("en-US");
  const [readAloud, setReadAloud] = useState(true);
  const [voiceConfirmation, setVoiceConfirmation] = useState(true);
  const [autoListen, setAutoListen] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#DFE5E8] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DFE5E8] flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-[18px] text-on-surface font-semibold">
                SayPay Settings
              </h2>
              <p className="font-body-sm text-body-sm text-secondary">
                Sandbox limits & voice preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#DFE5E8] flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Sandbox Rules */}
          <div className="space-y-4">
            <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
              Payment Policy Rules
            </h3>

            {/* Max Transaction Amount Limit */}
            <div className="space-y-1.5">
              <label
                htmlFor="max-amount"
                className="font-label-md text-label-md text-on-surface font-medium block"
              >
                Max Single Transaction Limit (USD)
              </label>
              <div className="relative rounded-[10px] shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary font-mono text-[14px]">
                  $
                </span>
                <input
                  id="max-amount"
                  type="number"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-surface-bright border border-[#DFE5E8] rounded-[10px] font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-[12px] text-secondary">
                Transactions above this amount will automatically trigger a REVIEW state.
              </p>
            </div>

            {/* Supported Currency */}
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface font-medium block">
                Default Currency
              </label>
              <input
                type="text"
                value="USD (United States Dollar)"
                disabled
                className="w-full px-3 py-2.5 bg-surface-container-low/50 border border-[#DFE5E8] rounded-[10px] font-mono text-sm text-secondary cursor-not-allowed"
              />
              <p className="text-[12px] text-secondary">
                Sandbox MVP strictly operates in USD.
              </p>
            </div>
          </div>

          <div className="border-t border-[#DFE5E8]" />

          {/* Voice & Audio AI Settings */}
          <div className="space-y-4">
            <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
              Voice & Audio AI Preferences
            </h3>

            {/* Speech Language */}
            <div className="space-y-1.5">
              <label
                htmlFor="speech-lang"
                className="font-label-md text-label-md text-on-surface font-medium block"
              >
                Recognition Language
              </label>
              <select
                id="speech-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-bright border border-[#DFE5E8] rounded-[10px] text-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="en-US">English (United States) — en-US</option>
                <option value="en-IN">English (India) — en-IN</option>
                <option value="en-GB">English (United Kingdom) — en-GB</option>
              </select>
            </div>

            {/* Toggle 1: Read Aloud */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-bright">
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Read aloud safety results
                </p>
                <p className="text-[12px] text-secondary">
                  Browser synthesizes audio summary of verdicts
                </p>
              </div>
              <input
                type="checkbox"
                checked={readAloud}
                onChange={(e) => setReadAloud(e.target.checked)}
                className="h-5 w-5 rounded border-[#DFE5E8] text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Toggle 2: Voice Confirmation */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-bright">
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Voice confirmation passkey
                </p>
                <p className="text-[12px] text-secondary">
                  Allow saying "Confirm Pay" or "Cancel" on Stage 4
                </p>
              </div>
              <input
                type="checkbox"
                checked={voiceConfirmation}
                onChange={(e) => setVoiceConfirmation(e.target.checked)}
                className="h-5 w-5 rounded border-[#DFE5E8] text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Toggle 3: Auto-listen after question */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#DFE5E8] bg-surface-bright">
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Auto-listen after question
                </p>
                <p className="text-[12px] text-secondary">
                  Mic activates automatically after system speaks
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoListen}
                onChange={(e) => setAutoListen(e.target.checked)}
                className="h-5 w-5 rounded border-[#DFE5E8] text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[#DFE5E8] bg-surface-bright flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#DFE5E8] text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-primary text-white rounded-lg font-label-md text-label-md font-semibold hover:bg-[#066653] transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
