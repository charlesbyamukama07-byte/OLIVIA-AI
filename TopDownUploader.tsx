import React, { useState } from 'react';
import { Upload, X, Check, Zap, Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateSyntheticSMCChart } from '../utils/presets';
import { optimizeChartImage } from '../utils/imageCompressor';

interface TopDownUploaderProps {
  onAnalyze: (payload: {
    mode: 'top-down';
    asset: string;
    accountBalance: number;
    riskPercentage: number;
    images: { timeframe: string; dataUrl: string }[];
    userNotes?: string;
  }) => void;
  isAnalyzing: boolean;
}

interface TFSlotConfig {
  id: 'W1' | 'D1' | 'H4' | 'H1' | 'M30' | 'M15' | 'M5';
  name: string;
  role: string;
  weight: 'MACRO' | 'INTERMEDIATE' | 'EXECUTION';
}

const TIMEFRAME_SLOTS: TFSlotConfig[] = [
  { id: 'W1', name: 'Weekly', role: 'Macro Bias & Yearly Liquidity', weight: 'MACRO' },
  { id: 'D1', name: 'Daily', role: 'External Liquidity Pools & PDH/PDL', weight: 'MACRO' },
  { id: 'H4', name: '4-Hour', role: 'Swing Structure & Major OBs', weight: 'INTERMEDIATE' },
  { id: 'H1', name: '1-Hour', role: 'Fair Value Gaps & Session Flow', weight: 'INTERMEDIATE' },
  { id: 'M30', name: '30-Min', role: 'Dealing Range Equilibrium (0.50)', weight: 'INTERMEDIATE' },
  { id: 'M15', name: '15-Min', role: 'Internal Order Flow & MSS', weight: 'EXECUTION' },
  { id: 'M5', name: '5-Min', role: 'Sniper Trigger & Stop-Hunt Entry', weight: 'EXECUTION' },
];

export const TopDownUploader: React.FC<TopDownUploaderProps> = ({ onAnalyze, isAnalyzing }) => {
  const [slotImages, setSlotImages] = useState<Record<string, string>>({});
  const [assetPair, setAssetPair] = useState<string>('EUR/USD');
  const [accountBalance, setAccountBalance] = useState<number>(500);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [userNotes, setUserNotes] = useState<string>('');

  const loadedCount = Object.keys(slotImages).length;

  const handleFileUpload = (tf: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const optimized = await optimizeChartImage(e.target.result as string);
        setSlotImages((prev) => ({ ...prev, [tf]: optimized }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSlot = (tf: string) => {
    setSlotImages((prev) => {
      const next = { ...prev };
      delete next[tf];
      return next;
    });
  };

  const handleLoadDemoPackage = () => {
    setAssetPair('EUR/USD');
    setSlotImages({
      D1: generateSyntheticSMCChart('EUR/USD', 'Daily (D1)', 'BULLISH', 'MACRO DAILY EXPANSION TOWARDS 1.0950'),
      H4: generateSyntheticSMCChart('EUR/USD', '4-Hour (H4)', 'BULLISH', 'H4 BULLISH SWING STRUCTURE & BOS'),
      M15: generateSyntheticSMCChart('EUR/USD', '15-Min (M15)', 'BULLISH', 'M15 UNMITIGATED ORDER BLOCK MITIGATION'),
      M5: generateSyntheticSMCChart('EUR/USD', '5-Min (M5)', 'BULLISH', 'M5 DISPLACEMENT CANDLE & MSS TRIGGER'),
    });
    setUserNotes('EUR/USD London Open continuation. Daily bullish bias confirmed, waiting for M5 entry trigger.');
  };

  const handleSubmit = () => {
    if (loadedCount === 0) return;
    const imagesPayload = Object.entries(slotImages).map(([timeframe, dataUrl]) => ({
      timeframe,
      dataUrl,
    }));

    onAnalyze({
      mode: 'top-down',
      asset: assetPair,
      accountBalance,
      riskPercentage: riskPercent,
      images: imagesPayload,
      userNotes,
    });
  };

  return (
    <div className="space-y-5">
      {/* Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Asset Pair */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Trading Asset
          </label>
          <select
            value={assetPair}
            onChange={(e) => setAssetPair(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
          >
            <option value="EUR/USD">EUR/USD (Euro / US Dollar)</option>
            <option value="GBP/USD">GBP/USD (Pound / US Dollar)</option>
            <option value="XAU/USD">XAU/USD (Gold Sniper)</option>
            <option value="USD/JPY">USD/JPY (Dollar / Yen)</option>
            <option value="AUD/USD">AUD/USD (Aussie Dollar)</option>
            <option value="NAS100">NAS100 (Nasdaq E-mini)</option>
            <option value="US30">US30 (Dow Jones)</option>
            <option value="AUTO">Auto-Detect from Charts</option>
          </select>
        </div>

        {/* Small Account Equity */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Account Equity ($)
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">Compounding</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">$</span>
            <input
              type="number"
              min={25}
              max={100000}
              step={25}
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Risk Percentage */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Compounding Risk %
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">{riskPercent}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.5}
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0.5% (Safe)</span>
            <span>1.5% (Optimal)</span>
            <span>3% (Aggressive)</span>
          </div>
        </div>

        {/* Dynamic Partial Upload Status */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Loaded Timeframes
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold font-mono text-white">{loadedCount} / 7</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                loadedCount > 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {loadedCount > 0 ? 'Fractal Bridge Active' : 'Waiting for Charts'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {loadedCount === 0
              ? 'Upload any 1 to 7 timeframes'
              : `Analyzing: ${Object.keys(slotImages).join(', ')}`}
          </p>
        </div>
      </div>

      {/* Dynamic Partial Upload Banner */}
      <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-sky-300">
          <Layers className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Dynamic Multi-Timeframe Engine:</strong> If you only upload partial timeframes (e.g. Daily + M5), Olivia automatically adapts, bridging macro direction to micro execution triggers.
          </span>
        </div>
        <button
          type="button"
          onClick={handleLoadDemoPackage}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-mono text-xs font-semibold cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Load 4-Timeframe Demo (D1+H4+M15+M5)</span>
        </button>
      </div>

      {/* 7 Timeframe Upload Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {TIMEFRAME_SLOTS.map((slot) => {
          const hasImage = Boolean(slotImages[slot.id]);
          return (
            <div
              key={slot.id}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between h-44 relative overflow-hidden ${
                hasImage
                  ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-white text-base">{slot.id}</span>
                  <span className="text-[10px] text-slate-400 font-sans">({slot.name})</span>
                </div>
                {hasImage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Remove chart"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Slot Role */}
              <p className="text-[10px] text-slate-400 font-sans leading-tight mt-1 z-10">{slot.role}</p>

              {/* Center thumbnail or upload button */}
              <div className="my-auto py-1 z-10">
                {hasImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 h-16 group">
                    <img
                      src={slotImages[slot.id]}
                      alt={`${slot.id} chart`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        <Check className="w-2.5 h-2.5" /> Ready
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-16 rounded-lg border border-dashed border-slate-700 hover:border-sky-500 bg-slate-900/50 hover:bg-sky-500/5 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(slot.id, e.target.files[0])}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-sky-400" />
                    <span className="text-[10px] font-mono text-slate-400 mt-1">Upload {slot.id}</span>
                  </label>
                )}
              </div>

              {/* Weight indicator bottom */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-850 pt-1 z-10">
                <span>{slot.weight}</span>
                <span className={hasImage ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {hasImage ? 'ACTIVE' : 'OPTIONAL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Notes */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
        <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
          Macro Context / High-Impact News Awareness (Optional)
        </label>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="e.g. FOMC high impact today at 14:00, Daily liquidity swept at 1.0820"
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Action CTA */}
      <div className="text-center pt-2">
        <button
          type="button"
          disabled={isAnalyzing || loadedCount === 0}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2.5 px-9 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-sky-500/20 cursor-pointer disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>
            {isAnalyzing
              ? `Synthesizing ${loadedCount} Timeframes with Fractal Protocol...`
              : `Execute Top-Down Analysis (${loadedCount} Timeframes Loaded)`}
          </span>
        </button>
      </div>
    </div>
  );
};
