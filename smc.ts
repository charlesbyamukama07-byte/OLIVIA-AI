export type BiasType = 'BULLISH' | 'BEARISH' | 'NEUTRAL_WAIT';

export type SignalGrade = 'A+ Institutional Sniper' | 'A High Conviction' | 'B Moderate' | 'No Trade / Invalidation';

export type ConfluenceStatus = 'CONFIRMED' | 'PARTIAL' | 'INVALIDATED' | 'NOT_OBSERVED';

export interface SMCConfluenceStep {
  stepNumber: number;
  name: string;
  category: 'Structure' | 'Supply & Demand' | 'Fair Value Gap' | 'Liquidity' | 'Pricing' | 'Triggers' | 'Volume/ADR' | 'Killzones';
  status: ConfluenceStatus;
  details: string;
  weight: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export interface SmallAccountCompounding {
  accountBalance: number;
  riskPercent: number;
  riskDollarAmount: number;
  suggestedLotSize: number;
  stopLossPips: number;
  tp1DollarGain: number;
  tp2DollarGain: number;
  tp3DollarGain: number;
  growthCompoundingNote: string;
}

export interface SMCSignal {
  id: string;
  createdAt: string; // ISO date string
  dateString: string; // YYYY-MM-DD
  asset: string;
  timeframe: string;
  mode: 'intraday' | 'top-down';
  bias: BiasType;
  confidenceScore: number; // 0 - 100
  grade: SignalGrade;
  killzone: string;
  orderType: 'BUY LIMIT' | 'SELL LIMIT' | 'BUY STOP' | 'SELL STOP' | 'MARKET EXECUTION';
  entryPrice: string;
  stopLoss: string;
  antiHuntBufferPips: number;
  antiHuntRationale: string;
  tp1: string;
  tp2: string;
  tp3: string;
  riskRewardRatio: string;
  confluences: SMCConfluenceStep[];
  smallAccountCompounding: SmallAccountCompounding;
  sniperRationale: string;
  voiceScript: string;
  timeframesAnalyzed?: string[];
  chartPreview?: string; // thumbnail data URL or placeholder
}

export interface TimeframeSlot {
  id: 'W1' | 'D1' | 'H4' | 'H1' | 'M30' | 'M15' | 'M5';
  label: string;
  role: string;
  image: string | null;
  fileName?: string;
}

export interface AnalysisRequestPayload {
  mode: 'intraday' | 'top-down';
  asset?: string;
  accountBalance: number;
  riskPercentage: number;
  images: {
    timeframe: string;
    dataUrl: string;
  }[];
  userNotes?: string;
}

export interface HistorySession {
  date: string; // YYYY-MM-DD
  signals: SMCSignal[];
}
