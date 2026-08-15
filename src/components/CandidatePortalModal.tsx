import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HxSymbol } from './HxLogo';
import { X, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface CandidatePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCount?: () => void;
}

interface CandidateData {
  candidateId: string;
  status: string;
  joinedDate: string;
  email: string;
}

export const CandidatePortalModal: React.FC<CandidatePortalModalProps> = ({
  isOpen,
  onClose,
  onRefreshCount,
}) => {
  const [step, setStep] = useState<'email' | 'verify' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  const resetState = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setCandidate(null);
    setError(null);
    setPreviewCode(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/waitlist/portal/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request verification code.');
      }

      if (data.previewCode) {
        setPreviewCode(data.previewCode);
      }
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/waitlist/portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setCandidate(data.candidate);
      setStep('profile');
      if (onRefreshCount) onRefreshCount();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/waitlist/portal/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.previewCode) setPreviewCode(data.previewCode);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: Enter Email */}
            {step === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <HxSymbol className="h-5 w-auto object-contain text-white shrink-0" />
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Candidate Portal
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Check Status
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter the email you used to join the waitlist. We will send a secure single-use verification code.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-3.5 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>SEND VERIFICATION CODE</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Enter Verification Code */}
            {step === 'verify' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <HxSymbol className="h-5 w-auto object-contain text-white shrink-0" />
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Security Verification
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Verify Your Email
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter the 6-digit code sent to <span className="text-white font-mono">{email}</span>.
                  </p>
                </div>

                {previewCode && (
                  <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono tracking-wider">Dev Preview Code:</span>
                    <span className="font-mono text-base font-bold text-white tracking-widest">{previewCode}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-center text-xl font-mono tracking-[0.3em] text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1 text-center font-mono">
                      Single-use code expires in 10 minutes
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-3.5 rounded-lg uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>VERIFY & VIEW STATUS</span>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isLoading}
                      className="text-zinc-400 hover:text-white transition-colors underline"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Candidate Information (Strictly Format Matching Specification) */}
            {step === 'profile' && candidate && (
              <div className="space-y-8 py-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <HxSymbol className="h-5 w-auto object-contain text-white shrink-0" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Candidate Profile
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Candidate ID Display */}
                <div className="text-left space-y-6">
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight">
                      {candidate.candidateId}
                    </div>
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
                      Candidate ID
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2 border-t border-zinc-900">
                    <div>
                      <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        Status
                      </div>
                      <div className="text-sm font-semibold text-white mt-1 font-mono tracking-wider">
                        {candidate.status}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        Joined
                      </div>
                      <div className="text-sm text-zinc-300 mt-1">
                        {candidate.joinedDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-wider py-3 rounded-lg border border-zinc-800 transition-colors"
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
  );
};
