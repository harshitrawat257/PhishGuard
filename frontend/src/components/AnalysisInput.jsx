import React, { useState } from 'react';
import { Link2, MessageSquare, QrCode, Mail, Search, Trash2, Clipboard, Loader2, PlayCircle, Upload, AlertCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import EmailHeaderInput from './EmailHeaderInput';
import QrScannerComponent from './QrScannerComponent';

export default function AnalysisInput({ onAnalyze, isLoading, demoExamples }) {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'message' | 'qr' | 'email'
  const [inputText, setInputText] = useState('');
  
  // OCR State for Screenshot Message Upload
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onAnalyze(inputText.trim(), activeTab);
  };

  const handleClear = () => {
    setInputText('');
    setOcrError('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch (err) {
      console.error('Clipboard permission denied');
    }
  };

  const handlePresetSelect = (example) => {
    setActiveTab(example.type);
    setInputText(example.input);
    setOcrError('');
  };

  // Screenshot Message Analysis (OCR using Tesseract.js)
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError('');

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      const extracted = ret?.data?.text?.trim();
      if (extracted) {
        setInputText(extracted);
      } else {
        setOcrError("We couldn't clearly read this screenshot. Please paste the message manually.");
      }
    } catch (err) {
      console.error('OCR error:', err);
      setOcrError("We couldn't clearly read this screenshot. Please paste the message manually.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Analyze suspicious content
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Select link, message text, QR scanner, or email header analysis
          </p>
        </div>

        {/* 4-Tab Segmented Control */}
        <div className="flex flex-wrap bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>URL</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'message'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>MESSAGE</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'qr'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR SCAN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'email'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>EMAIL HEADER</span>
          </button>
        </div>
      </div>

      {/* Mode 1 & 2: URL / MESSAGE Form */}
      {activeTab === 'url' || activeTab === 'message' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                {activeTab === 'url' ? 'Suspicious Web Link' : 'Message Content'}
              </label>
              
              <div className="flex items-center space-x-3 text-xs">
                {activeTab === 'message' && (
                  <label className="cursor-pointer inline-flex items-center space-x-1 text-[#2563EB] hover:text-blue-700 font-medium transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isOcrLoading ? "Reading..." : "Upload Screenshot"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleScreenshotUpload}
                      disabled={isOcrLoading}
                      className="hidden"
                    />
                  </label>
                )}
                {inputText && (
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

            {/* OCR Progress Loading Banner */}
            {isOcrLoading && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-medium text-[#2563EB]">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Reading screenshot using browser OCR...</span>
              </div>
            )}

            {/* OCR Error Callout */}
            {ocrError && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#DC2626]">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{ocrError}</span>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={activeTab === 'message' ? 4 : 3}
              placeholder={
                activeTab === 'url'
                  ? "Enter suspicious web URL to analyze (e.g. https://bit.ly/paypa1-login-verify)..."
                  : "Paste SMS, WhatsApp, or email text (or upload a screenshot above)..."
              }
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans resize-none shadow-sm"
            />
          </div>

          {/* Load Example / Presets */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">Load Example:</span>
              <span className="text-[11px] text-[#64748B]">Click to pre-fill test cases</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {demoExamples.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handlePresetSelect(ex)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/40 hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all flex items-center space-x-1.5 shadow-2xs font-medium"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{ex.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading || isOcrLoading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-sm tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Content...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze Risk →</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : activeTab === 'qr' ? (
        /* Mode 3: Adaptive Mobile / Desktop QR CODE SCANNER Component */
        <QrScannerComponent onAnalyze={onAnalyze} isLoading={isLoading} />
      ) : (
        /* Mode 4: EMAIL HEADER Tab */
        <EmailHeaderInput onAnalyze={onAnalyze} isLoading={isLoading} />
      )}
    </div>
  );
}




