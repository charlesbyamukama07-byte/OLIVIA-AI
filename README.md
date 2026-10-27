# Olivia AI — Institutional Sniper Terminal 🎯

> **Elite Smart Money Concepts (SMC) Forex & Indices Trading Terminal** optimized for institutional high-precision execution and small account compounding ($50 – $1,000+).

---

## ⚡ Core Institutional Protocols

1. **8-Step Confluence Protocol:**
   - **Market Structure:** Internal & external structure, Break of Structure (BOS), Change of Character (CHoCH).
   - **Supply & Demand Order Blocks:** Institutional sponsoring order blocks, unmitigated mitigations, breaker blocks.
   - **Fair Value Gaps (FVG):** Balanced Price Ranges (BPR) and 3-candle virgin imbalances.
   - **Liquidity Sweeps:** Buy-Side Liquidity (BSL) and Sell-Side Liquidity (SSL) sweeps, Asian Range purges.
   - **Premium vs. Discount:** Strict buying in Discount (<0.50 dealing range) and selling in Premium (>0.50), targeting 0.618–0.786 Optimal Trade Entry (OTE).
   - **Entry Triggers:** LTF displacement candles, Market Structure Shifts (MSS) on M1/M5.
   - **Volume & Indicators:** Average Daily Range (ADR) exhaustion, institutional volume nodes.
   - **Killzones & Timing:** London Open (02:00–05:00 EST), NY AM Open (07:00–10:00 EST), London Close.

2. **Anti-Stop-Hunt Shield Protocol:**
   - Anchors stop losses behind true institutional order block bodies.
   - Injects dynamic **ATR Volatility Buffers** (3–7 pips FX, 15–25 pips Gold/Indices) to safeguard against broker spread expansions and stop-runs.

3. **Dual Execution Modes:**
   - **Intraday Sniper Mode:** Rapid single-timeframe execution with drag & drop, clipboard screenshot paste (`Ctrl+V`), and preset charts.
   - **Top-Down Mode:** 7 distinct timeframe slots (W1, D1, H4, H1, M30, M15, M5) with dynamic fractal bridging for partial uploads.

4. **Voice Assistant (Olivia Voice):**
   - Web Speech API integration to read setups, entries, and targets aloud with live waveform visualizer.

5. **Daily Session History & Auto-Reset:**
   - LocalStorage persistent logging with automatic midnight date-check reset mechanism.
   - 1-click CSV & JSON export.

6. **Small Account Compounding Calculator:**
   - Micro-lot sizing and 15-trade compounding growth projection table.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/charlesbyamukama07-byte/OLIVIA-AI.git
cd OLIVIA-AI
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*(You can also configure and permanently save your Gemini API key directly in the browser UI).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Express, Node.js, tsx
- **AI Engine:** Google GenAI SDK (`@google/genai`) with Gemini 3.8 Flash & Gemini 3.1 Flash Lite fallback
- **Archiving:** JSZip
- **Audio:** Web Speech API (`SpeechSynthesis`)
