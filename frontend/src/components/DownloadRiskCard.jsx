import React from 'react';
import { FileCode, AlertOctagon, Download } from 'lucide-react';

export default function DownloadRiskCard({ downloadInfo }) {
  if (!downloadInfo) return null;

  const { filename, file_type, extension, score_impact } = downloadInfo;

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-[#DC2626]" />
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
            Download Risk
          </h3>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
          +{score_impact} pts impact
        </span>
      </div>

      <p className="text-xs text-[#64748B] leading-relaxed">
        The analyzed URL points directly to an executable or potentially dangerous payload. Attackers frequently use direct download links to distribute malware or ransomware.
      </p>

      {/* File Details Grid */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            File Detected
          </span>
          <span className="text-xs font-mono font-bold text-[#0F172A] truncate block mt-1">
            {filename}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            File Category
          </span>
          <span className="text-xs font-semibold text-[#0F172A] block mt-1">
            {file_type}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            Extension
          </span>
          <span className="text-xs font-mono font-bold text-[#DC2626] block mt-1">
            {extension}
          </span>
        </div>
      </div>
    </div>
  );
}
