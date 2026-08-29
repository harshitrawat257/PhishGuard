import React, { useState } from 'react';
import { Mail, Trash2, Clipboard, Search, Loader2, PlayCircle } from 'lucide-react';

export default function EmailHeaderInput({ onAnalyze, isLoading }) {
  const [headerText, setHeaderText] = useState('');

  const sampleHeader = `From: "PayPal Security Alert" <security-update@paypa1-billing.test>
Reply-To: support@different-phishing-host.test
Return-Path: bounce@unverified-domain.test
Received: from mail.paypa1-billing.test (mail.paypa1-billing.test [192.168.1.1])
Authentication-Results: spf=fail; dkim=fail; dmarc=fail;`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!headerText.trim() || isLoading) return;
    onAnalyze(headerText.trim(), 'email');
  };

  const handleClear = () => setHeaderText('');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setHeaderText(text);
    } catch (err) {
      console.error('Clipboard permission denied');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Raw Email Headers
          </label>

          <div className="flex items-center space-x-3 text-xs">
            {headerText && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center space-x-1 text-[#64748B] hover:text-[#DC2626] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center space-x-1 text-[#2563EB] hover:text-blue-700 font-medium transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>
        </div>

        <textarea
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          rows={6}
          placeholder="Paste raw email header lines here (e.g. From:, Reply-To:, Authentication-Results: spf=fail; dkim=fail; dmarc=fail;)..."
          className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-xs font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all resize-none shadow-sm"
        />
      </div>

      {/* Preset Example */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-[#0F172A]">Sample Header:</span>
        <button
          type="button"
          onClick={() => setHeaderText(sampleHeader)}
          className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/40 hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all flex items-center space-x-1.5 shadow-2xs font-medium"
        >
          <PlayCircle className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Load Spoofed Email Header</span>
        </button>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!headerText.trim() || isLoading}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-sm tracking-wide"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Email Header...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Analyze Email Header →</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
