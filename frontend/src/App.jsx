import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AnalysisInput from './components/AnalysisInput';
import RiskScoreCard from './components/RiskScoreCard';
import RiskBreakdownBars from './components/RiskBreakdownBars';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import HistoryTable from './components/HistoryTable';
import DomainComparisonCard from './components/DomainComparisonCard';
import DownloadRiskCard from './components/DownloadRiskCard';
import RedirectChainCard from './components/RedirectChainCard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import GuestAccessModal from './components/GuestAccessModal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  checkHealth,
  analyzeUrl,
  analyzeMessage,
  analyzeEmailHeader,
  getHistory,
  clearHistory,
  getDemoExamples
} from './services/api';
import { Shield, Sparkles, ShieldCheck, UserPlus, ArrowRight } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isGuest, setGuestMode, user, token, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial View Determination:
  // If user is authenticated OR in guest mode, show 'analyzer' (/home).
  // Otherwise, default to 'login' (/login) so Login page appears first!
  const [activeView, setActiveView] = useState(() => {
    if (localStorage.getItem('phishguard_token') || localStorage.getItem('phishguard_guest') === 'true') {
      return 'analyzer';
    }
    return 'login';
  });

  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [demoExamples, setDemoExamples] = useState([]);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Sync view when auth loading completes
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated || isGuest) {
        if (activeView === 'login' || activeView === 'signup') {
          setActiveView('analyzer');
        }
      } else {
        if (activeView !== 'signup') {
          setActiveView('login');
        }
      }
    }
  }, [loading, isAuthenticated, isGuest]);

  // Load history whenever token or user changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const histData = await getHistory();
        setHistory(histData || []);
      } catch (err) {
        console.error('Failed to load history', err);
      }
    };
    fetchHistory();
  }, [token, isAuthenticated]);

  // Check health and load demo cases on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const health = await checkHealth();
      setIsOnline(health.status === 'healthy');

      try {
        const demos = await getDemoExamples();
        setDemoExamples(demos || []);
      } catch (err) {
        console.error('Failed to load demo examples', err);
      }
    };

    fetchInitialData();
  }, []);

  const handleAnalyze = async (input, type) => {
    setIsLoading(true);
    try {
      let res;
      if (type === 'url') {
        res = await analyzeUrl(input);
      } else if (type === 'email') {
        res = await analyzeEmailHeader(input);
      } else {
        res = await analyzeMessage(input);
      }

      setCurrentResult(res);

      // Refresh history log
      const updatedHistory = await getHistory();
      setHistory(updatedHistory || []);
    } catch (error) {
      console.error('Analysis request error:', error);
      alert('Analysis request failed. Please make sure backend FastAPI server is running on http://localhost:8000.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleSelectDemo = (example) => {
    setIsDemoMode(true);
    handleAnalyze(example.input, example.type);
  };

  const handleReanalyzeFromHistory = (item) => {
    setCurrentResult({
      risk_score: item.risk_score,
      risk_level: item.risk_level,
      category_scores: item.category_scores,
      indicators: item.indicators,
      recommendation: item.recommendation,
      input_text: item.input_text,
      input_type: item.input_type
    });

    setActiveView('analyzer');
    const el = document.getElementById('result-panel');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContinueAsGuest = () => {
    setGuestMode();
    setActiveView('analyzer');
  };

  const handleProtectedAccessAttempt = () => {
    if (!isAuthenticated) {
      setIsGuestModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-[#2563EB] font-bold text-sm">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Loading PhishGuard AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      
      {/* Protected Guest Prompt Modal */}
      <GuestAccessModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onNavigateToSignup={() => setActiveView('signup')}
      />

      {/* Render Navbar only on Main App pages (Hide on Login/Signup for clean landing) */}
      {activeView !== 'login' && activeView !== 'signup' && (
        <Navbar
          isOnline={isOnline}
          isDemoMode={isDemoMode}
          toggleDemoMode={() => setIsDemoMode(!isDemoMode)}
          activeView={activeView}
          setActiveView={setActiveView}
          onProtectedAccessAttempt={handleProtectedAccessAttempt}
        />
      )}

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        
        {/* ROUTE 1: LOGIN PAGE (Default First Open) */}
        {activeView === 'login' ? (
          <Login
            onNavigateToSignup={() => setActiveView('signup')}
            onContinueAsGuest={handleContinueAsGuest}
            onLoginSuccess={() => setActiveView('analyzer')}
          />
        ) : activeView === 'signup' ? (
          /* ROUTE 2: SIGNUP PAGE */
          <Signup
            onNavigateToLogin={() => setActiveView('login')}
            onContinueAsGuest={handleContinueAsGuest}
            onSignupSuccess={() => setActiveView('analyzer')}
          />
        ) : activeView === 'analytics' ? (
          /* ROUTE 3: SECURITY ANALYTICS DASHBOARD */
          <AnalyticsDashboard />
        ) : (
          /* ROUTE 4: THREAT ANALYZER MAIN FLOW (/home) */
          <>
            {/* Hero Section */}
            <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Assisted Phishing & Threat Analyzer</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                Check <span className="text-[#2563EB]">suspicious links & emails</span> before you trust them.
              </h1>
              
              <p className="text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto font-normal">
                PhishGuard AI analyzes URLs, text messages, screenshots, QR codes, and email headers against structural anomalies, lookalike domains, short links, and email authentication failures.
              </p>
            </section>

            {/* Analyzer Input Card */}
            <section id="analyzer" className="max-w-3xl mx-auto w-full">
              <AnalysisInput
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                demoExamples={demoExamples}
                onSelectDemo={handleSelectDemo}
              />
            </section>

            {/* Live Result Panel */}
            {currentResult && (
              <section id="result-panel" className="max-w-3xl mx-auto w-full space-y-6">
                <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                      <h2 className="text-lg font-bold text-[#0F172A]">Analysis Results</h2>
                    </div>
                    <span className="text-xs text-[#64748B] font-mono">
                      Input: {currentResult.input_type?.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5">
                      <RiskScoreCard
                        riskScore={currentResult.risk_score}
                        riskLevel={currentResult.risk_level}
                      />
                    </div>
                    <div className="md:col-span-7">
                      <RiskBreakdownBars
                        categoryScores={currentResult.category_scores}
                      />
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Domain Comparison Card */}
                {currentResult.domain_comparison && (
                  <DomainComparisonCard domainComparison={currentResult.domain_comparison} />
                )}

                {/* Shortened URL & Redirect Expansion Card */}
                {currentResult.redirect_chain && (
                  <RedirectChainCard redirectChain={currentResult.redirect_chain} />
                )}

                {/* Download Risk Card */}
                {currentResult.download_info && (
                  <DownloadRiskCard downloadInfo={currentResult.download_info} />
                )}

                {/* Explainability & Action */}
                <ExplainabilityPanel result={currentResult} />

                {/* Subtle Guest Callout Banner */}
                {!isAuthenticated && (
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <h4 className="text-xs font-bold text-[#0F172A]">Want to save your scan history?</h4>
                      <p className="text-[11px] text-[#64748B]">Create a free account to save and revisit your security analyses anytime.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView('signup')}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Free Account</span>
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* How It Works Section */}
            <section id="how-it-works" className="space-y-6 pt-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-[#0F172A]">How PhishGuard AI Works</h2>
                <p className="text-xs text-[#64748B]">Transparent 4-step heuristic & NLP analysis pipeline</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] pt-1">Submit</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Paste any URL, SMS message, screenshot, QR code, or raw email header.
                  </p>
                </div>

                <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] pt-1">Analyze</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Evaluate domain structure, short link expansion, file types, and email headers.
                  </p>
                </div>

                <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] pt-1">Score</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Aggregate weighted risk scores across 5 security vectors (0–100).
                  </p>
                </div>

                <div className="bg-white rounded-[20px] border border-[#E2E8F0] p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] pt-1">Explain</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Receive plain-English indicator breakdowns, domain diffs, and safety recommendations.
                  </p>
                </div>
              </div>
            </section>

            {/* History Log Section */}
            <section id="history" className="pt-2">
              <HistoryTable
                history={history}
                onClearHistory={handleClearHistory}
                onReanalyze={handleReanalyzeFromHistory}
              />
            </section>

            {/* About Section */}
            <section id="about" className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A]">About PhishGuard AI</h3>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                PhishGuard AI provides explainable, transparent cybersecurity threat detection for everyday users. Designed as a SaaS security assistant, it breaks down complex link features, dangerous download links, email header authentications, and social engineering triggers into clear risk categories.
              </p>
            </section>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B]">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PhishGuard AI — Transparent Cyber Defense Engine</span>
          <span className="text-[11px] text-[#94A3B8]">Built for Security & Trust</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
