import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Trash2,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SMCSignal } from '../types/smc';
import { exportSessionToCSV, exportSessionToJSON } from '../utils/storage';
import { speechEngine } from '../utils/speech';

interface SessionHistoryProps {
  signals: SMCSignal[];
  onClearSession: () => void;
  onSelectSignal: (signal: SMCSignal) => void;
  todayDateString: string;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  signals,
  onClearSession,
  onSelectSignal,
  todayDateString,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalCount = signals.length;
  const bullishCount = signals.filter((s) => s.bias === 'BULLISH').length;
  const bearishCount = signals.filter((s) => s.bias === 'BEARISH').length;
  const avgConfidence =
    totalCount > 0
      ? Math.round(signals.reduce((acc, s) => acc + s.confidenceScore, 0) / totalCount)
      : 0;

  const handleReadSignal = (signal: SMCSignal) => {
    speechEngine.speak(signal.voiceScript || `${signal.asset} setup. ${signal.sniperRationale}`);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Daily Session
            </span>
            <span className="text-xs font-mono text-slate-500">
              Auto-Resets at End of Trading Day (00:00)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight mt-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <span>Daily Session History // {todayDateString}</span>
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {totalCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => exportSessionToCSV(signals)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                title="Export session to CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => exportSessionToJSON(signals)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                title="Export session to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={totalCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-medium disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Session</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Signals</span>
          <span className="text-xl font-bold font-mono text-white mt-0.5 block">{totalCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg Confidence</span>
          <span className="text-xl font-bold font-mono text-sky-400 mt-0.5 block">
            {totalCount > 0 ? `${avgConfidence}%` : '—'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Bullish / Bearish</span>
          <span className="text-sm font-bold font-mono text-slate-200 mt-1 block">
            <span className="text-emerald-400">{bullishCount} Bull</span> /{' '}
            <span className="text-rose-400">{bearishCount} Bear</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Compounding Safety</span>
          <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
            🛡️ 100% Anti-Hunt Protected
          </span>
        </div>
      </div>

      {/* Signals List / Empty State */}
      {totalCount === 0 ? (
        <div className="py-10 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-300">No Signals Logged in Today&apos;s Session Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload a chart or run an intraday/top-down analysis to automatically log your sniper signals here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {signals.map((sig) => {
            const isBull = sig.bias === 'BULLISH';
            const timeStr = new Date(sig.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={sig.id}
                className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left side: Asset, bias, time */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      isBull
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-950/50 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isBull ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-base">{sig.asset}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {sig.timeframe}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isBull ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {sig.bias}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Logged at {timeStr} • R:R: <span className="text-emerald-400 font-bold">{sig.riskRewardRatio}</span> • Entry: <span className="text-slate-200">{sig.entryPrice}</span>
                    </p>
                  </div>
                </div>

                {/* Right side: Confidence & buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] font-mono text-slate-500 block">Conviction</span>
                    <span className="text-xs font-mono font-bold text-sky-400">{sig.confidenceScore}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReadSignal(sig)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 transition-colors cursor-pointer"
                    title="Read setup aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSignal(sig)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Reset Today&apos;s Trading Session?</h4>
              <p className="text-xs text-slate-400 mt-1">
                This will clear all {totalCount} logged signals for today. Remember that Olivia will automatically reset the session at midnight anyway.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearSession();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
