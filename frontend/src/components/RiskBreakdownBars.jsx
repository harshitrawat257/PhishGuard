import React from 'react';
import { Link, Globe, MessageSquare, CornerDownRight } from 'lucide-react';

export default function RiskBreakdownBars({ categoryScores }) {
  const categories = [
    { key: 'url_risk', label: 'URL Risk', icon: Link, score: categoryScores?.url_risk || 0 },
    { key: 'domain_risk', label: 'Domain Risk', icon: Globe, score: categoryScores?.domain_risk || 0 },
    { key: 'message_risk', label: 'Message Risk', icon: MessageSquare, score: categoryScores?.message_risk || 0 },
    { key: 'redirect_risk', label: 'Redirect Risk', icon: CornerDownRight, score: categoryScores?.redirect_risk || 0 },
  ];

  const getBarColor = (val) => {
    if (val >= 75) return 'bg-[#DC2626]';
    if (val >= 50) return 'bg-[#F59E0B]';
    if (val >= 25) return 'bg-[#65A30D]';
    return 'bg-[#16A34A]';
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          Risk Breakdown
        </h3>
        <span className="text-[11px] text-[#64748B] font-medium">Weighted Factor</span>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const barColor = getBarColor(cat.score);
          return (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-[#0F172A] font-medium">
                  <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{cat.label}</span>
                </div>
                <span className="font-semibold text-[#0F172A]">{cat.score}%</span>
              </div>
              
              <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0]/60">
                <div
                  className={`h-full ${barColor} transition-all duration-700 ease-out`}
                  style={{ width: `${cat.score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

