import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(clientApiKey?: string): GoogleGenAI {
  const key = clientApiKey || process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    throw new Error('MISSING_API_KEY: No Gemini API Key configured in server environment or client header.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Generate with intelligent model fallback (tries gemini-3.8-flash, falls back immediately to gemini-3.1-flash-lite on 503/429/timeout)
async function generateWithModelFallback(
  ai: GoogleGenAI,
  requestParams: any
): Promise<any> {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Olivia AI Engine] Querying model: ${model}...`);
      const response = await ai.models.generateContent({
        ...requestParams,
        model,
      });
      console.log(`[Olivia AI Engine] Model ${model} responded successfully.`);
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      const isOverloaded = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('429');
      console.warn(`[Olivia AI Engine] Model ${model} encountered issue (${msg}). Overloaded/Unavailable: ${isOverloaded}`);
      // Continue to next model if overloaded or failed
    }
  }

  throw lastError;
}

// API Health / Config check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    hasEnvKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    terminal: 'Olivia AI — Institutional Sniper Terminal',
    time: new Date().toISOString(),
  });
});

// Export all source files for client-side JSZip packaging
app.get('/api/project-files', (req, res) => {
  try {
    const rootDir = process.cwd();
    const ignoredDirs = new Set(['node_modules', '.git', 'dist', '.vite', '.aistudio']);
    const ignoredFiles = new Set(['.DS_Store', 'package-lock.json', 'bun.lock']);
    const files: Record<string, string> = {};

    function scanDir(dirPath: string, relPath = '') {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (ignoredDirs.has(item) || ignoredFiles.has(item)) continue;
        const fullPath = path.join(dirPath, item);
        const itemRel = relPath ? `${relPath}/${item}` : item;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath, itemRel);
        } else if (stat.isFile()) {
          // Avoid huge binary files
          if (stat.size > 2 * 1024 * 1024) continue;
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            files[itemRel] = content;
          } catch {
            // skip binary
          }
        }
      }
    }

    scanDir(rootDir);
    res.json({ ok: true, files });
  } catch (err: any) {
    console.error('Error bundling project files:', err);
    res.json({ ok: false, message: err?.message || 'Failed to read project files', files: {} });
  }
});

// Test API Key endpoint
app.post('/api/test-key', async (req, res) => {
  try {
    const customKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
    const ai = getGenAIClient(customKey);
    const response = await generateWithModelFallback(ai, {
      contents: 'Respond with exactly: PING_OK',
    });
    res.json({
      ok: true,
      message: 'Gemini API key verified and operational.',
      result: response.text?.trim() || 'PING_OK',
    });
  } catch (error: any) {
    console.error('Test key failed:', error);
    // Return 200 with ok: false so Nginx proxy never intercepts with /warmup.html
    res.json({
      ok: false,
      message: error?.message || 'Failed to authenticate with Gemini API key',
    });
  }
});

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { mode, asset, accountBalance = 500, riskPercentage = 1.5, images = [], userNotes } = req.body;
    const clientKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;

    let ai: GoogleGenAI;
    try {
      ai = getGenAIClient(clientKey);
    } catch (e: any) {
      return res.json({
        error: 'API_KEY_REQUIRED',
        message: 'Gemini API Key is missing. Please save your API key in the terminal configuration panel.',
      });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.json({
        error: 'NO_IMAGES_PROVIDED',
        message: 'Please provide at least one chart screenshot to execute SMC institutional analysis.',
      });
    }

    // Build multimodal parts
    const parts: any[] = [];

    images.forEach((img: { timeframe: string; dataUrl: string }, index: number) => {
      if (img.dataUrl && img.dataUrl.includes(',')) {
        const [header, base64Data] = img.dataUrl.split(',');
        const mimeMatch = header.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
        parts.push({
          text: `[CHART SCREENSHOT #${index + 1} - TIMEFRAME: ${img.timeframe.toUpperCase()}]`,
        });
      }
    });

    const analysisPrompt = `
You are OLIVIA AI, an elite institutional Smart Money Concepts (SMC) Forex & Indices sniper analyst. You specialize in high-precision order flow execution optimized for rapid, consistent compounding of small accounts ($50 - $1,000+).

TASK:
Perform a comprehensive institutional analysis of the uploaded chart screenshot(s).
Mode: ${mode === 'top-down' ? 'TOP-DOWN MULTI-TIMEFRAME ANALYSIS' : 'RAPID INTRADAY SNIPER EXECUTION'}.
Identified Asset Pair: ${asset || 'Auto-detect from chart (e.g. EURUSD, GBPUSD, XAUUSD, US30, NAS100)'}.
User Account Equity: $${accountBalance}.
Planned Risk: ${riskPercentage}%.
User Notes / Context: ${userNotes || 'None provided'}.

MANDATORY PROTOCOLS TO ENFORCE:

1. THE 8-STEP CONFLUENCE PROTOCOL:
   You must rigorously evaluate all 8 institutional confluences:
   - Step 1: Market Structure (HTF Trend, BOS - Break of Structure, CHoCH - Change of Character, Internal vs External swing structure).
   - Step 2: Supply & Demand Order Blocks (Identify the exact institutional sponsoring order block, breaker block, or mitigation block. Check if mitigated or unmitigated).
   - Step 3: Fair Value Gaps (FVG / BPR - Balanced Price Range, Imbalances, virgin inefficiencies).
   - Step 4: Liquidity Sweeps (BSL - Buy-side liquidity, SSL - Sell-side liquidity, Asian Range sweep, Equal Highs/Lows [EQH/EQL] sweeps).
   - Step 5: Premium vs. Discount Pricing (50% Equilibrium. Longs strictly in Discount <0.50, Shorts strictly in Premium >0.50. Check OTE 0.618 - 0.786).
   - Step 6: Entry Triggers (LTF displacement candle, MSS on M1/M5, candle wick rejections, volume expansion).
   - Step 7: Institutional Indicators & Volume (Institutional delta, ADR exhaustion status, session volume footprint).
   - Step 8: Killzones & Timing (London Open 02:00-05:00 EST, New York AM Killzone 07:00-10:00 EST, London Close 10:00-12:00 EST, or Current Session).

2. THE ANTI-STOP-HUNT PROTOCOL:
   Retail traders place stop losses directly on swing highs/lows where market makers hunt liquidity.
   - YOU MUST ANCHOR THE STOP LOSS behind the true institutional invalidation level (OB origin).
   - ADD A STRICT ATR VOLATILITY BUFFER of 3 to 7 pips (for Forex) or 15 to 25 pips (for Gold/XAUUSD/Indices) beyond the structural anchor.
   - Explain the exact Anti-Hunt safety rationale.

3. DYNAMIC PARTIAL UPLOAD HANDLING (FOR TOP-DOWN MODE):
   If the user only uploaded a subset of timeframes (e.g., Daily and M5, or H4 and M15), dynamically bridge the gap using fractal market geometry and explain the synthesis between macro bias and sniper execution.

4. SMALL ACCOUNT COMPOUNDING CALCULATION:
   Calculate the exact micro/mini/standard lot size for a $${accountBalance} account at ${riskPercentage}% risk based on the stop loss distance.
   Provide exact dollar return projections for TP1 (1:2 R:R), TP2 (1:3.5 R:R), and TP3 (1:5+ R:R) to demonstrate how disciplined compounding turns small deposits into institutional capital.

5. VOICE SCRIPT:
   Generate a crisp, confident, 3-4 sentence spoken script spoken by Olivia (designed for Web Speech synthesis) summarizing the bias, entry level, stop loss safety, and TP targets.

Output strictly valid JSON matching the schema. Temperature must be 0.2.
`;

    parts.push({ text: analysisPrompt });

    const result = await generateWithModelFallback(ai, {
      contents: {
        parts,
      },
      config: {
        temperature: 0.2,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            asset: { type: Type.STRING, description: 'Asset pair name e.g. EUR/USD, XAU/USD' },
            timeframe: { type: Type.STRING, description: 'Primary execution timeframe e.g. M15 / M5' },
            bias: {
              type: Type.STRING,
              description: 'Trading bias',
              enum: ['BULLISH', 'BEARISH', 'NEUTRAL_WAIT'],
            },
            confidenceScore: { type: Type.INTEGER, description: 'Confidence score from 0 to 100' },
            grade: {
              type: Type.STRING,
              description: 'Execution setup quality grade',
              enum: ['A+ Institutional Sniper', 'A High Conviction', 'B Moderate', 'No Trade / Invalidation'],
            },
            killzone: { type: Type.STRING, description: 'Active Killzone or optimal execution window' },
            orderType: {
              type: Type.STRING,
              description: 'Order execution type',
              enum: ['BUY LIMIT', 'SELL LIMIT', 'BUY STOP', 'SELL STOP', 'MARKET EXECUTION'],
            },
            entryPrice: { type: Type.STRING, description: 'Sniper entry price coordinate' },
            stopLoss: { type: Type.STRING, description: 'Anti-hunt protected stop loss coordinate' },
            antiHuntBufferPips: { type: Type.NUMBER, description: 'Pips buffer added to prevent stop hunts' },
            antiHuntRationale: { type: Type.STRING, description: 'Detailed reason for stop placement and buffer' },
            tp1: { type: Type.STRING, description: 'Take Profit 1 price coordinate (1:2 R:R)' },
            tp2: { type: Type.STRING, description: 'Take Profit 2 price coordinate (1:3.5 R:R)' },
            tp3: { type: Type.STRING, description: 'Take Profit 3 price coordinate (1:5+ R:R runner)' },
            riskRewardRatio: { type: Type.STRING, description: 'Calculated Risk to Reward ratio e.g. 1:4.2' },
            confluences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    enum: ['Structure', 'Supply & Demand', 'Fair Value Gap', 'Liquidity', 'Pricing', 'Triggers', 'Volume/ADR', 'Killzones'],
                  },
                  status: {
                    type: Type.STRING,
                    enum: ['CONFIRMED', 'PARTIAL', 'INVALIDATED', 'NOT_OBSERVED'],
                  },
                  details: { type: Type.STRING },
                  weight: {
                    type: Type.STRING,
                    enum: ['CRITICAL', 'HIGH', 'MODERATE'],
                  },
                },
                required: ['stepNumber', 'name', 'category', 'status', 'details', 'weight'],
              },
            },
            smallAccountCompounding: {
              type: Type.OBJECT,
              properties: {
                accountBalance: { type: Type.NUMBER },
                riskPercent: { type: Type.NUMBER },
                riskDollarAmount: { type: Type.NUMBER },
                suggestedLotSize: { type: Type.NUMBER },
                stopLossPips: { type: Type.NUMBER },
                tp1DollarGain: { type: Type.NUMBER },
                tp2DollarGain: { type: Type.NUMBER },
                tp3DollarGain: { type: Type.NUMBER },
                growthCompoundingNote: { type: Type.STRING },
              },
              required: [
                'accountBalance',
                'riskPercent',
                'riskDollarAmount',
                'suggestedLotSize',
                'stopLossPips',
                'tp1DollarGain',
                'tp2DollarGain',
                'tp3DollarGain',
                'growthCompoundingNote',
              ],
            },
            sniperRationale: { type: Type.STRING, description: 'Institutional narrative teardown' },
            voiceScript: { type: Type.STRING, description: 'Script for voice assistant' },
          },
          required: [
            'asset',
            'timeframe',
            'bias',
            'confidenceScore',
            'grade',
            'killzone',
            'orderType',
            'entryPrice',
            'stopLoss',
            'antiHuntBufferPips',
            'antiHuntRationale',
            'tp1',
            'tp2',
            'tp3',
            'riskRewardRatio',
            'confluences',
            'smallAccountCompounding',
            'sniperRationale',
            'voiceScript',
          ],
        },
      },
    });

    let rawJson = result.text || '{}';
    // Clean any markdown wrapper if present
    if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }
    const parsedData = JSON.parse(rawJson);

    // Attach server metadata & ID
    const enrichedSignal = {
      id: 'sig_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      dateString: new Date().toISOString().split('T')[0],
      mode,
      ...parsedData,
      timeframesAnalyzed: images.map((i: any) => i.timeframe),
      chartPreview: images[0]?.dataUrl || undefined,
    };

    res.json(enrichedSignal);
  } catch (error: any) {
    console.error('Error analyzing chart:', error);
    // Send 200 with error property so NGINX never intercepts and overwrites with /warmup.html
    res.json({
      error: 'ANALYSIS_FAILED',
      message: error?.message || 'Institutional analysis failed. Check chart clarity or server connection.',
    });
  }
});

// Setup Vite or static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Olivia AI Server] Listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Olivia AI Server] Startup failed:', err);
  process.exit(1);
});
