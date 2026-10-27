import { SMCSignal } from '../types/smc';

// Helper to create synthetic high-detail SMC chart SVG data URL for instant testing
export function generateSyntheticSMCChart(
  pair: string,
  timeframe: string,
  bias: 'BULLISH' | 'BEARISH',
  notes: string
): string {
  const isBull = bias === 'BULLISH';
  const mainColor = isBull ? '#22c55e' : '#f87171';
  const obColor = isBull ? 'rgba(34, 197, 94, 0.25)' : 'rgba(248, 113, 113, 0.25)';
  const obBorder = isBull ? '#22c55e' : '#ef4444';
  const fvgColor = 'rgba(56, 189, 248, 0.2)';
  const fvgBorder = '#38bdf8';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="500" viewBox="0 0 900 500" style="background:#0b1120; font-family: ui-monospace, monospace;">
    <!-- Grid -->
    <defs>
      <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.8" opacity="0.6"/>
      </pattern>
      <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="900" height="500" fill="url(#grid)" />

    <!-- Terminal Header on Chart -->
    <rect x="20" y="15" width="860" height="40" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <text x="35" y="40" fill="#38bdf8" font-size="14" font-weight="bold">● OLIVIA TERMINAL // ${pair} [${timeframe}]</text>
    <text x="320" y="40" fill="${mainColor}" font-size="13" font-weight="bold">BIAS: ${bias} [INSTITUTIONAL ORDER FLOW]</text>
    <text x="700" y="40" fill="#94a3b8" font-size="12">SMC CONFLUENCE ENGINE</text>

    <!-- Liquidity Sweep Zone High -->
    <line x1="100" y1="120" x2="800" y2="120" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4" />
    <text x="810" y="125" fill="#f59e0b" font-size="11">BSL (Buy-Side Liquidity)</text>

    <!-- Liquidity Sweep Zone Low -->
    <line x1="80" y1="380" x2="800" y2="380" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4" />
    <text x="810" y="385" fill="#f59e0b" font-size="11">SSL (Sell-Side Liquidity)</text>

    <!-- Candlestick sequence illustrating SMC dynamics -->
    <!-- Swing Phase 1 -->
    <line x1="90" y1="200" x2="90" y2="280" stroke="#ef4444" stroke-width="1.5"/>
    <rect x="85" y="220" width="10" height="45" fill="#ef4444"/>

    <line x1="120" y1="240" x2="120" y2="310" stroke="#ef4444" stroke-width="1.5"/>
    <rect x="115" y="250" width="10" height="50" fill="#ef4444"/>

    <!-- Sweep of SSL Low -->
    <line x1="150" y1="280" x2="150" y2="395" stroke="#ef4444" stroke-width="2"/>
    <rect x="145" y="300" width="10" height="40" fill="#ef4444"/>
    <circle cx="150" cy="395" r="5" fill="#ef4444"/>
    <text x="165" y="415" fill="#ef4444" font-size="11" font-weight="bold">▲ LIQUIDITY SWEEP (ASIAN LOWS)</text>

    <!-- Order Block (OB) Zone -->
    <rect x="190" y="${isBull ? '310' : '150'}" width="380" height="45" fill="${obColor}" stroke="${obBorder}" stroke-width="1.5" stroke-dasharray="2 2" rx="4"/>
    <text x="200" y="${isBull ? '335' : '175'}" fill="${mainColor}" font-size="12" font-weight="bold">+OB (Unmitigated Institutional Order Block)</text>

    <!-- FVG Inefficiency Zone -->
    <rect x="270" y="230" width="220" height="40" fill="${fvgColor}" stroke="${fvgBorder}" stroke-width="1" rx="3"/>
    <text x="280" y="255" fill="#38bdf8" font-size="11" font-weight="bold">+FVG (Fair Value Gap / BPR)</text>

    <!-- Strong Displacement Candles (MSS / BOS) -->
    <line x1="180" y1="310" x2="180" y2="385" stroke="#22c55e" stroke-width="1.5"/>
    <rect x="175" y="315" width="10" height="60" fill="#22c55e"/>

    <line x1="210" y1="260" x2="210" y2="340" stroke="#22c55e" stroke-width="2"/>
    <rect x="205" y="270" width="10" height="55" fill="#22c55e"/>

    <line x1="240" y1="210" x2="240" y2="280" stroke="#22c55e" stroke-width="2"/>
    <rect x="235" y="215" width="10" height="60" fill="#22c55e"/>

    <!-- Break of Structure (BOS / CHoCH) Line -->
    <line x1="170" y1="215" x2="360" y2="215" stroke="#38bdf8" stroke-width="2"/>
    <text x="370" y="218" fill="#38bdf8" font-size="12" font-weight="bold">BOS / CHoCH (Market Structure Shift)</text>

    <!-- Pullback into Discount OTE / OB -->
    <line x1="280" y1="200" x2="280" y2="250" stroke="#ef4444" stroke-width="1.5"/>
    <rect x="275" y="210" width="10" height="30" fill="#ef4444"/>

    <line x1="310" y1="230" x2="310" y2="290" stroke="#ef4444" stroke-width="1.5"/>
    <rect x="305" y="240" width="10" height="40" fill="#ef4444"/>

    <!-- Mitigation Entry Candle -->
    <line x1="340" y1="270" x2="340" y2="${isBull ? '325' : '160'}" stroke="#22c55e" stroke-width="2"/>
    <rect x="335" y="${isBull ? '280' : '170'}" width="10" height="40" fill="#22c55e"/>
    <circle cx="340" cy="${isBull ? '320' : '165'}" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
    
    <!-- Sniper Entry Label -->
    <rect x="360" y="${isBull ? '305' : '150'}" width="180" height="30" rx="4" fill="#0369a1" stroke="#38bdf8" stroke-width="1"/>
    <text x="370" y="${isBull ? '325' : '170'}" fill="#ffffff" font-size="11" font-weight="bold">⚡ SNIPER ENTRY TRIGGER</text>

    <!-- Anti-Stop-Hunt Buffer Demonstration -->
    <line x1="130" y1="410" x2="390" y2="410" stroke="#f87171" stroke-width="2" stroke-dasharray="6 3"/>
    <text x="140" y="430" fill="#f87171" font-size="11" font-weight="bold">🛡️ ANTI-HUNT STOP LOSS (-5 PIPS ATR BUFFER)</text>

    <!-- Projection Arrow to TP Targets -->
    <path d="M 350 ${isBull ? '280' : '180'} Q 450 ${isBull ? '160' : '320'} 600 ${isBull ? '110' : '390'}" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="4 2"/>
    
    <!-- TP1 / TP2 / TP3 Flags -->
    <rect x="610" y="170" width="130" height="26" rx="4" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
    <text x="620" y="187" fill="#86efac" font-size="11" font-weight="bold">TP1: 1:2 R:R (50%)</text>

    <rect x="610" y="135" width="130" height="26" rx="4" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
    <text x="620" y="152" fill="#86efac" font-size="11" font-weight="bold">TP2: 1:3.5 R:R (30%)</text>

    <rect x="610" y="100" width="145" height="26" rx="4" fill="#166534" stroke="#4ade80" stroke-width="1.5"/>
    <text x="620" y="117" fill="#bbf7d0" font-size="11" font-weight="bold">TP3: 1:5+ R:R (RUNNER)</text>

    <!-- Bottom Institutional Watermark -->
    <text x="25" y="480" fill="#64748b" font-size="11">OLIVIA AI // SMART MONEY INSTITUTIONAL ALGORITHM // 8-STEP CONFLUENCE VALIDATED</text>
    <text x="680" y="480" fill="#38bdf8" font-size="11">${notes}</text>
  </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// Signal of the Day Pre-configured Institutional Setup (94% confidence)
export const DEFAULT_SIGNAL_OF_THE_DAY: SMCSignal = {
  id: 'sotd_eurusd_sniper_daily',
  createdAt: new Date().toISOString(),
  dateString: new Date().toISOString().split('T')[0],
  asset: 'EUR/USD',
  timeframe: 'M15',
  mode: 'intraday',
  bias: 'BULLISH',
  confidenceScore: 94,
  grade: 'A+ Institutional Sniper',
  killzone: 'London Open Killzone (07:00 - 10:00 UTC)',
  orderType: 'BUY LIMIT',
  entryPrice: '1.08420',
  stopLoss: '1.08270',
  antiHuntBufferPips: 5,
  antiHuntRationale: 'Placed 5 pips below the Asian range sweep low (1.08320) and structural M15 Order Block origin, insulating the position against secondary broker spread expansion and stop-runs.',
  tp1: '1.08720',
  tp2: '1.08950',
  tp3: '1.09200',
  riskRewardRatio: '1:5.2',
  confluences: [
    {
      stepNumber: 1,
      name: 'Market Structure (BOS / CHoCH)',
      category: 'Structure',
      status: 'CONFIRMED',
      details: 'Clean H4 bullish order flow with M15 Change of Character (CHoCH) printing at 1.08550 with displacement.',
      weight: 'CRITICAL',
    },
    {
      stepNumber: 2,
      name: 'Supply & Demand Order Blocks',
      category: 'Supply & Demand',
      status: 'CONFIRMED',
      details: 'Unmitigated M15 Bullish Order Block situated at 1.08380-1.08420 with high volume institutional sponsoring wick.',
      weight: 'CRITICAL',
    },
    {
      stepNumber: 3,
      name: 'Fair Value Gap (FVG / BPR)',
      category: 'Fair Value Gap',
      status: 'CONFIRMED',
      details: 'Clear 3-candle imbalance (FVG) from 1.08440 to 1.08490 aligned with 50% equilibrium discount.',
      weight: 'HIGH',
    },
    {
      stepNumber: 4,
      name: 'Liquidity Sweeps (BSL / SSL)',
      category: 'Liquidity',
      status: 'CONFIRMED',
      details: 'London open violently swept Asian Session Lows (SSL) purging retail breakout stops prior to reversal.',
      weight: 'CRITICAL',
    },
    {
      stepNumber: 5,
      name: 'Premium vs. Discount Pricing',
      category: 'Pricing',
      status: 'CONFIRMED',
      details: 'Entry sits at 0.705 Optimal Trade Entry (OTE) Fib retracement, well below the 0.50 dealing range equilibrium.',
      weight: 'HIGH',
    },
    {
      stepNumber: 6,
      name: 'Entry Triggers (LTF MSS)',
      category: 'Triggers',
      status: 'CONFIRMED',
      details: 'M5 bullish displacement with 3 consecutive high-volume green candles leaving inverted FVG support.',
      weight: 'HIGH',
    },
    {
      stepNumber: 7,
      name: 'Volume & Institutional Exhaustion',
      category: 'Volume/ADR',
      status: 'CONFIRMED',
      details: 'ADR (Average Daily Range) is at only 28% capacity, leaving 72% headroom for full London/NY expansion.',
      weight: 'MODERATE',
    },
    {
      stepNumber: 8,
      name: 'Killzones & Timing',
      category: 'Killzones',
      status: 'CONFIRMED',
      details: 'Setup matured at 02:45 EST, perfectly inside the Frankfurt-to-London Open algorithmic injection window.',
      weight: 'CRITICAL',
    },
  ],
  smallAccountCompounding: {
    accountBalance: 500,
    riskPercent: 1.5,
    riskDollarAmount: 7.50,
    suggestedLotSize: 0.05,
    stopLossPips: 15,
    tp1DollarGain: 15.00,
    tp2DollarGain: 26.50,
    tp3DollarGain: 39.00,
    growthCompoundingNote: 'A 1.5% disciplined risk on $500 targets +$39.00 (7.8% net account growth) with zero overnight swap risk.',
  },
  sniperRationale: 'High-conviction London institutional sweep. The liquidity purge below Asian session low collected sell-stops, rapidly reclaimed by an aggressive institutional candle. The unmitigated M15 Order Block at 1.08420 offers an elite risk-to-reward ratio of 1:5.2 targeting equal highs at 1.09200.',
  voiceScript: 'Greetings sniper. This is Olivia. Signal of the day is EUR/USD Bullish. We have an institutional liquidity sweep into our unmitigated M15 order block. Enter Buy Limit at 1.08420, with an anti-hunt protected stop loss at 1.08270. Targets are 1.08720 for TP1, 1.08950 for TP2, and 1.09200 for full runner expansion. Compounding conviction: ninety-four percent.',
};

// Preset demo chart scenarios for 1-click user testing
export const DEMO_PRESETS = [
  {
    name: 'EUR/USD London Sweep (Bullish)',
    pair: 'EUR/USD',
    timeframe: 'M15',
    bias: 'BULLISH' as const,
    notes: 'London Open Asian Low Sweep // OTE 0.705',
    getChart: () => generateSyntheticSMCChart('EUR/USD', 'M15', 'BULLISH', 'LONDON KILLZONE SSL PURGE'),
  },
  {
    name: 'XAU/USD Gold NY Killzone (Bearish)',
    pair: 'XAU/USD',
    timeframe: 'M5',
    bias: 'BEARISH' as const,
    notes: 'NY AM Open Premium Rejection // Bearish FVG',
    getChart: () => generateSyntheticSMCChart('XAU/USD', 'M5', 'BEARISH', 'NY OPEN PREMIUM BSL PURGE'),
  },
  {
    name: 'GBP/JPY H4/M15 Trend Continuation',
    pair: 'GBP/JPY',
    timeframe: 'M15',
    bias: 'BULLISH' as const,
    notes: 'H4 Bullish Structure // M15 Mitigation OB',
    getChart: () => generateSyntheticSMCChart('GBP/JPY', 'M15', 'BULLISH', 'DISCOUNT MITIGATION RE-TEST'),
  },
];
