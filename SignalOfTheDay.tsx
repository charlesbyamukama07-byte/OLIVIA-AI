import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkPlus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';
import { SMCSignal } from '../types/smc';
import { VoiceState, speechEngine } from '../utils/speech';

interface SignalOfTheDayProps {
  signal: SMCSignal;
  onLogSignal: (signal: SMCSignal) => void;
  voiceState: VoiceState;
  onSelectForTeardown: (signal: SMCSignal) => void;
}

export const SignalOfTheDay: React.FC<SignalOfTheDayProps> = ({
  signal,
  onLogSignal,
  voiceState,
  onSelectForTeardown,
}) => {
  const [isLogged, setIsLogged] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isBullish = signal.bias === 'BULLISH';
  const isSpeakingThis = voiceState.isSpeaking && voiceState.activeText.includes(signal.asset);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleVoiceToggle = () => {
    if (isSpeakingThis) {
      speechEngine.stop();
    } else {
      speechEngine.speak(signal.voiceScript || `${signal.asset} setup. ${signal.sniperRationale}`);
    }
  };

  const handleLogClick = () => {
    onLogSignal(signal);
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 2000);
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 border border-sky-500/30 shadow-2xl shadow-sky-500/5 overflow-hidden">
      {/* Decorative institutional glow top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-emerald-400 to-indigo-500"></div>

      <div className="p-5 sm:p-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Institutional High-Conviction
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {signal.confidenceScore}% Confidence (85%+ Required)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Signal of the Day // {signal.asset}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Read Aloud Button */}
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                isSpeakingThis
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300'
              }`}
              title="Listen to Olivia read out this sniper setup"
            >
              {isSpeakingThis ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Log to history */}
            <button
              onClick={handleLogClick}
              disabled={isLogged}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              <BookmarkPlus className={`w-4 h-4 ${isLogged ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isLogged ? 'Logged to Session!' : 'Log Setup'}</span>
            </button>
          </div>
        </div>

        {/* Core Coordinates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
          {/* Bias */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Bias & Setup</span>
            <div className="flex items-center gap-1.5 mt-1">
              {isBullish ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              )}
              <span className={`font-mono font-bold text-sm ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {signal.bias}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block truncate">{signal.orderType}</span>
          </div>

          {/* Limit Entry */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Sniper Entry</span>
              <button
                onClick={() => handleCopy(signal.entryPrice, 'entry')}
                className="text-slate-500 hover:text-sky-400 opacity-60 group-hover:opacity-100 transition-opacity"
                title="Copy Entry"
              >
                {copiedKey === 'entry' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono font-black text-white text-base mt-1 block tracking-tight">
              {signal.entryPrice}
            </span>
            <span className="text-[10px] text-sky-400 font-mono mt-0.5 block">{signal.timeframe} Order Block</span>
          </div>

          {/* Anti-Hunt Stop Loss */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/20 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Anti-Hunt SL
              </span>
              <button
                onClick={() => handleCopy(signal.stopLoss, 'sl')}
                className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity"
                title="Copy Stop Loss"
              >
                {copiedKey === 'sl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono font-black text-rose-400 text-base mt-1 block tracking-tight">
              {signal.stopLoss}
            </span>
            <span className="text-[10px] text-rose-400/80 font-mono mt-0.5 block">
              +{signal.antiHuntBufferPips} pips ATR buffer
            </span>
          </div>

          {/* Target 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">TP1 (50% Vol)</span>
              <button
                onClick={() => handleCopy(signal.tp1, 'tp1')}
                className="text-slate-500 hover:text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                {copiedKey === 'tp1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono font-bold text-slate-200 text-base mt-1 block tracking-tight">{signal.tp1}</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">1:2 R:R Target</span>
          </div>

          {/* Target 2 & 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">TP2 & TP3</span>
              <button
                onClick={() => handleCopy(signal.tp3, 'tp3')}
                className="text-slate-500 hover:text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                {copiedKey === 'tp3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono font-bold text-emerald-300 text-base mt-1 block tracking-tight">
              {signal.tp3}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">TP2: {signal.tp2}</span>
          </div>

          {/* R:R Ratio */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">Sniper R:R</span>
            <span className="font-mono font-black text-emerald-400 text-xl mt-1 block tracking-tight">
              {signal.riskRewardRatio}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Compounding Grade</span>
          </div>
        </div>

        {/* Narrative & Anti-Hunt Rationale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Sniper Narrative & Order Flow
            </span>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{signal.sniperRationale}</p>
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Anti-Stop-Hunt Shield Protocol
            </span>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{signal.antiHuntRationale}</p>
          </div>
        </div>

        {/* Expandable 8-Step Confluence Checklist */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>
              {isExpanded ? 'Hide Confluence Teardown' : 'View 8-Step Confluence Protocol Checklist (8/8 Verified)'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onSelectForTeardown(signal)}
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            <span>Open in Terminal Analyzer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
            {signal.confluences.map((c) => (
              <div
                key={c.stepNumber}
                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                  {c.stepNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{c.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.2 rounded">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
