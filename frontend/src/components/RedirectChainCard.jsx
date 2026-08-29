import React from 'react';
import { GitCommit, ArrowDown, ExternalLink } from 'lucide-react';

export default function RedirectChainCard({ redirectChain }) {
  if (!redirectChain) return null;

  const { original_url, final_destination, hops, is_shortened } = redirectChain;

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
            {is_shortened ? 'Shortened URL & Redirect Expansion' : 'HTTP Redirect Trace'}
          </h3>
        </div>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          {hops} Redirect Hop{hops !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-xs text-[#64748B] leading-relaxed">
        {is_shortened
          ? 'Shortened URLs hide the final destination host. Below is the safely resolved target path (SSRF Shielded).'
          : 'The URL performs automatic redirects before reaching its destination.'}
      </p>

      {/* Visual Flow Box */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
        {/* Step 1: Original URL */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            Submitted Short Link
          </span>
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-2.5 font-mono text-xs text-[#0F172A] break-all select-all">
            {original_url}
          </div>
        </div>

        {/* Arrow Connector */}
        <div className="flex items-center justify-center text-[#2563EB]">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>

        {/* Step 2: Expanded Destination */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider block">
            Expanded Destination Host
          </span>
          <div className="bg-white border border-[#FCA5A5] rounded-lg p-2.5 font-mono text-xs font-bold text-[#0F172A] break-all select-all">
            {final_destination}
          </div>
        </div>
      </div>
    </div>
  );
}
