import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SignalOfTheDay } from './components/SignalOfTheDay';
import { IntradayUploader } from './components/IntradayUploader';
import { TopDownUploader } from './components/TopDownUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { SessionHistory } from './components/SessionHistory';
import { CompoundingModal } from './components/CompoundingModal';
import { ProjectZipExporterModal } from './components/ProjectZipExporterModal';
import { SMCSignal } from './types/smc';
import { DEFAULT_SIGNAL_OF_THE_DAY } from './utils/presets';
import {
  getStoredApiKey,
  getSessionSignals,
  saveSessionSignal,
  clearDailySession,
  getTodayDateString,
} from './utils/storage';
import { VoiceState, speechEngine } from './utils/speech';
import {
  Zap,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  History,
  ShieldAlert,
  FolderGit2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'intraday' | 'top-down' | 'history'>('intraday');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [compoundingModalOpen, setCompoundingModalOpen] = useState(false);
  const [zipExporterModalOpen, setZipExporterModalOpen] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isSpeaking: false,
    isPaused: false,
    activeText: '',
  });

  const [sessionSignals, setSessionSignals] = useState<SMCSignal[]>([]);
  const [activeSignal, setActiveSignal] = useState<SMCSignal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStepProgress, setAnalysisStepProgress] = useState<string>('');
  const [todayDateStr, setTodayDateStr] = useState<string>('');

  // Initial load
  useEffect(() => {
    const key = getStoredApiKey();
    setHasStoredKey(Boolean(key));

    const today = getTodayDateString();
    setTodayDateStr(today);

    const { signals } = getSessionSignals();
    setSessionSignals(signals);

    // Subscribe to voice synthesis state
    const unsubscribe = speechEngine.subscribe((state) => {
      setVoiceState(state);
    });

    return () => {
      unsubscribe();
      speechEngine.stop();
    };
  }, []);

  // Periodic date check to ensure auto-reset at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateString();
      if (today !== todayDateStr) {
        setTodayDateStr(today);
        const { signals } = getSessionSignals();
        setSessionSignals(signals);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayDateStr]);

  const handleLogSignal = (signal: SMCSignal) => {
    const updated = saveSessionSignal(signal);
    setSessionSignals(updated);
  };

  const handleClearSession = () => {
    clearDailySession();
    setSessionSignals([]);
  };

  const handleExecuteAnalysis = async (payload: {
    mode: 'intraday' | 'top-down';
    asset: string;
    accountBalance: number;
    riskPercentage: number;
    images: { timeframe: string; dataUrl: string }[];
    userNotes?: string;
  }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStepProgress('Initializing Multimodal Vision & SMC Order Flow Parser...');

    // Progress simulation steps for high-frequency institutional feel
    const stepMessages = [
      'Scanning High-Timeframe Market Structure (BOS / CHoCH)...',
      'Mapping Unmitigated Institutional Order Blocks & Breaker Blocks...',
      'Locating Fair Value Gaps (FVG) and Balanced Price Ranges...',
      'Calculating Buy-Side & Sell-Side Liquidity Sweeps...',
      'Assessing Dealing Range Equilibrium & 0.705 OTE Discount...',
      'Enforcing Anti-Stop-Hunt Protocol (Adding ATR Volatility Buffer)...',
      'Synthesizing Small Account Compounding Coordinates & Sizing...',
    ];

    let stepIdx = 0;
    const progressTimer = setInterval(() => {
      if (stepIdx < stepMessages.length) {
        setAnalysisStepProgress(stepMessages[stepIdx]);
        stepIdx++;
      }
    }, 900);

    try {
      const storedKey = getStoredApiKey();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': storedKey,
        },
        body: JSON.stringify(payload),
      });

      clearInterval(progressTimer);

      const rawText = await res.text();
      let responseData: any;
      try {
        responseData = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn('Non-JSON response received:', rawText.slice(0, 200));
        if (rawText.includes('<!doctype') || rawText.includes('<html') || rawText.includes('warmup')) {
          throw new Error(
            'The institutional analysis engine is warming up. Please click "Initiate Sniper Analysis" again to complete analysis.'
          );
        }
        throw new Error(`Unexpected server response: ${rawText.slice(0, 100)}`);
      }

      if (!res.ok || responseData?.error) {
        if (responseData?.error === 'API_KEY_REQUIRED') {
          setApiKeyModalOpen(true);
          throw new Error(
            'Gemini API Key required. Please configure and save your API key in the terminal configuration panel.'
          );
        }
        throw new Error(responseData?.message || 'Institutional analysis failed. Check chart clarity or server connection.');
      }

      const signalResult: SMCSignal = responseData;
      setActiveSignal(signalResult);
      handleLogSignal(signalResult);

      // Auto-trigger speech summary for elite trader experience
      if (signalResult.voiceScript) {
        speechEngine.speak(signalResult.voiceScript);
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('Analysis execution error:', err);
      setAnalysisError(err.message || 'An error occurred during institutional analysis.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStepProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Institutional Sniper Terminal Header */}
      <Header
        onOpenApiKey={() => setApiKeyModalOpen(true)}
        onOpenCompounding={() => setCompoundingModalOpen(true)}
        onOpenZipExporter={() => setZipExporterModalOpen(true)}
        hasStoredKey={hasStoredKey}
        voiceState={voiceState}
      />

      {/* Main Terminal Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Signal of the Day Institutional Showcase */}
        <SignalOfTheDay
          signal={DEFAULT_SIGNAL_OF_THE_DAY}
          onLogSignal={handleLogSignal}
          voiceState={voiceState}
          onSelectForTeardown={(sig) => {
            setActiveSignal(sig);
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }}
        />

        {/* Mode Selector Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('intraday')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'intraday'
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Intraday Analysis Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('top-down')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'top-down'
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Top-Down Multi-Timeframe Mode (7 Timeframes)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Daily Session Logs ({sessionSignals.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Gemini 3.8/2.5 Flash Confluence Engine</span>
          </div>
        </div>

        {/* Error Notification Banner */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold">Execution Notice: </strong>
              {analysisError}
            </div>
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(true)}
              className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-500/40 text-[11px] font-bold text-white transition-colors cursor-pointer"
            >
              Open Settings
            </button>
          </div>
        )}

        {/* Active Analysis HUD overlay */}
        {isAnalyzing && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-sky-500/40 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Cpu className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-white tracking-wide">
                  OLIVIA AI SNIPER ENGINE AT WORK
                </h4>
                <p className="text-xs text-sky-400 font-mono mt-0.5 animate-pulse">
                  {analysisStepProgress}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 animate-[pulse_1.5s_infinite] w-full"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 8-Step Confluence
              </span>
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-emerald-400" /> Anti-Stop-Hunt ATR Buffer
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Small Compounding Sizing
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Temperature: 0.2
              </span>
            </div>
          </div>
        )}

        {/* Active Tab View */}
        {activeTab === 'intraday' && (
          <IntradayUploader onAnalyze={handleExecuteAnalysis} isAnalyzing={isAnalyzing} />
        )}

        {activeTab === 'top-down' && (
          <TopDownUploader onAnalyze={handleExecuteAnalysis} isAnalyzing={isAnalyzing} />
        )}

        {activeTab === 'history' && (
          <SessionHistory
            signals={sessionSignals}
            onClearSession={handleClearSession}
            onSelectSignal={(sig) => {
              setActiveSignal(sig);
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            todayDateString={todayDateStr}
          />
        )}

        {/* Active Analysis Results Display */}
        {activeSignal && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black font-mono text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span>Teardown Analysis // {activeSignal.asset} [{activeSignal.timeframe}]</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Setup ID: {activeSignal.id}
              </span>
            </div>
            <AnalysisResults
              signal={activeSignal}
              onLogSignal={handleLogSignal}
              voiceState={voiceState}
              onReset={() => setActiveSignal(null)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center text-xs font-mono text-slate-500">
          <p>Olivia AI — Institutional Sniper Terminal // Smart Money Concepts Algorithm</p>
          <p className="mt-1 sm:mt-0">Anti-Stop-Hunt Shield • 8-Step Confluence Protocol • Daily Auto-Reset</p>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={(key) => setHasStoredKey(Boolean(key))}
      />

      <CompoundingModal
        isOpen={compoundingModalOpen}
        onClose={() => setCompoundingModalOpen(false)}
      />

      <ProjectZipExporterModal
        isOpen={zipExporterModalOpen}
        onClose={() => setZipExporterModalOpen(false)}
      />
    </div>
  );
}
