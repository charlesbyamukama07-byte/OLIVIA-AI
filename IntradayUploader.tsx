import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Zap, X, Sliders, Play, Sparkles, Layers } from 'lucide-react';
import { DEMO_PRESETS } from '../utils/presets';
import { optimizeChartImage } from '../utils/imageCompressor';

interface IntradayUploaderProps {
  onAnalyze: (payload: {
    mode: 'intraday';
    asset: string;
    accountBalance: number;
    riskPercentage: number;
    images: { timeframe: string; dataUrl: string }[];
    userNotes?: string;
  }) => void;
  isAnalyzing: boolean;
}

export const IntradayUploader: React.FC<IntradayUploaderProps> = ({ onAnalyze, isAnalyzing }) => {
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('M15');
  const [assetPair, setAssetPair] = useState<string>('EUR/USD');
  const [accountBalance, setAccountBalance] = useState<number>(500);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener (Ctrl+V from TradingView)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              if (event.target?.result) {
                const optimized = await optimizeChartImage(event.target.result as string);
                setChartImage(optimized);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const optimized = await optimizeChartImage(event.target.result as string);
          setChartImage(optimized);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const optimized = await optimizeChartImage(event.target.result as string);
          setChartImage(optimized);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadPreset = (presetIndex: number) => {
    const preset = DEMO_PRESETS[presetIndex];
    setAssetPair(preset.pair);
    setTimeframe(preset.timeframe);
    setUserNotes(preset.notes);
    setChartImage(preset.getChart());
  };

  const handleSubmit = () => {
    if (!chartImage) return;
    onAnalyze({
      mode: 'intraday',
      asset: assetPair,
      accountBalance,
      riskPercentage: riskPercent,
      images: [{ timeframe, dataUrl: chartImage }],
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
            Trading Pair
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
            <option value="AUTO">Auto-Detect from Chart</option>
          </select>
        </div>

        {/* Timeframe */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Execution Timeframe
          </label>
          <div className="grid grid-cols-4 gap-1">
            {['M1', 'M5', 'M15', 'H1'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Small Account Equity */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Account Equity ($)
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">Small Compounding</span>
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
      </div>

      {/* Preset SMC Chart Loader Shortcuts */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-mono text-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick SMC Preset Setups:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {DEMO_PRESETS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleLoadPreset(idx)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-sky-500/50 font-mono text-[11px] transition-all cursor-pointer"
            >
              ⚡ {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone & Preview Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => !chartImage && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all p-6 text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10'
            : chartImage
            ? 'border-slate-800 bg-slate-950 cursor-default'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {chartImage ? (
          <div className="space-y-4">
            <div className="relative inline-block max-w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl">
              <img
                src={chartImage}
                alt="Intraday Chart"
                className="max-h-96 w-auto object-contain mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setChartImage(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/90 hover:bg-rose-600 text-white border border-slate-700 transition-colors cursor-pointer"
                title="Remove chart"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-sky-300">
                {assetPair} [{timeframe}] Screenshot Loaded
              </div>
            </div>

            {/* Optional Context Notes */}
            <div className="max-w-md mx-auto text-left" onClick={(e) => e.stopPropagation()}>
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Trader Notes / Killzone Context (Optional)
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. London open sweep of Asian low, looking for M5 BOS"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Execute Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Executing 8-Step Confluence Protocol...' : 'Initiate Sniper Analysis'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mx-auto flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                Drop Chart Screenshot or <span className="text-sky-400 underline">Browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PNG, JPG, WebP. You can also press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-sky-300">Ctrl+V</kbd> to paste directly from TradingView.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-[11px] font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                Target: M15 / M5 Order Block Rapid Teardown
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
