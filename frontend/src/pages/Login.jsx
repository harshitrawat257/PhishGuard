import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Globe, ArrowRight, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigateToSignup, onContinueAsGuest, onLoginSuccess }) {
  const { login, lang, setLang, t } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setFormError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError(t.invalidEmailError);
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(t.invalidEmailError);
      valid = false;
    }

    if (!password) {
      setPasswordError(t.passwordRequiredError);
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setFormError('');

    try {
      await login(email.trim(), password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setFormError(t.loginFailError);
      } else {
        setFormError(t.networkError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        
        {/* 1. Left Branding Section (Desktop 45% / 5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#EFF6FF] border-r border-[#E2E8F0] p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
          {/* Decorative background glow circle */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-blue-200/40 blur-2xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Logo & Name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  PhishGuard AI
                </h2>
                <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                  Cybersecurity Engine
                </p>
              </div>
            </div>

            {/* Tagline & Copy */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xl font-bold text-[#0F172A] leading-snug">
                {t.benefitsHeading}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t.benefitsCopy}
              </p>
            </div>

            {/* 3 Checkmark Benefits */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-[#0F172A] bg-white/80 p-2.5 rounded-xl border border-[#DBEAFE]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{t.benefit1}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-[#0F172A] bg-white/80 p-2.5 rounded-xl border border-[#DBEAFE]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{t.benefit2}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-semibold text-[#0F172A] bg-white/80 p-2.5 rounded-xl border border-[#DBEAFE]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>{t.benefit3}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] relative z-10 pt-6 border-t border-[#DBEAFE]">
            Encrypted Authentication & Session Security
          </div>
        </div>

        {/* 2. Right Form Section (Desktop 55% / 7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          
          {/* Top Bar: Mobile Logo & Language Selector */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            {/* Mobile Header Brand */}
            <div className="flex lg:hidden items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-[#0F172A]">PhishGuard AI</span>
            </div>
            
            <div className="hidden lg:block text-xs font-medium text-[#64748B]">
              Security Portal
            </div>

            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1.5 rounded-xl text-xs">
              <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
              >
                <option value="en">🌐 English</option>
                <option value="hi">🌐 हिंदी</option>
                <option value="hinglish">🌐 Hinglish</option>
              </select>
            </div>
          </div>

          {/* Login Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              {t.welcomeBack}
            </h2>
            <p className="text-xs text-[#64748B]">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder={t.emailPlaceholder}
                className={`w-full bg-[#F8FAFC] border ${
                  emailError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                } focus:bg-white rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans shadow-2xs`}
              />
              {emailError && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder={t.passwordPlaceholder}
                  className={`w-full bg-[#F8FAFC] border ${
                    passwordError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                  } focus:bg-white rounded-xl pl-4 pr-11 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans shadow-2xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{passwordError}</p>
              )}
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-sm tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.loggingInBtn}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.loginBtn}</span>
                </>
              )}
            </button>

            {/* Secondary Continue as Guest Button */}
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold py-3 px-5 rounded-xl transition-all flex items-center justify-center space-x-2 text-xs"
            >
              <span>{t.guestBtn}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="text-center text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            <span>{t.noAccountPrompt} </span>
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="font-bold text-[#2563EB] hover:underline"
            >
              {t.createAccountBtn}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
