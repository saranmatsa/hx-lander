import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HxSymbol } from './HxLogo';
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Ban,
  Copy,
  Check,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { PositionDetailsSkeleton } from './PositionSkeleton';

export interface PositionData {
  candidateId: string;
  emailMasked: string;
  originalPosition: number;
  position: number | null;
  peopleAhead: number;
  totalActive: number;
  movedUpSpots: number;
  hasMovedUp: boolean;
  joinedDate: string;
  joinedAt: string;
  status: 'ACTIVE' | 'CANCELLED';
  isCancelled: boolean;
  cancelledAt?: string;
}

interface PositionDetailsPageProps {
  data: PositionData;
  token: string;
  onBack: () => void;
  onRefreshCount?: () => void;
  onStatusChanged?: (updated: PositionData) => void;
}

export const PositionDetailsPage: React.FC<PositionDetailsPageProps> = ({
  data,
  token,
  onBack,
  onRefreshCount,
  onStatusChanged,
}) => {
  const [positionData, setPositionData] = useState<PositionData>(data);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [cancelSuccessAlert, setCancelSuccessAlert] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!token.trim() || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/waitlist/check-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setPositionData(json.data);
        if (onStatusChanged) onStatusChanged(json.data);
        if (onRefreshCount) onRefreshCount();
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelPosition = async () => {
    if (!token.trim()) return;

    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch('/api/waitlist/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to cancel position.');
      }

      setPositionData(json.data);
      setShowCancelModal(false);
      setCancelSuccessAlert(true);
      if (onStatusChanged) onStatusChanged(json.data);
      if (onRefreshCount) onRefreshCount();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel position.');
    } finally {
      setCancelling(false);
    }
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token.trim());
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col p-6 sm:p-10">
      {/* Top Header */}
      <header className="w-full flex justify-between items-center z-10 max-w-4xl mx-auto pb-8 border-b border-zinc-900">
        <div className="flex items-center space-x-3">
          <HxSymbol className="h-5 sm:h-6 md:h-6.5 w-auto object-contain shrink-0" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
            Waitlist Verification
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh queue status"
            className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors duration-200 bg-black hover:bg-[#121214] px-3.5 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors duration-200 bg-black hover:bg-[#121214] px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto py-8 sm:py-12 space-y-6 flex-1 flex flex-col">
        {/* Cancellation Notice Banner */}
        <AnimatePresence>
          {cancelSuccessAlert && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 bg-[#0a0a0c] hover:bg-[#101014] transition-colors duration-200 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <Ban className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Your reservation was cancelled. Subsequent queue candidates have moved up.</span>
              </div>
              <button
                onClick={() => setCancelSuccessAlert(false)}
                className="text-zinc-500 hover:text-white hover:bg-[#18181b] px-2 py-1 rounded text-xs ml-4 uppercase tracking-wider transition-colors duration-200 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Position Card or Skeleton while refreshing */}
        {isRefreshing ? (
          <PositionDetailsSkeleton />
        ) : (
          <div className="bg-[#0a0a0c] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-7 relative overflow-hidden transition-colors duration-200">
            {/* Candidate ID and Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Candidate Identification
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {positionData.candidateId}
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Queue Status
                </span>
                {positionData.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE IN QUEUE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <Ban className="w-3 h-3 text-zinc-500" />
                    <span>CANCELLED</span>
                  </span>
                )}
              </div>
            </div>

            {/* Queue Movement Indicator (Non-silent) */}
            {positionData.status === 'ACTIVE' && positionData.hasMovedUp && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs font-mono text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/60 flex items-center justify-center shrink-0 border border-emerald-700/60 text-emerald-300">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Queue Advanced: You moved up <strong className="text-emerald-100">+{positionData.movedUpSpots}</strong> spot{positionData.movedUpSpots > 1 ? 's' : ''} in line due to prior cancellations.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 text-[11px] font-mono shrink-0 self-start sm:self-auto">
                  Original #{positionData.originalPosition} → Live #{positionData.position}
                </span>
              </div>
            )}

            {/* 3 Metrics Grid: Position, People Ahead, Total Active */}
            {positionData.status === 'ACTIVE' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* Position */}
                <div className="bg-[#050507] hover:bg-[#101014] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors duration-200 rounded-xl p-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Live Position
                    </span>
                    {positionData.hasMovedUp && (
                      <span className="text-[10px] font-mono text-emerald-400 font-medium flex items-center space-x-0.5 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>+{positionData.movedUpSpots}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white flex items-baseline space-x-2">
                    <span>#{positionData.position}</span>
                    {positionData.hasMovedUp && (
                      <span className="text-xs text-zinc-500 line-through">
                        #{positionData.originalPosition}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono block">
                    Current waitlist rank
                  </span>
                </div>

                {/* People Ahead */}
                <div className="bg-[#050507] hover:bg-[#101014] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors duration-200 rounded-xl p-5 space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    People Ahead
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                    {positionData.peopleAhead}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono block">
                    Waiting ahead of you
                  </span>
                </div>

                {/* Total Active */}
                <div className="bg-[#050507] hover:bg-[#101014] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors duration-200 rounded-xl p-5 space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Total Active
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                    {positionData.totalActive}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono block">
                    Active engineers in queue
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#050507] border border-zinc-800/80 rounded-xl space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Ban className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-zinc-300 font-mono">
                  Position Cancelled
                </div>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  This position is no longer active in the waitlist. Other candidates have advanced forward.
                </p>
                {positionData.cancelledAt && (
                  <div className="text-[11px] text-zinc-600 font-mono pt-1">
                    Cancelled: {new Date(positionData.cancelledAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Details Section */}
            <div className="border-t border-zinc-900 pt-5 space-y-3 font-mono text-xs text-zinc-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-zinc-900/60 gap-1">
                <span className="text-zinc-500 flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Join Date</span>
                </span>
                <span className="text-zinc-200">{positionData.joinedDate}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-zinc-900/60 gap-1">
                <span className="text-zinc-500 flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Registered Email</span>
                </span>
                <span className="text-zinc-200">{positionData.emailMasked}</span>
              </div>

              {/* Secret Access Code Card */}
              <div className="bg-[#050507] hover:bg-[#101014] border border-zinc-800/80 hover:border-zinc-700/80 transition-colors duration-200 rounded-xl p-4 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Your Secret Access Token</span>
                  </span>
                  <span className="text-[10px] text-zinc-600">Confidential</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="font-mono text-xs text-zinc-200 bg-black/80 px-3 py-2.5 rounded-lg border border-zinc-800/80 flex-1 break-all select-all">
                    {token}
                  </div>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="bg-[#121214] hover:bg-[#1c1c20] text-white font-mono text-xs px-4 py-2.5 rounded-full transition-colors duration-200 flex items-center justify-center space-x-1.5 shrink-0 border border-zinc-800 hover:border-zinc-700 cursor-pointer active:scale-[0.98]"
                  >
                    {copiedToken ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* VISUALLY SECONDARY CANCEL ACTION */}
            {positionData.status === 'ACTIVE' && (
              <div className="pt-4 border-t border-zinc-900 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors duration-200 py-2 px-4 rounded-full hover:bg-red-950/20 border border-transparent hover:border-red-900/40 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel My Position</span>
                </button>
                <span className="text-[10px] text-zinc-600 font-mono mt-1">
                  Release spot and advance next engineer in line
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal Before Cancellation */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[420px] bg-[#0d0d10] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 text-white my-auto shadow-2xl shadow-black/80 space-y-4"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-900/90">
                <div className="flex items-center space-x-2">
                  <HxSymbol className="h-4 sm:h-4.5 w-auto object-contain text-white shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Cancel Reservation
                  </span>
                </div>

                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  aria-label="Close cancel modal"
                  className="text-zinc-400 hover:text-white p-1 -mr-1 rounded-md hover:bg-zinc-800/60 transition-colors duration-150 cursor-pointer"
                >
                  <Ban className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                </button>
              </div>

              <div className="space-y-1 pt-0.5">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Cancel Waitlist Spot?
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Are you sure you want to cancel Candidate <span className="text-white font-mono font-semibold">{positionData.candidateId}</span> (Spot #{positionData.position})? Your spot will be released immediately to advancing engineers.
                </p>
              </div>

              {cancelError && (
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 font-mono">
                  {cancelError}
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-zinc-900/90">
                <button
                  type="button"
                  onClick={handleCancelPosition}
                  disabled={cancelling}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-lg uppercase tracking-wider transition-colors duration-150 flex items-center justify-center space-x-1.5 cursor-pointer border border-red-500 hover:border-red-400 active:scale-[0.98]"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="font-mono text-xs">Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="w-full bg-transparent hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 font-mono text-xs py-2 rounded-lg border border-zinc-800/60 hover:border-zinc-700/80 transition-colors duration-150 cursor-pointer"
                >
                  Keep Spot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-8 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-500 font-mono">
        <span>Redefine Impossible.</span>
        <span>HX Engineering</span>
      </footer>
    </div>
  );
};

