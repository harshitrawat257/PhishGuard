import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function ExplainabilityPanel({ result }) {
  if (!result) return null;

  const indicators = result.indicators || [];
  const recommendation = result.recommendation || '';
  const riskLevel = result.risk_level || 'SAFE';

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return {
          cardBg: 'bg-[#FEF2F2]/70 border-[#FCA5A5]/60',
          badge: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]',
          iconColor: 'text-[#DC2626]',
          scoreBg: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
        };
      case 'medium':
        return {
          cardBg: 'bg-[#FFFBEB]/70 border-[#FDE68A]/60',
          badge: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
          iconColor: 'text-[#D97706]',
          scoreBg: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
        };
      default:
        return {
          cardBg: 'bg-[#EFF6FF]/70 border-[#BFDBFE]/60',
          badge: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]',
          iconColor: 'text-[#2563EB]',
          scoreBg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
        };
    }
  };

  const isHighOrSuspicious = riskLevel === 'HIGH RISK' || riskLevel === 'SUSPICIOUS';

  return (
    <div className="space-y-6">
      {/* WHY? Detected Indicators Section */}
      <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
              Why this score?
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            {indicators.length} Flagged Indicator{indicators.length !== 1 ? 's' : ''}
          </span>
        </div>

        {indicators.length === 0 ? (
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A]" />
            <span>No malicious or suspicious indicators were detected in this analysis.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {indicators.map((ind, idx) => {
              const style = getSeverityStyle(ind.severity);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${style.cardBg}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${style.iconColor}`}>•</span>
                      <span className="text-xs font-bold text-[#0F172A]">{ind.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${style.badge}`}>
                        {ind.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed pl-3">
                      {ind.description}
                    </p>
                  </div>
                  {ind.score_impact > 0 && (
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md border ${style.scoreBg}`}>
                      +{ind.score_impact} pts
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECOMMENDED ACTION Callout Box */}
      <div
        className={`rounded-[20px] p-6 border shadow-sm space-y-3 ${
          isHighOrSuspicious
            ? 'bg-[#FEF2F2] border-[#FCA5A5]'
            : 'bg-[#F0FDF4] border-[#BBF7D0]'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isHighOrSuspicious ? (
            <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          )}
          <h4
            className={`text-xs font-bold uppercase tracking-wider ${
              isHighOrSuspicious ? 'text-[#991B1B]' : 'text-[#166534]'
            }`}
          >
            Recommended Action
          </h4>
        </div>
        <p
          className={`text-xs leading-relaxed font-medium ${
            isHighOrSuspicious ? 'text-[#7F1D1D]' : 'text-[#14532D]'
          }`}
        >
          {recommendation}
        </p>
      </div>
    </div>
  );
}

