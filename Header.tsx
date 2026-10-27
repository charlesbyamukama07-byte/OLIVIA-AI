import React, { useState, useEffect } from 'react';
import { Shield, Volume2, Key, Calculator, Clock, Activity, Sparkles, VolumeX, FolderGit2 } from 'lucide-react';
import { VoiceState, speechEngine } from '../utils/speech';

interface HeaderProps {
  onOpenApiKey: () => void;
  onOpenCompounding: () => void;
  onOpenZipExporter: () => void;
  hasStoredKey: boolean;
  voiceState: VoiceState;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApiKey,
  onOpenCompounding,
  onOpenZipExporter,
  hasStoredKey,
  voiceState,
}) => {
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [timeEst, setTimeEst] = useState<string>('');
  const [activeSession, setActiveSession] = useState<{ name: string; killzone: boolean }>({
    name: 'London / NY Overlap',
    killzone: true,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(
        now.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC'
      );
      setTimeEst(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }) + ' EST'
      );

      // Institutional Killzone calculation based on EST
      const estHours = now.getUTCHours() - 5;
      const normalizedEst = (estHours + 24) % 24;

      if (normalizedEst >= 2 && normalizedEst < 5) {
        setActiveSession({ name: 'London Open Killzone', killzone: true });
      } else if (normalizedEst >= 7 && normalizedEst < 10) {
        setActiveSession({ name: 'New York AM Killzone', killzone: true });
      } else if (normalizedEst >= 10 && normalizedEst < 12) {
        setActiveSession({ name: 'London Close Killzone', killzone: true });
      } else if (normalizedEst >= 19 || normalizedEst < 0) {
        setActiveSession({ name: 'Asian Session (Liquidity Build)', killzone: false });
      } else {
        setActiveSession({ name: 'Interbank Dealing Session', killzone: false });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 via-blue-600/30 to-indigo-900/40 border border-sky-500/40 shadow-lg shadow-sky-500/10">
            <Shield className="w-6 h-6 text-sky-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Olivia AI
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-400 tracking-wider uppercase font-mono">
                  SMC Terminal v2.5
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Institutional Sniper Terminal — Smart Money Market Analysis & High-Precision Execution
            </p>
          </div>
        </div>

        {/* Live Session Radar & Clocks */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Killzone Radar */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <Activity className={`w-3.5 h-3.5 ${activeSession.killzone ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400">SESSION:</span>
            <span className={`font-semibold ${activeSession.killzone ? 'text-emerald-300' : 'text-amber-300'}`}>
              {activeSession.name}
            </span>
          </div>

          {/* Time badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-sky-300 font-bold">{timeUtc}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{timeEst}</span>
          </div>

          {/* Voice indicator */}
          {voiceState.isSpeaking && (
            <div
              onClick={() => speechEngine.stop()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-mono cursor-pointer hover:bg-sky-500/25 transition-all shadow-sm"
              title="Click to silence Olivia"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-full bg-sky-400 animate-pulse"></span>
                <span className="w-0.5 h-2 bg-sky-400 animate-pulse delay-75"></span>
                <span className="w-0.5 h-3 bg-sky-400 animate-pulse delay-150"></span>
              </div>
              <span className="font-semibold">Olivia Speaking</span>
              <VolumeX className="w-3 h-3 ml-1 text-slate-400" />
            </div>
          )}

          {/* Compounding Calculator Trigger */}
          <button
            onClick={onOpenCompounding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compounding Calc</span>
          </button>

          {/* GitHub Project ZIP Exporter Trigger */}
          <button
            onClick={onOpenZipExporter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-400 text-sky-300 text-xs font-medium transition-all shadow-sm cursor-pointer"
            title="Download full project ZIP bundle for GitHub deployment"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Export ZIP (GitHub)</span>
          </button>

          {/* API Key Config Button */}
          <button
            onClick={onOpenApiKey}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm cursor-pointer border ${
              hasStoredKey
                ? 'bg-slate-900 hover:bg-slate-800 border-emerald-500/40 text-emerald-300'
                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 border-sky-400 text-white font-semibold'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasStoredKey ? 'API Key Active' : 'Configure API Key'}</span>
            {hasStoredKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
          </button>
        </div>
      </div>
    </header>
  );
};
