import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HxSymbol } from './HxLogo';
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  ClipboardPaste,
} from 'lucide-react';
import { PositionDetailsPage, PositionData } from './PositionDetailsPage';
import { PositionDetailsSkeleton } from './PositionSkeleton';

interface CheckPositionPageProps {
  onBack: () => void;
  initialToken?: string;
  onRefreshCount?: () => void;
}

export const CheckPositionPage: React.FC<CheckPositionPageProps> = ({
  onBack,
  initialToken = '',
  onRefreshCount,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState(false);

  const handleFetchPosition = async (tokenToUse?: string) => {
    const raw = (tokenToUse !== undefined ? tokenToUse : tokenInput).trim();
    if (!raw) {
      setError('Please paste your HX access token.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist/check-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: raw }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'No waitlist candidate found for this token.');
      }

      setPositionData(json.data);
      setVerifiedToken(raw);
      if (onRefreshCount) onRefreshCount();
    } catch (err: any) {
      setError(err.message || 'Unable to check position. Please verify the code.');
      setPositionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTokenInput(text.trim());
        setError(null);
      }
    } catch {
      // Fallback
    }
  };

  const copyCurrentToken = () => {
    if (!tokenInput) return;
    navigator.clipboard.writeText(tokenInput.trim());
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  useEffect(() => {
    if (initialToken) {
      handleFetchPosition(initialToken);
    }
  }, [initialToken]);

  // When access code is verified, DIRECTLY render full Position Details Page
  if (positionData && verifiedToken) {
    return (
      <PositionDetailsPage
        data={positionData}
        token={verifiedToken}
        onBack={() => {
          setPositionData(null);
          setVerifiedToken('');
        }}
        onRefreshCount={onRefreshCount}
        onStatusChanged={(updated) => {
          setPositionData(updated);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col p-6 sm:p-10">
      {/* Top Navigation */}
      <header className="w-full flex justify-between items-center z-10 max-w-4xl mx-auto pb-8 border-b border-zinc-900">
        <div className="flex items-center space-x-3">
          <HxSymbol className="h-5 sm:h-6 md:h-6.5 w-auto object-contain shrink-0" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
            Waitlist Verification
          </span>
        </div>

        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors duration-200 bg-black hover:bg-[#121214] px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto py-12 sm:py-16 space-y-8 flex-1 flex flex-col justify-center">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#0a0a0c] hover:bg-[#121214] transition-colors duration-200 border border-zinc-800 hover:border-zinc-700 rounded-full text-xs font-mono text-zinc-300">
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Passwordless Access Code</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Check Your Position
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Enter your secret HX access token to view your live queue position, total active candidates, and manage your reservation.
          </p>
        </div>

        {/* Token Input Card Form */}
        <div className="bg-[#0a0a0c] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchPosition();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                <span>Access Code</span>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-zinc-400 hover:text-white hover:bg-[#18181b] px-2 py-0.5 rounded transition-colors duration-200 flex items-center space-x-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste from clipboard</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setError(null);
                  }}
                  placeholder="HX-8fK2mQ9xL..."
                  className="w-full bg-[#050507] hover:bg-[#0e0e11] focus:bg-[#0e0e11] border border-zinc-800 hover:border-zinc-700 focus:border-zinc-400 rounded-xl px-4 py-3.5 text-sm font-mono text-white placeholder-zinc-600 transition-colors duration-200"
                  autoFocus
                />
                {tokenInput && (
                  <button
                    type="button"
                    onClick={copyCurrentToken}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 hover:bg-[#18181b] p-1.5 rounded-full transition-colors duration-200 cursor-pointer"
                    title="Copy token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/70 rounded-xl text-xs text-red-300 flex items-center space-x-2 font-mono">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm py-4 px-8 rounded-full uppercase tracking-[0.15em] transition-colors duration-200 border border-transparent hover:border-zinc-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VERIFYING CODE...</span>
                </>
              ) : (
                <>
                  <span>VIEW MY POSITION</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Skeleton Screen Preview while loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 px-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                <span>Querying live candidate roster...</span>
              </div>
              <PositionDetailsSkeleton />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-8 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-500 font-mono">
        <span>Redefine Impossible.</span>
        <span>HX Engineering</span>
      </footer>
    </div>
  );
};

