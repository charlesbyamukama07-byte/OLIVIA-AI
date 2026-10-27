import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../utils/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredApiKey();
      setApiKey(current);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    onKeySaved(apiKey);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setStoredApiKey('');
    setApiKey('');
    onKeySaved('');
    setTestResult(null);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: 'Please enter a Gemini API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const start = Date.now();
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey.trim(),
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { ok: false, message: 'Server is warming up. Please try again.' };
      }
      const latency = Date.now() - start;

      if (data?.ok) {
        setTestResult({
          ok: true,
          message: `Authentication verified! Gemini Flash engine operational (${latency}ms ping).`,
        });
      } else {
        setTestResult({
          ok: false,
          message: data?.message || 'Key validation failed. Please check the key in Google AI Studio.',
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Connection error while testing key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gemini API Key Configuration</h3>
              <p className="text-xs text-slate-400">Olivia Institutional Sniper Engine Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter your Google Gemini API key to power Olivia&apos;s real-time multimodal chart vision and 8-step confluence calculations. Your key is stored securely in your browser&apos;s <code className="text-sky-300 font-mono">localStorage</code>.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span className="text-[11px] text-slate-500 font-normal">Stored permanently in browser</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-4 py-2.5 pr-20 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Clear key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 font-mono ${
                testResult.ok
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{testResult.message}</div>
            </div>
          )}

          {/* Security badge */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Zero-leakage protocol: Stored locally in your client storage. If you configured <code className="text-sky-300 font-mono">GEMINI_API_KEY</code> on your server environment, Olivia will automatically fall back to it.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || !apiKey.trim()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isTesting ? 'Pinging Engine...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
