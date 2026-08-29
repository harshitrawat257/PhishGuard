import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/api';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, BarChart3, PieChart, Layers, RefreshCw, Loader2 } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white rounded-[20px] border border-[#E2E8F0] shadow-sm">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        <span className="text-sm font-semibold text-[#64748B]">Loading Security Analytics...</span>
      </div>
    );
  }

  const {
    total_scans = 0,
    high_risk = 0,
    suspicious = 0,
    safe_low_risk = 0,
    risk_distribution = {},
    scan_types = {},
    top_indicators = [],
    recent_trends = []
  } = data || {};

  if (total_scans === 0) {
    return (
      <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-12 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto border border-[#BFDBFE]">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-[#0F172A]">No analyses yet</h3>
          <p className="text-xs text-[#64748B]">
            Run a few link, message, QR, or email header scans to generate security trends and real-time threat intelligence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Security Analytics Dashboard
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time phishing detection telemetry aggregated from SQLite history
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-all shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scans</span>
            <Activity className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A]">{total_scans}</div>
          <div className="text-[11px] text-[#64748B]">Analyzed inputs</div>
        </div>

        {/* High Risk */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#DC2626]">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#DC2626]">{high_risk}</div>
          <div className="text-[11px] text-[#64748B]">
            {total_scans > 0 ? `${Math.round((high_risk / total_scans) * 100)}% of total` : '0%'}
          </div>
        </div>

        {/* Suspicious */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#D97706]">
            <span className="text-xs font-bold uppercase tracking-wider">Suspicious</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#D97706]">{suspicious}</div>
          <div className="text-[11px] text-[#64748B]">
            {total_scans > 0 ? `${Math.round((suspicious / total_scans) * 100)}% of total` : '0%'}
          </div>
        </div>

        {/* Safe / Low Risk */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#16A34A]">
            <span className="text-xs font-bold uppercase tracking-wider">Safe / Low Risk</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#16A34A]">{safe_low_risk}</div>
          <div className="text-[11px] text-[#64748B]">
            {total_scans > 0 ? `${Math.round((safe_low_risk / total_scans) * 100)}% of total` : '0%'}
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Risk Distribution</h3>
            </div>
            <span className="text-xs text-[#64748B]">Threat Breakdown</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Safe', count: risk_distribution['SAFE'] || 0, color: 'bg-[#16A34A]', text: 'text-[#16A34A]' },
              { label: 'Low Risk', count: risk_distribution['LOW RISK'] || 0, color: 'bg-[#65A30D]', text: 'text-[#65A30D]' },
              { label: 'Suspicious', count: risk_distribution['SUSPICIOUS'] || 0, color: 'bg-[#F59E0B]', text: 'text-[#D97706]' },
              { label: 'High Risk', count: risk_distribution['HIGH RISK'] || 0, color: 'bg-[#DC2626]', text: 'text-[#DC2626]' }
            ].map((item) => {
              const pct = total_scans > 0 ? Math.round((item.count / total_scans) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0F172A]">{item.label}</span>
                    <span className={item.text}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scan Types Distribution */}
        <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-base font-bold text-[#0F172A]">Scan Vectors</h3>
            </div>
            <span className="text-xs text-[#64748B]">Input Modes</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(scan_types).map(([type, count]) => {
              const pct = total_scans > 0 ? Math.round((count / total_scans) * 100) : 0;
              return (
                <div key={type} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">{type}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-[#0F172A]">{count}</span>
                    <span className="text-xs font-semibold text-[#2563EB]">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Indicators List */}
      <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-base font-bold text-[#0F172A]">Most Frequent Phishing Indicators</h3>
          </div>
          <span className="text-xs text-[#64748B]">Detection Counts</span>
        </div>

        {top_indicators.length === 0 ? (
          <p className="text-xs text-[#64748B] py-2">No indicators recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {top_indicators.map((ind, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] truncate pr-2">{ind.name}</span>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  {ind.count} match{ind.count !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
