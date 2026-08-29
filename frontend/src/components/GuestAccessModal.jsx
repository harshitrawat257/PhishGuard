import React from 'react';
import { Shield, UserPlus, X } from 'lucide-react';

export default function GuestAccessModal({ isOpen, onClose, onNavigateToSignup }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] border border-[#E2E8F0] max-w-md w-full p-6 sm:p-8 shadow-xl space-y-5 relative">
        
        {/* Close X button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
          <Shield className="w-6 h-6" />
        </div>

        {/* Title & Body */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Save your security scans
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Create an account to access saved history, revisit past security analyses, and unlock personalized threat analytics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToSignup) onNavigateToSignup();
            }}
            className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-2 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold rounded-xl text-xs transition-all"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}
