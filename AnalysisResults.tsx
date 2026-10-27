import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Target,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  DollarSign,
  Percent,
} from 'lucide-react';
import { SMCSignal, ConfluenceStatus } from '../types/smc';
import { VoiceState, speechEngine } from '../utils/speech';

interface AnalysisResultsProps {
  signal: SMCSignal;
  onLogSignal: (signal: SMCSignal) => void;
  voiceState: VoiceState;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  signal,
  onLogSignal,
  voiceState,
  onReset,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const isBullish = signal.bias === 'BULLISH';
  const isSpeakingThis = voiceState.isSpeaking && voiceState.activeText.includes(signal.asset);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleVoiceToggle = () => {
    if (isSpeakingThis) {
      if (voiceState.isPaused) {
        speechEngine.resume();
      } else {
        speechEngine.pause();
      }
    } else {
      speechEngine.speak(signal.voiceScript || `${signal.asset} setup. ${signal.sniperRationale}`);
    }
  };

  const handleVoiceStop = () => {
    speechEngine.stop();
  };

  const handleLogClick = () => {
    onLogSignal(signal);
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 2000);
  };

  const filteredConfluences = signal.confluences.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Main Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
        {/* Glow corner accent */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isBullish ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        ></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold uppercase">
                {signal.mode === 'top-down' ? 'Top-Down Synthesis' : 'Intraday Sniper'}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                {signal.timeframe} Execution
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold">
                {signal.grade}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {signal.asset}
              </h2>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-bold text-sm border ${
                  isBullish
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                }`}
              >
                {isBullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{signal.bias} SNIPER</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Optimal Window: {signal.killzone}</span>
            </p>
          </div>

          {/* Confidence Score Gauge & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Confluence Score
              </span>
              <div className="flex items-baseline gap-1 justify-end mt-0.5">
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  {signal.confidenceScore}%
                </span>
              </div>
              <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    signal.confidenceScore >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-sky-400'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${signal.confidenceScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLogClick}
                disabled={isLogged}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
              >
                <BookmarkPlus className={`w-3.5 h-3.5 ${isLogged ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{isLogged ? 'Logged to History' : 'Save to Session'}</span>
              </button>
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono cursor-pointer transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Voice Assistant Player Bar */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">Olivia Audio Briefing</span>
                {isSpeakingThis && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    READING SETUP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 italic font-sans">
                &ldquo;{signal.voiceScript}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleVoiceToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              {isSpeakingThis && !voiceState.isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{voiceState.isPaused ? 'Resume' : 'Play Voice'}</span>
                </>
              )}
            </button>
            {isSpeakingThis && (
              <button
                type="button"
                onClick={handleVoiceStop}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Stop audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Execution Coordinates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entry Coordinate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              {signal.orderType}
            </span>
            <button
              onClick={() => handleCopy(signal.entryPrice, 'entry')}
              className="p-1 rounded text-slate-500 hover:text-sky-400 transition-colors"
              title="Copy Entry"
            >
              {copiedKey === 'entry' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="font-mono font-black text-2xl text-white mt-1 block tracking-tight">
            {signal.entryPrice}
          </span>
          <p className="text-[11px] text-sky-400 font-mono mt-1">High-Precision Order Block</p>
        </div>

        {/* Anti-Stop-Hunt Stop Loss */}
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Anti-Hunt Stop Loss
            </span>
            <button
              onClick={() => handleCopy(signal.stopLoss, 'sl')}
              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
              title="Copy Stop Loss"
            >
              {copiedKey === 'sl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="font-mono font-black text-2xl text-rose-400 mt-1 block tracking-tight">
            {signal.stopLoss}
          </span>
          <p className="text-[11px] text-rose-400/90 font-mono mt-1">
            Structural Anchor + {signal.antiHuntBufferPips} Pips Buffer
          </p>
        </div>

        {/* Multi-Target TPs */}
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Multi-TP Ladder
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {signal.riskRewardRatio} R:R
            </span>
          </div>
          <div className="space-y-1.5 mt-2 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>TP1 (50% Vol):</span>
              <span className="font-bold text-white">{signal.tp1}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>TP2 (30% Vol):</span>
              <span className="font-bold text-white">{signal.tp2}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span>TP3 (Moonbag):</span>
              <span className="font-bold text-emerald-300">{signal.tp3}</span>
            </div>
          </div>
        </div>

        {/* Small Account Compounding Calculation */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-sky-500/30">
          <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block">
            Small Account Compounding
          </span>
          <div className="mt-2 space-y-1 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Account Equity:</span>
              <span className="text-white font-bold">${signal.smallAccountCompounding.accountBalance}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Risk {signal.smallAccountCompounding.riskPercent}%:</span>
              <span className="text-rose-400 font-bold">-${signal.smallAccountCompounding.riskDollarAmount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Suggested Lot:</span>
              <span className="text-sky-300 font-bold">{signal.smallAccountCompounding.suggestedLotSize} lots</span>
            </div>
            <div className="flex justify-between text-emerald-400 pt-1 border-t border-slate-800">
              <span>Full Gain (TP3):</span>
              <span className="font-black text-emerald-300">+${signal.smallAccountCompounding.tp3DollarGain}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Stop-Hunt Protocol Deep Teardown Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Anti-Stop-Hunt Shield Protocol Analysis
            </h3>
            <p className="text-[11px] text-slate-400">
              Why this trade placement is insulated against institutional liquidity sweeps
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-sans leading-relaxed">
          {signal.antiHuntRationale}
        </div>
      </div>

      {/* 8-Step Confluence Protocol Teardown */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Institutional 8-Step Confluence Protocol Checklist</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Rigorous verification of market structure, order blocks, FVG, liquidity sweeps, and killzones
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {['ALL', 'CONFIRMED', 'PARTIAL'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterStatus === status
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredConfluences.map((c) => {
            const isConfirmed = c.status === 'CONFIRMED';
            const isPartial = c.status === 'PARTIAL';
            return (
              <div
                key={c.stepNumber}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 font-mono font-bold text-xs flex items-center justify-center">
                        #{c.stepNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{c.name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isPartial
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">{c.details}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Category: {c.category}</span>
                  <span
                    className={`font-semibold ${
                      c.weight === 'CRITICAL' ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {c.weight} CONFLUENCE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sniper Narrative Teardown */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Olivia&apos;s Execution Thesis & Institutional Playbook</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{signal.sniperRationale}</p>
        <p className="text-[11px] text-sky-400/90 font-mono mt-3">
          💡 {signal.smallAccountCompounding.growthCompoundingNote}
        </p>
      </div>
    </div>
  );
};
