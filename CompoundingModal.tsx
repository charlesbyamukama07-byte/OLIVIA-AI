import React, { useState } from 'react';
import { X, Calculator, TrendingUp, DollarSign, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface CompoundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompoundingModal: React.FC<CompoundingModalProps> = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState<number>(500);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [slPips, setSlPips] = useState<number>(15);
  const [rrRatio, setRrRatio] = useState<number>(3.5);

  if (!isOpen) return null;

  // Pip value standard on EURUSD = $10 per 1 standard lot, so $1 per 0.1 mini lot, $0.10 per 0.01 micro lot.
  // Cash Risk = Balance * (RiskPercent / 100)
  // Lot Size = Cash Risk / (slPips * 10)
  const cashRisk = (balance * riskPercent) / 100;
  const rawLotSize = cashRisk / (slPips * 10);
  const lotSize = Math.max(0.01, Number(rawLotSize.toFixed(2)));

  const tpGain = cashRisk * rrRatio;
  const newBalanceOnWin = balance + tpGain;
  const newBalanceOnLoss = balance - cashRisk;

  // Generate 15-trade compounding projection
  const projectionTrades = [];
  let currentProjectedBalance = balance;
  for (let i = 1; i <= 15; i++) {
    const risk = (currentProjectedBalance * riskPercent) / 100;
    const gain = risk * rrRatio;
    currentProjectedBalance += gain;
    projectionTrades.push({
      tradeNum: i,
      startBal: currentProjectedBalance - gain,
      profit: gain,
      endBal: currentProjectedBalance,
      growthPct: ((currentProjectedBalance - balance) / balance) * 100,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Small Account Compounding Engine</h3>
              <p className="text-xs text-slate-400">Institutional Position Sizing & Exponential Growth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body - scrollable */}
        <div className="space-y-5 overflow-y-auto pr-1 my-4 flex-1">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Account Equity ($)
              </label>
              <input
                type="number"
                min={25}
                max={50000}
                step={25}
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Risk % ({riskPercent}%)
              </label>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.5}
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full accent-emerald-400 mt-2 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Stop Loss (Pips)
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={slPips}
                onChange={(e) => setSlPips(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Target R:R (1:{rrRatio})
              </label>
              <input
                type="number"
                min={1.5}
                max={10}
                step={0.5}
                value={rrRatio}
                onChange={(e) => setRrRatio(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Sizing Results Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Calculated Lot Size
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-0.5 block">
                {lotSize} Lots
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Micro lots</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Capital Risked
              </span>
              <span className="text-2xl font-black font-mono text-rose-400 mt-0.5 block">
                -${cashRisk.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{riskPercent}% of account</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Target Gain (1:{rrRatio})
              </span>
              <span className="text-2xl font-black font-mono text-emerald-300 mt-0.5 block">
                +${tpGain.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">
                +{(riskPercent * rrRatio).toFixed(1)}% ROI
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                New Balance
              </span>
              <span className="text-2xl font-black font-mono text-sky-400 mt-0.5 block">
                ${newBalanceOnWin.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Post-Take-Profit</span>
            </div>
          </div>

          {/* 15-Trade Exponential Compounding Projection Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                15-Trade Institutional Compounding Curve (At 1:{rrRatio} R:R)
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                15 Trades: ${(projectionTrades[14]?.endBal || 0).toFixed(2)} (+{(projectionTrades[14]?.growthPct || 0).toFixed(0)}%)
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Trade #</th>
                      <th className="p-2.5">Starting Balance</th>
                      <th className="p-2.5">Profit (TP)</th>
                      <th className="p-2.5">Ending Equity</th>
                      <th className="p-2.5 text-right">Net Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {projectionTrades.map((t) => (
                      <tr key={t.tradeNum} className="hover:bg-slate-800/40">
                        <td className="p-2 font-bold text-sky-400">Trade {t.tradeNum}</td>
                        <td className="p-2 text-slate-300">${t.startBal.toFixed(2)}</td>
                        <td className="p-2 text-emerald-400 font-bold">+${t.profit.toFixed(2)}</td>
                        <td className="p-2 text-white font-bold">${t.endBal.toFixed(2)}</td>
                        <td className="p-2 text-right text-emerald-400">+{t.growthPct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
