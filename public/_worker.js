const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "arcee-ai/trinity-large-thinking:free";
const COINGECKO_SIMPLE_PRICE = "https://api.coingecko.com/api/v3/simple/price";
const ODDPOOL_API_BASE = "https://api.oddpool.com";
const POLYMARKET_GAMMA_BASE = "https://gamma-api.polymarket.com";
const POLYMARKET_CLOB_BASE = "https://clob.polymarket.com";
const BINANCE_TESTNET_BASE = "https://testnet.binance.vision/api";
const STOOQ_QUOTE_BASE = "https://stooq.com/q/l/";
const YAHOO_QUOTE_BASE = "https://query1.finance.yahoo.com/v7/finance/quote";
const CRYPTO_ASSETS = [
  { id: "bitcoin", symbol: "BTC", label: "BTCUSD" },
  { id: "ethereum", symbol: "ETH", label: "ETHUSD" },
  { id: "solana", symbol: "SOL", label: "SOLUSD" },
  { id: "avalanche-2", symbol: "AVAX", label: "AVAXUSD" },
];
const STOOQ_ASSETS = [
  { code: "aapl.us", symbol: "AAPL", label: "AAPL", type: "stock" },
  { code: "spy.us", symbol: "SPY", label: "SPY", type: "index" },
  { code: "qqq.us", symbol: "QQQ", label: "QQQ", type: "index" },
  { code: "nvda.us", symbol: "NVDA", label: "NVDA", type: "stock" },
  { code: "amd.us", symbol: "AMD", label: "AMD", type: "stock" },
  { code: "tsla.us", symbol: "TSLA", label: "TSLA", type: "stock" },
  { code: "eurusd", symbol: "EURUSD", label: "EURUSD", type: "fx" },
  { code: "xauusd", symbol: "GOLD", label: "XAUUSD", type: "metal" },
];
const YAHOO_ASSETS = [
  { code: "AAPL", symbol: "AAPL", label: "AAPL", type: "stock" },
  { code: "SPY", symbol: "SPY", label: "SPY", type: "index" },
  { code: "QQQ", symbol: "QQQ", label: "QQQ", type: "index" },
  { code: "NVDA", symbol: "NVDA", label: "NVDA", type: "stock" },
  { code: "AMD", symbol: "AMD", label: "AMD", type: "stock" },
  { code: "TSLA", symbol: "TSLA", label: "TSLA", type: "stock" },
  { code: "EURUSD=X", symbol: "EURUSD", label: "EURUSD", type: "fx" },
  { code: "GC=F", symbol: "GOLD", label: "XAUUSD", type: "metal" },
  { code: "^VIX", symbol: "VIX", label: "VIX", type: "index" },
];
const CALENDAR_FALLBACK = [
  {
    time: "08:30",
    currency: "USD",
    impact: "high",
    event: "US CPI / NFP / FOMC style high-impact window",
    reason: "Can move XAUUSD, EURUSD, SPY/QQQ and crypto risk sentiment quickly.",
    action: "Block new orders 15 minutes before and after unless explicitly overridden in journal.",
  },
  {
    time: "10:00",
    currency: "USD",
    impact: "medium",
    event: "US confidence, ISM, jobs or housing release",
    reason: "Can widen spreads and invalidate tight stops.",
    action: "Preview-only until spread and ATR normalize.",
  },
  {
    time: "24/7",
    currency: "CRYPTO",
    impact: "medium",
    event: "Exchange/funding/liquidity check",
    reason: "Crypto venues can change risk profile outside traditional sessions.",
    action: "Require wallet approval, max spend cap and no seed/private-key storage.",
  },
  {
    time: "Manual",
    currency: "ALL",
    impact: "high",
    event: "Investing.com calendar verification",
    reason: "Confirm the current calendar before trading a prop-firm account.",
    action: "Open Investing economic calendar and journal the decision.",
  },
];
const NEWS_IMAGES = {
  macro: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=80",
  forex: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=80",
  crypto: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=900&q=80",
  polymarket: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=80",
  stocks: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
};
const NEWS_FALLBACK = [
  {
    title: "Macro calendar risk window",
    source: "Zeus Risk Desk",
    category: "Macro",
    summary: "CPI, FOMC, NFP and rate decisions can widen spreads. The agent should block or wait near high-impact windows.",
    url: "https://www.investing.com/economic-calendar/",
    image: NEWS_IMAGES.macro,
    risk: "high",
  },
  {
    title: "Gold and USD sensitivity",
    source: "InsiderWave-style catalyst",
    category: "Forex / Gold",
    summary: "XAUUSD needs USD, yields and event-risk context before any FTMO-style preview.",
    url: "https://www.investing.com/",
    image: NEWS_IMAGES.forex,
    risk: "medium",
  },
  {
    title: "Crypto liquidity and venue risk",
    source: "Crypto market desk",
    category: "Crypto",
    summary: "BTC/ETH moves can support context, but wallet/CLOB execution stays separate from MT5 prop-firm trading.",
    url: "https://coinmarketcap.com/",
    image: NEWS_IMAGES.crypto,
    risk: "medium",
  },
  {
    title: "Prediction markets as context only",
    source: "Polymarket context",
    category: "Polymarket",
    summary: "Event odds can show crowd expectations, but Zeus never treats them as direct order signals.",
    url: "https://polymarket.com/",
    image: NEWS_IMAGES.polymarket,
    risk: "low",
  },
];
const BOT_CONNECTORS = [
  {
    id: "agentscope-runtime",
    name: "AgentScope Multi-Agent Runtime",
    venue: "AgentScope",
    type: "agent-framework",
    url: "https://agentscope.io/",
    docs: "https://docs.agentscope.io/basic-concepts/agent",
    purpose: "Orchestrate Zeus agents as visible, auditable ReAct-style roles: market scanner, news risk, strategy validator, prop rules, risk gate, supervisor and execution preview.",
    safety: "Framework/runtime only. It cannot override Zeus manual approval, kill switch, SL/TP or audit requirements.",
  },
  {
    id: "apibricks-console",
    name: "APIBricks Console + API Keys",
    venue: "APIBricks",
    type: "api-provider",
    url: "https://console.apibricks.io/team/54a30dc6-46dc-4dac-93a7-72ad3f4288ee",
    docs: "https://www.apibricks.io/platform/docs/customer-portal/billing",
    purpose: "Manage API keys, products, subscriptions, quotas, request logs, connection logs and usage analytics for API providers used by Zeus.",
    safety: "Backend-only secrets. API keys must be stored as Cloudflare secrets and never returned to browser JS.",
  },
  {
    id: "pionex-bot",
    name: "Pionex BTC/USDT Bot",
    venue: "Pionex",
    type: "exchange-bot",
    url: "https://www.pionex.com/en/trade/BTC_USDT/Bot",
    purpose: "Research grid/DCA-style crypto bot ranges and risk caps for BTC/USDT.",
    safety: "Manual venue login/review only. No password typing, no 2FA bypass, no hidden order clicks.",
  },
  {
    id: "cmc-agent-skills",
    name: "CoinMarketCap Agent Skills",
    venue: "CoinMarketCap",
    type: "agent-skills",
    url: "https://coinmarketcap.com/api/skills-marketplace/",
    purpose: "Route crypto research into structured market reports, token research, MCP, x402 and API skills.",
    safety: "Analysis/data route only. It never submits broker or wallet orders.",
  },
  {
    id: "threecommas-dashboard",
    name: "3Commas Dashboard",
    venue: "3Commas",
    type: "bot-dashboard",
    url: "https://app.3commas.io/d",
    purpose: "Prepare DCA/Grid/SmartTrade plans for manual 3Commas review.",
    safety: "External API keys must have no withdrawal permissions and remain outside browser JS.",
  },
];
const CMC_SKILLS = [
  { name: "AgentScope", description: "Multi-agent orchestration framework with agents, tools, memory, evaluation, runtime and Studio-style supervision." },
  { name: "APIBricks Console", description: "API key, subscription, quota, audit log and usage management layer for external API products." },
  { name: "CMC MCP", description: "Real-time crypto market data via MCP for prices, technicals, news, holders, narratives and global metrics." },
  { name: "Market Report", description: "Daily/weekly market report using global metrics, fear/greed, derivatives and catalysts." },
  { name: "Crypto Research", description: "Single-token due diligence for fundamentals, tokenomics, holder distribution, technicals and risks." },
  { name: "CMC CLI", description: "Terminal-native workflows for CoinMarketCap market reports and coin research." },
  { name: "x402 Skills", description: "Pay-per-request data access without an API key, using USDC on Base." },
  { name: "API Integration", description: "REST integration pattern for cryptocurrency, DEX, exchange and market data endpoints." },
];
const encoder = new TextEncoder();

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function cookieResponse(body, status = 200, cookie = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (cookie) headers["Set-Cookie"] = cookie;
  return new Response(JSON.stringify(body), { status, headers });
}

function sessionCookie(token, maxAge = 60 * 60 * 24 * 30) {
  return `zt_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function clearSessionCookie() {
  return "zt_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function base64UrlEncode(value) {
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left, right) {
  const a = encoder.encode(String(left || ""));
  const b = encoder.encode(String(right || ""));
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}

async function hmacHex(secret, payload) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
}

async function sha256Hex(value) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return toHex(bits);
}

function approvalSecret(env) {
  return env.EXECUTION_APPROVAL_SECRET || env.OPENROUTER_API_KEY || env.BINANCE_TESTNET_API_SECRET || "";
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

function numberValue(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeSymbol(symbol) {
  return String(symbol || "BTCUSDT").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function orderSide(direction) {
  return String(direction || "LONG").toUpperCase() === "SHORT" ? "SELL" : "BUY";
}

const FUNDED_ELITE_FLASH = {
  key: "fundedEliteFlash",
  label: "FundedElite Flash Activation",
  evaluation: {
    phases: 1,
    profitTargetPercent: 0.06,
    maxDailyDrawdownPercent: 0.03,
    maxTotalDrawdownPercent: 0.06,
    drawdownType: "static",
    minTradingDays: 0,
    secondChance: false,
  },
  live: {
    maxDailyLossPercent: 0.03,
    totalDrawdownPercent: 0.06,
    drawdownType: "trailing",
    minProfitableDays: 3,
    minProfitableDayPercent: 0.005,
    bestDayMaxShareOfProfit: 0.3,
  },
  metadata: {
    profitSplit: "Informational only",
    payout: "Informational only",
  },
};

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fundedEliteState(input = {}) {
  const phase = input.phase === "live" ? "live" : "evaluation";
  const accountSize = Math.max(numberValue(input.accountSize, 100000), 1);
  const initialBalance = Math.max(numberValue(input.initialBalance, accountSize), 1);
  const startOfDayBalance = Math.max(numberValue(input.startOfDayBalance, accountSize), 1);
  const currentEquity = Math.max(numberValue(input.currentEquity, accountSize), 0);
  const highWaterEquity = Math.max(numberValue(input.highWaterEquity, currentEquity), initialBalance, currentEquity);
  const dailyPnl = numberValue(input.dailyPnl, currentEquity - startOfDayBalance);
  const totalProfit = Math.max(numberValue(input.totalProfit, currentEquity - initialBalance), 0);
  const bestDayProfit = Math.max(numberValue(input.bestDayProfit, 0), 0);
  const profitableDays = numberValue(input.profitableDays, 0);
  const maxDailyLoss = startOfDayBalance * FUNDED_ELITE_FLASH.evaluation.maxDailyDrawdownPercent;
  const dailyLoss = Math.max(-dailyPnl, 0);
  const evaluationFloor = initialBalance - initialBalance * FUNDED_ELITE_FLASH.evaluation.maxTotalDrawdownPercent;
  const trailingFloor = highWaterEquity - initialBalance * FUNDED_ELITE_FLASH.live.totalDrawdownPercent;
  const activeFloor = phase === "live" ? trailingFloor : evaluationFloor;
  const dailyLossBufferRemaining = maxDailyLoss - dailyLoss;
  const maxDrawdownBufferRemaining = currentEquity - activeFloor;
  const consistencyLimit = totalProfit * FUNDED_ELITE_FLASH.live.bestDayMaxShareOfProfit;
  const consistencyViolated = phase === "live" && totalProfit > 0 && bestDayProfit > consistencyLimit;
  const extraProfitRequiredForConsistency = consistencyViolated
    ? Math.max(bestDayProfit / FUNDED_ELITE_FLASH.live.bestDayMaxShareOfProfit - totalProfit, 0)
    : 0;
  const blockers = [];
  const warnings = [];
  if (dailyLoss >= maxDailyLoss) blockers.push("FundedElite daily drawdown limit is breached.");
  if (currentEquity <= activeFloor) blockers.push("FundedElite total drawdown floor is breached.");
  if (dailyLossBufferRemaining <= maxDailyLoss * 0.15) warnings.push("Daily drawdown buffer is close to breach.");
  if (maxDrawdownBufferRemaining <= initialBalance * 0.01) warnings.push("Total drawdown buffer is thin.");
  if (phase === "live" && profitableDays < FUNDED_ELITE_FLASH.live.minProfitableDays) warnings.push("Live phase needs 3 profitable days before payout eligibility.");
  if (phase === "live" && consistencyViolated) warnings.push("Consistency warning: best day exceeds 30% of total profit.");
  return {
    phase,
    accountSize,
    initialBalance,
    startOfDayBalance,
    currentEquity,
    highWaterEquity,
    dailyPnl,
    totalProfit,
    bestDayProfit,
    profitableDays,
    profitTarget: initialBalance * FUNDED_ELITE_FLASH.evaluation.profitTargetPercent,
    maxDailyLoss,
    staticDrawdownFloor: evaluationFloor,
    trailingDrawdownFloor: trailingFloor,
    activeDrawdownFloor: activeFloor,
    dailyLossBufferRemaining,
    maxDrawdownBufferRemaining,
    maxAllowedLossForNextTrade: Math.max(Math.min(dailyLossBufferRemaining, maxDrawdownBufferRemaining) * 0.8, 0),
    consistencyStatus: consistencyViolated ? "warning" : "ok",
    extraProfitRequiredForConsistency,
    minPositiveDay: accountSize * FUNDED_ELITE_FLASH.live.minProfitableDayPercent,
    blockers,
    warnings,
  };
}

function calculatePositionSize({ accountSize, riskPercent, entry, stopLoss, maxAllowedLoss, symbol = "" } = {}) {
  const size = Math.max(numberValue(accountSize, 100000), 1);
  const riskPct = clampNumber(numberValue(riskPercent, 0.25), 0, 5) / 100;
  const stopDistance = Math.abs(numberValue(entry) - numberValue(stopLoss));
  const riskAmount = Math.min(size * riskPct, Math.max(numberValue(maxAllowedLoss, size * riskPct), 0));
  const units = stopDistance > 0 ? riskAmount / stopDistance : 0;
  const contractFactor = /XAU|GOLD/i.test(symbol) ? 100 : /EUR|GBP|JPY|USD$/i.test(symbol) ? 100000 : 1;
  return {
    riskAmount,
    riskPercent: riskPct * 100,
    stopDistance,
    units,
    lotSize: contractFactor > 1 ? Number((units / contractFactor).toFixed(3)) : Number(units.toFixed(6)),
  };
}

function runProtectedAgentCycle(input = {}, killSwitchActive = false) {
  const symbol = normalizeSymbol(input.symbol || "XAUUSD");
  const direction = String(input.direction || "LONG").toUpperCase();
  const entry = numberValue(input.entry, /BTC/.test(symbol) ? 78000 : /XAU|GOLD/.test(symbol) ? 2380 : 100);
  const atr = Math.max(numberValue(input.atr, entry * 0.004), 0.01);
  const stop = numberValue(input.stop ?? input.stopLoss, direction === "LONG" ? entry - atr : entry + atr);
  const target = numberValue(input.target ?? input.takeProfit, direction === "LONG" ? entry + atr * 2 : entry - atr * 2);
  const volume = numberValue(input.relativeVolume, 1.7);
  const rsi = numberValue(input.rsi, direction === "LONG" ? 58 : 42);
  const spreadPercent = numberValue(input.spreadPercent, 0.03);
  const minRewardRisk = numberValue(input.minRewardRisk, 1.5);
  const account = fundedEliteState(input.account || input);
  const confidence = clampNumber(48 + (volume >= 1.5 ? 14 : -8) + (rsi > 45 && rsi < 68 ? 10 : 0) + (spreadPercent <= 0.05 ? 8 : 0), 1, 95);
  const rrEstimate = Math.abs(target - entry) / Math.max(Math.abs(entry - stop), 0.0001);

  const scanner = {
    agent: "Market Scanner Agent",
    status: "passed",
    candidate: {
      symbol,
      direction,
      setup: input.setup || "VWAP reclaim + EMA 9/21/50 continuation",
      entry_idea: entry,
      invalidation: direction === "LONG" ? "Close below VWAP/structure or stop zone." : "Close above VWAP/structure or stop zone.",
      stop_loss_zone: stop,
      target_zone: target,
      rr_estimate: Number(rrEstimate.toFixed(2)),
      confidence_score: Math.round(confidence),
      reason: `Candidate only: ${symbol} has ${input.setup || "VWAP/EMA momentum"}, RVOL ${volume.toFixed(1)}x, RSI ${rsi}.`,
    },
  };

  const highNews = String(input.newsRisk || "low").toLowerCase() === "high" || Boolean(input.highImpactNews);
  const news = {
    agent: "News/Macro Risk Agent",
    status: highNews ? "blocked" : String(input.newsRisk || "low").toLowerCase() === "medium" ? "warning" : "passed",
    risk_level: highNews ? "high" : String(input.newsRisk || "low").toLowerCase() === "medium" ? "medium" : "low",
    block_trade: highNews,
    reason: highNews ? "High-impact macro/news/platform risk blocks new trades." : "No high-impact blocker detected.",
  };

  const checklist = {
    stop_loss_defined: stop > 0,
    target_defined: target > 0,
    rr_above_minimum: rrEstimate >= minRewardRisk,
    confidence_ok: confidence >= 60,
    volume_confirmation: volume >= 1.5,
  };
  const setupValid = Object.values(checklist).every(Boolean);
  const strategy = {
    agent: "Strategy Validation Agent",
    status: setupValid ? "passed" : "blocked",
    setup_valid: setupValid,
    score: Math.round((Object.values(checklist).filter(Boolean).length / Object.values(checklist).length) * 100),
    checklist,
    explanation: setupValid ? "Setup matches the selected playbook confirmations." : "Setup is missing required confirmations.",
  };

  const rules = {
    agent: "Prop Firm Rules Agent",
    status: account.blockers.length ? "blocked" : account.warnings.length ? "warning" : "passed",
    rule_pass: account.blockers.length === 0,
    nearest_rule_risk: account.dailyLossBufferRemaining < account.maxDrawdownBufferRemaining ? "daily_drawdown" : "total_drawdown",
    daily_loss_buffer_remaining: Number(account.dailyLossBufferRemaining.toFixed(2)),
    max_drawdown_buffer_remaining: Number(account.maxDrawdownBufferRemaining.toFixed(2)),
    consistency_status: account.consistencyStatus,
    max_allowed_loss_for_next_trade: Number(account.maxAllowedLossForNextTrade.toFixed(2)),
    warnings: account.warnings,
    blockers: account.blockers,
  };

  const riskBlockers = [...account.blockers];
  if (killSwitchActive || input.killSwitchActive) riskBlockers.push("Kill switch is active.");
  if (entry <= 0) riskBlockers.push("Entry price is required.");
  if (stop <= 0) riskBlockers.push("Stop-loss is required.");
  if (target <= 0) riskBlockers.push("Take-profit is required.");
  if (direction === "LONG" && stop >= entry) riskBlockers.push("LONG stop-loss must be below entry.");
  if (direction === "LONG" && target <= entry) riskBlockers.push("LONG take-profit must be above entry.");
  if (direction === "SHORT" && stop <= entry) riskBlockers.push("SHORT stop-loss must be above entry.");
  if (direction === "SHORT" && target >= entry) riskBlockers.push("SHORT take-profit must be below entry.");
  if (numberValue(input.riskPercent, 0.25) > 0.5) riskBlockers.push("Risk per trade is above FundedElite cap of 0.5%.");
  if (spreadPercent > 0.08) riskBlockers.push("Spread is too high.");
  if (highNews) riskBlockers.push("High-impact news blocks this trade.");
  if (rrEstimate < minRewardRisk) riskBlockers.push(`Reward/risk must be at least ${minRewardRisk}R.`);
  const sizing = calculatePositionSize({
    accountSize: account.accountSize,
    riskPercent: numberValue(input.riskPercent, 0.25),
    entry,
    stopLoss: stop,
    maxAllowedLoss: account.maxAllowedLossForNextTrade,
    symbol,
  });
  if (sizing.riskAmount <= 0 || sizing.lotSize <= 0) riskBlockers.push("Position size is too small or unavailable.");
  const risk = {
    agent: "Position Sizing / Risk Gate Agent",
    status: riskBlockers.length ? "blocked" : "passed",
    risk_pass: riskBlockers.length === 0,
    suggested_lot_size: sizing.lotSize,
    risk_amount: Number(sizing.riskAmount.toFixed(2)),
    risk_percent: Number(sizing.riskPercent.toFixed(3)),
    stop_loss: stop,
    take_profit: target,
    rr_ratio: Number(rrEstimate.toFixed(2)),
    rejection_reason: riskBlockers.join(" "),
    blockers: riskBlockers,
  };

  const blockers = [
    ...(news.block_trade ? [news.reason] : []),
    ...(strategy.setup_valid ? [] : [strategy.explanation]),
    ...(rules.rule_pass ? [] : rules.blockers),
    ...(risk.risk_pass ? [] : risk.blockers),
  ].filter(Boolean);
  let finalDecision = "READY_FOR_MANUAL_APPROVAL";
  if (blockers.length) finalDecision = "BLOCK";
  else if (news.risk_level === "medium" || rules.status === "warning") finalDecision = "PREVIEW_ONLY";
  else if (scanner.candidate.confidence_score < 70) finalDecision = "WATCH";
  const supervisor = {
    agent: "Supervisor Agent",
    status: blockers.length ? "blocked" : finalDecision === "READY_FOR_MANUAL_APPROVAL" ? "passed" : "warning",
    final_decision: finalDecision,
    summary: blockers.length ? `Blocked: ${blockers.join(" ")}` : `Candidate can proceed as ${finalDecision}. Manual approval and fresh risk re-check are still required.`,
    exact_blockers: blockers,
    next_safest_action: blockers.length ? "Do not trade. Fix blockers or wait." : "Build MT5 preview and require manual approval.",
  };
  const previewReady = finalDecision === "READY_FOR_MANUAL_APPROVAL" || finalDecision === "PREVIEW_ONLY";
  const preview = {
    agent: "Execution Preview Agent / MT5 Bridge Agent",
    status: previewReady ? "passed" : "blocked",
    preview_ready: previewReady,
    approval_required: true,
    mt5_payload: previewReady
      ? {
          symbol,
          direction,
          entry,
          stop_loss: stop,
          take_profit: target,
          lot_size: sizing.lotSize,
          estimated_loss: Number(sizing.riskAmount.toFixed(2)),
          estimated_profit: Number((sizing.riskAmount * rrEstimate).toFixed(2)),
          rr_ratio: Number(rrEstimate.toFixed(2)),
          spread_percent: spreadPercent,
          timestamp: new Date().toISOString(),
        }
      : null,
  };
  return {
    ok: finalDecision !== "BLOCK",
    run_id: crypto.randomUUID(),
    challenge: FUNDED_ELITE_FLASH,
    final_decision: finalDecision,
    agents: [scanner, news, strategy, rules, risk, supervisor, preview],
    candidate: scanner.candidate,
    account_guard: account,
    preview,
    created_at: new Date().toISOString(),
  };
}

async function ensureAuthSchema(env) {
  if (!env.zeustrading_users) return false;
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      plan TEXT NOT NULL,
      bot_profile TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`)
    .run();
  return true;
}

function publicUser(row, profile = null) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    profile: profile
      ? {
          displayName: profile.display_name,
          plan: profile.plan,
          botProfile: JSON.parse(profile.bot_profile || "{}"),
          updatedAt: profile.updated_at,
        }
      : null,
  };
}

async function currentUser(request, env) {
  if (!(await ensureAuthSchema(env))) return null;
  const token = getCookie(request, "zt_session");
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const session = await env.zeustrading_users
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?")
    .bind(tokenHash)
    .first();
  if (!session || Date.parse(session.expires_at) <= Date.now()) return null;
  const user = await env.zeustrading_users.prepare("SELECT id, email, name FROM users WHERE id = ?").bind(session.user_id).first();
  const profile = await env.zeustrading_users.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(session.user_id).first();
  return publicUser(user, profile);
}

async function authRegister(request, env) {
  if (!(await ensureAuthSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim() || email.split("@")[0] || "Trader";
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonResponse({ ok: false, error: "Valid email is required." }, 400);
  if (password.length < 8) return jsonResponse({ ok: false, error: "Password must be at least 8 characters." }, 400);

  const exists = await env.zeustrading_users.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (exists) return jsonResponse({ ok: false, error: "Account already exists. Please log in." }, 409);

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);
  const defaultProfile = JSON.stringify({
    platform: "mt5-bridge",
    mode: "protected-live",
    bridgeUrl: "http://127.0.0.1:8789",
    riskPercent: 0.25,
    maxTradesPerDay: 2,
    protectedLive: true,
  });

  await env.zeustrading_users.batch([
    env.zeustrading_users
      .prepare("INSERT INTO users (id, email, name, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(userId, email, name, passwordHash, salt, now, now),
    env.zeustrading_users
      .prepare("INSERT INTO profiles (user_id, display_name, plan, bot_profile, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind(userId, name, "protected-live", defaultProfile, now),
  ]);

  return authLogin(request, env, { email, password });
}

async function authLogin(request, env, forcedBody = null) {
  if (!(await ensureAuthSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = forcedBody || (await readJson(request));
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = await env.zeustrading_users.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (!user) return jsonResponse({ ok: false, error: "Invalid email or password." }, 401);
  const passwordHash = await hashPassword(password, user.password_salt);
  if (!constantTimeEqual(passwordHash, user.password_hash)) return jsonResponse({ ok: false, error: "Invalid email or password." }, 401);

  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();
  await env.zeustrading_users
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, user.id, now.toISOString(), expires)
    .run();
  const profile = await env.zeustrading_users.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(user.id).first();
  return cookieResponse({ ok: true, user: publicUser(user, profile) }, 200, sessionCookie(token));
}

async function authLogout(request, env) {
  if (env.zeustrading_users) {
    const token = getCookie(request, "zt_session");
    if (token) await env.zeustrading_users.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
  }
  return cookieResponse({ ok: true }, 200, clearSessionCookie());
}

async function authMe(request, env) {
  const user = await currentUser(request, env);
  return jsonResponse({ ok: Boolean(user), user });
}

async function authProfile(request, env) {
  const user = await currentUser(request, env);
  if (!user) return jsonResponse({ ok: false, error: "Login required." }, 401);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const displayName = String(body.displayName || user.name || "Trader").trim().slice(0, 80);
  const botProfile = JSON.stringify(body.botProfile || {});
  const now = new Date().toISOString();
  await env.zeustrading_users
    .prepare("UPDATE profiles SET display_name = ?, bot_profile = ?, updated_at = ? WHERE user_id = ?")
    .bind(displayName, botProfile, now, user.id)
    .run();
  return authMe(request, env);
}

async function ensureExecutionAuditSchema(env) {
  if (!env.zeustrading_users) return false;
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS execution_audit (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS bot_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      settings TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS challenge_rules (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      challenge_key TEXT NOT NULL,
      rules TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS account_state_snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      account_state TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS agent_run_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      run_id TEXT NOT NULL,
      final_decision TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS setup_candidates (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      run_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS trade_previews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      run_id TEXT,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS approved_trades (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      preview_id TEXT,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS rejected_trades (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      run_id TEXT,
      reason TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS rule_violations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      run_id TEXT,
      rule_key TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS kill_switch (
      user_id TEXT PRIMARY KEY,
      active INTEGER NOT NULL,
      mode TEXT NOT NULL,
      reason TEXT,
      updated_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS compliance_checks (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      country TEXT,
      blocked INTEGER NOT NULL,
      reason TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS wallet_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      wallet_address TEXT,
      message TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  await env.zeustrading_users
    .prepare(`CREATE TABLE IF NOT EXISTS wallet_approvals (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      wallet_address TEXT NOT NULL,
      wallet_provider TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      signature TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`)
    .run();
  return true;
}

async function killSwitchState(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return { active: false, mode: "block-new-orders", reason: "" };
  const user = await currentUser(request, env);
  const row = await env.zeustrading_users.prepare("SELECT active, mode, reason FROM kill_switch WHERE user_id = ?").bind(user?.id || "guest").first();
  return {
    active: Boolean(row?.active),
    mode: row?.mode || "block-new-orders",
    reason: row?.reason || "",
  };
}

async function saveJournalEntry(request, env, eventType, payload) {
  if (!(await ensureExecutionAuditSchema(env))) return null;
  const user = await currentUser(request, env);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await env.zeustrading_users
    .prepare("INSERT INTO journal_entries (id, user_id, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, user?.id || null, eventType, JSON.stringify(payload || {}), createdAt)
    .run();
  return { id, createdAt };
}

async function executionAudit(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const user = await currentUser(request, env);
  const eventType = String(body.eventType || "execution_event").slice(0, 80);
  const payload = JSON.stringify(body.payload || {});
  const createdAt = String(body.createdAt || new Date().toISOString());
  await env.zeustrading_users
    .prepare("INSERT INTO execution_audit (id, user_id, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), user?.id || null, eventType, payload, createdAt)
    .run();
  return jsonResponse({ ok: true });
}

async function agentRunCycle(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const user = await currentUser(request, env);
  const kill = await killSwitchState(request, env);
  const cycle = runProtectedAgentCycle(body, kill.active);
  const now = new Date().toISOString();
  await env.zeustrading_users.batch([
    env.zeustrading_users
      .prepare("INSERT INTO agent_run_logs (id, user_id, run_id, final_decision, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, cycle.run_id, cycle.final_decision, JSON.stringify(cycle), now),
    env.zeustrading_users
      .prepare("INSERT INTO setup_candidates (id, user_id, run_id, symbol, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, cycle.run_id, cycle.candidate.symbol, JSON.stringify(cycle.candidate), now),
    env.zeustrading_users
      .prepare("INSERT INTO account_state_snapshots (id, user_id, account_state, created_at) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, JSON.stringify(cycle.account_guard), now),
    env.zeustrading_users
      .prepare("INSERT INTO journal_entries (id, user_id, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, "agent_run_cycle", JSON.stringify(cycle), now),
  ]);
  if (cycle.final_decision === "BLOCK") {
    await env.zeustrading_users
      .prepare("INSERT INTO rejected_trades (id, user_id, run_id, reason, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, cycle.run_id, cycle.agents.find((agent) => agent.agent === "Supervisor Agent")?.summary || "Blocked", JSON.stringify(cycle), now)
      .run();
  }
  for (const blocker of cycle.agents.find((agent) => agent.agent === "Prop Firm Rules Agent")?.blockers || []) {
    await env.zeustrading_users
      .prepare("INSERT INTO rule_violations (id, user_id, run_id, rule_key, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, cycle.run_id, "fundedelite_flash", JSON.stringify({ blocker, cycle }), now)
      .run();
  }
  return jsonResponse({ ok: cycle.ok, kill_switch: kill, cycle }, cycle.final_decision === "BLOCK" ? 422 : 200);
}

async function mt5Preview(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const user = await currentUser(request, env);
  const kill = await killSwitchState(request, env);
  const cycle = runProtectedAgentCycle(body, kill.active);
  if (cycle.final_decision === "BLOCK") {
    await saveJournalEntry(request, env, "mt5_preview_blocked", cycle);
    return jsonResponse({ ok: false, reason: "Agent gates blocked MT5 preview.", cycle }, 422);
  }
  const payload = {
    ...body,
    exchange: "mt5-bridge",
    mode: body.mode === "protected-live" ? "protected-live" : "live-preview",
    stop: cycle.preview.mt5_payload.stop_loss,
    target: cycle.preview.mt5_payload.take_profit,
    journalNote: body.journalNote || "Agent cycle passed and MT5 preview was requested.",
  };
  const preview = buildExecutionPreview(payload);
  const now = new Date().toISOString();
  await env.zeustrading_users
    .prepare("INSERT INTO trade_previews (id, user_id, run_id, payload, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(preview.id, user?.id || null, cycle.run_id, JSON.stringify({ preview, cycle }), now)
    .run();
  await saveJournalEntry(request, env, preview.approved ? "mt5_preview_ready" : "mt5_preview_blocked", { preview, cycle });
  return jsonResponse({ ok: preview.approved, preview, cycle }, preview.approved ? 200 : 422);
}

async function mt5Approve(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const kill = await killSwitchState(request, env);
  if (kill.active) return jsonResponse({ ok: false, reason: "Kill switch is active. Approval blocked." }, 423);
  const response = await executionApprove(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("Cookie") || "" },
      body: JSON.stringify({ preview: body.preview }),
    }),
    env,
  );
  const data = await response.clone().json().catch(() => ({}));
  const user = await currentUser(request, env);
  if (response.ok) {
    await env.zeustrading_users
      .prepare("INSERT INTO approved_trades (id, user_id, preview_id, payload, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), user?.id || null, body.preview?.id || null, JSON.stringify(data), new Date().toISOString())
      .run();
    await saveJournalEntry(request, env, "manual_approval_issued", { preview: body.preview, approval: data });
  }
  return response;
}

async function killSwitchApi(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = request.method === "POST" ? await readJson(request) : {};
  const user = await currentUser(request, env);
  const userId = user?.id || "guest";
  if (request.method === "GET") return jsonResponse({ ok: true, kill_switch: await killSwitchState(request, env) });
  const active = body.active !== false;
  const mode = String(body.mode || "block-new-orders").slice(0, 80);
  const reason = String(body.reason || (active ? "User activated kill switch." : "User cleared kill switch.")).slice(0, 500);
  const now = new Date().toISOString();
  await env.zeustrading_users
    .prepare("INSERT OR REPLACE INTO kill_switch (user_id, active, mode, reason, updated_at) VALUES (?, ?, ?, ?, ?)")
    .bind(userId, active ? 1 : 0, mode, reason, now)
    .run();
  await saveJournalEntry(request, env, active ? "kill_switch_active" : "kill_switch_cleared", { mode, reason });
  return jsonResponse({ ok: true, kill_switch: { active, mode, reason, updated_at: now } });
}

async function journalApi(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const user = await currentUser(request, env);
  if (request.method === "POST") {
    const body = await readJson(request);
    if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
    const saved = await saveJournalEntry(request, env, String(body.eventType || "journal_note"), body.payload || body);
    return jsonResponse({ ok: true, entry: saved });
  }
  const rows = await env.zeustrading_users
    .prepare("SELECT id, event_type, payload, created_at FROM journal_entries WHERE user_id = ? OR (? IS NULL AND user_id IS NULL) ORDER BY created_at DESC LIMIT 50")
    .bind(user?.id || null, user?.id || null)
    .all();
  return jsonResponse({ ok: true, entries: rows.results || [] });
}

function restrictedClobCountries(env) {
  return String(env.CLOB_RESTRICTED_COUNTRIES || "US,CU,IR,KP,SY,RU,BY,MM")
    .split(",")
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean);
}

function requestCountry(request, body = {}) {
  return String(body.country || request.cf?.country || request.headers.get("CF-IPCountry") || "XX").toUpperCase();
}

async function complianceCheck(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = (await readJson(request)) || {};
  const user = await currentUser(request, env);
  const country = requestCountry(request, body);
  const restricted = restrictedClobCountries(env).includes(country);
  const attested = Boolean(body.jurisdictionAttestation) && Boolean(body.walletRiskAcknowledgement);
  const unknownCountry = country === "XX";
  const blocked = restricted || !attested;
  const reason = restricted
    ? `CLOB/wallet trading is blocked for country ${country}.`
    : !attested
      ? "Complete jurisdiction and wallet-risk attestations before building a wallet preview."
      : unknownCountry
        ? "Country could not be verified at the edge. Preview can continue, but live submit stays locked."
        : "Compliance/geofence check passed for preview-only wallet workflow.";
  const compliance = {
    checked: true,
    country,
    restricted,
    attested,
    blocked,
    reason,
    previewOnly: true,
    liveSubmitLocked: true,
    checked_at: new Date().toISOString(),
  };
  await env.zeustrading_users
    .prepare("INSERT INTO compliance_checks (id, user_id, country, blocked, reason, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), user?.id || null, country, blocked ? 1 : 0, reason, JSON.stringify({ ...body, compliance }), compliance.checked_at)
    .run();
  await saveJournalEntry(request, env, blocked ? "clob_compliance_blocked" : "clob_compliance_checked", compliance);
  return jsonResponse({ ok: !blocked, compliance }, blocked ? 451 : 200);
}

function walletApprovalMessage({ walletAddress, walletProvider, previewPayload, expiresAt, nonce }) {
  const tokenId = String(previewPayload?.tokenId || "not-selected");
  const side = String(previewPayload?.side || "BUY").toUpperCase();
  const price = numberValue(previewPayload?.price).toFixed(4);
  const size = numberValue(previewPayload?.size).toFixed(4);
  return [
    "Zeus Trading wallet approval",
    "Purpose: CLOB preview approval only. This is not an order submission.",
    `Wallet: ${walletAddress}`,
    `Provider: ${walletProvider}`,
    `Token: ${tokenId}`,
    `Side: ${side}`,
    `Limit price: ${price}`,
    `Size: ${size}`,
    `Nonce: ${nonce}`,
    `Expires: ${expiresAt}`,
    "Never share seed phrase or private key. Manual wallet confirmation remains required for any real venue.",
  ].join("\n");
}

async function walletChallenge(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const walletAddress = String(body.walletAddress || "").trim();
  const walletProvider = String(body.walletProvider || "phantom-terminal").slice(0, 80);
  if (walletAddress.length < 10) return jsonResponse({ ok: false, error: "Wallet address is required before signing." }, 400);
  const user = await currentUser(request, env);
  const nonce = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 5 * 60 * 1000).toISOString();
  const message = walletApprovalMessage({
    walletAddress,
    walletProvider,
    previewPayload: body.previewPayload || {},
    expiresAt,
    nonce,
  });
  const id = crypto.randomUUID();
  await env.zeustrading_users
    .prepare("INSERT INTO wallet_challenges (id, user_id, wallet_address, message, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, user?.id || null, walletAddress, message, expiresAt, createdAt.toISOString())
    .run();
  return jsonResponse({ ok: true, challenge: { id, message, expiresAt, walletAddress, walletProvider } });
}

async function walletApproval(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const challengeId = String(body.challengeId || "");
  const walletAddress = String(body.walletAddress || "").trim();
  const walletProvider = String(body.walletProvider || "phantom-terminal").slice(0, 80);
  const signature = String(body.signature || "").trim();
  const message = String(body.message || "");
  if (!challengeId || !walletAddress || !signature || !message) {
    return jsonResponse({ ok: false, error: "Challenge, wallet address, message, and signature are required." }, 400);
  }
  const challenge = await env.zeustrading_users
    .prepare("SELECT * FROM wallet_challenges WHERE id = ?")
    .bind(challengeId)
    .first();
  if (!challenge) return jsonResponse({ ok: false, error: "Wallet challenge was not found." }, 404);
  if (Date.parse(challenge.expires_at) <= Date.now()) return jsonResponse({ ok: false, error: "Wallet challenge expired. Build a new signature." }, 410);
  if (challenge.wallet_address !== walletAddress) return jsonResponse({ ok: false, error: "Wallet address does not match challenge." }, 409);
  if (challenge.message !== message) return jsonResponse({ ok: false, error: "Signed message does not match challenge." }, 409);
  const user = await currentUser(request, env);
  const approval = {
    id: crypto.randomUUID(),
    walletAddress,
    walletProvider,
    challengeId,
    signature,
    message,
    signature_verified: false,
    audit_only: true,
    approval_required_for_preview: true,
    live_submit_locked: true,
    created_at: new Date().toISOString(),
  };
  await env.zeustrading_users
    .prepare("INSERT INTO wallet_approvals (id, user_id, wallet_address, wallet_provider, challenge_id, signature, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(approval.id, user?.id || null, walletAddress, walletProvider, challengeId, signature, JSON.stringify({ approval, previewPayload: body.previewPayload || {} }), approval.created_at)
    .run();
  await saveJournalEntry(request, env, "clob_wallet_approval_signed", approval);
  return jsonResponse({ ok: true, approval });
}

function buildExecutionPreview(body) {
  const exchange = String(body.exchange || "mt5-bridge");
  const mode = String(body.mode || "preview");
  const symbol = normalizeSymbol(body.symbol);
  const direction = String(body.direction || "LONG").toUpperCase();
  const side = orderSide(direction);
  const entry = numberValue(body.entry);
  const stop = numberValue(body.stop);
  const target = numberValue(body.target);
  const accountSize = Math.max(numberValue(body.accountSize, 100000), 1);
  const currentEquity = Math.max(numberValue(body.currentEquity, accountSize), 1);
  const riskPercent = numberValue(body.riskPercent, 0.25);
  const riskAmount = accountSize * (riskPercent / 100);
  const tradesToday = numberValue(body.tradesToday);
  const maxTradesPerDay = Math.min(numberValue(body.maxTradesPerDay, 2), 2);
  const dailyPnl = numberValue(body.dailyPnl);
  const consecutiveLosses = numberValue(body.consecutiveLosses);
  const spreadPercent = numberValue(body.spreadPercent);
  const newsRisk = String(body.newsRisk || "low").toLowerCase();
  const journalNote = String(body.journalNote || "").trim();
  const challenge = body.challenge || {};
  const dailyStopPercent = numberValue(challenge.dailyStopPercent, 0.75);
  const capitalProtectionAtPercent = numberValue(challenge.capitalProtectionAtPercent, 5.5);
  const profitPercent = ((currentEquity - accountSize) / accountSize) * 100;
  const blockers = [];
  const warnings = [];

  if (!["mt5-bridge", "binance-testnet", "kucoin-mock", "ftmo-custom"].includes(exchange)) blockers.push("Unsupported execution platform.");
  if (exchange === "mt5-bridge" && !["protected-live", "live-preview"].includes(mode)) blockers.push("MT5 bridge requires Protected Live or Live Preview mode.");
  if (exchange === "kucoin-mock" && mode !== "preview") blockers.push("KuCoin is mock-only in v1.");
  if (exchange === "ftmo-custom" && mode !== "preview") blockers.push("FTMO profile is a challenge/rules model, not direct execution.");
  if (!["LONG", "SHORT"].includes(direction)) blockers.push("Invalid direction.");
  if (entry <= 0 || stop <= 0 || target <= 0) blockers.push("Entry, stop-loss, and target are required.");
  if (entry === stop) blockers.push("Stop-loss cannot equal entry.");
  if (direction === "LONG" && stop >= entry) blockers.push("LONG stop-loss must be below entry.");
  if (direction === "LONG" && target <= entry) blockers.push("LONG target must be above entry.");
  if (direction === "SHORT" && stop <= entry) blockers.push("SHORT stop-loss must be above entry.");
  if (direction === "SHORT" && target >= entry) blockers.push("SHORT target must be below entry.");
  if (riskPercent > 0.5) blockers.push("Risk per trade exceeds 0.5% challenge cap.");
  if (tradesToday >= maxTradesPerDay) blockers.push("Max 2 trades per day reached.");
  if (dailyPnl <= -(accountSize * (dailyStopPercent / 100))) blockers.push("Daily stop of -0.75% reached.");
  if (consecutiveLosses >= 2) blockers.push("Two consecutive losses: stop trading for the day.");
  if (spreadPercent > 0.08) blockers.push("Spread too wide.");
  if (newsRisk === "high") blockers.push("High-impact news risk.");
  if (journalNote.length < 10) blockers.push("Journal note required before approval.");
  if (profitPercent >= capitalProtectionAtPercent && riskPercent > 0.25) blockers.push("Capital-protection mode: reduce risk to 0.25% or less near target.");

  const riskPerUnit = Math.abs(entry - stop);
  const rewardRisk = riskPerUnit > 0 ? Math.abs(target - entry) / riskPerUnit : 0;
  if (rewardRisk < 1.5) blockers.push("Reward/risk must be at least 1.5R for challenge survival mode.");

  const quantity = riskPerUnit > 0 ? riskAmount / riskPerUnit : 0;
  if (quantity <= 0) blockers.push("Position size is too small.");
  if (mode === "preview" || mode === "live-preview") warnings.push("Live Preview: order will not be submitted.");
  if (exchange === "mt5-bridge" && mode === "protected-live") warnings.push("Manual approval and MT5 bridge health required before live submit.");
  if (exchange === "binance-testnet" && mode === "manual-testnet") warnings.push("Manual approval required before Binance Testnet submit.");

  const previewIdSource = [
    exchange,
    mode,
    symbol,
    side,
    entry.toFixed(8),
    stop.toFixed(8),
    target.toFixed(8),
    quantity.toFixed(8),
    riskPercent.toFixed(4),
  ].join("|");

  return {
    id: base64UrlEncode(previewIdSource).slice(0, 32),
    approved: blockers.length === 0,
    exchange,
    mode,
    symbol,
    side,
    type: "LIMIT",
    timeInForce: "GTC",
    quantity: Number(quantity.toFixed(6)),
    entry,
    stopLoss: stop,
    takeProfit: target,
    riskAmount: Number(riskAmount.toFixed(2)),
    riskPercent,
    rewardRisk: Number(rewardRisk.toFixed(2)),
    dailyStopPercent,
    maxDrawdownPercent: numberValue(challenge.maxDrawdownPercent, 6),
    targetPercent: numberValue(challenge.targetPercent, 6),
    capitalProtection: profitPercent >= capitalProtectionAtPercent,
    blockers,
    warnings,
  };
}

async function executionPreview(request, env) {
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);

  const preview = buildExecutionPreview(body);
  if (body.connectionOnly) {
    const configured =
      preview.exchange === "mt5-bridge"
        ? true
        : preview.exchange === "binance-testnet"
        ? Boolean(env.BINANCE_TESTNET_API_KEY && env.BINANCE_TESTNET_API_SECRET)
        : preview.exchange === "kucoin-mock";
    return jsonResponse({
      ok: true,
      connected: configured,
      reason:
        preview.exchange === "mt5-bridge"
          ? "Cloudflare approval guard is ready. Browser will check the local/VPS MT5 bridge directly."
          : configured
            ? "Execution adapter reachable."
            : "Adapter reachable, but testnet secrets are not configured.",
      preview,
    });
  }

  return jsonResponse(
    {
      ok: preview.approved,
      reason: preview.approved ? "Order preview approved. Manual approval is still required." : "Order preview blocked.",
      blockers: preview.blockers,
      preview,
    },
    preview.approved ? 200 : 422,
  );
}

async function executionApprove(request, env) {
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const secret = approvalSecret(env);
  if (!secret) {
    return jsonResponse({ ok: false, error: "Approval secret is not configured on Cloudflare." }, 503);
  }

  const preview = body.preview || {};
  if (!preview.approved) return jsonResponse({ ok: false, reason: "Preview is not approved." }, 422);
  const approvalAllowed =
    (preview.exchange === "mt5-bridge" && preview.mode === "protected-live") ||
    (preview.exchange === "binance-testnet" && preview.mode === "manual-testnet");
  if (!approvalAllowed) return jsonResponse({ ok: false, reason: "Only MT5 Protected Live or Binance Testnet manual mode can be approved." }, 422);

  const tokenPayload = {
    previewId: preview.id,
    exchange: preview.exchange,
    symbol: preview.symbol,
    side: preview.side,
    quantity: preview.quantity,
    price: preview.entry,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  const encoded = base64UrlEncode(tokenPayload);
  const signature = await hmacHex(secret, encoded);
  return jsonResponse({
    ok: true,
    reason: preview.exchange === "mt5-bridge" ? "Manual approval token issued for MT5 Protected Live." : "Manual approval token issued for Binance Testnet.",
    approvalToken: `${encoded}.${signature}`,
  });
}

async function verifyApprovalToken(token, env) {
  const secret = approvalSecret(env);
  if (!secret) return { ok: false, reason: "Approval secret is not configured." };
  const [encoded, signature] = String(token || "").split(".");
  if (!encoded || !signature) return { ok: false, reason: "Invalid approval token." };
  const expected = await hmacHex(secret, encoded);
  if (!constantTimeEqual(signature, expected)) return { ok: false, reason: "Approval token signature mismatch." };

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encoded));
  } catch (error) {
    return { ok: false, reason: "Approval token payload is invalid." };
  }

  if (Date.now() > payload.expiresAt) return { ok: false, reason: "Approval token expired." };
  return { ok: true, payload };
}

async function submitBinanceTestnet(request, env) {
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);

  const preview = body.preview || {};
  const token = await verifyApprovalToken(body.approvalToken, env);
  if (!token.ok) return jsonResponse({ ok: false, reason: token.reason }, 422);
  if (!env.BINANCE_TESTNET_API_KEY || !env.BINANCE_TESTNET_API_SECRET) {
    return jsonResponse({ ok: false, reason: "BINANCE_TESTNET_API_KEY and BINANCE_TESTNET_API_SECRET are not configured." }, 503);
  }
  if (preview.exchange !== "binance-testnet" || preview.mode !== "manual-testnet") {
    return jsonResponse({ ok: false, reason: "Only Binance Testnet manual mode can submit." }, 422);
  }
  if (!preview.approved || preview.blockers?.length) {
    return jsonResponse({ ok: false, reason: "Preview is blocked." }, 422);
  }
  if (token.payload.previewId !== preview.id) {
    return jsonResponse({ ok: false, reason: "Approval token does not match preview." }, 422);
  }

  const params = new URLSearchParams({
    symbol: preview.symbol,
    side: preview.side,
    type: "LIMIT",
    timeInForce: "GTC",
    quantity: String(preview.quantity),
    price: String(preview.entry),
    newClientOrderId: `zt_${preview.id}`.slice(0, 32),
    timestamp: String(Date.now()),
    recvWindow: "5000",
  });
  const query = params.toString();
  const signature = await hmacHex(env.BINANCE_TESTNET_API_SECRET, query);
  const response = await fetch(`${BINANCE_TESTNET_BASE}/v3/order?${query}&signature=${signature}`, {
    method: "POST",
    headers: {
      "X-MBX-APIKEY": env.BINANCE_TESTNET_API_KEY,
      Accept: "application/json",
    },
  });
  const data = await response.json().catch(() => ({ error: "Binance returned a non-JSON response." }));

  return jsonResponse(
    {
      ok: response.ok,
      reason: response.ok ? "Binance Testnet LIMIT order submitted." : data.msg || "Binance Testnet submit failed.",
      request: {
        baseUrl: BINANCE_TESTNET_BASE,
        symbol: preview.symbol,
        side: preview.side,
        type: "LIMIT",
        quantity: preview.quantity,
        price: preview.entry,
        exitPlan: { stopLoss: preview.stopLoss, takeProfit: preview.takeProfit },
      },
      response: data,
      preview,
    },
    response.ok ? 200 : response.status,
  );
}

function fallbackReview(context) {
  const account = context.account || {};
  const challenge = context.challenge || {};
  const market = context.market || {};
  const strategy = context.strategy || {};
  const riskAmount = Number(account.initialCapital || 0) * Number(account.riskPerTradePercent || 0);
  const target = Number(account.initialCapital || 0) * Number(challenge.profitTargetPercent || 0);

  return [
    "LOCAL RULE REVIEW",
    "",
    `Strategy candidate: ${strategy.label || "Unknown strategy"}`,
    `Primary market: ${market.label || "Unknown market"}`,
    `Challenge model: ${challenge.label || "Unknown challenge"}`,
    "",
    "Plan:",
    `- Risk per trade stays near ${Math.round(riskAmount)} account currency units and must never exceed 1%.`,
    `- Profit target is near ${Math.round(target)}, but daily loss and max loss rules come first.`,
    `- Entry must match: ${strategy.entry || "defined technical setup"}`,
    `- Invalidation: ${strategy.invalidation || "predefined stop-loss and structure failure"}`,
    `- Avoid: ${market.avoid || "high-impact news and abnormal spread"}`,
    "",
    "Required evidence before live:",
    "- Backtest and protected live audit sample with positive expectancy after fees/slippage.",
    "- No selected challenge daily loss or max loss violations.",
    "- Journal proves the same setup was followed repeatedly.",
  ].join("\n");
}

async function marketData(request) {
  const url = new URL(request.url);
  const requestedIds = url.searchParams.get("ids") || CRYPTO_ASSETS.map((asset) => asset.id).join(",");
  const endpoint = `${COINGECKO_SIMPLE_PRICE}?ids=${encodeURIComponent(requestedIds)}&vs_currencies=usd&include_24hr_change=true`;
  const assets = [];
  const errors = [];

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ZeusTrading/1.0",
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.status?.error_message || "CoinGecko request failed.");
    CRYPTO_ASSETS.forEach((asset) => {
      const quote = data[asset.id] || {};
      assets.push({
        symbol: asset.symbol,
        label: asset.label,
        price: Number(quote.usd || 0),
        change: Number(quote.usd_24h_change || 0),
        type: "crypto",
        source: "CoinGecko live",
      });
    });
  } catch (error) {
    errors.push(`CoinGecko: ${error.message}`);
  }

  try {
    const delayed = await fetchStooqAssets();
    delayed.forEach((asset) => assets.push(asset));
  } catch (error) {
    errors.push(`Stooq delayed: ${error.message}`);
  }

  try {
    const existing = new Set(assets.map((asset) => asset.symbol));
    const missingDelayed = STOOQ_ASSETS.some((asset) => !existing.has(asset.symbol));
    if (missingDelayed) {
      const yahooDelayed = await fetchYahooAssets();
      yahooDelayed.filter((asset) => !existing.has(asset.symbol)).forEach((asset) => assets.push(asset));
    }
  } catch (error) {
    errors.push(`Yahoo delayed: ${error.message}`);
  }

  if (!assets.length) {
    return jsonResponse({ error: "All market data providers unavailable.", errors }, 502);
  }

  return jsonResponse(
    {
      source: "CoinGecko live + Stooq delayed quotes",
      updatedAt: new Date().toISOString(),
      assets,
      errors,
    },
    200,
  );
}

async function fetchYahooAssets() {
  const symbols = YAHOO_ASSETS.map((asset) => asset.code).join(",");
  const endpoint = `${YAHOO_QUOTE_BASE}?symbols=${encodeURIComponent(symbols)}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 ZeusTrading/1.0",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  const rows = data.quoteResponse?.result || [];
  if (!Array.isArray(rows) || !rows.length) throw new Error("empty quote response");
  return rows.flatMap((row) => {
    const meta = YAHOO_ASSETS.find((asset) => asset.code === row.symbol);
    const price = Number(row.regularMarketPrice || row.postMarketPrice || row.preMarketPrice);
    if (!meta || !Number.isFinite(price) || price <= 0) return [];
    return {
      symbol: meta.symbol,
      label: meta.label,
      price,
      change: Number(row.regularMarketChangePercent || 0),
      volume: Number(row.regularMarketVolume || 0),
      type: meta.type,
      source: "Yahoo delayed",
      providerTime: row.regularMarketTime ? new Date(Number(row.regularMarketTime) * 1000).toISOString() : "",
    };
  });
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells.map((value) => value.trim().replace(/^"|"$/g, ""));
}

async function fetchStooqAssets() {
  const rows = await Promise.all(
    STOOQ_ASSETS.map(async (asset) => {
      const endpoint = `${STOOQ_QUOTE_BASE}?s=${encodeURIComponent(asset.code)}&f=sd2t2ohlcv&e=csv`;
      const response = await fetch(endpoint, {
        headers: {
          Accept: "text/csv",
          "User-Agent": "ZeusTrading/1.0",
        },
      });
      if (!response.ok) return null;
      const csv = (await response.text()).trim();
      const line = csv.split(/\r?\n/).filter(Boolean).at(-1);
      return line ? parseCsvLine(line) : null;
    }),
  );
  const assets = rows.flatMap((row) => {
    if (!row) return [];
    const [code, date, time, open, high, low, close, volume] = row;
    const meta = STOOQ_ASSETS.find((asset) => asset.code.toLowerCase() === String(code).toLowerCase());
    const price = Number(close);
    const openPrice = Number(open);
    if (!meta || !Number.isFinite(price) || price <= 0) return [];
    const change = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : 0;
    return {
      symbol: meta.symbol,
      label: meta.label,
      price,
      change,
      volume: Number(volume || 0),
      type: meta.type,
      source: "Stooq delayed",
      providerTime: `${date || ""} ${time || ""}`.trim(),
    };
  });
  if (!assets.length) throw new Error("empty CSV");
  return assets;
}

function parseMaybeJson(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function normalizePolymarketMarket(market) {
  const outcomes = parseMaybeJson(market.outcomes, []);
  const prices = parseMaybeJson(market.outcomePrices || market.outcome_prices, []);
  const yesIndex = Math.max(outcomes.findIndex((outcome) => String(outcome).toLowerCase() === "yes"), 0);
  const yesPrice = Number(prices[yesIndex] || prices[0] || market.lastTradePrice || 0);
  const volume = Number(market.volumeNum || market.volume || market.volume24hr || 0);
  return {
    source: "Polymarket Gamma",
    venue: "polymarket",
    id: String(market.id || market.conditionId || market.slug || ""),
    title: market.question || market.title || market.slug || "Polymarket market",
    category: market.category || market.groupItemTitle || "prediction",
    probability: Number.isFinite(yesPrice) ? yesPrice : 0,
    volume,
    liquidity: Number(market.liquidityNum || market.liquidity || 0),
    url: market.slug ? `https://polymarket.com/market/${market.slug}` : "https://polymarket.com/",
  };
}

function macroRiskFromPredictionMarkets(markets, query) {
  const top = markets[0];
  const macroQuery = /fed|fomc|cpi|nfp|payroll|rate|inflation|gdp|unemployment/i.test(query);
  const highProb = markets.some((market) => market.probability >= 0.75 || market.probability <= 0.25);
  const liquid = markets.some((market) => Number(market.volume || 0) > 1000000 || Number(market.liquidity || 0) > 100000);
  const riskLevel = macroQuery && (highProb || liquid) ? "medium" : "low";
  return {
    risk_level: riskLevel,
    ftmo_action: riskLevel === "medium" ? "Reduce size or preview only around this event window." : "Informational context only.",
    reason: top
      ? `${top.title}: implied probability ${(top.probability * 100).toFixed(1)}%, volume ${Math.round(top.volume || 0)}.`
      : "No prediction market data returned.",
  };
}

function normalizeCalendarEvent(row) {
  return {
    time: row.time || row.date || row.datetime || "TBD",
    currency: row.currency || row.country || row.region || "ALL",
    impact: String(row.impact || row.importance || "medium").toLowerCase().includes("high")
      ? "high"
      : String(row.impact || row.importance || "medium").toLowerCase().includes("low")
        ? "low"
        : "medium",
    event: row.title || row.event || row.name || "Economic event",
    reason: row.reason || "Use as macro/news risk context before Protected Live execution.",
    action: row.action || "Journal the event and block/preview according to policy.",
  };
}

function calendarRiskLevel(events) {
  if (events.some((event) => event.impact === "high")) return "high";
  if (events.some((event) => event.impact === "medium")) return "medium";
  return "low";
}

async function economicCalendar(request) {
  const url = new URL(request.url);
  const focus = String(url.searchParams.get("focus") || "all").toLowerCase();
  let events = CALENDAR_FALLBACK;
  let source = "protected fallback + Investing.com manual verification";
  let providerNote = "Investing.com economic calendar is linked for human verification; the app uses normalized risk gates.";

  try {
    const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      headers: {
        Accept: "application/json",
        "User-Agent": "ZeusTrading/1.0",
      },
    });
    if (response.ok) {
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      events = rows
        .slice(0, 80)
        .map((row) =>
          normalizeCalendarEvent({
            time: row.date || row.time,
            currency: row.country || row.currency,
            impact: row.impact,
            event: row.title,
            reason: "ForexFactory-style weekly calendar proxy. Verify final details on Investing.com before trading.",
            action: String(row.impact || "").toLowerCase() === "high" ? "Block high-impact windows." : "Preview-only if spread/ATR expands.",
          }),
        )
        .filter((event) => event.event && event.currency);
      source = "weekly economic calendar proxy";
      providerNote = "Use this as normalized macro risk context and confirm exact event timing on Investing.com.";
    }
  } catch (error) {
    providerNote = `Calendar provider unavailable: ${error.message}. Fallback risk events loaded.`;
  }

  const filtered = events.filter((event) => {
    if (focus === "all") return true;
    const currency = String(event.currency || "").toLowerCase();
    const text = `${event.event || ""} ${event.reason || ""}`.toLowerCase();
    if (focus === "usd") return currency.includes("usd") || currency.includes("us") || text.includes("gold") || text.includes("indices");
    if (focus === "eur") return currency.includes("eur") || text.includes("eur");
    if (focus === "crypto") return currency.includes("crypto") || text.includes("crypto") || text.includes("btc") || text.includes("bitcoin");
    return true;
  });

  return jsonResponse({
    ok: true,
    source,
    providerNote,
    updatedAt: new Date().toISOString(),
    sourceLinks: {
      investingCalendar: "https://www.investing.com/economic-calendar/",
      polymarket: "https://polymarket.com/",
      mexcTestnet: "https://futures.testnet.mexc.com/futures/BTC_USDT",
      octobot: "https://www.octobot.cloud/explore",
    },
    riskLevel: calendarRiskLevel(filtered),
    events: filtered.slice(0, 18),
    safety: "Economic calendar is a blocker/context feed only. It does not generate direct orders.",
  });
}

function stripXml(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function inferNewsMeta(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("bitcoin") || text.includes("crypto") || text.includes("ethereum")) {
    return { category: "Crypto", image: NEWS_IMAGES.crypto, risk: "medium" };
  }
  if (text.includes("fed") || text.includes("cpi") || text.includes("jobs") || text.includes("inflation") || text.includes("rate")) {
    return { category: "Macro", image: NEWS_IMAGES.macro, risk: "high" };
  }
  if (text.includes("gold") || text.includes("dollar") || text.includes("euro") || text.includes("forex")) {
    return { category: "Forex / Gold", image: NEWS_IMAGES.forex, risk: "medium" };
  }
  return { category: "Stocks", image: NEWS_IMAGES.stocks, risk: "low" };
}

async function newsFeed() {
  let items = NEWS_FALLBACK;
  let source = "protected fallback + InsiderWave-style research links";
  try {
    const response = await fetch("https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,NVDA,AMD,TSLA,BTC-USD,GC=F,EURUSD=X&region=US&lang=en-US", {
      headers: {
        Accept: "application/rss+xml,text/xml",
        "User-Agent": "ZeusTrading/1.0",
      },
    });
    if (response.ok) {
      const xml = await response.text();
      const rows = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
        .slice(0, 8)
        .map((match) => {
          const item = match[1];
          const title = stripXml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
          const summary = stripXml(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "");
          const url = stripXml(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "https://finance.yahoo.com/");
          const publishedAt = stripXml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "");
          const meta = inferNewsMeta(title, summary);
          return {
            title,
            source: "Yahoo Finance RSS",
            category: meta.category,
            summary: summary.slice(0, 220) || "Market catalyst loaded. Use as context only.",
            url,
            image: meta.image,
            risk: meta.risk,
            publishedAt,
          };
        })
        .filter((item) => item.title);
      if (rows.length) {
        items = rows;
        source = "Yahoo Finance RSS + Zeus image/risk normalization";
      }
    }
  } catch (error) {
    source = `fallback news (${error.message})`;
  }

  return jsonResponse({
    ok: true,
    source,
    updatedAt: new Date().toISOString(),
    items,
    sourceLinks: {
      insiderwave: "https://insiderwave.com/",
      investing: "https://www.investing.com/",
      investingCalendar: "https://www.investing.com/economic-calendar/",
      polymarket: "https://polymarket.com/",
      coinmarketcap: "https://coinmarketcap.com/",
    },
    safety: "News is a risk/catalyst feed only. It never creates direct orders.",
  });
}

async function botConnectors(env = {}) {
  return jsonResponse({
    ok: true,
    updatedAt: new Date().toISOString(),
    connectors: BOT_CONNECTORS,
    skills: CMC_SKILLS,
    providerStatus: {
      apibricksConfigured: Boolean(env.APIBRICKS_API_KEY),
      apibricksTeamId: "54a30dc6-46dc-4dac-93a7-72ad3f4288ee",
      secretPolicy: "Set APIBRICKS_API_KEY as a Cloudflare Pages secret. Never paste provider keys into frontend fields.",
    },
    sourceLinks: {
      pionexBot: "https://www.pionex.com/en/trade/BTC_USDT/Bot",
      pionexDocs: "https://www.pionex.com/docs/api-docs",
      agentscope: "https://agentscope.io/",
      agentscopeDocs: "https://docs.agentscope.io/basic-concepts/agent",
      apibricksConsole: "https://console.apibricks.io/team/54a30dc6-46dc-4dac-93a7-72ad3f4288ee",
      apibricksDocs: "https://www.apibricks.io/platform/docs/customer-portal/billing",
      cmcAgent: "https://coinmarketcap.com/api/agent/",
      cmcSkills: "https://coinmarketcap.com/api/skills-marketplace/",
      threeCommasDashboard: "https://app.3commas.io/d",
    },
    safety: "Connectors are research/preview routes until explicit venue API credentials, no-withdraw permissions, risk gate, manual approval and audit logs are configured.",
  });
}

async function botConnectorPreview(request, env) {
  const body = (await readJson(request)) || {};
  const connector = BOT_CONNECTORS.find((item) => item.id === String(body.connector || "")) || BOT_CONNECTORS[0];
  const symbol = normalizeSymbol(body.symbol || "BTCUSDT");
  const riskPercent = clampNumber(numberValue(body.riskPercent, 0.25), 0, 3);
  const noWithdrawPermission = body.noWithdrawPermission !== false;
  const manualApprovalRequired = body.manualApprovalRequired !== false;
  const account = fundedEliteState(body.account || {});
  const blockers = [];
  const warnings = [];

  if (!noWithdrawPermission) blockers.push("External exchange/API keys must not have withdrawal permission.");
  if (!manualApprovalRequired) blockers.push("Manual Zeus approval is required before any external connector action.");
  if (riskPercent > 0.5) blockers.push("Connector risk is above protected-live max of 0.5%.");
  if (account.dailyLossBufferRemaining <= 0) blockers.push("Daily drawdown buffer is breached.");
  if (account.maxDrawdownBufferRemaining <= 0) blockers.push("Max drawdown buffer is breached.");
  if (connector.id === "cmc-agent-skills") warnings.push("CMC Skills provide analysis/data routing only, not execution.");
  if (connector.id === "agentscope-runtime") warnings.push("AgentScope coordinates agent roles only; Zeus risk gates and manual approval remain the execution authority.");
  if (connector.id === "apibricks-console") {
    warnings.push("APIBricks is a backend API provider connector. Store keys only in Cloudflare secrets.");
    if (!env.APIBRICKS_API_KEY) warnings.push("APIBRICKS_API_KEY secret is not configured yet; connector stays in setup/preview mode.");
  }
  if (connector.id === "pionex-bot") warnings.push("Pionex bot setup must be reviewed manually on Pionex before starting any bot.");
  if (connector.id === "threecommas-dashboard") warnings.push("3Commas API/venue permissions must be configured outside browser JS.");

  const preview = {
    connector: connector.id,
    venue: connector.venue,
    symbol,
    useCase: String(body.useCase || "market-analysis"),
    approved_for_research: blockers.length === 0,
    live_execution_enabled: false,
    decision: blockers.length ? "BLOCK_CONNECTOR_PREVIEW" : "RESEARCH_PREVIEW_READY",
    blockers,
    warnings,
    required_controls: [
      "No withdrawal permission on external API keys",
      "Manual approval in Zeus before external action",
      "Hard risk gate and daily/max drawdown buffer",
      "Journal/audit entry before and after connector use",
      "Venue-side 2FA/login remains user-controlled",
    ],
    suggested_skill_route:
      connector.id === "agentscope-runtime"
        ? ["Market Scanner Agent", "News Risk Agent", "Strategy Validator", "Prop Rules Agent", "Risk Gate", "Supervisor"]
        : connector.id === "apibricks-console"
          ? ["API key inventory", "Usage quotas", "Request logs", "Provider health", "Secret policy"]
        : connector.id === "cmc-agent-skills"
        ? ["CMC MCP", "Market Report", "Crypto Research"]
        : connector.id === "threecommas-dashboard"
          ? ["Market Report", "Risk Gate", "SmartTrade preview"]
          : ["Market Report", "Grid range research", "DCA risk cap"],
    external_url: connector.url,
    timestamp: new Date().toISOString(),
  };

  await saveJournalEntry(request, env, preview.approved_for_research ? "bot_connector_preview_ready" : "bot_connector_preview_blocked", preview);
  return jsonResponse({ ok: true, preview });
}

async function predictionMarkets(request, env) {
  const url = new URL(request.url);
  const query = String(url.searchParams.get("q") || "fomc").trim().slice(0, 80);
  const limit = Math.min(Math.max(numberValue(url.searchParams.get("limit"), 8), 1), 12);
  const source = String(url.searchParams.get("source") || "auto");
  const markets = [];
  let provider = "polymarket-gamma";
  let providerNote = "Polymarket public Gamma API; read-only market intelligence.";

  if (env.ODDPOOL_API_KEY && source !== "polymarket") {
    const oddpoolUrl = `${ODDPOOL_API_BASE}/search/events?q=${encodeURIComponent(query)}&status=active&sort_by=volume&limit=${limit}`;
    const response = await fetch(oddpoolUrl, {
      headers: { Accept: "application/json", "X-API-Key": env.ODDPOOL_API_KEY },
    });
    if (response.ok) {
      const data = await response.json().catch(() => []);
      const rows = Array.isArray(data) ? data : data.events || data.results || [];
      for (const row of rows.slice(0, limit)) {
        markets.push({
          source: "Oddpool",
          venue: row.exchange || row.platform || "prediction",
          id: String(row.event_id || row.id || row.market_id || ""),
          title: row.title || row.event_title || row.market_title || "Prediction market event",
          category: row.category || "prediction",
          probability: Number(row.probability || row.price || row.yes_ask || 0),
          volume: Number(row.total_volume || row.volume || 0),
          liquidity: Number(row.total_liquidity || row.liquidity || 0),
          url: row.url || "https://www.oddpool.com/",
        });
      }
      provider = "oddpool";
      providerNote = "Oddpool normalized Kalshi/Polymarket search; read-only unless explicit trading integration is added later.";
    }
  }

  if (!markets.length) {
    const searchUrl = `${POLYMARKET_GAMMA_BASE}/public-search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const searchResponse = await fetch(searchUrl, { headers: { Accept: "application/json" } });
    if (searchResponse.ok) {
      const data = await searchResponse.json().catch(() => ({}));
      const eventMarkets = (data.events || [])
        .flatMap((event) => event.markets || [])
        .filter((market) => market.active !== false && market.closed !== true && market.acceptingOrders !== false);
      eventMarkets.slice(0, limit).map(normalizePolymarketMarket).forEach((market) => markets.push(market));
    }
  }

  if (!markets.length) {
    const gammaUrl = `${POLYMARKET_GAMMA_BASE}/markets?active=true&closed=false&limit=${limit}&ascending=false&order=volume`;
    const response = await fetch(gammaUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return jsonResponse({ ok: false, error: "Prediction market data unavailable.", provider, status: response.status }, 502);
    }
    const data = await response.json().catch(() => []);
    const rows = Array.isArray(data) ? data : data.markets || [];
    rows
      .filter((market) => market.active !== false && market.closed !== true)
      .slice(0, limit)
      .map(normalizePolymarketMarket)
      .forEach((market) => markets.push(market));
  }

  const risk = macroRiskFromPredictionMarkets(markets, query);
  return jsonResponse({
    ok: true,
    provider,
    provider_note: providerNote,
    query,
    markets,
    ftmo_context: {
      ...risk,
      usage: "Use as News/Macro Risk context only. Do not use prediction-market odds as a direct MT5 signal.",
      safety: "Polymarket execution is not connected. FTMO execution remains MT5 protected live only.",
    },
    strategies: [
      "FTMO macro shield: if FOMC/CPI/NFP probabilities reprice sharply, switch to preview-only or no-trade.",
      "Liquidity filter: ignore prediction markets with weak volume/liquidity or wide spreads.",
      "Sentiment divergence: use event odds as context for USD/gold/indices bias, then confirm only on your own chart.",
      "Polymarket paper-only: odds momentum and cross-venue arbitrage are separate strategies, not FTMO trades.",
    ],
    updated_at: new Date().toISOString(),
  });
}

function normalizeClobMarket(market) {
  const tokens = Array.isArray(market.tokens) ? market.tokens : [];
  return {
    condition_id: market.condition_id,
    question: market.question,
    market_slug: market.market_slug,
    accepting_orders: Boolean(market.accepting_orders),
    active: Boolean(market.active),
    closed: Boolean(market.closed),
    minimum_order_size: Number(market.minimum_order_size || 0),
    minimum_tick_size: Number(market.minimum_tick_size || 0.01),
    tokens: tokens.map((token) => ({
      token_id: String(token.token_id || ""),
      outcome: token.outcome,
      price: Number(token.price || 0),
    })),
  };
}

async function clobMarkets(request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(numberValue(url.searchParams.get("limit"), 8), 1), 20);
  const response = await fetch(`${POLYMARKET_CLOB_BASE}/sampling-markets?limit=${limit}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return jsonResponse({ ok: false, error: "Polymarket CLOB markets unavailable.", status: response.status }, 502);
  const data = await response.json().catch(() => ({ data: [] }));
  const markets = (data.data || [])
    .filter((market) => market.active && !market.closed && market.accepting_orders)
    .slice(0, limit)
    .map(normalizeClobMarket);
  return jsonResponse({
    ok: true,
    venue: "polymarket-clob",
    safety: "Read-only discovery. Trading requires wallet-side signing and explicit user approval.",
    markets,
    updated_at: new Date().toISOString(),
  });
}

async function clobOrderbook(request) {
  const url = new URL(request.url);
  const tokenId = String(url.searchParams.get("token_id") || "").replace(/[^0-9]/g, "");
  if (!tokenId) return jsonResponse({ ok: false, error: "token_id is required." }, 400);
  const response = await fetch(`${POLYMARKET_CLOB_BASE}/book?token_id=${tokenId}`, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({ error: "CLOB returned non-JSON response." }));
  if (!response.ok) return jsonResponse({ ok: false, error: data.error || "CLOB orderbook unavailable.", response: data }, response.status);
  return jsonResponse({
    ok: true,
    venue: "polymarket-clob",
    orderbook: data,
    best_bid: data.bids?.at?.(-1) || data.bids?.[0] || null,
    best_ask: data.asks?.[0] || null,
    safety: "Orderbook is read-only. Preview does not sign or submit orders.",
  });
}

async function clobPreview(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  if (!body) return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  const kill = await killSwitchState(request, env);
  const tokenId = String(body.tokenId || "").replace(/[^0-9]/g, "");
  const side = String(body.side || "BUY").toUpperCase();
  const outcome = String(body.outcome || "YES").toUpperCase();
  const price = numberValue(body.price);
  const size = numberValue(body.size);
  const maxSpend = numberValue(body.maxSpend, 50);
  const walletProvider = String(body.walletProvider || "phantom-terminal");
  const compliance = body.compliance || {};
  const walletApproval = body.walletApproval || {};
  let storedWalletApproval = null;
  const blockers = [];
  const warnings = [];
  if (walletApproval.id) {
    storedWalletApproval = await env.zeustrading_users
      .prepare("SELECT * FROM wallet_approvals WHERE id = ?")
      .bind(String(walletApproval.id))
      .first();
  }
  if (kill.active) blockers.push("Kill switch is active.");
  if (!compliance.checked) blockers.push("Compliance/geofence check is required before CLOB preview.");
  if (compliance.blocked) blockers.push(compliance.reason || "Compliance check blocked this wallet route.");
  if (!walletApproval.walletAddress) blockers.push("Wallet address is required before CLOB preview.");
  if (!walletApproval.id) blockers.push("Stored wallet approval id is required before CLOB preview.");
  if (!storedWalletApproval) {
    blockers.push("Wallet approval was not found in the audit store. Sign the preview approval first.");
  } else {
    const storedPayload = JSON.parse(storedWalletApproval.payload || "{}");
    const storedApproval = storedPayload.approval || {};
    if (storedWalletApproval.wallet_address !== walletApproval.walletAddress) blockers.push("Wallet approval address does not match audit store.");
    if (storedApproval.audit_only !== true) blockers.push("Wallet approval proof must be audit-only protected approval.");
    if (storedApproval.live_submit_locked !== true) blockers.push("Wallet approval must keep live submit locked.");
  }
  if (!tokenId) blockers.push("Polymarket CLOB token_id is required.");
  if (!["BUY", "SELL"].includes(side)) blockers.push("Side must be BUY or SELL.");
  if (!["YES", "NO"].includes(outcome)) warnings.push("Outcome should be YES or NO for binary markets.");
  if (price <= 0 || price >= 1) blockers.push("CLOB price must be between 0 and 1.");
  if (size <= 0) blockers.push("Order size is required.");
  const notional = side === "BUY" ? price * size : size;
  if (notional > maxSpend) blockers.push("Order notional exceeds wallet/CLOB max spend cap.");
  if (size < 5) blockers.push("Polymarket minimum order size is commonly 5 shares or higher.");
  if (!String(body.marketUrl || "").includes("polymarket.com") && body.marketUrl) warnings.push("Market URL is not a Polymarket URL.");
  warnings.push("Preview only: browser wallet must sign any future order. Backend will not store seed phrase or private key.");
  warnings.push("This CLOB/wallet system is separate from FTMO/MT5.");
  const preview = {
    id: base64UrlEncode(["clob", tokenId, side, outcome, price, size, Date.now()].join("|")).slice(0, 32),
    venue: "polymarket-clob",
    walletProvider,
    tokenId,
    marketUrl: String(body.marketUrl || "https://polymarket.com/"),
    side,
    outcome,
    price,
    size,
    notional: Number(notional.toFixed(2)),
    maxSpend,
    walletAddress: walletApproval.walletAddress || "",
    compliance,
    walletApproval: walletApproval.id
      ? {
          id: walletApproval.id,
          walletAddress: walletApproval.walletAddress,
          walletProvider: walletApproval.walletProvider,
          signature_verified: false,
          audit_only: true,
          created_at: storedWalletApproval?.created_at || walletApproval.created_at,
        }
      : null,
    preview_ready: blockers.length === 0,
    approval_required: true,
    wallet_signature_required: true,
    compliance_required: true,
    submit_locked: true,
    blockers,
    warnings,
    created_at: new Date().toISOString(),
  };
  await saveJournalEntry(request, env, preview.preview_ready ? "clob_wallet_preview_ready" : "clob_wallet_preview_blocked", preview);
  return jsonResponse({ ok: preview.preview_ready, preview }, preview.preview_ready ? 200 : 422);
}

async function clobSubmit(request, env) {
  if (!(await ensureExecutionAuditSchema(env))) return jsonResponse({ ok: false, error: "D1 database is not configured." }, 503);
  const body = await readJson(request);
  await saveJournalEntry(request, env, "clob_submit_blocked", {
    reason: "CLOB live submit is intentionally locked. Wallet signing and compliance approvals are audit gates only until a regulated signer/order adapter is implemented.",
    request: body || {},
  });
  return jsonResponse(
    {
      ok: false,
      order_status: "LOCKED",
      reason: "CLOB submit is not enabled. Open Phantom Terminal or Polymarket manually; Zeus only builds previews and audit logs for now.",
      next_step: "Use Open Phantom Terminal, connect wallet yourself, and never share seed phrase/private key.",
    },
    423,
  );
}

async function openRouterAgent(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const context = body.context || {};
  const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const apiKey = env.OPENROUTER_API_KEY;
  const fallback = fallbackReview(context);

  if (!apiKey) {
    return jsonResponse(
      {
        error: "OPENROUTER_API_KEY is not configured on Cloudflare Pages.",
        model,
        fallback,
      },
      503,
    );
  }

  const systemPrompt = [
    "You are Zeus Trading Protected Live Trade Supervisor.",
    "You help supervise rule-based strategy candidates for FTMO, FundedElite Flash Activation, and similar prop-firm evaluation accounts through a protected MT5 bridge workflow.",
    "Do not promise profit, do not guarantee passing any challenge, and do not tell the user to blindly enter trades.",
    "Always prioritize risk limits, stop-loss, target, max daily loss, max loss, spread/news filters, MT5 bridge health, manual approval, journaling, audit logs, and kill switch readiness.",
    "Use TradingView/forum ideas only as educational hypotheses that must be confirmed by the user's own chart and risk rules.",
    "Output in Croatian/Bosnian/Serbian. Be concise, practical, and structured.",
  ].join(" ");

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://zeustrading.online",
      "X-Title": "Zeus Trading Prop-Firm Agent",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            "Review this selected prop-firm protected-live strategy-agent context and produce a cautious supervision plan.",
            "Include: challenge rules, strategy thesis, entry conditions, invalidation, news filter, risk plan, MT5 bridge readiness, audit evidence required, and final approve/block verdict.",
            "Do not give financial advice. Treat this as protected live supervision with mandatory manual approval.",
            JSON.stringify(context, null, 2),
          ].join("\n\n"),
        },
      ],
      temperature: 0.25,
      max_tokens: 1200,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    return jsonResponse({ error: "OpenRouter returned a non-JSON response.", model, fallback }, 502);
  }

  if (!response.ok) {
    return jsonResponse({ error: data.error?.message || "OpenRouter request failed.", model, fallback }, response.status);
  }

  return jsonResponse({
    model: data.model || model,
    content: data.choices?.[0]?.message?.content || fallback,
    fallback,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth/register" && request.method === "POST") {
      return authRegister(request, env);
    }
    if (url.pathname === "/auth/login" && request.method === "POST") {
      return authLogin(request, env);
    }
    if (url.pathname === "/auth/logout" && request.method === "POST") {
      return authLogout(request, env);
    }
    if (url.pathname === "/auth/me" && request.method === "GET") {
      return authMe(request, env);
    }
    if (url.pathname === "/auth/profile" && request.method === "POST") {
      return authProfile(request, env);
    }
    if (url.pathname === "/execution/preview" && request.method === "POST") {
      return executionPreview(request, env);
    }
    if (url.pathname === "/execution/preview") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/execution/approve" && request.method === "POST") {
      return executionApprove(request, env);
    }
    if (url.pathname === "/execution/approve") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/execution/audit" && request.method === "POST") {
      return executionAudit(request, env);
    }
    if (url.pathname === "/execution/audit") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/execution/submit-testnet" && request.method === "POST") {
      return submitBinanceTestnet(request, env);
    }
    if (url.pathname === "/execution/submit-testnet") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/agent/run-cycle" && request.method === "POST") {
      return agentRunCycle(request, env);
    }
    if (url.pathname === "/api/agent/run-cycle") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/mt5/preview" && request.method === "POST") {
      return mt5Preview(request, env);
    }
    if (url.pathname === "/api/mt5/preview") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/mt5/approve" && request.method === "POST") {
      return mt5Approve(request, env);
    }
    if (url.pathname === "/api/mt5/approve") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/kill-switch" && ["GET", "POST"].includes(request.method)) {
      return killSwitchApi(request, env);
    }
    if (url.pathname === "/api/kill-switch") {
      return jsonResponse({ error: "Use GET or POST." }, 405);
    }
    if (url.pathname === "/api/journal" && ["GET", "POST"].includes(request.method)) {
      return journalApi(request, env);
    }
    if (url.pathname === "/api/journal") {
      return jsonResponse({ error: "Use GET or POST." }, 405);
    }
    if (url.pathname === "/api/market-data" && request.method === "GET") {
      return marketData(request);
    }
    if (url.pathname === "/api/market-data") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/prediction-markets" && request.method === "GET") {
      return predictionMarkets(request, env);
    }
    if (url.pathname === "/api/prediction-markets") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/economic-calendar" && request.method === "GET") {
      return economicCalendar(request);
    }
    if (url.pathname === "/api/economic-calendar") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/news-feed" && request.method === "GET") {
      return newsFeed();
    }
    if (url.pathname === "/api/news-feed") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/bot-connectors" && request.method === "GET") {
      return botConnectors(env);
    }
    if (url.pathname === "/api/bot-connectors") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/bot-connectors/preview" && request.method === "POST") {
      return botConnectorPreview(request, env);
    }
    if (url.pathname === "/api/bot-connectors/preview") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/compliance/check" && request.method === "POST") {
      return complianceCheck(request, env);
    }
    if (url.pathname === "/api/compliance/check") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/wallet/challenge" && request.method === "POST") {
      return walletChallenge(request, env);
    }
    if (url.pathname === "/api/wallet/challenge") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/wallet/approval" && request.method === "POST") {
      return walletApproval(request, env);
    }
    if (url.pathname === "/api/wallet/approval") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/clob/markets" && request.method === "GET") {
      return clobMarkets(request);
    }
    if (url.pathname === "/api/clob/markets") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/clob/orderbook" && request.method === "GET") {
      return clobOrderbook(request);
    }
    if (url.pathname === "/api/clob/orderbook") {
      return jsonResponse({ error: "Use GET." }, 405);
    }
    if (url.pathname === "/api/clob/preview" && request.method === "POST") {
      return clobPreview(request, env);
    }
    if (url.pathname === "/api/clob/preview") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/clob/submit" && request.method === "POST") {
      return clobSubmit(request, env);
    }
    if (url.pathname === "/api/clob/submit") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    if (url.pathname === "/api/openrouter-agent" && request.method === "POST") {
      return openRouterAgent(request, env);
    }
    if (url.pathname === "/api/openrouter-agent") {
      return jsonResponse({ error: "Use POST." }, 405);
    }
    return env.ASSETS.fetch(request);
  },
};
