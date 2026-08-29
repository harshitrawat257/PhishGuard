import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskScoreCard({ riskScore, riskLevel }) {
  // Color & Icon mapping based on risk level
  const getConfig = (level) => {
    switch (level) {
      case 'SAFE':
        return {
          stroke: '#16A34A', // Safe green
          textClass: 'text-[#16A34A]',
          badgeBg: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]',
          icon: ShieldCheck,
          label: 'Safe Content'
        };
      case 'LOW RISK':
        return {
          stroke: '#65A30D', // Low Risk lime
          textClass: 'text-[#65A30D]',
          badgeBg: 'bg-[#F7FEE7] border-[#D9F99D] text-[#65A30D]',
          icon: Shield,
          label: 'Low Risk'
        };
      case 'SUSPICIOUS':
        return {
          stroke: '#F59E0B', // Suspicious amber
          textClass: 'text-[#F59E0B]',
          badgeBg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
          icon: AlertTriangle,
          label: 'Suspicious Warning'
        };
      case 'HIGH RISK':
      default:
        return {
          stroke: '#DC2626', // High Risk red
          textClass: 'text-[#DC2626]',
          badgeBg: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]',
          icon: ShieldAlert,
          label: 'High Risk Phishing'
        };
    }
  };

  const config = getConfig(riskLevel);
  const IconComponent = config.icon;

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm flex flex-col items-center justify-center text-center">
      <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
        Risk Assessment
      </span>

      {/* SVG Circular Progress Gauge */}
      <div className="relative w-40 h-40 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-[#F1F5F9]"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={config.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${config.textClass}`}>
            {riskScore}
          </span>
          <span className="text-xs text-[#64748B] font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`mt-3 flex items-center space-x-2 px-3.5 py-1 rounded-full border text-xs font-bold tracking-wide ${config.badgeBg}`}>
        <IconComponent className="w-3.5 h-3.5" />
        <span>{riskLevel}</span>
      </div>
    </div>
  );
}

