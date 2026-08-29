import React, { useState, useRef, useEffect } from 'react';
import { Shield, Sparkles, Activity, BarChart3, Search, User, LogOut, History, ChevronDown, UserPlus, LogIn, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ isOnline, isDemoMode, toggleDemoMode, activeView, setActiveView, onProtectedAccessAttempt }) {
  const { user, isAuthenticated, isGuest, logout, lang, setLang } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    if (setActiveView) setActiveView('login');
  };

  const getUserInitial = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const handleNavClick = (viewName) => {
    if ((viewName === 'analytics' || viewName === 'history') && !isAuthenticated) {
      if (onProtectedAccessAttempt) {
        onProtectedAccessAttempt();
      } else if (setActiveView) {
        setActiveView('login');
      }
      return;
    }

    if (viewName === 'history') {
      if (setActiveView) setActiveView('analyzer');
      setTimeout(() => {
        const el = document.getElementById('history');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (setActiveView) setActiveView(viewName);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] px-4 lg:px-8 py-3">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleNavClick('analyzer')}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <Shield className="w-5 h-5 text-[#2563EB]" />
            </div>
            
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold text-[#0F172A] tracking-tight">
                PhishGuard <span className="text-[#2563EB]">AI</span>
              </span>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => handleNavClick('analyzer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'analyzer'
                  ? 'bg-white text-[#2563EB] shadow-2xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Home / Analyzer</span>
            </button>

            {/* Dashboard Tab */}
            <button
              onClick={() => handleNavClick('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'analytics'
                  ? 'bg-white text-[#2563EB] shadow-2xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* History Tab */}
            <button
              onClick={() => handleNavClick('history')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] transition-all"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>
        </div>

        {/* Right Controls: Language Selector, Demo Mode, & User State */}
        <div className="flex items-center space-x-2.5">

          {/* Language Selector Dropdown */}
          <div className="flex items-center space-x-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-1.5 rounded-xl text-xs">
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

          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isDemoMode 
                ? 'bg-[#EFF6FF] border-[#2563EB]/40 text-[#2563EB]' 
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Mode</span>
            {isDemoMode && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>}
          </button>

          {/* Authentication State Controls */}
          {isAuthenticated ? (
            /* Logged-In User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 p-1.5 pr-2.5 rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {getUserInitial()}
                </div>
                <span className="text-xs font-bold text-[#0F172A] hidden sm:inline max-w-[90px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-2 space-y-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-[#F1F5F9] space-y-0.5">
                    <p className="font-bold text-[#0F172A] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleNavClick('analyzer');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F8FAFC] flex items-center space-x-2 text-[#0F172A] font-medium"
                  >
                    <Search className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Home / Analyzer</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleNavClick('analytics');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F8FAFC] flex items-center space-x-2 text-[#0F172A] font-medium"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleNavClick('history');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F8FAFC] flex items-center space-x-2 text-[#0F172A] font-medium"
                  >
                    <History className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>My Saved History</span>
                  </button>

                  <div className="pt-1 border-t border-[#F1F5F9]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FEF2F2] flex items-center space-x-2 text-[#DC2626] font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest / Logged-Out Actions: Create Account */
            <button
              type="button"
              onClick={() => setActiveView && setActiveView('signup')}
              className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center space-x-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
