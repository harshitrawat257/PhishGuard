import React, { useState } from 'react';
import { Clock, Search, Trash2, RefreshCw } from 'lucide-react';

export default function HistoryTable({ history, onClearHistory, onReanalyze }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.input_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || item.risk_level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getBadgeClass = (level) => {
    switch (level) {
      case 'SAFE':
        return 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]';
      case 'LOW RISK':
        return 'bg-[#F7FEE7] border-[#D9F99D] text-[#65A30D]';
      case 'SUSPICIOUS':
        return 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]';
      case 'HIGH RISK':
      default:
        return 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]';
    }
  };

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div id="history" className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
            Analysis History
          </h3>
          <span className="text-xs font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
            {history.length}
          </span>
        </div>

        {/* Clear Button */}
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 text-xs text-[#64748B] hover:text-[#DC2626] px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] transition-all font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past URLs or messages..."
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-all font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] text-xs font-medium">
          {['ALL', 'HIGH RISK', 'SUSPICIOUS', 'SAFE'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterLevel === lvl ? 'bg-[#2563EB] text-white font-semibold shadow-2xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* History Records Table */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#64748B]">
          No analysis history records match your search query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Input</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3 max-w-xs truncate font-medium text-[#0F172A]">
                    {item.input_text}
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#2563EB] border border-[#E2E8F0]">
                      {item.input_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0F172A]">
                    {item.risk_score} <span className="text-[#64748B] font-normal text-[11px]">/ 100</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide ${getBadgeClass(item.risk_level)}`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#64748B] text-[11px]">
                    {formatDate(item.timestamp)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onReanalyze(item)}
                      className="text-[#2563EB] hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-blue-100 transition-colors text-[11px] inline-flex items-center space-x-1 ml-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

