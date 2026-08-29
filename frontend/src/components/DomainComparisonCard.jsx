import React from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DomainComparisonCard({ domainComparison }) {
  if (!domainComparison) return null;

  const { submitted_domain, official_domain, brand, similarity } = domainComparison;

  // Character diff renderer highlighting changed characters
  const renderDiff = (submitted, official) => {
    return (
      <div className="flex items-center space-x-1 font-mono text-sm tracking-wider">
        {submitted.split('').map((char, idx) => {
          const isDiff = official[idx] && char !== official[idx];
          return (
            <span
              key={idx}
              className={`px-1 py-0.5 rounded font-bold transition-colors ${
                isDiff
                  ? 'bg-[#FCA5A5] text-[#991B1B] underline decoration-2'
                  : 'text-[#0F172A]'
              }`}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
            Possible {brand} Domain Impersonation
          </h3>
        </div>
        
        {/* Similarity Score Badge (labeled separately from Phishing Risk Score) */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-bold text-[#2563EB]">
          <span>Domain Similarity: {similarity}%</span>
        </div>
      </div>

      <p className="text-xs text-[#64748B] leading-relaxed">
        This domain closely resembles the official <strong className="text-[#0F172A]">{brand}</strong> domain. Highlighted characters indicate potential typosquatting or character substitution.
      </p>

      {/* Side-by-Side Domain Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Submitted Domain */}
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5]/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">
            <span>Submitted Domain</span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#FCA5A5]">Unverified</span>
          </div>
          {renderDiff(submitted_domain, official_domain)}
        </div>

        {/* Official Domain */}
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#16A34A] uppercase tracking-wider">
            <span>Official {brand} Domain</span>
            <span className="flex items-center space-x-1 text-[10px] bg-white px-2 py-0.5 rounded border border-[#BBF7D0]">
              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
              <span>Verified</span>
            </span>
          </div>
          <div className="font-mono text-sm text-[#0F172A] font-bold tracking-wider py-0.5">
            {official_domain}
          </div>
        </div>
      </div>
    </div>
  );
}
