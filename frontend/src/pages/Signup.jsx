import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Globe, ArrowRight, Loader2, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup({ onNavigateToLogin, onContinueAsGuest, onSignupSuccess }) {
  const { signup, lang, setLang, t } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setFormError('');

    if (!name.trim()) {
      setNameError(t.nameRequiredError);
      valid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(t.invalidEmailError);
      valid = false;
    }

    if (!password || password.length < 8) {
      setPasswordError(t.passwordMinError);
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError(t.passwordsMatchError);
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
      await signup(name.trim(), email.trim(), password, lang);
      if (onSignupSuccess) onSignupSuccess();
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.data?.detail) {
        setFormError(err.response.data.detail);
      } else {
        setFormError(t.networkError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-[24px] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        
        {/* 1. Left Branding Section */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#EFF6FF] border-r border-[#E2E8F0] p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
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

            <div className="space-y-2 pt-2">
              <h3 className="text-xl font-bold text-[#0F172A] leading-snug">
                {t.benefitsHeading}
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t.benefitsCopy}
              </p>
            </div>

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
            Save and sync your security scan history
          </div>
        </div>

        {/* 2. Right Form Section */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-5">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
            <div className="flex lg:hidden items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-[#0F172A]">PhishGuard AI</span>
            </div>
            
            <div className="hidden lg:block text-xs font-medium text-[#64748B]">
              New Account Signup
            </div>

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

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              {t.createAccountTitle}
            </h2>
            <p className="text-xs text-[#64748B]">
              {t.signupSubtitle}
            </p>
          </div>

          {formError && (
            <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                {t.fullNameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                placeholder={t.fullNamePlaceholder}
                className={`w-full bg-[#F8FAFC] border ${
                  nameError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                } focus:bg-white rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans shadow-2xs`}
              />
              {nameError && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{nameError}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
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
                } focus:bg-white rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans shadow-2xs`}
              />
              {emailError && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{emailError}</p>
              )}
            </div>

            {/* Password & Confirm Password (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
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
                    placeholder={t.createPasswordPlaceholder}
                    className={`w-full bg-[#F8FAFC] border ${
                      passwordError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                    } focus:bg-white rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans shadow-2xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-semibold text-[#DC2626]">{passwordError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmError('');
                  }}
                  placeholder={t.confirmPasswordPlaceholder}
                  className={`w-full bg-[#F8FAFC] border ${
                    confirmError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                  } focus:bg-white rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] transition-all font-sans shadow-2xs`}
                />
                {confirmError && (
                  <p className="text-[11px] font-semibold text-[#DC2626]">{confirmError}</p>
                )}
              </div>
            </div>

            {/* Primary Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-sm tracking-wide mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.creatingAccountBtn}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t.createAccountBtn}</span>
                </>
              )}
            </button>

            {/* Secondary Continue as Guest */}
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center justify-center space-x-2 text-xs"
            >
              <span>{t.guestBtn}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
            <span>{t.alreadyAccountPrompt} </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-[#2563EB] hover:underline"
            >
              {t.loginBtn}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
