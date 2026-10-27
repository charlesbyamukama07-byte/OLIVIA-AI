import { SMCSignal } from '../types/smc';

const STORAGE_KEY_API_KEY = 'olivia_gemini_api_key';
const STORAGE_KEY_SESSION_DATE = 'olivia_daily_session_date';
const STORAGE_KEY_SIGNALS = 'olivia_daily_session_signals';
const STORAGE_KEY_ARCHIVE = 'olivia_historical_archives';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  }
}

export function getSessionSignals(): { signals: SMCSignal[]; wasResetToday: boolean } {
  if (typeof window === 'undefined') return { signals: [], wasResetToday: false };

  const today = getTodayDateString();
  const storedDate = localStorage.getItem(STORAGE_KEY_SESSION_DATE);

  // If new day detected, archive past day and auto-reset daily session
  if (storedDate && storedDate !== today) {
    try {
      const oldSignalsRaw = localStorage.getItem(STORAGE_KEY_SIGNALS);
      if (oldSignalsRaw) {
        const oldSignals = JSON.parse(oldSignalsRaw);
        if (Array.isArray(oldSignals) && oldSignals.length > 0) {
          // Archive old session
          const pastArchivesRaw = localStorage.getItem(STORAGE_KEY_ARCHIVE) || '[]';
          const pastArchives = JSON.parse(pastArchivesRaw);
          pastArchives.unshift({ date: storedDate, count: oldSignals.length, signals: oldSignals });
          localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(pastArchives.slice(0, 30)));
        }
      }
    } catch (e) {
      console.error('Error archiving past session:', e);
    }

    // Reset for today
    localStorage.setItem(STORAGE_KEY_SESSION_DATE, today);
    localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify([]));
    return { signals: [], wasResetToday: true };
  }

  // Same day or initial setup
  if (!storedDate) {
    localStorage.setItem(STORAGE_KEY_SESSION_DATE, today);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SIGNALS);
    if (!raw) return { signals: [], wasResetToday: false };
    const parsed = JSON.parse(raw);
    return { signals: Array.isArray(parsed) ? parsed : [], wasResetToday: false };
  } catch (err) {
    console.error('Failed to parse session signals:', err);
    return { signals: [], wasResetToday: false };
  }
}

export function saveSessionSignal(signal: SMCSignal): SMCSignal[] {
  if (typeof window === 'undefined') return [signal];

  const { signals } = getSessionSignals();
  // Prevent duplicate by id
  const filtered = signals.filter((s) => s.id !== signal.id);
  const updated = [signal, ...filtered];

  localStorage.setItem(STORAGE_KEY_SESSION_DATE, getTodayDateString());
  localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(updated));
  return updated;
}

export function clearDailySession(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SESSION_DATE, getTodayDateString());
  localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify([]));
}

export function exportSessionToJSON(signals: SMCSignal[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(signals, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Olivia_AI_SMC_Session_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSessionToCSV(signals: SMCSignal[]): void {
  if (signals.length === 0) return;

  const headers = [
    'Date',
    'Time',
    'Asset',
    'Timeframe',
    'Mode',
    'Bias',
    'ConfidenceScore',
    'Grade',
    'Killzone',
    'OrderType',
    'EntryPrice',
    'StopLoss',
    'AntiHuntBufferPips',
    'TP1',
    'TP2',
    'TP3',
    'RiskRewardRatio',
    'SuggestedLotSize',
    'AccountRiskDollar',
  ];

  const rows = signals.map((s) => [
    s.dateString,
    new Date(s.createdAt).toLocaleTimeString(),
    `"${s.asset}"`,
    s.timeframe,
    s.mode,
    s.bias,
    s.confidenceScore,
    `"${s.grade}"`,
    `"${s.killzone}"`,
    s.orderType,
    s.entryPrice,
    s.stopLoss,
    s.antiHuntBufferPips,
    s.tp1,
    s.tp2,
    s.tp3,
    `"${s.riskRewardRatio}"`,
    s.smallAccountCompounding?.suggestedLotSize || '',
    s.smallAccountCompounding?.riskDollarAmount || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Olivia_AI_SMC_Session_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
