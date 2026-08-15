import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, ValidationError } from '@formspree/react';
import { HxSymbol } from './components/HxLogo';
import { CheckPositionPage } from './components/CheckPositionPage';
import { X, Loader2, KeyRound, Copy, Check, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface JoinedCandidate {
  candidateId: string;
  email: string;
  joinedAt: string;
  joinedDate?: string;
  status: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'check-position'>('home');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [formspreeState, handleFormspreeSubmit] = useForm('mjybyyvg');

  // Waitlist Join state
  const [waitlistStep, setWaitlistStep] = useState<'form' | 'success'>('form');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [joinedCandidate, setJoinedCandidate] = useState<JoinedCandidate | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch dynamic waitlist count from database
  const fetchCount = async () => {
    try {
      const res = await fetch('/api/waitlist/count');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setWaitlistCount(data.count);
        }
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJoinError(null);
    setJoinLoading(true);

    const emailValue = joinEmail.trim();

    try {
      // 1. Submit to Formspree in background for lead inbox preservation
      try {
        handleFormspreeSubmit(e);
      } catch {
        // Continue regardless of formspree
      }

      // 2. Call backend waitlist API to generate cryptographically secure token & record in MongoDB
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join waitlist. Please try again.');
      }

      setGeneratedToken(data.token);
      setJoinedCandidate(data.candidate);
      setWaitlistStep('success');
      fetchCount();
    } catch (err: any) {
      setJoinError(err.message || 'An error occurred. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const copyTokenToClipboard = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken.trim());
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCloseModal = () => {
    setIsWaitlistOpen(false);
    setWaitlistStep('form');
    setJoinEmail('');
    setJoinError(null);
    setGeneratedToken(null);
    setJoinedCandidate(null);
    setCopiedToken(false);
  };

  const handleGoToCheckPosition = () => {
    handleCloseModal();
    setCurrentView('check-position');
  };

  if (currentView === 'check-position' || currentView === 'roster') {
    return (
      <CheckPositionPage
        onBack={() => setCurrentView('home')}
        initialToken={generatedToken || ''}
        onRefreshCount={fetchCount}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between p-6 sm:p-10 overflow-hidden">
      {/* Top Header */}
      <header className="w-full flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <HxSymbol className="h-5 sm:h-6 md:h-6.5 w-auto object-contain shrink-0" />
        </div>

        <button
          onClick={() => setCurrentView('check-position')}
          className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors duration-200 bg-black hover:bg-[#121214] px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 flex items-center space-x-2 active:scale-[0.98] cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
          <span>Check Position</span>
        </button>
      </header>

      {/* Main Centered Hero Content */}
      <main className="my-auto flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-6 sm:space-y-8 z-10 px-4">
        {/* Logo Badge Line: HX CFD | HX MBSE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-white text-base sm:text-lg md:text-xl font-medium tracking-tight"
        >
          <div className="inline-flex items-center gap-2">
            <HxSymbol className="h-5 sm:h-6 md:h-6.5 w-auto object-contain shrink-0" />
            <span className="font-semibold tracking-wide text-white leading-none">CFD</span>
          </div>

          <span className="text-zinc-600 font-light text-base sm:text-lg select-none">|</span>

          <div className="inline-flex items-center gap-2">
            <HxSymbol className="h-5 sm:h-6 md:h-6.5 w-auto object-contain shrink-0" />
            <span className="font-semibold tracking-wide text-white leading-none">MBSE</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.08] max-w-2xl"
        >
          Engineering<br />
          Without the<br />
          Barriers.
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-lg font-normal tracking-wide"
        >
          The future belongs to those who refuse today's limits.
        </motion.p>

        {/* Button & Dynamic Live Waitlist Count */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2 w-full max-w-xs flex flex-col items-center space-y-3.5"
        >
          <button
            onClick={() => {
              setWaitlistStep('form');
              setIsWaitlistOpen(true);
            }}
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm py-4 px-8 rounded-full uppercase tracking-[0.2em] transition-colors duration-200 border border-transparent hover:border-zinc-300 active:scale-[0.98] cursor-pointer"
          >
            JOIN WAITLIST
          </button>

          {/* Dynamic Clickable Count Element with Skeleton loader state */}
          <button
            onClick={() => setCurrentView('check-position')}
            className="group flex items-center justify-center space-x-2 text-xs text-zinc-400 hover:text-white transition-colors duration-200 font-mono py-1.5 px-4 rounded-full bg-black hover:bg-[#121214] border border-zinc-800/80 hover:border-zinc-700 cursor-pointer"
          >
            {waitlistCount === null ? (
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 animate-pulse" />
                <span className="text-zinc-500">syncing waitlist count...</span>
              </div>
            ) : (
              <>
                <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">
                  {waitlistCount} {waitlistCount === 1 ? 'person has' : 'people have'} joined
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform text-zinc-500 group-hover:text-zinc-300">→</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Footer Slogan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6 flex flex-col items-center"
        >
          <p className="text-zinc-500 hover:text-zinc-400 transition-colors duration-200 text-xs sm:text-sm tracking-[0.2em] uppercase font-mono select-none">
            Redefine Impossible.
          </p>
        </motion.div>
      </main>

      {/* Empty footer spacer to maintain perfect vertical center balance */}
      <footer className="w-full h-6" />

      {/* Join Waitlist Modal */}
      <AnimatePresence>
        {isWaitlistOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[420px] bg-[#0d0d10] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 text-white my-auto shadow-2xl shadow-black/80"
            >
              {/* STEP 1: Email Form */}
              {waitlistStep === 'form' && (
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-900/90">
                    <div className="flex items-center space-x-2">
                      <HxSymbol className="h-4 sm:h-4.5 w-auto object-contain text-white shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Waitlist
                      </span>
                    </div>

                    <button
                      onClick={handleCloseModal}
                      aria-label="Close waitlist modal"
                      className="text-zinc-400 hover:text-white p-1 -mr-1 rounded-md hover:bg-zinc-800/60 transition-colors duration-150 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1 pt-0.5">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      Join Early Access
                    </h2>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Enter your email to reserve your spot on the waitlist. You will immediately receive a cryptographically unique access token.
                    </p>
                  </div>

                  {joinError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 font-mono flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  <form onSubmit={handleJoinSubmit} className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={joinEmail}
                        onChange={(e) => {
                          setJoinEmail(e.target.value);
                          if (joinError) setJoinError(null);
                        }}
                        placeholder="Enter your work email"
                        className="w-full bg-[#050507] hover:bg-[#101014] focus:bg-[#101014] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-400 rounded-lg px-3.5 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 transition-colors duration-150 font-sans"
                        autoFocus
                      />
                      <ValidationError prefix="Email" field="email" errors={formspreeState.errors} className="text-xs text-red-400 font-mono" />
                    </div>

                    <button
                      type="submit"
                      disabled={joinLoading || formspreeState.submitting}
                      className="w-full bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-semibold text-xs sm:text-sm py-3 sm:py-3.5 px-4 rounded-lg uppercase tracking-[0.12em] transition-colors duration-150 border border-transparent flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                    >
                      {joinLoading || formspreeState.submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="font-mono text-xs">Generating Code...</span>
                        </>
                      ) : (
                        <span>SUBMIT</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Token Assigned Display with Copy Code */}
              {waitlistStep === 'success' && joinedCandidate && generatedToken && (
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-900/90">
                    <div className="flex items-center space-x-2">
                      <HxSymbol className="h-4 sm:h-4.5 w-auto object-contain text-white shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Waitlist Confirmed
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400/90 font-mono bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-900/50">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="font-semibold">{joinedCandidate.candidateId}</span>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        aria-label="Close waitlist modal"
                        className="text-zinc-400 hover:text-white p-1 -mr-1 rounded-md hover:bg-zinc-800/60 transition-colors duration-150 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Explanation */}
                  <div className="space-y-1 pt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                      Your Access Token
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Save this secret access code. You can use it anytime on <strong className="text-zinc-100 font-medium">Check Your Position</strong> to view your waitlist rank or manage your spot without passwords.
                    </p>
                  </div>

                  {/* Token Box with Copy Button */}
                  <div className="bg-[#050507] border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Secret Access Code:
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Keep confidential</span>
                    </div>

                    <div className="font-mono text-xs sm:text-[13px] text-zinc-100 bg-black/90 px-3 py-2.5 rounded-lg border border-zinc-800/90 select-all break-all tracking-tight leading-snug">
                      {generatedToken}
                    </div>

                    <button
                      type="button"
                      onClick={copyTokenToClipboard}
                      className="w-full bg-[#141417] hover:bg-[#1e1e23] active:bg-[#25252b] text-zinc-200 hover:text-white font-mono text-xs py-2 px-3 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-1.5 border border-zinc-800/90 hover:border-zinc-700 cursor-pointer active:scale-[0.98]"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="uppercase tracking-wider text-[11px]">Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900/90">
                    <button
                      type="button"
                      onClick={handleGoToCheckPosition}
                      className="w-full bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-semibold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-lg uppercase tracking-wider transition-colors duration-150 flex items-center justify-center space-x-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Check My Position</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full bg-transparent hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 font-mono text-xs py-2 rounded-lg border border-zinc-800/60 hover:border-zinc-700/80 transition-colors duration-150 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

