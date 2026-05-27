const fmtUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const fmtPrice = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const fmtCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const rules = {
  twoStep: {
    provider: "FTMO",
    label: "2-Step Challenge",
    target: 0.1,
    dailyLoss: 0.05,
    maxLoss: 0.1,
    trailingMaxLoss: false,
    minDays: 4,
    dailyStopPercent: 0.75,
    capitalProtectionAtPercent: 9.5,
    source: "FTMO Trading Objectives",
  },
  oneStep: {
    provider: "FTMO",
    label: "1-Step Challenge",
    target: 0.1,
    dailyLoss: 0.03,
    maxLoss: 0.1,
    trailingMaxLoss: true,
    minDays: 0,
    dailyStopPercent: 0.75,
    capitalProtectionAtPercent: 9.5,
    source: "FTMO Trading Objectives",
  },
  fundedEliteFlash: {
    provider: "FundedElite",
    label: "FundedElite Flash Activation",
    target: 0.06,
    dailyLoss: 0.03,
    maxLoss: 0.06,
    trailingMaxLoss: false,
    liveTrailingMaxLoss: true,
    minDays: 0,
    liveMinProfitableDays: 3,
    livePositiveDayTarget: 0.005,
    consistencyRule: "Live phase: strongest day should stay within 30% of total account profit.",
    dailyStopPercent: 0.75,
    capitalProtectionAtPercent: 5.5,
    source: "FundedElite Flash Activation FAQ",
  },
};

const ideas = [
  {
    title: "XAUUSD resistance retest",
    source: "TradingView idea pattern",
    category: "xau",
    score: 72,
    text: "Treat the public idea as a map of zones: resistance, support, invalidation. Entry waits for your own candle confirmation.",
    tags: ["XAUUSD", "S/R", "confirmation"],
  },
  {
    title: "Forum claim: 100% win rate",
    source: "Myfxbook community",
    category: "risk",
    score: 18,
    text: "Any no-loss claim gets rejected unless verified by long sample, drawdown, broker, slippage, and live account context.",
    tags: ["reject", "overfit", "risk"],
  },
  {
    title: "Position sizing before entry",
    source: "Myfxbook calculators mindset",
    category: "risk",
    score: 91,
    text: "Start from max allowed loss and stop distance. Profit target never decides lot size.",
    tags: ["risk", "position size", "FTMO"],
  },
  {
    title: "CME risk-first framing",
    source: "CME education",
    category: "education",
    score: 84,
    text: "Use market data and volatility as context. A setup with unclear risk is not a setup.",
    tags: ["volatility", "education", "context"],
  },
  {
    title: "Investopedia concept review",
    source: "Investopedia",
    category: "education",
    score: 80,
    text: "Before adding indicators, define trend, support/resistance, risk/reward, and what would prove the idea wrong.",
    tags: ["basics", "technical analysis", "journal"],
  },
];

const pipeline = [
  ["Data", "OHLCV, quotes, news, calendar"],
  ["Strategy", "VWAP, EMA, RSI, ATR, volume"],
  ["Risk", "Size, stop, max loss, spread"],
  ["Explain", "Reason, invalidation, manual confirm"],
];

const activeAgentStages = [
  {
    title: "User Control",
    detail: "Loads the registered profile, control mode, allowed markets, manual approval policy, and saved MT5 bridge URL.",
    output: "User profile controls the agent chain. Manual approval remains required for protected live orders.",
  },
  {
    title: "Browser Watch",
    detail: "Observes dashboard state, selected challenge, market, risk settings, MT5 bridge status, and the next required user action.",
    output: "Browser assistant is active. It guides setup and blocks unsafe workflow steps.",
  },
  {
    title: "Challenge Rules",
    detail: "Applies FTMO or FundedElite objectives: target, daily drawdown, max drawdown, static/trailing mode, and consistency rules.",
    output: "Challenge constraints are loaded before any signal is considered.",
  },
  {
    title: "Market Scanner",
    detail: "Scans Forex, Gold, Crypto, and Indices for volume spike, VWAP reclaim, breakout, trend continuation, and spread risk.",
    output: "Scanner updates candidates, but every setup still needs risk approval.",
  },
  {
    title: "Indicator Agent",
    detail: "Checks EMA 9/21/50, VWAP, RSI, MACD, ATR, volume spike, previous high/low, and clean invalidation.",
    output: "Technical evidence must support the trade plan; tarot is only a risk-pause.",
  },
  {
    title: "News + Risk",
    detail: "Blocks earnings, CPI, FOMC, NFP, abnormal volatility, high news risk, wide spread, and revenge trading.",
    output: "If news or drawdown risk is high, the agent moves to no-trade mode.",
  },
  {
    title: "Strategy Supervisor",
    detail: "OpenRouter/free model explains setup thesis, invalidation, missing evidence, confidence, and approve/block recommendation.",
    output: "AI can reason and explain; it cannot override hard risk rules.",
  },
  {
    title: "Order Preview",
    detail: "Prepares entry, stop, target, R:R, position size, lot size estimate, and journal note for browser approval.",
    output: "Manual approval is required before any MT5 live submit.",
  },
  {
    title: "Execution Gate",
    detail: "Checks MT5 bridge health, approval token, SL/TP, audit log, and kill switch readiness.",
    output: "Protected Live can submit only after bridge preview and user approval.",
  },
  {
    title: "Journal + Review",
    detail: "Stores signal, blockers, approval, bridge response, result, rule violations, and next improvement note.",
    output: "Every decision is journaled so the registered user can review the full chain.",
  },
];

const scannerSeeds = [
  {
    ticker: "NVDA",
    marketSymbol: "NVDA",
    setup: "VWAP reclaim + volume spike",
    direction: "LONG",
    relativeVolume: 2.4,
    rsi: 61,
    spread: 0.03,
    atr: 1.8,
    news: "medium",
    score: 74,
    tags: ["above VWAP", "EMA 9 > 21", "QQQ strong"],
  },
  {
    ticker: "AMD",
    marketSymbol: "AMD",
    setup: "EMA trend continuation",
    direction: "LONG",
    relativeVolume: 2.1,
    rsi: 58,
    spread: 0.04,
    atr: 1.4,
    news: "low",
    score: 79,
    tags: ["VWAP reclaim", "volume confirmed", "clean R:R"],
  },
  {
    ticker: "TSLA",
    marketSymbol: "TSLA",
    setup: "Opening range breakout",
    direction: "LONG",
    relativeVolume: 1.7,
    rsi: 73,
    spread: 0.08,
    atr: 2.9,
    news: "high",
    score: 46,
    tags: ["stretched RSI", "news risk", "smaller size"],
  },
  {
    ticker: "BTCUSD",
    marketSymbol: "BTC",
    setup: "Trend continuation near liquidity level",
    direction: "LONG",
    relativeVolume: 1.9,
    rsi: 63,
    spread: 0.05,
    atr: 2.6,
    news: "medium",
    score: 68,
    tags: ["crypto live", "momentum", "protected"],
  },
  {
    ticker: "XAUUSD",
    marketSymbol: "GOLD",
    setup: "VWAP reclaim after liquidity sweep",
    direction: "LONG",
    relativeVolume: 1.6,
    rsi: 55,
    spread: 0.04,
    atr: 1.7,
    news: "low",
    score: 71,
    tags: ["gold proxy", "ATR clean", "macro filter"],
  },
];

const cryptoAssets = [
  { id: "bitcoin", symbol: "BTC", label: "BTCUSD" },
  { id: "ethereum", symbol: "ETH", label: "ETHUSD" },
  { id: "solana", symbol: "SOL", label: "SOLUSD" },
  { id: "avalanche-2", symbol: "AVAX", label: "AVAXUSD" },
];

const simulatedAssets = [
  { symbol: "AAPL", label: "AAPL", price: 308.82, change: 1.26, volatility: 0.24 },
  { symbol: "SPY", label: "SPY", price: 531.2, change: 0.72, volatility: 0.16 },
  { symbol: "QQQ", label: "QQQ", price: 458.44, change: 0.91, volatility: 0.22 },
  { symbol: "NVDA", label: "NVDA", price: 924.5, change: 1.08, volatility: 0.55 },
  { symbol: "AMD", label: "AMD", price: 168.2, change: 0.84, volatility: 0.48 },
  { symbol: "TSLA", label: "TSLA", price: 177.4, change: -0.36, volatility: 0.75 },
  { symbol: "EURUSD", label: "EURUSD", price: 1.0852, change: 0.18, volatility: 0.08 },
  { symbol: "GOLD", label: "XAUUSD", price: 2414.68, change: 0.35, volatility: 0.18 },
  { symbol: "VIX", label: "VIX", price: 12.48, change: -1.26, volatility: 0.35 },
];

const calendarFallback = [
  {
    time: "08:30",
    currency: "USD",
    impact: "high",
    event: "High-impact US macro window",
    reason: "Treat CPI, NFP, FOMC and rates windows as no-trade unless already planned and protected.",
    action: "Block new Protected Live orders 15 minutes before and after.",
  },
  {
    time: "10:00",
    currency: "USD",
    impact: "medium",
    event: "US confidence / housing / ISM style release",
    reason: "Can move indices, gold and USD pairs quickly.",
    action: "Preview-only until spreads normalize.",
  },
  {
    time: "24/7",
    currency: "CRYPTO",
    impact: "medium",
    event: "Crypto platform/liquidity check",
    reason: "Exchange outages, funding spikes and thin liquidity can invalidate bot signals.",
    action: "Require wallet approval and max spend cap.",
  },
  {
    time: "Manual",
    currency: "ALL",
    impact: "high",
    event: "Investing.com calendar review",
    reason: "Confirm the exact live calendar before trading a prop-firm account.",
    action: "Open Investing calendar and journal the decision.",
  },
];

const botConnectorSeeds = [
  {
    id: "agentscope-runtime",
    name: "AgentScope Multi-Agent Runtime",
    venue: "AgentScope",
    type: "Agent framework",
    url: "https://agentscope.io/",
    docs: "https://docs.agentscope.io/basic-concepts/agent",
    purpose: "Blueprint for visible multi-agent orchestration: scanner, news risk, strategy validation, prop-firm rules, risk gate, supervisor and execution preview agents.",
    safety: "Framework route only. It can coordinate agents and tools, but Zeus keeps manual approval, kill switch and audit logs as hard gates.",
  },
  {
    id: "everything-claude-code",
    name: "Everything Claude Code Toolkit",
    venue: "GitHub / Claude Code",
    type: "Agent configs",
    url: "https://github.com/arabicapp/everything-claude-code",
    docs: "https://github.com/arabicapp/everything-claude-code/blob/main/README.md",
    purpose: "Reference library for Claude Code-style agents, skills, hooks, commands, rules and MCP configs that can inspire Zeus developer workflows.",
    safety: "Reference/import checklist only. No external config can bypass Zeus risk gate, manual approval, kill switch, audit export or backend secret rules.",
  },
  {
    id: "apibricks-console",
    name: "APIBricks Console + API Keys",
    venue: "APIBricks",
    type: "API provider",
    url: "https://console.apibricks.io/team/54a30dc6-46dc-4dac-93a7-72ad3f4288ee",
    docs: "https://www.apibricks.io/platform/docs/customer-portal/billing",
    purpose: "Manage API keys, subscriptions, usage logs, quotas and provider billing for data/API products used by Zeus.",
    safety: "Keys must be saved only as Cloudflare secrets. Browser UI can show connection status, never the raw API key.",
  },
  {
    id: "pionex-bot",
    name: "Pionex BTC/USDT Bot",
    venue: "Pionex",
    type: "Exchange bot",
    url: "https://www.pionex.com/en/trade/BTC_USDT/Bot",
    purpose: "Research grid/DCA style crypto bot plans for BTC/USDT without bypassing Pionex login or venue approval.",
    safety: "Open venue manually. Zeus only prepares risk plan, ranges, max spend, and journal note.",
  },
  {
    id: "cmc-agent-skills",
    name: "CoinMarketCap Agent Skills",
    venue: "CoinMarketCap",
    type: "Data + skills",
    url: "https://coinmarketcap.com/api/skills-marketplace/",
    purpose: "Route crypto questions into reusable skills: market report, token research, CMC MCP, x402 and API integration.",
    safety: "Data and skill routing only; never direct order execution.",
  },
  {
    id: "threecommas-dashboard",
    name: "3Commas Dashboard",
    venue: "3Commas",
    type: "Bot dashboard",
    url: "https://app.3commas.io/d",
    purpose: "Prepare DCA/Grid/SmartTrade ideas and webhook-style plans for manual 3Commas review.",
    safety: "API keys must have no withdrawal permission. Zeus does not store exchange secrets in browser.",
  },
];

const cmcSkillSeeds = [
  ["AgentScope", "Multi-agent orchestration layer for transparent ReAct agents, tools, memory, evaluation and runtime supervision."],
  ["Everything Claude Code", "Claude Code agent/config reference: agents, skills, hooks, commands, rules and MCP patterns for developer workflow design."],
  ["APIBricks Console", "Backend-only API provider layer for keys, usage logs, quotas, products and subscriptions."],
  ["CMC MCP", "Real-time market data, technicals, news, holders, narratives and global crypto context."],
  ["Market Report", "Daily/weekly report using global metrics, fear/greed, derivatives, trending narratives and catalysts."],
  ["Crypto Research", "Token due diligence: fundamentals, tokenomics, holder distribution, technicals and risk factors."],
  ["CMC CLI", "Terminal-native CoinMarketCap workflows for reports, coin research and command selection."],
  ["x402 Skills", "Pay-per-request CMC data access with wallet-based payments, no API key route."],
  ["API Integration", "REST-style cryptocurrency, DEX, exchange and market data endpoints for custom apps."],
];

const newsFallback = [
  {
    title: "Macro calendar risk window",
    source: "Zeus Risk Desk",
    category: "Macro",
    summary: "High-impact CPI, FOMC, NFP and rate events can widen spreads. The agent should switch to wait/block near these windows.",
    url: "https://www.investing.com/economic-calendar/",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=80",
    risk: "high",
  },
  {
    title: "Gold and USD sensitivity",
    source: "InsiderWave-style catalyst",
    category: "Forex / Gold",
    summary: "XAUUSD setups need USD, yields and event-risk context before any FTMO-style preview.",
    url: "https://www.investing.com/",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=80",
    risk: "medium",
  },
  {
    title: "Crypto liquidity and venue risk",
    source: "Crypto market desk",
    category: "Crypto",
    summary: "BTC/ETH momentum can help context, but wallet/CLOB execution stays separate from MT5 prop-firm trading.",
    url: "https://coinmarketcap.com/",
    image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=900&q=80",
    risk: "medium",
  },
  {
    title: "Prediction markets as context only",
    source: "Polymarket context",
    category: "Polymarket",
    summary: "Event odds can reveal crowd expectations, but Zeus treats them as news context, never as direct order signals.",
    url: "https://polymarket.com/",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=80",
    risk: "low",
  },
];

const strategyLibrarySeeds = [
  {
    id: "ftmo-survival",
    title: "FTMO Challenge Survival",
    badge: "FTMO",
    use: "Pass-style risk discipline",
    rule: "0.25%-0.5% risk, 1-2 A+ trades, stop after daily drawdown pressure.",
    indicators: "EMA 9/21/50, VWAP, ATR, RSI, macro calendar",
    target: "Slow progress, protect account, consistency first.",
  },
  {
    id: "gold-session",
    title: "XAUUSD Session Playbook",
    badge: "Gold",
    use: "London/New York volatility",
    rule: "No trade around CPI/FOMC/NFP; require clean structure and fixed SL.",
    indicators: "VWAP, previous day high/low, ATR, volume spike",
    target: "1.5R-2R only when spread and macro risk allow.",
  },
  {
    id: "vwap-momentum",
    title: "VWAP Reclaim Momentum",
    badge: "Stocks",
    use: "NVDA/AMD/TSLA/SPY/QQQ candidates",
    rule: "Close back above VWAP, EMA confirmation, RVOL >= 1.5x.",
    indicators: "VWAP, EMA 9/21, RSI 45-70, relative volume",
    target: "Candidate only until risk gate builds preview.",
  },
  {
    id: "polymarket-event",
    title: "Polymarket Event Trading",
    badge: "CLOB",
    use: "Wallet-approved event positions",
    rule: "Compliance/geofence, wallet signature, no seed phrase, CLOB separate from FTMO.",
    indicators: "Orderbook, liquidity, odds drift, event resolution risk",
    target: "Preview and audit first; live submit stays locked unless adapter is approved.",
  },
  {
    id: "crypto-bot",
    title: "Crypto Bot Route",
    badge: "Crypto",
    use: "Pionex/3Commas/MEXC testnet research",
    rule: "No withdrawal API keys, testnet before live, risk caps and journal.",
    indicators: "Trend, volatility, funding, exchange liquidity, BTC dominance",
    target: "Connector preview only until backend secret and approval flow exist.",
  },
];

const guidedFlowSteps = [
  {
    id: "profile",
    title: "Profile + API vault",
    text: "Login/register, save public wallet address and keep real API keys only in Cloudflare secrets.",
    target: "profile",
    action: "Open Profile",
  },
  {
    id: "data",
    title: "Live data + news",
    text: "Load chart feed, economic calendar, Polymarket context and connector status before scanning.",
    target: "calendar",
    action: "Check News",
  },
  {
    id: "agents",
    title: "Run agent chain",
    text: "Market Scanner, News Risk, Strategy Validator, Prop Rules, Risk Gate and Supervisor work in order.",
    target: "active-agent",
    action: "Run Agents",
  },
  {
    id: "preview",
    title: "Build order preview",
    text: "MT5/testnet/bot connector preview calculates entry, SL, TP, size, R:R and blockers.",
    target: "bot-builder",
    action: "Build Preview",
  },
  {
    id: "approve",
    title: "Approve live safely",
    text: "Testnet/mock can automate. Live broker/exchange submit needs visible user approval and audit log.",
    target: "signal",
    action: "Review Approval",
  },
];

const agentSyncRows = [
  ["Market Scanner", "Chart feed, CoinGecko, delayed quotes, CMC/APIBricks provider route", "test", "live"],
  ["News/Macro Risk", "Economic calendar, Polymarket/Oddpool context, platform risk checks", "test", "live"],
  ["Strategy Validator", "VWAP, EMA, RSI, ATR, volume spike, playbook confluence", "test", "live"],
  ["Prop Rules", "FundedElite/FTMO daily loss, max DD, consistency and target progress", "test", "live"],
  ["Risk Gate", "SL/TP, lot size, spread, R:R, kill switch and max loss buffers", "test", "live"],
  ["Supervisor", "Final BLOCK/WATCH/PREVIEW/READY verdict with explanation", "test", "live"],
  ["Execution Preview", "MT5 bridge, Pionex/3Commas/APIBricks connector preview and CLOB wallet preview", "test", "live"],
  ["Live Submit", "Mock/testnet can auto-submit; real broker/exchange remains manual approve", "test", "locked"],
  ["Journal", "Every setup, blocker, approval, response and result is stored", "test", "live"],
];

const botStrategyProfiles = {
  vwap: {
    label: "VWAP reclaim + volume",
    trigger: "Close back above VWAP, EMA 9 > EMA 21, RVOL >= 1.5x, RSI 45-70, spread acceptable.",
    invalidation: "5m close below VWAP or structure low breaks before follow-through.",
  },
  ema: {
    label: "EMA momentum continuation",
    trigger: "EMA 9/21/50 aligned, pullback holds dynamic support, volume confirms continuation.",
    invalidation: "EMA structure flips or pullback base fails.",
  },
  orb: {
    label: "Opening range breakout",
    trigger: "Defined opening range breaks with volume, retest holds, index/market context agrees.",
    invalidation: "Price returns inside the range or breakout candle fails.",
  },
  riskpause: {
    label: "Tarot risk-pause only",
    trigger: "No trade trigger. The bot only blocks emotional trades and forces journal/risk review.",
    invalidation: "Any unclear stop, revenge impulse, high-impact news, or missing journal note.",
  },
};

const botMarketProfiles = {
  crypto: {
    watchlist: ["BTCUSD", "ETHUSD", "SOLUSD", "AVAXUSD"],
    data: "CoinGecko crypto feed through Cloudflare proxy",
    session: "24/7, but avoid illiquid weekend chop and high-spread bursts.",
  },
  gold: {
    watchlist: ["XAUUSD"],
    data: "Simulated gold proxy now; broker-grade data later.",
    session: "London/New York overlap with macro calendar filter.",
  },
  stocks: {
    watchlist: ["NVDA", "AMD", "TSLA"],
    data: "Simulated stock feed now; Alpaca/Polygon later.",
    session: "US cash session, avoid earnings and halts.",
  },
  indices: {
    watchlist: ["SPY", "QQQ", "VIX"],
    data: "Simulated index feed now; broker/market-data API later.",
    session: "US cash open and first two hours.",
  },
};

const marketProfiles = {
  xau: {
    label: "XAUUSD / Gold",
    session: "London/New York overlap",
    avoid: "Avoid first impulse after CPI/FOMC/NFP and wide-spread rollover windows.",
    filter: "ATR expansion, liquidity sweep near previous high/low, VWAP reclaim, and clean 5m close.",
  },
  indices: {
    label: "SPY / QQQ / US indices",
    session: "US cash open and first two hours",
    avoid: "Avoid 15 minutes before high-impact macro and when VIX expands aggressively.",
    filter: "Index alignment, opening range structure, VWAP side, breadth, and relative volume.",
  },
  stocks: {
    label: "Large-cap stocks",
    session: "Premarket plan plus US cash session",
    avoid: "Avoid earnings day, halt risk, very wide spreads, and low liquidity.",
    filter: "Gap catalyst, RVOL above 1.5x, tight spread, sector/index confirmation, and clean levels.",
  },
  fx: {
    label: "EURUSD / majors",
    session: "London open and New York overlap",
    avoid: "Avoid central-bank releases, abnormal spread, and choppy low-volume sessions.",
    filter: "H1/H4 trend, key level reaction, ATR-normal stop, and no high-impact calendar conflict.",
  },
};

const strategyProfiles = {
  vwap: {
    label: "VWAP reclaim + volume",
    entry: "Price loses VWAP, reclaims it with a confirmed close, EMA 9 > EMA 21, RVOL >= 1.5x, RSI not stretched.",
    invalidation: "A 5m close back below VWAP or structure failure before follow-through.",
    target: "First target at 1R-1.5R, final target at 2R+ only if market context supports continuation.",
  },
  orb: {
    label: "Opening range breakout",
    entry: "Define first 5-15 minute range, wait for breakout with volume, then enter only on clean retest or strong close.",
    invalidation: "Return inside opening range after entry or failed breakout candle.",
    target: "Use ATR and previous day levels; no chase if entry is far from the range edge.",
  },
  trend: {
    label: "EMA trend continuation",
    entry: "EMA 9 above/below EMA 21 and 50, pullback into dynamic support/resistance, continuation candle with volume.",
    invalidation: "EMA structure flips or price closes through the pullback base.",
    target: "Scale around 1R and hold only while trend structure remains intact.",
  },
  mean: {
    label: "Mean reversion at key levels",
    entry: "Only at pre-marked support/resistance with exhaustion, divergence or liquidity sweep, and tight invalidation.",
    invalidation: "Clean breakout through the level or no reversal confirmation.",
    target: "Return to VWAP/mid-range first; no revenge entry if the level breaks.",
  },
};

const checks = [
  ["Trend context", "H1/H4 trend direction is written down."],
  ["Key level", "Support/resistance zone is visible without forcing it."],
  ["Invalidation", "Stop loss is based on structure, not hope."],
  ["Volatility", "Spread/news/ATR allow the planned stop distance."],
  ["Risk gate", "Loss is below planned account risk and daily guard."],
  ["Independent confirmation", "The idea still makes sense on your own chart."],
  ["Journal first", "Reason and exit plan are written before entry."],
];

const deck = [
  {
    name: "The Chariot",
    glyph: "VII",
    subtitle: "Momentum",
    text: "Momentum is useful only when you still control speed, size, and exit.",
  },
  {
    name: "The Tower",
    glyph: "XVI",
    subtitle: "Max Loss",
    text: "If one candle can damage the account, the setup is already broken.",
  },
  {
    name: "Temperance",
    glyph: "XIV",
    subtitle: "Patience",
    text: "Wait for your confluence. A missed trade costs less than a forced one.",
  },
  {
    name: "The Moon",
    glyph: "XVIII",
    subtitle: "Bias",
    text: "Separate intuition from fear. If the thesis is blurry, no trade.",
  },
  {
    name: "Justice",
    glyph: "XI",
    subtitle: "Risk Gate",
    text: "The checklist is the judge: stop, target, news, spread, and daily limit.",
  },
  {
    name: "The Sun",
    glyph: "XIX",
    subtitle: "Clarity",
    text: "Clarity wins. Trade only when invalidation and reward are obvious.",
  },
];

const tarotReadingCards = [
  {
    name: "The Moon",
    glyph: "XVIII",
    subtitle: "Bias",
    label: "Liquidity and sentiment",
    role: "Bias check",
    reading: "Open reading: separate chart evidence from fear, hope, and forum noise. If the thesis is blurry, the agent must pause.",
    action: "Required action: write the invalidation level before any protected live setup is allowed.",
  },
  {
    name: "The Oracle",
    glyph: "VII",
    subtitle: "VWAP",
    label: "VWAP and flow",
    role: "Setup quality",
    reading: "Open reading: VWAP and flow can support a setup only after candle confirmation. No blind entry just because momentum looks strong.",
    action: "Required action: wait for the close, volume confirmation, and clean spread.",
  },
  {
    name: "The Balance",
    glyph: "XI",
    subtitle: "Risk Gate",
    label: "Risk and position size",
    role: "Risk gate",
    reading: "Open reading: position size must follow stop distance and daily loss limits. If risk is not clear, there is no trade.",
    action: "Required action: calculate stop, target, R:R, and max loss before the idea becomes a protected live plan.",
  },
  {
    name: "The Tower",
    glyph: "XVI",
    subtitle: "Max Loss",
    label: "Volatility and breaks",
    role: "Danger filter",
    reading: "Open reading: one violent candle can destroy a challenge if size is too large. Wide spreads and news shocks block execution.",
    action: "Required action: reject the trade during high-impact news, abnormal ATR, or weak liquidity.",
  },
  {
    name: "The Sun",
    glyph: "XIX",
    subtitle: "Clarity",
    label: "P/L and expectancy",
    role: "Clarity check",
    reading: "Open reading: a good trade is simple to explain. Expected value matters more than one lucky win.",
    action: "Required action: save the result to the journal and judge the setup by sample size, not emotion.",
  },
];

const state = {
  filter: "all",
  checked: new Set(),
  journal: JSON.parse(localStorage.getItem("propLabJournal") || "[]"),
  cloudJournal: [],
  cloudJournalStatus: "Not synced",
  auditSummary: null,
  scannerRun: 0,
  agentPlan: null,
  activeAgentStep: 0,
  agentLog: [],
  agentStartedAt: Date.now(),
  agentPaused: false,
  agentChainRunning: false,
  lastSystemCheckReport: null,
  selectedTarotIndex: 2,
  agentConsole: [],
  prediction: {
    markets: [],
    context: null,
    provider: "",
  },
  economicCalendar: {
    events: calendarFallback,
    source: "local protected fallback",
    updatedAt: null,
    riskLevel: "medium",
  },
  news: {
    items: newsFallback,
    source: "fallback",
    updatedAt: null,
  },
  botConnectors: {
    connectors: botConnectorSeeds,
    skills: cmcSkillSeeds,
    preview: null,
  },
  clob: {
    markets: [],
    selectedMarket: null,
    preview: null,
    wallet: {
      address: "",
      provider: "",
      compliance: null,
      challenge: null,
      approval: null,
    },
  },
  authMode: "login",
  user: null,
  market: {
    assets: new Map(),
    status: "connecting",
    source: "CoinGecko crypto + simulated equities",
    lastUpdated: null,
    error: "",
    refreshMs: 45000,
  },
  exchange: {
    preview: null,
    approvalToken: "",
    log: [],
    mt5Connected: false,
    mt5Account: null,
  },
  killSwitch: {
    active: false,
    mode: "block-new-orders",
    reason: "",
  },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberValue(id) {
  return Number($(id).value || 0);
}

function selectHasValue(selector, value) {
  const select = $(selector);
  return Boolean(select && Array.from(select.options).some((option) => option.value === value));
}

function syncChallengeSelects(sourceSelector) {
  const source = $(sourceSelector);
  if (!source) return;
  const targetSelector = sourceSelector === "#phaseSelect" ? "#agentChallenge" : "#phaseSelect";
  if (selectHasValue(targetSelector, source.value)) {
    $(targetSelector).value = source.value;
  }
}

function selectedChallengeKey() {
  const agentValue = $("#agentChallenge")?.value;
  const phaseValue = $("#phaseSelect")?.value;
  return rules[agentValue] ? agentValue : rules[phaseValue] ? phaseValue : "fundedEliteFlash";
}

function selectedChallengeRule() {
  return rules[selectedChallengeKey()] || rules.fundedEliteFlash;
}

function fundedEliteGuardFromInputs() {
  const accountSize = numberValue("#initialCapital") || 100000;
  const initialBalance = accountSize;
  const startOfDayBalance = numberValue("#dayStartBalance") || accountSize;
  const currentEquity = numberValue("#currentEquity") || accountSize;
  const highWaterEquity = Math.max(numberValue("#highWaterEquity") || currentEquity, initialBalance, currentEquity);
  const phase = $("#challengePhase")?.value || "evaluation";
  const dailyPnl = currentEquity - startOfDayBalance;
  const totalProfit = numberValue("#totalProfit") || currentEquity - initialBalance;
  const bestDayProfit = Math.max(numberValue("#bestDayProfit") || 0, 0);
  const profitableDays = numberValue("#profitableDays") || 0;
  const maxDailyLoss = startOfDayBalance * 0.03;
  const dailyLoss = Math.max(-dailyPnl, 0);
  const staticFloor = initialBalance - initialBalance * 0.06;
  const trailingFloor = highWaterEquity - initialBalance * 0.06;
  const activeFloor = phase === "live" ? trailingFloor : staticFloor;
  const dailyLossBufferRemaining = maxDailyLoss - dailyLoss;
  const maxDrawdownBufferRemaining = currentEquity - activeFloor;
  const consistencyLimit = Math.max(totalProfit, 0) * 0.3;
  const consistencyViolated = phase === "live" && totalProfit > 0 && bestDayProfit > consistencyLimit;
  const extraProfitRequiredForConsistency = consistencyViolated ? Math.max(bestDayProfit / 0.3 - totalProfit, 0) : 0;
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
    profitTarget: initialBalance * 0.06,
    maxDailyLoss,
    staticDrawdownFloor: staticFloor,
    trailingDrawdownFloor: trailingFloor,
    activeDrawdownFloor: activeFloor,
    dailyLossBufferRemaining,
    maxDrawdownBufferRemaining,
    maxAllowedLossForNextTrade: Math.max(Math.min(dailyLossBufferRemaining, maxDrawdownBufferRemaining) * 0.8, 0),
    consistencyStatus: consistencyViolated ? "warning" : "ok",
    extraProfitRequiredForConsistency,
    warnings: [
      ...(dailyLossBufferRemaining <= maxDailyLoss * 0.15 ? ["Daily DD buffer close to breach"] : []),
      ...(maxDrawdownBufferRemaining <= initialBalance * 0.01 ? ["Total DD buffer thin"] : []),
      ...(phase === "live" && profitableDays < 3 ? ["Live needs 3 profitable days"] : []),
      ...(consistencyViolated ? ["Best day exceeds 30% of total profit"] : []),
    ],
  };
}

function collectAgentContext() {
  const challengeKey = selectedChallengeKey();
  const marketKey = $("#agentMarket").value;
  const styleKey = $("#agentStyle").value;
  const rule = rules[challengeKey];
  const market = marketProfiles[marketKey];
  const strategy = strategyProfiles[styleKey];
  const initial = numberValue("#initialCapital");
  const riskPct = numberValue("#riskPerTrade") / 100;

  return {
    project: "Zeus Trading Prop-Firm Agent",
    challenge: {
      key: challengeKey,
      provider: rule.provider,
      label: rule.label,
      profitTargetPercent: rule.target,
      dailyLossPercent: rule.dailyLoss,
      maxLossPercent: rule.maxLoss,
      trailingMaxLoss: Boolean(rule.trailingMaxLoss),
      liveTrailingMaxLoss: Boolean(rule.liveTrailingMaxLoss),
      minTradingDays: rule.minDays,
      liveMinProfitableDays: rule.liveMinProfitableDays || 0,
      livePositiveDayTarget: rule.livePositiveDayTarget || 0,
      consistencyRule: rule.consistencyRule || "No single trading day should dominate the account result.",
      source: rule.source,
    },
    account: {
      initialCapital: initial,
      currentEquity: numberValue("#currentEquity"),
      dayStartBalance: numberValue("#dayStartBalance"),
      riskPerTradePercent: riskPct,
      maxTradesPerDay: clamp(numberValue("#agentMaxTrades"), 1, 5),
      targetEvaluationDays: clamp(numberValue("#agentDays"), 5, 60),
    },
    market: {
      key: marketKey,
      label: market.label,
      session: market.session,
      avoid: market.avoid,
      filter: market.filter,
    },
    predictionMarkets: {
      provider: state.prediction.provider,
      ftmoContext: state.prediction.context?.ftmo_context || null,
      topMarkets: state.prediction.markets.slice(0, 5),
    },
    strategy: {
      key: styleKey,
      label: strategy.label,
      entry: strategy.entry,
      invalidation: strategy.invalidation,
      target: strategy.target,
    },
    hardRules: {
      mandatoryStopLoss: true,
      minRewardRisk: 2,
      maxRiskPerTradePercent: 0.01,
      preferredRiskPerTradePercent: 0.005,
      noRevengeTrading: true,
      protectedLive: true,
      manualApprovalRequired: true,
      mt5BridgeRequired: true,
      userControlMode: $("#agentControlMode")?.value || "manual-approval",
      requireUserApproval: $("#agentRequireApproval")?.checked !== false,
      registeredUser: Boolean(state.user),
    },
  };
}

function updateRisk() {
  const phase = $("#phaseSelect").value;
  const rule = rules[phase] || selectedChallengeRule();
  const initial = numberValue("#initialCapital");
  const dayStart = numberValue("#dayStartBalance");
  const equity = numberValue("#currentEquity");
  const riskPct = numberValue("#riskPerTrade") / 100;

  const target = initial * rule.target;
  const profit = equity - initial;
  const targetProgress = clamp((profit / target) * 100, 0, 100);
  const dailyLimit = dayStart - initial * rule.dailyLoss;
  const maxLimit = rule.trailingMaxLoss ? Math.max(initial, dayStart) - initial * rule.maxLoss : initial - initial * rule.maxLoss;
  const dailyBuffer = equity - dailyLimit;
  const maxBuffer = equity - maxLimit;
  const plannedLoss = initial * riskPct;
  const fundedEliteGuard = fundedEliteGuardFromInputs();

  $("#sidebarMode").textContent = rule.label;
  $("#profitTarget").textContent = fmtUsd.format(target);
  $("#profitProgress").style.width = `${targetProgress}%`;
  $("#profitProgressLabel").textContent = `${targetProgress.toFixed(1)}% complete`;
  $("#dailyBuffer").textContent = fmtUsd.format(dailyBuffer);
  $("#dailyProgress").style.width = `${clamp((dailyBuffer / (initial * rule.dailyLoss)) * 100, 0, 100)}%`;
  $("#dailyLimitLabel").textContent = `Limit: ${fmtUsd.format(dailyLimit)}`;
  $("#maxBuffer").textContent = fmtUsd.format(maxBuffer);
  $("#maxProgress").style.width = `${clamp((maxBuffer / (initial * rule.maxLoss)) * 100, 0, 100)}%`;
  $("#maxLimitLabel").textContent = `Limit: ${fmtUsd.format(maxLimit)}`;
  $("#tradeRisk").textContent = fmtUsd.format(plannedLoss);
  $("#nextTradeLoss").textContent = fmtUsd.format(fundedEliteGuard.maxAllowedLossForNextTrade);
  $("#nextTradeLossHelp").textContent = `Floor: ${fmtUsd.format(fundedEliteGuard.activeDrawdownFloor)} / Daily max loss: ${fmtUsd.format(fundedEliteGuard.maxDailyLoss)}`;
  $("#consistencyStatus").textContent = fundedEliteGuard.consistencyStatus === "ok" ? "OK" : "Warning";
  $("#consistencyHelp").textContent =
    fundedEliteGuard.consistencyStatus === "ok"
      ? "Best day is within 30% of total profit."
      : `Needs about ${fmtUsd.format(fundedEliteGuard.extraProfitRequiredForConsistency)} extra profit before payout eligibility.`;

  const guard = $("#guardStatus");
  guard.className = "status-chip safe";
  guard.textContent = "Safe";

  if (dailyBuffer < plannedLoss * 2 || maxBuffer < plannedLoss * 4) {
    guard.className = "status-chip warning";
    guard.textContent = "Thin buffer";
  }

  if (dailyBuffer <= 0 || maxBuffer <= 0 || plannedLoss > initial * 0.01) {
    guard.className = "status-chip danger";
    guard.textContent = "Stand down";
  }

  if (fundedEliteGuard.dailyLossBufferRemaining <= 0 || fundedEliteGuard.maxDrawdownBufferRemaining <= 0) {
    guard.className = "status-chip danger";
    guard.textContent = "FundedElite block";
  }
  renderCockpitStatus();
}

function riskContext() {
  const phase = $("#phaseSelect").value;
  const rule = rules[phase] || selectedChallengeRule();
  const initial = numberValue("#initialCapital");
  const dayStart = numberValue("#dayStartBalance");
  const equity = numberValue("#currentEquity");
  const riskPct = numberValue("#riskPerTrade") / 100;
  const dailyLimit = dayStart - initial * rule.dailyLoss;
  const maxLimit = rule.trailingMaxLoss ? Math.max(initial, dayStart) - initial * rule.maxLoss : initial - initial * rule.maxLoss;

  return {
    initial,
    equity,
    riskPct,
    dailyLimit,
    maxLimit,
    dailyBuffer: equity - dailyLimit,
    maxBuffer: equity - maxLimit,
    maxDailyLoss: initial * rule.dailyLoss,
    rule,
  };
}

function renderPipeline() {
  $("#pipelineGrid").innerHTML = pipeline
    .map(
      ([title, help], index) => `
        <article class="pipeline-step">
          <span>${index + 1}</span>
          <strong>${title}</strong>
          <small>${help}</small>
        </article>
      `,
    )
    .join("");
}

function formatMarketPrice(asset) {
  if (!asset) return "--";
  return asset.price >= 1000 ? fmtUsd.format(asset.price) : fmtPrice.format(asset.price);
}

function formatMarketChange(change) {
  const value = Number(change || 0);
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getMarketAsset(symbol) {
  return state.market.assets.get(symbol);
}

function cockpitSymbolKey(value = "") {
  const symbol = String(value || "").toUpperCase();
  if (symbol === "BTCUSD") return "BTC";
  if (symbol === "ETHUSD") return "ETH";
  if (symbol === "XAUUSD") return "GOLD";
  return symbol;
}

function cockpitAsset() {
  const selected = $("#symbolSelect")?.value || "AAPL";
  return getMarketAsset(cockpitSymbolKey(selected)) || getMarketAsset("AAPL") || {
    symbol: "AAPL",
    label: "AAPL",
    price: 308.82,
    change: 1.26,
    volatility: 0.24,
    source: "seed",
  };
}

function chartInstrumentTitle(asset) {
  const titles = {
    AAPL: "Apple Inc · 1D · NASDAQ",
    NVDA: "NVIDIA Corp · 1D · NASDAQ",
    AMD: "Advanced Micro Devices · 1D · NASDAQ",
    TSLA: "Tesla Inc · 1D · NASDAQ",
    SPY: "SPDR S&P 500 ETF · 1D · ARCA",
    QQQ: "Invesco QQQ · 1D · NASDAQ",
    GOLD: "Gold Spot / XAUUSD · 1D · MT5",
    EURUSD: "Euro / U.S. Dollar · 1D · MT5",
    BTC: "Bitcoin · 1D · Crypto",
  };
  return titles[asset.symbol] || `${asset.label || asset.symbol} · 1D`;
}

function seededWave(seed, index) {
  const code = String(seed).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Math.sin(index * 1.28 + code * 0.17) * 0.62 + Math.sin(index * 0.37 + code * 0.07) * 0.38;
}

function buildChartCandles(asset) {
  const count = 58;
  const change = Number(asset.change || 0);
  const end = Math.max(Number(asset.price || 100), 0.01);
  const start = end / (1 + change / 100 || 1);
  const volatility = Math.max(Number(asset.volatility || 0.2), 0.06);
  const candles = [];
  let close = start;
  for (let index = 0; index < count; index += 1) {
    const trend = (end - start) / count;
    const wave = seededWave(asset.symbol, index) * end * (volatility / 100) * 1.8;
    const open = close;
    close = Math.max(0.01, open + trend + wave * 0.34);
    const wick = Math.abs(wave) + end * (volatility / 100) * (0.75 + (index % 5) * 0.08);
    const high = Math.max(open, close) + wick;
    const low = Math.max(0.01, Math.min(open, close) - wick * 0.74);
    const volume = 28 + Math.abs(wave / end) * 1800 + ((index * 17) % 34);
    candles.push({ open, high, low, close, volume });
  }
  const last = candles.at(-1);
  const scale = end / last.close;
  return candles.map((candle) => ({
    open: candle.open * scale,
    high: candle.high * scale,
    low: candle.low * scale,
    close: candle.close * scale,
    volume: candle.volume,
  }));
}

function renderPremiumChart() {
  const svg = $("#premiumChartSvg");
  if (!svg) return;
  const asset = cockpitAsset();
  const candles = buildChartCandles(asset);
  const width = 980;
  const height = 520;
  const top = 32;
  const bottom = 408;
  const volumeTop = 428;
  const volumeBottom = 500;
  const min = Math.min(...candles.map((candle) => candle.low));
  const max = Math.max(...candles.map((candle) => candle.high));
  const range = Math.max(max - min, 0.0001);
  const xStep = width / candles.length;
  const candleWidth = Math.max(5, xStep * 0.52);
  const volumeMax = Math.max(...candles.map((candle) => candle.volume));
  const priceY = (price) => top + ((max - price) / range) * (bottom - top);
  const last = candles.at(-1);
  const first = candles[0];
  const lastY = priceY(last.close);
  const grid = [0, 1, 2, 3, 4, 5]
    .map((line) => {
      const y = top + ((bottom - top) / 5) * line;
      const price = max - (range / 5) * line;
      return `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,255,255,0.06)" /><text x="${width - 62}" y="${y - 7}" fill="rgba(248,247,237,0.58)" font-size="12" font-weight="700">${asset.price < 10 ? price.toFixed(4) : price.toFixed(2)}</text>`;
    })
    .join("");
  const candleSvg = candles
    .map((candle, index) => {
      const x = index * xStep + xStep / 2;
      const openY = priceY(candle.open);
      const closeY = priceY(candle.close);
      const highY = priceY(candle.high);
      const lowY = priceY(candle.low);
      const up = candle.close >= candle.open;
      const color = up ? "#55c3a7" : "#ee5f62";
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(Math.abs(closeY - openY), 4);
      const volumeH = (candle.volume / volumeMax) * (volumeBottom - volumeTop);
      return `
        <line x1="${x}" y1="${highY}" x2="${x}" y2="${lowY}" stroke="${color}" stroke-width="1.4" opacity="0.9" />
        <rect x="${x - candleWidth / 2}" y="${bodyY}" width="${candleWidth}" height="${bodyH}" rx="1.3" fill="${color}" />
        <rect x="${x - candleWidth / 2}" y="${volumeBottom - volumeH}" width="${candleWidth}" height="${volumeH}" fill="${color}" opacity="0.34" />
      `;
    })
    .join("");
  svg.innerHTML = `
    <defs>
      <linearGradient id="ztArea" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#55c3a7" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#55c3a7" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${grid}
    <line x1="0" y1="${lastY}" x2="${width}" y2="${lastY}" stroke="#55c3a7" stroke-width="1.2" stroke-dasharray="2 7" opacity="0.72" />
    ${candleSvg}
    <text x="18" y="31" fill="rgba(248,247,237,0.58)" font-size="12" font-weight="800">Vol · ${(last.volume * 1.12).toFixed(2)}M</text>
    <text x="18" y="496" fill="rgba(248,247,237,0.56)" font-size="12" font-weight="800">Oct</text>
    <text x="258" y="496" fill="rgba(248,247,237,0.56)" font-size="12" font-weight="800">Dec</text>
    <text x="505" y="496" fill="rgba(248,247,237,0.56)" font-size="12" font-weight="800">Feb</text>
    <text x="758" y="496" fill="rgba(248,247,237,0.56)" font-size="12" font-weight="800">May</text>
  `;

  const open = first.open;
  const high = Math.max(...candles.slice(-8).map((candle) => candle.high));
  const low = Math.min(...candles.slice(-8).map((candle) => candle.low));
  const change = Number(asset.change || 0);
  $("#cockpitSymbolLabel").textContent = asset.label || asset.symbol;
  $("#cockpitInstrumentMeta").textContent = `${asset.source || "sim"} · Protected Live · ${state.market.status}`;
  $("#cockpitChartTitle").textContent = chartInstrumentTitle(asset);
  $("#cockpitPrice").textContent = formatMarketPrice(asset);
  $("#cockpitChange").textContent = formatMarketChange(change);
  $("#cockpitOhlc").textContent = `O ${open.toFixed(asset.price < 10 ? 4 : 2)} H ${high.toFixed(asset.price < 10 ? 4 : 2)} L ${low.toFixed(asset.price < 10 ? 4 : 2)} C ${last.close.toFixed(asset.price < 10 ? 4 : 2)}`;
  $("#activePriceLabel").textContent = asset.price < 10 ? asset.price.toFixed(4) : asset.price.toFixed(2);
  $("#activePriceLabel").style.top = `${clamp((lastY / height) * 100, 8, 82)}%`;
  $(".chart-price-block")?.classList.toggle("down", change < 0);
  renderCockpitStatus();
}

function renderCockpitStatus() {
  if (!$("#cockpitRiskGauge")) return;
  const risk = riskContext();
  const guard = $("#guardStatus");
  const dailyPct = clamp((risk.dailyBuffer / Math.max(risk.initial * selectedChallengeRule().dailyLoss, 1)) * 100, 0, 100);
  const agentReady = state.agentPlan?.computed?.readiness || "Waiting for setup";
  const mt5Text = state.exchange.mt5Connected ? "MT5 connected" : $("#exchangeExecutionStatus")?.textContent || "MT5 disconnected";
  $("#cockpitRiskGauge").style.setProperty("--risk-value", `${dailyPct}%`);
  $("#cockpitRiskGauge span").textContent = `${Math.round(dailyPct)}%`;
  $("#cockpitRiskStatus").textContent = guard?.textContent ? `Risk: ${guard.textContent}` : "Risk gate not run";
  $("#cockpitAgentStatus").textContent = agentReady;
  $("#cockpitDataStatus").textContent = state.market.status === "live" ? "Live feed active" : state.market.status === "degraded" ? "Fallback feed active" : "Connecting";
  $("#cockpitRuleStatus").textContent = selectedChallengeRule().label;
  $("#cockpitMt5Status").textContent = mt5Text;
  $("#cockpitLastAction").textContent = state.exchange.log[0]?.title || state.agentPlan?.strategy?.label || "Waiting for live scan";
  $("#cockpitApprovalState").textContent = state.exchange.preview?.approved ? "Preview approved. Manual click still required." : "Manual approval required before any live submit.";
}

function updateMarketStatus() {
  const dot = $("#marketConnectionDot");
  const label = $("#marketConnectionStatus");
  const stamp = $("#marketLastUpdated");
  if (!dot || !label || !stamp) return;

  const status = state.market.status;
  dot.className = `connection-dot ${status}`;

  if (status === "live") {
    label.textContent = "Live market data";
  } else if (status === "degraded") {
    label.textContent = "Fallback data";
  } else {
    label.textContent = "Connecting";
  }

  stamp.textContent = state.market.lastUpdated
    ? state.market.lastUpdated.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  stamp.title = state.market.error || state.market.source;
  if ($("#sourceChartStatus")) {
    $("#sourceChartStatus").textContent =
      status === "live" ? "Live + delayed feeds active" : status === "degraded" ? "Fallback guarded" : "Connecting";
  }
  renderCockpitStatus();
}

function renderTickerTape() {
  const tape = $("#tickerTape");
  if (!tape) return;

  const symbols = ["SPY", "QQQ", "BTC", "ETH", "SOL", "NVDA", "AMD", "GOLD", "VIX"];
  const items = symbols
    .map((symbol) => getMarketAsset(symbol))
    .filter(Boolean);

  if (!items.length) {
    tape.innerHTML = `<span>Loading market data <strong>...</strong></span>`;
    return;
  }

  tape.innerHTML = items
    .map((asset) => {
      const isDown = asset.change < 0;
      return `
        <span class="ticker-item ${isDown ? "down" : ""}">
          <b>${asset.label}</b>
          <em>${formatMarketPrice(asset)}</em>
          <strong>${formatMarketChange(asset.change)}</strong>
          <small>${asset.source}</small>
        </span>
      `;
    })
    .join("");
  renderQuickMarketBoard(items);
  renderPremiumChart();
}

function renderQuickMarketBoard(items = null) {
  const board = $("#quickMarketBoard");
  if (!board) return;
  const assets =
    items ||
    ["BTC", "ETH", "SOL", "GOLD", "EURUSD", "SPY", "QQQ", "NVDA"]
      .map((symbol) => getMarketAsset(symbol))
      .filter(Boolean);
  $("#marketBoardStatus").textContent = state.market.status === "live" ? "Live feed" : state.market.status === "degraded" ? "Guarded fallback" : "Loading";
  board.innerHTML = assets.length
    ? assets
        .slice(0, 8)
        .map((asset) => {
          const down = asset.change < 0;
          return `
            <button class="market-tile ${down ? "down" : "up"}" type="button" data-market-symbol="${asset.symbol}">
              <span>${asset.label}</span>
              <strong>${formatMarketPrice(asset)}</strong>
              <small>${formatMarketChange(asset.change)} · ${asset.source}</small>
            </button>
          `;
        })
        .join("")
    : `<article class="market-tile"><span>Waiting</span><strong>Market feed</strong><small>Click Refresh Center.</small></article>`;
}

function simulateAsset(asset) {
  const previous = getMarketAsset(asset.symbol);
  const basePrice = previous?.price || asset.price;
  const baseChange = previous?.change ?? asset.change;
  const impulse = (Math.random() - 0.46) * asset.volatility;
  const price = Math.max(0.01, basePrice * (1 + impulse / 100));
  const change = clamp(baseChange + impulse, -8, 8);

  return {
    ...asset,
    price,
    change,
    type: "simulated",
    source: "sim",
    updatedAt: Date.now(),
  };
}

function fallbackCryptoAssets() {
  return [
    { symbol: "BTC", label: "BTCUSD", price: 67502.11, change: 1.28, type: "crypto", source: "sim" },
    { symbol: "ETH", label: "ETHUSD", price: 3612.44, change: 0.82, type: "crypto", source: "sim" },
    { symbol: "SOL", label: "SOLUSD", price: 168.52, change: 1.04, type: "crypto", source: "sim" },
    { symbol: "AVAX", label: "AVAXUSD", price: 39.18, change: -0.22, type: "crypto", source: "sim" },
  ].map((asset) => {
    const previous = getMarketAsset(asset.symbol);
    return simulateAsset({ ...asset, price: previous?.price || asset.price, change: previous?.change ?? asset.change, volatility: 0.35 });
  });
}

async function fetchCryptoAssets() {
  const ids = cryptoAssets.map((asset) => asset.id).join(",");
  const proxyUrl = `/api/market-data?ids=${encodeURIComponent(ids)}`;
  const isStaticLocal = window.location.protocol !== "https:" && ["127.0.0.1", "localhost"].includes(window.location.hostname);
  if (isStaticLocal) {
    throw new Error("Local static preview uses simulated crypto fallback");
  }

  const response = await fetch(proxyUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Market proxy ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data.assets)) {
    throw new Error("Market proxy invalid payload");
  }

  return data.assets.map((asset) => ({
    ...asset,
    updatedAt: Date.now(),
  }));
}

function updateEquityFromMarket() {
  const equityInput = $("#currentEquity");
  const note = $("#equityLiveNote");
  if (!equityInput) return;

  const initial = numberValue("#initialCapital") || 100000;
  const basket = [
    ["SPY", 0.18],
    ["QQQ", 0.2],
    ["NVDA", 0.14],
    ["AMD", 0.1],
    ["BTC", 0.14],
    ["ETH", 0.08],
    ["GOLD", 0.16],
  ];
  const basketChange = basket.reduce((sum, [symbol, weight]) => sum + ((getMarketAsset(symbol)?.change || 0) * weight), 0);
  const livePnl = initial * 0.0185 + initial * (basketChange / 100) * 0.18;
  const equity = Math.round(initial + livePnl);

  if (document.activeElement !== equityInput) {
    equityInput.value = equity;
  }
  const highWaterInput = $("#highWaterEquity");
  if (highWaterInput && document.activeElement !== highWaterInput) {
    highWaterInput.value = Math.max(Number(highWaterInput.value || 0), equity);
  }
  const totalProfitInput = $("#totalProfit");
  if (totalProfitInput && document.activeElement !== totalProfitInput) {
    totalProfitInput.value = Math.round(equity - initial);
  }

  if (note) {
    note.textContent = `Live basket sync: ${formatMarketChange(basketChange)} weighted move, ${state.market.status === "live" ? "CoinGecko crypto active" : "fallback/simulated mode"}.`;
  }
}

function createMarketDataHook({ refreshMs = 45000 } = {}) {
  let timer = null;

  async function refresh() {
    state.market.status = "connecting";
    updateMarketStatus();

    const simulated = simulatedAssets.map(simulateAsset);
    let crypto = [];

    try {
      crypto = await fetchCryptoAssets();
      state.market.status = "live";
      state.market.error = "";
    } catch (error) {
      crypto = fallbackCryptoAssets();
      state.market.status = "degraded";
      state.market.error = error.message || "CoinGecko unavailable";
    }

    [...simulated, ...crypto].forEach((asset) => {
      state.market.assets.set(asset.symbol, asset);
    });
    state.market.lastUpdated = new Date();

    updateMarketStatus();
    renderTickerTape();
    updateEquityFromMarket();
    updateRisk();
    renderScanner();
    buildSignal();
  }

  return {
    refresh,
    start() {
      refresh();
      window.clearInterval(timer);
      timer = window.setInterval(refresh, refreshMs);
    },
  };
}

const marketData = createMarketDataHook({ refreshMs: state.market.refreshMs });

function renderScanner() {
  const rotation = state.scannerRun % scannerSeeds.length;
  const rows = [...scannerSeeds.slice(rotation), ...scannerSeeds.slice(0, rotation)];
  $("#scannerList").innerHTML = rows
    .map(
      (row) => {
        const asset = getMarketAsset(row.marketSymbol || row.ticker);
        const liveChange = asset?.change || 0;
        const confidence = clamp(Math.round(row.score + liveChange * 4 + (asset ? 3 : -2) - (row.news === "high" ? 7 : 0)), 1, 99);
        const price = asset ? formatMarketPrice(asset) : "--";
        const change = asset ? formatMarketChange(asset.change) : "pending";
        const changeClass = asset?.change < 0 ? "down" : "up";
        return `
        <article class="scanner-card">
          <div>
            <strong>${row.ticker}</strong>
            <span class="tag">${row.direction}</span>
          </div>
          <div>
            <div class="scanner-market-line">
              <span class="scanner-price">${price}</span>
              <span class="market-change ${changeClass}">${change}</span>
              <small>${asset?.source || "waiting"}</small>
            </div>
            <p>${row.setup}. RVOL ${row.relativeVolume.toFixed(1)}x, RSI ${row.rsi}, spread ${row.spread.toFixed(2)}%, news ${row.news}.</p>
            <div class="tag-row">
              ${row.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
          <div class="scanner-score">
            <strong>${confidence}</strong>
            <span>confidence</span>
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderPredictionMarkets(data = null) {
  const summary = $("#predictionSummary");
  const list = $("#predictionMarkets");
  const status = $("#predictionStatus");
  if (!summary || !list || !status) return;
  const context = data || state.prediction.context;
  const markets = context?.markets || state.prediction.markets || [];
  status.className = `status-chip ${context?.ftmo_context?.risk_level === "medium" ? "warning" : "safe"}`;
  status.textContent = context?.ftmo_context?.risk_level ? `Macro ${context.ftmo_context.risk_level}` : "Context only";
  summary.textContent = context
    ? `${context.provider}: ${context.ftmo_context.reason} ${context.ftmo_context.usage}`
    : "No event odds loaded yet.";
  list.innerHTML = markets.length
    ? markets
        .slice(0, 8)
        .map(
          (market) => `
            <article class="prediction-card">
              <div>
                <strong>${market.title}</strong>
                <small>${market.venue || market.source} · ${market.category || "prediction"}</small>
              </div>
              <div class="prediction-prob">
                <span>${Math.round(Number(market.probability || 0) * 100)}%</span>
                <small>implied</small>
              </div>
              <p>Volume ${fmtCompact.format(Number(market.volume || 0))}, liquidity ${fmtCompact.format(Number(market.liquidity || 0))}. Used as macro/news context only.</p>
            </article>
          `,
        )
        .join("")
    : "<article class=\"prediction-card\"><strong>No markets loaded</strong><p>Search FOMC, CPI, Bitcoin, Fed rates, or gold-related events.</p></article>";
}

function calendarMatchesFocus(event, focus) {
  if (focus === "all") return true;
  const currency = String(event.currency || "").toLowerCase();
  const text = `${event.event || ""} ${event.reason || ""}`.toLowerCase();
  if (focus === "usd") return currency.includes("usd") || text.includes("gold") || text.includes("indices");
  if (focus === "eur") return currency.includes("eur") || text.includes("eurusd");
  if (focus === "crypto") return currency.includes("crypto") || text.includes("crypto") || text.includes("bitcoin") || text.includes("btc");
  return true;
}

function renderEconomicCalendar(data = null) {
  const list = $("#economicCalendarList");
  const summary = $("#calendarSummary");
  if (!list || !summary) return;
  const focus = $("#calendarFocus")?.value || "all";
  const policy = $("#calendarPolicy")?.value || "block-high";
  const context = data || state.economicCalendar;
  const events = (context.events || calendarFallback).filter((event) => calendarMatchesFocus(event, focus));
  const highCount = events.filter((event) => String(event.impact).toLowerCase() === "high").length;
  const source = context.source || "protected fallback";
  summary.textContent = `${source}: ${events.length} relevant events. Policy: ${policy}. ${highCount ? "High-impact window requires block/wait behavior." : "No high-impact fallback event in current focus."}`;
  list.innerHTML = events.length
    ? events
        .map((event) => {
          const impact = String(event.impact || "medium").toLowerCase();
          const cardClass = impact === "high" ? "block" : impact === "medium" ? "warn" : "";
          return `
            <article class="calendar-event-card ${cardClass}">
              <time>${event.time || "TBD"}</time>
              <div>
                <strong>${event.currency || "ALL"} · ${event.event || "Calendar event"}</strong>
                <small>${event.reason || "Use as news/macro risk context."}</small>
                <small>Action: ${event.action || "Journal and wait for spread to normalize."}</small>
              </div>
              <span class="impact-pill ${impact}">${impact}</span>
            </article>
          `;
        })
        .join("")
    : `<article class="calendar-event-card warn"><time>Manual</time><div><strong>No events matched this focus.</strong><small>Open Investing calendar and journal your no-news decision.</small></div><span class="impact-pill medium">check</span></article>`;
}

function riskLabelClass(risk = "medium") {
  const value = String(risk).toLowerCase();
  if (value === "high") return "danger";
  if (value === "low") return "safe";
  return "warning";
}

function renderNewsFeed(data = null) {
  const grid = $("#newsImageGrid");
  if (!grid) return;
  const context = data || state.news;
  const items = context.items || newsFallback;
  grid.innerHTML = items
    .slice(0, 6)
    .map(
      (item) => `
        <article class="news-image-card ${riskLabelClass(item.risk)}">
          <a href="${item.url || "https://www.investing.com/"}" target="_blank" rel="noreferrer">
            <img src="${item.image || newsFallback[0].image}" alt="${item.category || "Market"} news image" loading="lazy" />
            <span>${item.source || "Market feed"}</span>
          </a>
          <div>
            <strong>${item.title}</strong>
            <p>${item.summary || "Use as protected news context before any trade preview."}</p>
            <small>${item.category || "Market"} · risk ${item.risk || "medium"}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadNewsFeed() {
  try {
    const response = await fetch("/api/news-feed", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "News feed unavailable.");
    state.news = {
      items: data.items || newsFallback,
      source: data.source || "news proxy",
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    };
    renderNewsFeed(state.news);
    agentConsoleLog("News feed", `${state.news.source}: ${state.news.items.length} items loaded.`);
  } catch (error) {
    state.news = { items: newsFallback, source: `fallback (${error.message})`, updatedAt: new Date() };
    renderNewsFeed(state.news);
    agentConsoleLog("News fallback", error.message);
  }
}

function renderStrategyLibrary() {
  const grid = $("#strategyLibrary");
  if (!grid) return;
  grid.innerHTML = strategyLibrarySeeds
    .map(
      (strategy) => `
        <article class="strategy-library-card" data-strategy-card="${strategy.id}">
          <span>${strategy.badge}</span>
          <strong>${strategy.title}</strong>
          <p>${strategy.use}</p>
          <small><b>Rule:</b> ${strategy.rule}</small>
          <small><b>Indicators:</b> ${strategy.indicators}</small>
          <button class="secondary-action" type="button" data-strategy-select="${strategy.id}">Use Strategy</button>
        </article>
      `,
    )
    .join("");
}

function renderAdminDashboard() {
  const admin = $("#adminDashboard");
  if (!admin) return;
  const loggedIn = Boolean(state.user);
  const botProfile = state.user?.profile?.botProfile || botProfileFromInputs();
  const riskPercent = Number(botProfile.riskPercent || numberValue("#botRisk") || 0.25);
  const bridgeUrl = $("#mt5BridgeUrl")?.value || "http://127.0.0.1:8789";
  const readiness = [
    {
      label: "Registration",
      ready: loggedIn,
      detail: loggedIn ? `${state.user.email} saved` : "Create/login profile first",
    },
    {
      label: "Risk cap",
      ready: riskPercent > 0 && riskPercent <= 0.5,
      detail: `${riskPercent.toFixed(2)}% per trade`,
    },
    {
      label: "MT5 bridge",
      ready: state.exchange.mt5Connected,
      detail: state.exchange.mt5Connected ? "Connected" : bridgeUrl,
    },
    {
      label: "Manual approval",
      ready: $("#agentRequireApproval")?.checked !== false,
      detail: "Required before protected live submit",
    },
    {
      label: "News/calendar",
      ready: Boolean(state.news.updatedAt || state.economicCalendar.updatedAt),
      detail: state.news.updatedAt || state.economicCalendar.updatedAt ? "Risk feed loaded" : "Refresh live desk",
    },
  ];
  $("#adminConsoleStatus").textContent = loggedIn ? "Admin profile active" : "Register to unlock admin";
  admin.innerHTML = `
    <div class="admin-kpi ${loggedIn ? "ready" : "warn"}">
      <span>User</span>
      <strong>${loggedIn ? state.user.name : "Guest"}</strong>
      <small>${loggedIn ? state.user.email : "No saved profile yet"}</small>
    </div>
    <div class="admin-kpi">
      <span>Mode</span>
      <strong>${botProfile.mode || $("#executionModeSelect")?.value || "protected-live"}</strong>
      <small>Manual approval is required for live submit.</small>
    </div>
    <div class="admin-kpi">
      <span>Risk</span>
      <strong>${riskPercent.toFixed(2)}%</strong>
      <small>Default per trade risk cap.</small>
    </div>
    <div class="admin-kpi">
      <span>Bridge</span>
      <strong>${state.exchange.mt5Connected ? "Connected" : "Local check"}</strong>
      <small>${bridgeUrl}</small>
    </div>
    <div class="admin-readiness">
      <strong>Admin readiness</strong>
      ${readiness
        .map(
          (item) => `
            <div class="readiness-row ${item.ready ? "ready" : "todo"}">
              <span>${item.ready ? "Ready" : "Todo"}</span>
              <div>
                <b>${item.label}</b>
                <small>${item.detail}</small>
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderStartHereFlow() {
  const profileState = $("#startProfileState");
  if (!profileState) return;
  const loggedIn = Boolean(state.user);
  const marketReady = state.market.status === "live" || state.market.status === "degraded";
  const calendarReady = Boolean(state.economicCalendar.updatedAt);
  const newsReady = Boolean(state.news.updatedAt);
  const strategy = botStrategyProfiles[$("#botStrategy")?.value || "vwap"]?.label || "Strategy selected";
  const riskStatus = $("#preflightStatus")?.textContent || "Not run";
  const previewReady = Boolean(state.exchange.preview?.approved);

  profileState.textContent = loggedIn ? `Admin ready: ${state.user.name}` : "Login or register first";
  $("#startDataState").textContent = marketReady
    ? `${state.market.status === "live" ? "Live" : "Fallback"} prices · calendar ${calendarReady ? "ready" : "pending"} · news ${newsReady ? "ready" : "pending"}`
    : "Load market board, news and calendar";
  $("#startStrategyState").textContent = strategy;
  $("#startRiskState").textContent = riskStatus;
  $("#startPreviewState").textContent = previewReady ? "Preview approved, manual click required" : "Build preview after risk gate";

  const states = {
    profile: loggedIn,
    "live-data": marketReady && (calendarReady || newsReady),
    strategy: true,
    risk: String(riskStatus).toLowerCase().includes("ok"),
    preview: previewReady,
  };

  $$(".start-step").forEach((step) => {
    step.classList.toggle("done", Boolean(states[step.dataset.startStep]));
    step.classList.toggle("active", !states[step.dataset.startStep]);
  });
}

function renderBotConnectors(data = null) {
  const connectors = data?.connectors || state.botConnectors.connectors || botConnectorSeeds;
  const skills = data?.skills || state.botConnectors.skills || cmcSkillSeeds;
  const grid = $("#botConnectorGrid");
  const skillsList = $("#cmcSkillsList");
  if (grid) {
    grid.innerHTML = connectors
      .map(
        (connector) => `
          <article class="connector-card">
            <span>${connector.venue || connector.type}</span>
            <strong>${connector.name}</strong>
            <p>${connector.purpose}</p>
            <small>${connector.safety}</small>
            <a class="secondary-action" href="${connector.url}" target="_blank" rel="noreferrer">Open ${connector.venue}</a>
            ${connector.docs ? `<a class="secondary-action" href="${connector.docs}" target="_blank" rel="noreferrer">Docs</a>` : ""}
          </article>
        `,
      )
      .join("");
  }
  if (skillsList) {
    skillsList.innerHTML = `
      <span>CoinMarketCap skills marketplace</span>
      ${skills
        .map((skill) => {
          const title = Array.isArray(skill) ? skill[0] : skill.name;
          const text = Array.isArray(skill) ? skill[1] : skill.description;
          return `
            <article class="skill-row">
              <div>
                <strong>${title}</strong>
                <small>${text}</small>
              </div>
              <span>skill</span>
            </article>
          `;
        })
        .join("")}
    `;
  }
}

function renderGuidedFlow(activeId = "profile") {
  const list = $("#guidedFlowSteps");
  const matrix = $("#agentSyncMatrix");
  if (list) {
    list.innerHTML = guidedFlowSteps
      .map(
        (step, index) => `
          <article class="guided-step-card ${step.id === activeId ? "active" : ""}">
            <span>${index + 1}</span>
            <strong>${step.title}</strong>
            <small>${step.text}</small>
            <button class="secondary-action" type="button" data-guided-target="${step.target}" data-guided-step="${step.id}">${step.action}</button>
          </article>
        `,
      )
      .join("");
  }
  if (matrix) {
    matrix.innerHTML = agentSyncRows
      .map(
        ([agent, text, testStatus, liveStatus]) => `
          <article class="agent-sync-row">
            <strong>${agent}</strong>
            <small>${text}</small>
            <div class="sync-pills">
              <span class="sync-pill">${testStatus}</span>
              <span class="sync-pill ${liveStatus === "locked" ? "locked" : "live"}">${liveStatus}</span>
            </div>
          </article>
        `,
      )
      .join("");
  }
  if ($("#guidedFlowStatus")) {
    const step = guidedFlowSteps.find((item) => item.id === activeId) || guidedFlowSteps[0];
    $("#guidedFlowStatus").textContent = `${guidedFlowSteps.indexOf(step) + 1} / ${step.title}`;
  }
}

async function loadBotConnectors() {
  $("#botConnectorStatus").className = "status-chip warning";
  $("#botConnectorStatus").textContent = "Loading";
  try {
    const response = await fetch("/api/bot-connectors", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Connector API unavailable.");
    state.botConnectors.connectors = data.connectors || botConnectorSeeds;
    state.botConnectors.skills = data.skills || cmcSkillSeeds;
    renderBotConnectors(data);
    $("#botConnectorStatus").className = "status-chip safe";
    $("#botConnectorStatus").textContent = "Connectors ready";
    agentConsoleLog("Bot connectors", "Pionex, CoinMarketCap Skills and 3Commas routes loaded.");
  } catch (error) {
    renderBotConnectors();
    $("#botConnectorStatus").className = "status-chip warning";
    $("#botConnectorStatus").textContent = "Local connector map";
    agentConsoleLog("Bot connectors fallback", error.message);
  }
}

function collectConnectorPayload() {
  return {
    connector: $("#connectorSelect")?.value || "pionex-bot",
    useCase: $("#connectorUseCase")?.value || "market-analysis",
    symbol: $("#connectorSymbol")?.value || "BTC_USDT",
    riskPercent: numberValue("#connectorRisk") || 0.25,
    noWithdrawPermission: $("#connectorNoWithdraw")?.checked !== false,
    manualApprovalRequired: $("#connectorManualApproval")?.checked !== false,
    account: fundedEliteGuardFromInputs(),
    selectedChallenge: selectedChallengeRule().label,
    marketDataStatus: state.market.status,
    agentFramework: $("#connectorSelect")?.value === "agentscope-runtime" ? "AgentScope" : "Zeus native",
    apiProvider: $("#connectorSelect")?.value === "apibricks-console" ? "APIBricks" : "direct",
  };
}

async function buildConnectorPreview() {
  const payload = collectConnectorPayload();
  $("#botConnectorStatus").className = "status-chip warning";
  $("#botConnectorStatus").textContent = "Previewing";
  try {
    const response = await fetch("/api/bot-connectors/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    state.botConnectors.preview = data.preview || data;
    $("#connectorPreviewOutput").textContent = JSON.stringify(data, null, 2);
    $("#botConnectorStatus").className = response.ok && data.preview?.approved_for_research ? "status-chip safe" : "status-chip danger";
    $("#botConnectorStatus").textContent = response.ok && data.preview?.approved_for_research ? "Research preview ready" : "Preview blocked";
    agentConsoleLog("Connector preview", data.preview?.decision || data.error || "Connector preview complete.");
  } catch (error) {
    $("#connectorPreviewOutput").textContent = error.message;
    $("#botConnectorStatus").className = "status-chip danger";
    $("#botConnectorStatus").textContent = "Preview error";
  }
}

function openSelectedConnector() {
  const id = $("#connectorSelect")?.value || "pionex-bot";
  const connector = (state.botConnectors.connectors || botConnectorSeeds).find((item) => item.id === id) || botConnectorSeeds[0];
  window.open(connector.url, "_blank", "noopener,noreferrer");
  agentConsoleLog("Connector opened", `${connector.name}: manual review required on external venue.`);
}

async function loadEconomicCalendar() {
  $("#calendarSummary").textContent = "Loading economic calendar and protected news gate...";
  try {
    const response = await fetch(`/api/economic-calendar?focus=${encodeURIComponent($("#calendarFocus")?.value || "all")}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Economic calendar unavailable.");
    state.economicCalendar = {
      events: data.events || calendarFallback,
      source: data.source || "calendar proxy",
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      riskLevel: data.riskLevel || "medium",
    };
    renderEconomicCalendar(state.economicCalendar);
    agentConsoleLog("Economic calendar", `${state.economicCalendar.source}: ${state.economicCalendar.events.length} events loaded.`);
    showToast("Economic calendar loaded.");
  } catch (error) {
    state.economicCalendar = {
      events: calendarFallback,
      source: `fallback calendar (${error.message})`,
      updatedAt: new Date(),
      riskLevel: "medium",
    };
    renderEconomicCalendar(state.economicCalendar);
    agentConsoleLog("Calendar fallback", error.message);
  }
}

function renderClobMarkets() {
  const list = $("#clobMarkets");
  if (!list) return;
  if (!state.clob.markets.length) {
    list.innerHTML = `
      <article class="exchange-log-entry">
        <strong>No CLOB markets loaded</strong>
        <small>Click Load Polymarket CLOB to fetch active previewable markets.</small>
      </article>
    `;
    return;
  }
  list.innerHTML = state.clob.markets
    .map(
      (market, index) => `
        <button class="clob-market-row" type="button" data-clob-market="${index}">
          <strong>${market.question}</strong>
          <small>${market.tokens.map((token) => `${token.outcome}: ${(token.price * 100).toFixed(0)}%`).join(" · ")} · min ${market.minimum_order_size}</small>
        </button>
      `,
    )
    .join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  new Uint8Array(bytes).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function updateClobWalletUi() {
  const compliance = state.clob.wallet.compliance;
  const approval = state.clob.wallet.approval;
  const walletText = state.clob.wallet.address
    ? `${state.clob.wallet.provider || "wallet"} · ${state.clob.wallet.address.slice(0, 6)}...${state.clob.wallet.address.slice(-4)}`
    : "Not connected";
  if ($("#clobComplianceStatus")) {
    $("#clobComplianceStatus").textContent = compliance
      ? compliance.blocked
        ? compliance.reason
        : `${compliance.country}: passed for preview`
      : "Not checked";
  }
  if ($("#clobWalletAddress")) $("#clobWalletAddress").textContent = walletText;
  if ($("#clobWalletApprovalStatus")) {
    $("#clobWalletApprovalStatus").textContent = approval
      ? `Signed ${new Date(approval.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · audit only`
      : "Not signed";
  }
}

async function runClobCompliance() {
  $("#clobStatus").className = "status-chip warning";
  $("#clobStatus").textContent = "Checking compliance";
  const payload = {
    jurisdictionAttestation: Boolean($("#clobJurisdictionAttestation").checked),
    walletRiskAcknowledgement: Boolean($("#clobWalletRiskAcknowledgement").checked),
    manualApprovalRequired: Boolean($("#clobManualApprovalRequired").checked),
    country: Intl.DateTimeFormat().resolvedOptions().timeZone ? "" : "XX",
  };
  try {
    const response = await fetch("/api/compliance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    state.clob.wallet.compliance = data.compliance || null;
    updateClobWalletUi();
    $("#clobStatus").className = response.ok ? "status-chip safe" : "status-chip danger";
    $("#clobStatus").textContent = response.ok ? "Compliance passed" : "Compliance blocked";
    $("#clobPreviewOutput").textContent = JSON.stringify(data, null, 2);
    agentConsoleLog("CLOB compliance", data.compliance?.reason || data.error || "Compliance checked.");
  } catch (error) {
    $("#clobStatus").className = "status-chip danger";
    $("#clobStatus").textContent = "Compliance error";
    $("#clobPreviewOutput").textContent = error.message;
  }
}

async function connectPhantomWallet() {
  $("#clobStatus").className = "status-chip warning";
  $("#clobStatus").textContent = "Connecting wallet";
  try {
    if (window.phantom?.solana?.isPhantom) {
      const response = await window.phantom.solana.connect();
      state.clob.wallet.address = response.publicKey.toString();
      state.clob.wallet.provider = "phantom-solana";
    } else if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      state.clob.wallet.address = accounts?.[0] || "";
      state.clob.wallet.provider = "evm-wallet";
    } else {
      window.open("https://trade.phantom.com/?utm_source=extension_content_card", "_blank", "noopener,noreferrer");
      throw new Error("Wallet extension was not detected. Open Phantom Terminal, install/connect wallet, then return.");
    }
    state.clob.wallet.approval = null;
    updateClobWalletUi();
    $("#clobStatus").className = "status-chip safe";
    $("#clobStatus").textContent = "Wallet connected";
    agentConsoleLog("Wallet connected", `${state.clob.wallet.provider}: ${state.clob.wallet.address}`);
  } catch (error) {
    $("#clobStatus").className = "status-chip danger";
    $("#clobStatus").textContent = "Wallet not connected";
    $("#clobPreviewOutput").textContent = error.message;
  }
}

async function signClobApproval() {
  if (!state.clob.wallet.address) await connectPhantomWallet();
  if (!state.clob.wallet.address) return;
  const previewPayload = collectClobPayload();
  $("#clobStatus").className = "status-chip warning";
  $("#clobStatus").textContent = "Waiting signature";
  try {
    const challengeResponse = await fetch("/api/wallet/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: state.clob.wallet.address,
        walletProvider: state.clob.wallet.provider || $("#clobWalletProvider").value,
        previewPayload,
      }),
    });
    const challengeData = await challengeResponse.json();
    if (!challengeResponse.ok || !challengeData.ok) throw new Error(challengeData.error || "Wallet challenge failed.");
    const message = challengeData.challenge.message;
    let signature = "";
    if (state.clob.wallet.provider === "phantom-solana" && window.phantom?.solana?.signMessage) {
      const encoded = new TextEncoder().encode(message);
      const signed = await window.phantom.solana.signMessage(encoded, "utf8");
      signature = bytesToBase64(signed.signature);
    } else if (state.clob.wallet.provider === "evm-wallet" && window.ethereum) {
      signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, state.clob.wallet.address],
      });
    } else {
      throw new Error("This wallet cannot sign messages in the browser session.");
    }
    const approvalResponse = await fetch("/api/wallet/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: challengeData.challenge.id,
        walletAddress: state.clob.wallet.address,
        walletProvider: state.clob.wallet.provider || $("#clobWalletProvider").value,
        message,
        signature,
        previewPayload,
      }),
    });
    const approvalData = await approvalResponse.json();
    if (!approvalResponse.ok || !approvalData.ok) throw new Error(approvalData.error || "Wallet approval failed.");
    state.clob.wallet.challenge = challengeData.challenge;
    state.clob.wallet.approval = approvalData.approval;
    updateClobWalletUi();
    $("#clobStatus").className = "status-chip safe";
    $("#clobStatus").textContent = "Approval signed";
    $("#clobPreviewOutput").textContent = JSON.stringify(approvalData, null, 2);
    agentConsoleLog("Wallet approval", "Explicit wallet approval signed for this CLOB preview. Submit remains locked.");
  } catch (error) {
    $("#clobStatus").className = "status-chip danger";
    $("#clobStatus").textContent = "Signature blocked";
    $("#clobPreviewOutput").textContent = error.message;
  }
}

async function loadClobMarkets() {
  $("#clobStatus").className = "status-chip warning";
  $("#clobStatus").textContent = "Loading CLOB";
  try {
    const response = await fetch("/api/clob/markets?limit=8");
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "CLOB markets unavailable.");
    state.clob.markets = data.markets || [];
    renderClobMarkets();
    $("#clobStatus").className = "status-chip safe";
    $("#clobStatus").textContent = "CLOB loaded";
    agentConsoleLog("CLOB markets", `${state.clob.markets.length} active preview markets loaded.`);
  } catch (error) {
    $("#clobStatus").className = "status-chip danger";
    $("#clobStatus").textContent = "CLOB unavailable";
    $("#clobMarkets").innerHTML = `<article class="exchange-log-entry blocked"><strong>CLOB unavailable</strong><small>${error.message}</small></article>`;
  }
}

function selectClobMarket(index) {
  const market = state.clob.markets[index];
  if (!market) return;
  state.clob.selectedMarket = market;
  const token = market.tokens[0] || {};
  $("#clobMarketUrl").value = market.market_slug ? `https://polymarket.com/market/${market.market_slug}` : "https://polymarket.com/";
  $("#clobTokenId").value = token.token_id || "";
  $("#clobOutcome").value = String(token.outcome || "YES").toUpperCase().includes("NO") ? "NO" : "YES";
  $("#clobPrice").value = token.price > 0 && token.price < 1 ? Number(token.price).toFixed(2) : "0.50";
  $("#clobSize").value = Math.max(Number(market.minimum_order_size || 5), 5);
  agentConsoleLog("CLOB market selected", market.question);
}

function collectClobPayload() {
  return {
    walletProvider: $("#clobWalletProvider").value,
    marketUrl: $("#clobMarketUrl").value,
    tokenId: $("#clobTokenId").value,
    outcome: $("#clobOutcome").value,
    side: $("#clobSide").value,
    price: numberValue("#clobPrice"),
    size: numberValue("#clobSize"),
    maxSpend: numberValue("#clobMaxSpend"),
    jurisdictionAttestation: Boolean($("#clobJurisdictionAttestation")?.checked),
    walletRiskAcknowledgement: Boolean($("#clobWalletRiskAcknowledgement")?.checked),
    manualApprovalRequired: Boolean($("#clobManualApprovalRequired")?.checked),
    compliance: state.clob.wallet.compliance,
    walletApproval: state.clob.wallet.approval,
  };
}

async function buildClobPreview() {
  const payload = collectClobPayload();
  $("#clobStatus").className = "status-chip warning";
  $("#clobStatus").textContent = "Previewing";
  try {
    const response = await fetch("/api/clob/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    state.clob.preview = data.preview || null;
    $("#clobPreviewOutput").textContent = JSON.stringify(data, null, 2);
    $("#clobStatus").className = response.ok ? "status-chip safe" : "status-chip danger";
    $("#clobStatus").textContent = response.ok ? "Wallet preview ready" : "Preview blocked";
    agentConsoleLog("CLOB preview", response.ok ? "Wallet preview ready. Submit remains locked." : data.preview?.blockers?.join(" ") || "Blocked.");
  } catch (error) {
    $("#clobStatus").className = "status-chip danger";
    $("#clobStatus").textContent = "Preview error";
    $("#clobPreviewOutput").textContent = error.message;
  }
}

async function submitClobLocked() {
  const response = await fetch("/api/clob/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preview: state.clob.preview, userClicked: true }),
  });
  const data = await response.json();
  $("#clobPreviewOutput").textContent = JSON.stringify(data, null, 2);
  $("#clobStatus").className = "status-chip danger";
  $("#clobStatus").textContent = "Submit locked";
  agentConsoleLog("CLOB submit locked", data.reason || "Submit remains locked.");
}

async function loadPredictionMarkets() {
  const query = $("#predictionQuery").value.trim() || "fomc";
  const source = $("#predictionSource").value;
  $("#predictionStatus").className = "status-chip warning";
  $("#predictionStatus").textContent = "Loading";
  try {
    const response = await fetch(`/api/prediction-markets?q=${encodeURIComponent(query)}&source=${encodeURIComponent(source)}&limit=8`);
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Prediction market API unavailable.");
    state.prediction = {
      markets: data.markets || [],
      context: data,
      provider: data.provider,
    };
    renderPredictionMarkets(data);
    agentConsoleLog("Prediction markets", `${data.provider}: ${data.ftmo_context.reason}`);
    showToast("Prediction market context loaded.");
  } catch (error) {
    $("#predictionStatus").className = "status-chip danger";
    $("#predictionStatus").textContent = "Unavailable";
    $("#predictionSummary").textContent = error.message;
    agentConsoleLog("Prediction markets unavailable", error.message);
  }
}

function selectedBotIndicators() {
  return $$(".bot-indicator")
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function buildBotConfig() {
  const strategy = botStrategyProfiles[$("#botStrategy").value];
  const market = botMarketProfiles[$("#botMarket").value];
  const challengeRule = selectedChallengeRule();
  const riskPct = numberValue("#botRisk");
  const auditDays = numberValue("#botDemoDays");
  const execution = $("#botExecution").value;
  const indicators = selectedBotIndicators();
  const readiness =
    riskPct <= 0.5 && execution === "protected-live" && indicators.length >= 4
      ? "Protected Live ready"
      : riskPct > 0.75
        ? "Risk too high"
        : "Needs risk gate";

  const status = $("#botReadiness");
  status.className = readiness === "Protected Live ready" ? "status-chip safe" : readiness === "Risk too high" ? "status-chip danger" : "status-chip warning";
  status.textContent = readiness;

  const workflow = [
    ["1", "Market + strategy", `${market.watchlist.join(", ")} with ${strategy.label}.`],
    ["2", "Risk + challenge rules", `${challengeRule.label}: ${(challengeRule.target * 100).toFixed(0)}% target, ${(challengeRule.dailyLoss * 100).toFixed(0)}% daily loss, ${(challengeRule.maxLoss * 100).toFixed(0)}% max drawdown.`],
    ["3", "MT5 preview + approve", "Bridge previews lot size and order request; user manually approves live submit."],
  ];

  $("#botWorkflow").innerHTML = workflow
    .map(
      ([step, title, text]) => `
        <article class="bot-workflow-step">
          <span>${step}</span>
          <div>
            <strong>${title}</strong>
            <small>${text}</small>
          </div>
        </article>
      `,
    )
    .join("");

  const config = {
    botName: $("#botName").value.trim() || "Zeus Trading Bot",
    mode: execution,
    liveExecution: execution === "protected-live",
    protectedLiveRoute: "MT5 bridge with manual approval",
    bridgeUrl: $("#mt5BridgeUrl")?.value || "http://127.0.0.1:8789",
    market: {
      watchlist: market.watchlist,
      data: market.data,
      session: market.session,
    },
    strategy: {
      name: strategy.label,
      trigger: strategy.trigger,
      invalidation: strategy.invalidation,
      indicators,
    },
    risk: {
      challenge: challengeRule.label,
      challengeProvider: challengeRule.provider,
      riskPerTradePercent: riskPct,
      maxTradesPerDay: clamp(numberValue("#agentMaxTrades"), 1, 5),
      minRewardRisk: 2,
      mandatoryStopLoss: true,
      dailyLossLock: true,
      noRevengeTrading: true,
    },
    reporting: {
      auditDays,
      requiredMetrics: ["win rate", "expectancy", "profit factor", "max drawdown", "rule violations"],
      dashboard: "Live ticker, scanner confidence, MT5 bridge status, equity guard, journal, and daily review.",
    },
  };

  $("#botConfigOutput").textContent = JSON.stringify(config, null, 2);
}

async function authRequest(path, payload = null, method = "POST") {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (payload) options.body = JSON.stringify(payload);
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({ ok: false, error: "Auth API returned a non-JSON response." }));
  return { ok: response.ok, data };
}

function botProfileFromInputs() {
  return {
    platform: $("#executionPlatform").value,
    mode: $("#executionModeSelect").value,
    bridgeUrl: $("#mt5BridgeUrl")?.value || "http://127.0.0.1:8789",
    challenge: selectedChallengeKey(),
    agentControlMode: $("#agentControlMode")?.value || "manual-approval",
    requireUserApproval: $("#agentRequireApproval")?.checked !== false,
    market: $("#botMarket").value,
    strategy: $("#botStrategy").value,
    riskPercent: numberValue("#botRisk"),
    auditDays: numberValue("#botDemoDays"),
    maxTradesPerDay: 2,
    protectedLive: true,
    indicators: selectedBotIndicators(),
    wallet: {
      label: $("#profileWalletLabel")?.value || "Primary crypto wallet",
      address: $("#profileWalletAddress")?.value?.trim() || "",
      fundingMode: $("#profileFundingMode")?.value || "manual-approve",
      safety: "Public address only. Zeus never stores seed phrase or private key.",
    },
  };
}

function applyUserProfile(user) {
  state.user = user;
  const loggedIn = Boolean(user);
  $("#authStatus").className = loggedIn ? "status-chip safe" : "status-chip warning";
  $("#authStatus").textContent = loggedIn ? "Logged in" : "Guest";
  $("#sidebarProfileStatus").textContent = loggedIn ? "Signed in" : "Guest mode";
  $("#sidebarProfileName").textContent = loggedIn ? user.name : "No profile";
  $("#sidebarProfileHelp").textContent = loggedIn ? "Bot settings can be saved to your profile." : "Register or log in to save bot settings.";
  $("#profileName").textContent = loggedIn ? user.profile?.displayName || user.name : "Guest trader";
  $("#profileEmail").textContent = loggedIn ? user.email : "Not logged in.";

  const botProfile = user?.profile?.botProfile || {};
  $("#profilePlatform").textContent =
    botProfile.platform === "mt5-bridge" ? "MT5 Bridge" : botProfile.platform === "kucoin-mock" ? "KuCoin Mock" : botProfile.platform === "ftmo-custom" ? "FTMO Profile" : "Binance Testnet";
  $("#profileRisk").textContent = `${Number(botProfile.riskPercent || numberValue("#botRisk") || 0.25).toFixed(2)}%`;
  $("#profileLive").textContent = botProfile.protectedLive || botProfile.mode === "protected-live" ? "Protected" : "Guarded";
  const wallet = botProfile.wallet || {};
  const walletAddress = String(wallet.address || "");
  if ($("#profileWalletStatus")) {
    $("#profileWalletStatus").textContent = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "No wallet";
  }

  if (botProfile.challenge && selectHasValue("#phaseSelect", botProfile.challenge)) $("#phaseSelect").value = botProfile.challenge;
  if (botProfile.challenge && selectHasValue("#agentChallenge", botProfile.challenge)) $("#agentChallenge").value = botProfile.challenge;
  if (botProfile.agentControlMode && $("#agentControlMode")) $("#agentControlMode").value = botProfile.agentControlMode;
  if (typeof botProfile.requireUserApproval === "boolean" && $("#agentRequireApproval")) $("#agentRequireApproval").checked = botProfile.requireUserApproval;
  if (botProfile.platform && $("#executionPlatform")) $("#executionPlatform").value = botProfile.platform;
  if (botProfile.mode && $("#executionModeSelect")) $("#executionModeSelect").value = botProfile.mode;
  if (botProfile.bridgeUrl && $("#mt5BridgeUrl")) $("#mt5BridgeUrl").value = botProfile.bridgeUrl;
  if (botProfile.market && $("#botMarket")) $("#botMarket").value = botProfile.market;
  if (botProfile.strategy && $("#botStrategy")) $("#botStrategy").value = botProfile.strategy;
  if (botProfile.riskPercent && $("#botRisk")) $("#botRisk").value = botProfile.riskPercent;
  if (botProfile.demoDays && $("#botDemoDays")) $("#botDemoDays").value = botProfile.demoDays;
  if (wallet.label && $("#profileWalletLabel")) $("#profileWalletLabel").value = wallet.label;
  if (wallet.address && $("#profileWalletAddress")) $("#profileWalletAddress").value = wallet.address;
  if (wallet.fundingMode && $("#profileFundingMode")) $("#profileFundingMode").value = wallet.fundingMode;
  buildBotConfig();
  renderAgentControlStatus();
  renderAdminDashboard();
  renderStartHereFlow();
}

async function loadCurrentUser() {
  try {
    const { data } = await authRequest("/auth/me", null, "GET");
    applyUserProfile(data.user || null);
  } catch (error) {
    applyUserProfile(null);
  }
}

function setAuthMode(mode) {
  state.authMode = mode;
  $$(".auth-tabs button").forEach((button) => button.classList.toggle("active", button.dataset.authMode === mode));
  $("#authSubmit").textContent = mode === "register" ? "Create Profile" : "Login";
  $("#authName").closest("label").style.display = mode === "register" ? "grid" : "none";
  $("#authPassword").setAttribute("autocomplete", mode === "register" ? "new-password" : "current-password");
}

async function submitAuth(event) {
  event.preventDefault();
  const payload = {
    name: $("#authName").value,
    email: $("#authEmail").value,
    password: $("#authPassword").value,
  };
  const path = state.authMode === "register" ? "/auth/register" : "/auth/login";
  $("#authMessage").textContent = state.authMode === "register" ? "Creating profile..." : "Logging in...";
  const { ok, data } = await authRequest(path, payload);
  if (!ok || !data.ok) {
    $("#authMessage").textContent = data.error || "Authentication failed.";
    return;
  }
  $("#authPassword").value = "";
  $("#authMessage").textContent = "Profile loaded. Your bot settings can now be saved.";
  applyUserProfile(data.user);
}

async function logoutUser() {
  await authRequest("/auth/logout", {});
  $("#authMessage").textContent = "Logged out.";
  applyUserProfile(null);
}

async function saveProfileSettings() {
  if (!state.user) {
    $("#authMessage").textContent = "Login or register before saving profile settings.";
    showToast("Login required to save profile.");
    return;
  }
  const payload = {
    displayName: $("#authName").value || state.user.name,
    botProfile: botProfileFromInputs(),
  };
  const { ok, data } = await authRequest("/auth/profile", payload);
  if (!ok || !data.ok) {
    $("#authMessage").textContent = data.error || "Profile save failed.";
    return;
  }
  $("#authMessage").textContent = "Profile settings saved.";
  applyUserProfile(data.user);
  showToast("Profile saved.");
}

function addExchangeLog(title, detail, level = "info") {
  state.exchange.log.unshift({
    title,
    detail,
    level,
    time: new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  });
  state.exchange.log = state.exchange.log.slice(0, 8);
  renderExchangeLog();
  renderCockpitStatus();
}

function renderExchangeLog() {
  const log = $("#exchangeStatusLog");
  if (!log) return;

  if (!state.exchange.log.length) {
    log.innerHTML = `
      <article class="exchange-log-entry">
        <strong>Waiting for action</strong>
        <small>Connect or build an order preview to start the controlled execution flow.</small>
      </article>
    `;
    return;
  }

  log.innerHTML = state.exchange.log
    .map(
      (entry) => `
        <article class="exchange-log-entry ${entry.level}">
          <strong>${entry.title}</strong>
          <small>${entry.time} - ${entry.detail}</small>
        </article>
      `,
    )
    .join("");
}

function mt5BridgeUrl(path = "") {
  const base = ($("#mt5BridgeUrl")?.value || "http://127.0.0.1:8789").replace(/\/+$/, "");
  return `${base}${path}`;
}

async function callMt5Bridge(path, options = {}) {
  const response = await fetch(mt5BridgeUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({ ok: response.ok, status: response.status, text: "Bridge returned non-JSON response." }));
  if (!response.ok) {
    throw new Error(data.reason || data.error || `MT5 bridge ${response.status}`);
  }
  return data;
}

async function auditExecution(eventType, payload = {}) {
  try {
    await fetch("/execution/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        payload,
        createdAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    addExchangeLog("Audit sync pending", error.message, "info");
  }
}

async function saveCloudJournalEntry(eventType, payload = {}) {
  try {
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "Journal API failed.");
    return data.entry || null;
  } catch (error) {
    agentConsoleLog("Cloud journal pending", error.message);
    return null;
  }
}

function summarizeJournalPayload(eventType, payload = {}) {
  let value = payload || {};
  if (typeof payload === "string") {
    try {
      value = JSON.parse(payload || "{}");
    } catch (error) {
      value = { text: payload };
    }
  }
  if (value.text) return value.text;
  if (value.decision || value.nextAction) return `${value.decision || eventType}: ${value.nextAction || "Decision saved."}`;
  if (value.cycle?.final_decision) return `${value.cycle.final_decision}: ${value.cycle.agents?.find((agent) => agent.agent === "Supervisor Agent")?.summary || "Agent cycle saved."}`;
  if (value.final_decision) return `${value.final_decision}: ${value.agents?.find((agent) => agent.agent === "Supervisor Agent")?.summary || "Agent cycle saved."}`;
  if (value.mode || value.reason) return `${value.mode || eventType}: ${value.reason || "Audit event saved."}`;
  return JSON.stringify(value).slice(0, 420);
}

async function loadCloudJournal() {
  state.cloudJournalStatus = "Syncing...";
  renderJournal();
  try {
    const [journalResponse, summaryResponse] = await Promise.all([
      fetch("/api/journal", { cache: "no-store" }),
      fetch("/api/audit-summary", { cache: "no-store" }),
    ]);
    const data = await journalResponse.json();
    const summaryData = await summaryResponse.json().catch(() => ({}));
    if (!journalResponse.ok || !data.ok) throw new Error(data.error || "Journal API unavailable.");
    if (summaryResponse.ok && summaryData.ok) state.auditSummary = summaryData.summary;
    state.cloudJournal = (data.entries || []).map((entry) => {
      let payload = {};
      try {
        payload = JSON.parse(entry.payload || "{}");
      } catch (error) {
        payload = { text: entry.payload || "Unparseable journal payload" };
      }
      return {
        id: entry.id,
        eventType: entry.event_type,
        time: new Date(entry.created_at).toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }),
        text: summarizeJournalPayload(entry.event_type, payload),
      };
    });
    state.cloudJournalStatus = `${state.cloudJournal.length} cloud entries`;
    agentConsoleLog("Cloud journal", state.cloudJournalStatus);
  } catch (error) {
    state.cloudJournalStatus = `Cloud sync unavailable: ${error.message}`;
    agentConsoleLog("Cloud journal unavailable", error.message);
  }
  renderJournal();
}

async function exportAuditBundle() {
  const button = $("#exportAuditBundle");
  if (button) button.disabled = true;
  try {
    const response = await fetch("/api/audit-export", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Audit export unavailable.");
    const pretty = JSON.stringify(data, null, 2);
    const blob = new Blob([pretty], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `zeus-audit-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    agentConsoleLog("Audit export", `Downloaded ${Object.keys(data.tables || {}).length} audit tables.`);
    showToast("Audit JSON exported.");
  } catch (error) {
    agentConsoleLog("Audit export failed", error.message);
    showToast("Audit export unavailable.");
  } finally {
    if (button) button.disabled = false;
  }
}

function renderAuditSummary() {
  const grid = $("#auditSummaryGrid");
  if (!grid) return;
  const summary = state.auditSummary;
  if (!summary) {
    grid.innerHTML = `
      <article>
        <span>Cloud audit</span>
        <strong>Not synced</strong>
        <small>Click Sync Cloud Audit to load backend counts.</small>
      </article>
    `;
    return;
  }
  const cards = [
    ["Agent runs", summary.agent_runs, summary.latest_agent_decision],
    ["Previews", summary.trade_previews, "MT5/order previews"],
    ["Approvals", summary.approvals, "Manual approval tokens"],
    ["Rejections", summary.rejections, "Blocked setups"],
    ["Violations", summary.rule_violations, "Rule blockers"],
    ["Kill switch", summary.kill_switch_active ? "ACTIVE" : "Off", summary.kill_switch_mode],
  ];
  grid.innerHTML = cards
    .map(
      ([label, value, help]) => `
        <article class="${label === "Kill switch" && value === "ACTIVE" ? "danger" : ""}">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${help || "Backend audit"}</small>
        </article>
      `,
    )
    .join("");
}

function collectExecutionPayload(connectionOnly = false) {
  const accountSize = numberValue("#initialCapital") || 100000;
  const riskPercent = numberValue("#botRisk") || 0.25;
  const dailyPnlPercent = numberValue("#executionDailyPnl") || 0;
  const entry = numberValue("#executionEntry");
  const stop = numberValue("#executionStop");
  const target = numberValue("#executionTarget");
  const challengeKey = selectedChallengeKey();
  const challengeRule = rules[challengeKey] || rules.fundedEliteFlash;
  const accountGuard = fundedEliteGuardFromInputs();

  return {
    connectionOnly,
    exchange: $("#executionPlatform").value,
    mode: $("#executionModeSelect").value,
    bridgeUrl: $("#mt5BridgeUrl")?.value || "http://127.0.0.1:8789",
    symbol: $("#executionSymbol").value.trim().toUpperCase(),
    direction: $("#executionSide").value,
    entry,
    stop,
    target,
    accountSize,
    currentEquity: numberValue("#currentEquity") || accountSize,
    initialBalance: accountGuard.initialBalance,
    startOfDayBalance: accountGuard.startOfDayBalance,
    highWaterEquity: accountGuard.highWaterEquity,
    totalProfit: accountGuard.totalProfit,
    bestDayProfit: accountGuard.bestDayProfit,
    profitableDays: accountGuard.profitableDays,
    phase: accountGuard.phase,
    riskPercent,
    tradesToday: 0,
    maxTradesPerDay: 2,
    dailyPnl: accountSize * (dailyPnlPercent / 100),
    consecutiveLosses: numberValue("#executionLosses"),
    spreadPercent: numberValue("#signalSpread") || 0.03,
    newsRisk: $("#signalNews")?.value || "low",
    journalNote: $("#executionJournal").value.trim(),
    account: accountGuard,
    predictionMarkets: {
      provider: state.prediction.provider,
      ftmoContext: state.prediction.context?.ftmo_context || null,
      topMarkets: state.prediction.markets.slice(0, 5),
    },
    challenge: {
      key: challengeKey,
      provider: challengeRule.provider,
      label: challengeRule.label,
      targetPercent: challengeRule.target * 100,
      maxDailyLossPercent: challengeRule.dailyLoss * 100,
      maxDrawdownPercent: challengeRule.maxLoss * 100,
      dailyStopPercent: challengeRule.dailyStopPercent || 0.75,
      capitalProtectionAtPercent: challengeRule.capitalProtectionAtPercent || Math.max(0.5, challengeRule.target * 100 - 0.5),
      trailingMaxLoss: Boolean(challengeRule.trailingMaxLoss),
      liveTrailingMaxLoss: Boolean(challengeRule.liveTrailingMaxLoss),
      minTradingDays: challengeRule.minDays,
      liveMinProfitableDays: challengeRule.liveMinProfitableDays || 0,
      livePositiveDayTarget: challengeRule.livePositiveDayTarget || 0,
      consistencyRule: challengeRule.consistencyRule || "",
      source: challengeRule.source,
    },
  };
}

async function postExecution(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({ error: "Execution API returned a non-JSON response." }));
  return { ok: response.ok, status: response.status, data };
}

function setExchangeStatus(status, level = "warning") {
  const badge = $("#exchangeExecutionStatus");
  if (!badge) return;
  badge.className = `status-chip ${level}`;
  badge.textContent = status;
  renderCockpitStatus();
}

function renderExchangePreview(data, allowApproval = true) {
  const output = $("#exchangeOrderPreview");
  if (!output) return;
  output.textContent = JSON.stringify(data, null, 2);

  const approved = Boolean(
    allowApproval &&
      data?.ok &&
      data?.preview?.approved &&
      ((data?.preview?.exchange === "mt5-bridge" && data?.preview?.mode === "protected-live") ||
        (data?.preview?.exchange === "binance-testnet" && data?.preview?.mode === "manual-testnet")),
  );
  $("#approveTestnetTrade").disabled = !approved;

  if (data?.ok && data?.preview?.approved) {
    setExchangeStatus("Preview approved", "safe");
  } else {
    setExchangeStatus("Blocked", "danger");
  }
  renderCockpitStatus();
}

async function connectExchange() {
  const payload = collectExecutionPayload(true);
  addExchangeLog("Connection check", `${payload.exchange} / ${payload.mode}`, "info");

  try {
    if (payload.exchange === "mt5-bridge") {
      const health = await callMt5Bridge("/health");
      state.exchange.mt5Connected = true;
      state.exchange.mt5Account = health.account || null;
      setExchangeStatus("MT5 Connected", "safe");
      addExchangeLog("MT5 bridge connected", health.version || "Bridge health OK.", "approved");
      await auditExecution("mt5_connected", { health, bridgeUrl: payload.bridgeUrl });
      return;
    }
    const { ok, data } = await postExecution("/execution/preview", payload);
    renderExchangePreview(data, false);
    addExchangeLog(ok ? "Connection ready" : "Connection blocked", data.reason || data.error || "Execution API responded.", ok ? "approved" : "blocked");
  } catch (error) {
    setExchangeStatus(payload.exchange === "mt5-bridge" ? "MT5 Disconnected" : "API offline", "danger");
    addExchangeLog(payload.exchange === "mt5-bridge" ? "MT5 bridge unavailable" : "Execution API unavailable", error.message, "blocked");
  }
}

async function buildOrderPreview() {
  const payload = collectExecutionPayload(false);
  state.exchange.approvalToken = "";
  $("#approveTestnetTrade").disabled = true;
  addExchangeLog("Order preview requested", `${payload.symbol} ${payload.direction} at ${payload.entry}`, "info");

  try {
    const route = payload.exchange === "mt5-bridge" ? "/api/mt5/preview" : "/execution/preview";
    const { ok, data } = await postExecution(route, payload);
    if (data.cycle) {
      state.agentCycle = data.cycle;
      renderAgentCycle(data);
    }
    state.exchange.preview = data.preview || null;
    if (payload.exchange === "mt5-bridge" && ok && data.preview?.approved) {
      try {
        const bridgePreview = await callMt5Bridge("/order/preview", {
          method: "POST",
          body: JSON.stringify(data.preview),
        });
        data.bridge = bridgePreview;
        state.exchange.preview.bridge = bridgePreview;
        addExchangeLog("MT5 preview ready", bridgePreview.reason || "Bridge returned live preview.", "approved");
      } catch (bridgeError) {
        data.ok = false;
        data.bridgeError = bridgeError.message;
        data.preview.approved = false;
        data.preview.blockers = [...(data.preview.blockers || []), `MT5 bridge unavailable: ${bridgeError.message}`];
        addExchangeLog("MT5 preview unavailable", bridgeError.message, "blocked");
      }
    }
    renderExchangePreview(data);
    await auditExecution("order_preview", { ok, data });
    addExchangeLog(ok && data.preview?.approved ? "Risk approved" : "Risk blocked", data.reason || data.blockers?.join("; ") || "Preview complete.", ok && data.preview?.approved ? "approved" : "blocked");
  } catch (error) {
    setExchangeStatus(payload.exchange === "mt5-bridge" ? "MT5 Disconnected" : "API offline", "danger");
    addExchangeLog(payload.exchange === "mt5-bridge" ? "MT5 bridge unavailable" : "Execution API unavailable", error.message, "blocked");
  }
}

async function approveTestnetTrade() {
  if (!state.exchange.preview) {
    addExchangeLog("Approval blocked", "Build an order preview first.", "blocked");
    return;
  }

  addExchangeLog("Manual approval clicked", "Browser approval captured. Submitting to protected approval guard.", "approved");

  try {
    const approvalRoute = state.exchange.preview.exchange === "mt5-bridge" ? "/api/mt5/approve" : "/execution/approve";
    const approval = await postExecution(approvalRoute, { preview: state.exchange.preview });
    if (!approval.ok || !approval.data.approvalToken) {
      renderExchangePreview(approval.data);
      addExchangeLog("Approval rejected", approval.data.error || approval.data.reason || "Approval token was not issued.", "blocked");
      return;
    }

    state.exchange.approvalToken = approval.data.approvalToken;
    addExchangeLog("Approval token issued", "Manual gate passed. Preparing protected submit.", "approved");

    if (state.exchange.preview.exchange === "mt5-bridge") {
      const submit = await callMt5Bridge("/order/submit", {
        method: "POST",
        body: JSON.stringify({
          approvalToken: state.exchange.approvalToken,
          preview: state.exchange.preview,
        }),
      });
      await auditExecution("mt5_order_submit", { submit, preview: state.exchange.preview });
      renderExchangePreview({ ok: true, reason: submit.reason || "MT5 live order submitted through protected bridge.", response: submit, preview: state.exchange.preview });
      addExchangeLog("MT5 live submit complete", submit.reason || "Bridge accepted the protected order.", "approved");
      return;
    }

    const submit = await postExecution("/execution/submit-testnet", {
      approvalToken: state.exchange.approvalToken,
      preview: state.exchange.preview,
    });
    renderExchangePreview(submit.data);
    addExchangeLog(submit.ok ? "Testnet submit complete" : "Testnet submit blocked", submit.data.reason || submit.data.error || "Submit finished.", submit.ok ? "approved" : "blocked");
  } catch (error) {
    setExchangeStatus("API offline", "danger");
    addExchangeLog("Submit unavailable", error.message, "blocked");
  }
}

async function killSwitch() {
  const payload = collectExecutionPayload(true);
  addExchangeLog("Kill switch requested", "Attempting to flatten/stop through MT5 bridge.", "blocked");
  try {
    const armed = await postExecution("/api/kill-switch", {
      active: true,
      mode: payload.exchange === "mt5-bridge" ? "flatten-and-block" : "block-new-orders",
      reason: "User clicked Zeus Trading kill switch.",
    });
    if (armed.data?.kill_switch) {
      state.killSwitch = armed.data.kill_switch;
      renderKillSwitchStatus();
    }
    if (payload.exchange !== "mt5-bridge") {
      addExchangeLog("Kill switch armed", "No MT5 bridge selected; local order routing is stopped in dashboard.", "blocked");
      setExchangeStatus("Kill Switch Armed", "danger");
      await auditExecution("kill_switch_local", payload);
      return;
    }
    const response = await callMt5Bridge("/positions/flatten", {
      method: "POST",
      body: JSON.stringify({ reason: "Zeus Trading kill switch", requestedAt: new Date().toISOString() }),
    });
    setExchangeStatus("Kill Switch Sent", "danger");
    addExchangeLog("MT5 flatten sent", response.reason || "Bridge accepted kill switch request.", "blocked");
    await auditExecution("kill_switch_mt5", { response });
  } catch (error) {
    setExchangeStatus("Kill Switch Failed", "danger");
    addExchangeLog("Kill switch failed", error.message, "blocked");
    await auditExecution("kill_switch_failed", { error: error.message });
  }
}

function renderKillSwitchStatus(kill = state.killSwitch) {
  const badge = $("#killSwitchState");
  if (!badge) return;
  badge.className = `status-chip ${kill?.active ? "danger" : "safe"}`;
  badge.textContent = kill?.active ? `Kill Switch Active: ${kill.mode || "blocked"}` : "Kill Switch Off";
}

async function syncKillSwitchState() {
  try {
    const response = await fetch("/api/kill-switch", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Kill switch API unavailable.");
    state.killSwitch = data.kill_switch || state.killSwitch;
    renderKillSwitchStatus();
    return state.killSwitch;
  } catch (error) {
    const badge = $("#killSwitchState");
    if (badge) {
      badge.className = "status-chip warning";
      badge.textContent = "Kill Switch Unknown";
    }
    agentConsoleLog("Kill switch sync failed", error.message);
    return null;
  }
}

async function clearKillSwitch() {
  addExchangeLog("Kill switch clear requested", "Clearing backend block-new-orders state. Existing positions are not changed.", "info");
  try {
    const result = await postExecution("/api/kill-switch", {
      active: false,
      mode: "block-new-orders",
      reason: "User cleared Zeus Trading kill switch from dashboard.",
    });
    if (!result.ok || result.data?.ok === false) throw new Error(result.data?.error || result.data?.reason || "Clear request failed.");
    state.killSwitch = result.data.kill_switch || { active: false, mode: "block-new-orders", reason: "" };
    renderKillSwitchStatus();
    addExchangeLog("Kill switch cleared", "New previews are allowed again, but still require risk gate and manual approval.", "approved");
    await auditExecution("kill_switch_cleared_from_dashboard", state.killSwitch);
    await loadCloudJournal();
  } catch (error) {
    addExchangeLog("Kill switch clear failed", error.message, "blocked");
    showToast("Kill switch clear failed.");
  }
}

function buildAgentPlan() {
  const context = collectAgentContext();
  const market = marketProfiles[context.market.key];
  const strategy = strategyProfiles[context.strategy.key];
  const days = context.account.targetEvaluationDays;
  const maxTrades = context.account.maxTradesPerDay;
  const initial = context.account.initialCapital;
  const riskPct = context.account.riskPerTradePercent;
  const rule = rules[context.challenge.key];
  const riskAmount = initial * riskPct;
  const maxDailyLoss = initial * rule.dailyLoss;
  const maxStrategyLoss = Math.min(maxDailyLoss * 0.45, riskAmount * maxTrades);
  const requiredNet = initial * rule.target;
  const minimumSample = Math.max(60, days * maxTrades * 2);
  const readiness =
    riskPct <= 0.005 && maxTrades <= 3
      ? "Conservative test"
      : riskPct <= 0.01
        ? "Aggressive test"
        : "Too much risk";

  $("#agentMode").className = readiness === "Too much risk" ? "status-chip danger" : "status-chip warning";
  $("#agentMode").textContent = readiness;

  $("#agentPlan").innerHTML = `
    <div class="agent-plan-header">
      <div>
        <span>Generated playbook</span>
        <strong>${strategy.label}</strong>
      </div>
      <div>
        <span>Primary market</span>
        <strong>${market.label}</strong>
      </div>
    </div>
    <div class="strategy-brief">
      <article>
        <span>Goal</span>
        <p>Build a repeatable strategy candidate for ${rule.label}. Target is ${fmtUsd.format(requiredNet)}, but the agent optimizes for rule survival first: daily loss, max loss, and consistency.</p>
      </article>
      <article>
        <span>Market filter</span>
        <p>${market.filter}</p>
      </article>
      <article>
        <span>Entry logic</span>
        <p>${strategy.entry}</p>
      </article>
      <article>
        <span>Invalidation</span>
        <p>${strategy.invalidation}</p>
      </article>
      <article>
        <span>Risk protocol</span>
        <p>Risk per trade: ${fmtUsd.format(riskAmount)}. Max trades/day: ${maxTrades}. Strategy stops for the day near ${fmtUsd.format(maxStrategyLoss)} or any revenge-trading behavior.</p>
      </article>
      <article>
        <span>Evidence required</span>
        <p>Minimum ${minimumSample} historical/audit samples, expectancy above zero after fees/slippage, no daily-rule breaks, and max drawdown inside ${rule.provider} limits.</p>
      </article>
    </div>
    <div class="agent-stack">
      <span>Agent workflow</span>
      <strong>User Control -> Rules Agent -> Scanner -> Indicator Agent -> News/Risk -> AI Supervisor -> MT5 Preview -> Manual Approval -> Journal</strong>
      <small>Session focus: ${market.session}. Guardrail: ${market.avoid}. Source: ${rule.source}.</small>
    </div>
  `;
  state.agentPlan = {
    ...context,
    computed: {
      riskAmount,
      maxDailyLoss,
      maxStrategyLoss,
      requiredNet,
      minimumSample,
      readiness,
    },
  };
  renderPremiumChart();
}

function localAgentReview(context) {
  const risk = context.account.initialCapital * context.account.riskPerTradePercent;
  const target = context.account.initialCapital * context.challenge.profitTargetPercent;
  return [
    "LOCAL RULE REVIEW",
    "",
    `Strategy candidate: ${context.strategy.label}`,
    `Primary market: ${context.market.label}`,
    `Challenge model: ${context.challenge.label}`,
    "",
    "Plan:",
    `- Risk per trade stays near ${fmtUsd.format(risk)} and must never exceed 1% of account.`,
    `- Profit target is ${fmtUsd.format(target)}, but survival rules come first: daily loss, max loss, no revenge trading.`,
    `- Entry must match: ${context.strategy.entry}`,
    `- Invalidation: ${context.strategy.invalidation}`,
    `- Avoid condition: ${context.market.avoid}`,
    "",
    "Required evidence before scaling:",
    "- Backtest and live audit sample with positive expectancy after fees/slippage.",
    "- No challenge daily loss or max loss violations.",
    "- Journal proves entries followed the same rules repeatedly.",
  ].join("\n");
}

function localControlChatReview(context, prompt) {
  const guard = context.fundedEliteGuard || fundedEliteGuardFromInputs();
  const blockers = [];
  if (!context.hardRules.registeredUser) blockers.push("profile is not saved");
  if (!state.exchange.mt5Connected) blockers.push("MT5 bridge is not connected");
  if (state.news.items?.some((item) => item.impact === "high")) blockers.push("high-impact news needs manual review");
  if (guard.rulePass === false) blockers.push("challenge drawdown buffer is too thin");

  const decision = blockers.length ? "WATCH / PREVIEW ONLY" : "READY FOR RISK GATE";
  return [
    `ZEUS CONTROL REVIEW: ${decision}`,
    "",
    `Question: ${prompt || "General protected-live check"}`,
    `Challenge: ${context.challenge.label}`,
    `Primary market: ${context.market.label}`,
    `Daily buffer: ${fmtUsd.format(guard.dailyLossBufferRemaining || 0)}`,
    `Max DD buffer: ${fmtUsd.format(guard.maxDrawdownBufferRemaining || 0)}`,
    "",
    blockers.length ? `Blockers: ${blockers.join(", ")}.` : "No hard blocker found in local dashboard context.",
    "Next safest action: refresh prices/news, run Risk Gate, build MT5 preview, then approve manually only if SL/TP/R:R are valid.",
  ].join("\n");
}

async function runControlCenterChat(prompt = "") {
  const input = $("#controlChatInput");
  const output = $("#controlChatOutput");
  const button = $("#controlChatSend");
  if (!output) return;

  const question = (prompt || input?.value || "").trim();
  if (!question) {
    output.textContent = "Napiši pitanje ili klikni jedan shortcut iznad.";
    return;
  }

  const context = {
    ...(state.agentPlan || collectAgentContext()),
    userPrompt: question,
    controlCenter: {
      role: "protected live trading supervisor",
      expectedAnswer: "Return BLOCK/WATCH/PREVIEW_ONLY/READY_FOR_MANUAL_APPROVAL and next safest click.",
      marketStatus: state.market.status,
      mt5Connected: state.exchange.mt5Connected,
      currentPreview: state.exchange.preview,
      news: state.news.items?.slice(0, 4) || [],
      calendar: state.economicCalendar.events?.slice(0, 4) || [],
    },
    fundedEliteGuard: fundedEliteGuardFromInputs(),
  };

  if (button) button.disabled = true;
  if (input) input.value = question;
  output.textContent = "Zeus agent provjerava challenge rules, news/calendar, MT5 status, risk gate i sljedeci siguran korak...";
  agentConsoleLog("Control chat", question);

  try {
    const response = await fetch("/api/openrouter-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });
    const data = await response.json();
    output.textContent = data.content || data.fallback || data.error || localControlChatReview(context, question);
    agentConsoleLog(response.ok ? "Control chat complete" : "Control chat fallback", data.model || data.error || "local guard");
    showToast(response.ok ? "Agent answer ready." : "Agent fallback answer ready.");
  } catch (error) {
    output.textContent = localControlChatReview(context, question);
    agentConsoleLog("Control chat fallback", error.message);
    showToast("OpenRouter unavailable; local protected review shown.");
  } finally {
    if (button) button.disabled = false;
  }
}

function routeControlDesk(type) {
  if (type === "ftmo") {
    if (selectHasValue("#agentChallenge", "fundedEliteFlash")) $("#agentChallenge").value = "fundedEliteFlash";
    if (selectHasValue("#agentMarket", "xau")) $("#agentMarket").value = "xau";
    if (selectHasValue("#agentStyle", "vwap")) $("#agentStyle").value = "vwap";
    if (selectHasValue("#botMarket", "gold")) $("#botMarket").value = "gold";
    if (selectHasValue("#botStrategy", "vwap")) $("#botStrategy").value = "vwap";
    if (selectHasValue("#executionPlatform", "mt5-bridge")) $("#executionPlatform").value = "mt5-bridge";
    if (selectHasValue("#executionModeSelect", "protected-live")) $("#executionModeSelect").value = "protected-live";
    buildAgentPlan();
    buildBotConfig();
    const target = document.querySelector('[data-panel="bot-builder"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("FTMO/FundedElite desk prepared.");
    return;
  }

  if (type === "polymarket") {
    loadPredictionMarkets();
    loadClobMarkets();
    const target = document.querySelector('[data-panel="clob-wallet"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Polymarket CLOB desk prepared.");
  }
}

function renderSystemCheckTimeline(steps = null, status = "Not run yet") {
  const timeline = $("#systemCheckTimeline");
  const label = $("#systemCheckStatus");
  if (!timeline || !label) return;

  const rows =
    steps ||
    [
      ["waiting", "Data", "Live prices, news and calendar"],
      ["waiting", "Risk", "SL/TP, R:R, drawdown buffer"],
      ["waiting", "Bridge", "MT5 health check"],
      ["waiting", "Agents", "Scanner, news, rules, supervisor"],
      ["waiting", "Next click", "System recommends the safest next action"],
    ];

  label.textContent = status;
  timeline.innerHTML = rows
    .map(
      ([stateLabel, title, help]) => `
        <article class="${stateLabel}">
          <span>${stateLabel}</span>
          <strong>${title}</strong>
          <small>${help}</small>
        </article>
      `,
    )
    .join("");
}

function renderSystemCheckReport(report = state.lastSystemCheckReport) {
  const output = $("#systemCheckReport");
  const decision = $("#systemCheckDecision");
  if (!output || !decision) return;

  if (!report) {
    decision.textContent = "Awaiting first check";
    output.textContent = "Run the full check to generate a protected-live decision report.";
    return;
  }

  decision.textContent = report.decision;
  const blockers = report.blockers.length ? report.blockers.join("; ") : "No hard blocker in the latest supervisor output.";
  output.textContent = [
    `Decision: ${report.decision}`,
    `Generated: ${report.generatedAt}`,
    `Challenge: ${report.challenge}`,
    `Symbol: ${report.symbol}`,
    `Bridge: ${report.bridge}`,
    `Risk gate: ${report.risk}`,
    `Daily buffer: ${report.dailyBuffer}`,
    `Max DD buffer: ${report.maxBuffer}`,
    `Blockers: ${blockers}`,
    "",
    `Next safest action: ${report.nextAction}`,
    "",
    "Live rule: no order without SL, TP, risk pass, fresh re-check, manual approval and audit log.",
  ].join("\n");
}

function buildSystemCheckReport(decision, nextAction, riskText) {
  const guard = fundedEliteGuardFromInputs();
  const cycle = state.agentCycle || {};
  const supervisor = cycle.agents?.find((agent) => agent.agent === "Supervisor Agent");
  const blockers = supervisor?.exact_blockers || cycle.blockers || [];
  const payload = collectExecutionPayload(false);
  return {
    decision,
    generatedAt: new Date().toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "medium" }),
    challenge: selectedChallengeRule().label,
    symbol: payload.symbol,
    bridge: state.exchange.mt5Connected ? "MT5 connected" : "MT5 disconnected",
    risk: riskText || "Risk calculated",
    dailyBuffer: fmtUsd.format(guard.dailyLossBufferRemaining || 0),
    maxBuffer: fmtUsd.format(guard.maxDrawdownBufferRemaining || 0),
    blockers,
    nextAction,
    raw: {
      cycle,
      preview: state.exchange.preview,
      marketStatus: state.market.status,
      newsRisk: state.economicCalendar.riskLevel,
    },
  };
}

function applyAgentPreviewToExecutionForm() {
  const preview = state.agentCycle?.preview;
  const payload = preview?.mt5_payload;
  if (!payload) return false;

  if ($("#executionSymbol")) $("#executionSymbol").value = payload.symbol || $("#executionSymbol").value;
  if ($("#executionSide")) $("#executionSide").value = payload.direction === "SHORT" ? "SELL" : "BUY";
  if ($("#executionEntry")) $("#executionEntry").value = Number(payload.entry || $("#executionEntry").value || 0).toFixed(2);
  if ($("#executionStop")) $("#executionStop").value = Number(payload.stop_loss || $("#executionStop").value || 0).toFixed(2);
  if ($("#executionTarget")) $("#executionTarget").value = Number(payload.take_profit || $("#executionTarget").value || 0).toFixed(2);
  if ($("#executionPlatform") && selectHasValue("#executionPlatform", "mt5-bridge")) $("#executionPlatform").value = "mt5-bridge";
  return true;
}

function saveSystemCheckReportToJournal() {
  if (!state.lastSystemCheckReport) {
    showToast("Run Full System Check first.");
    return;
  }
  state.journal.unshift({
    text: $("#systemCheckReport")?.textContent || JSON.stringify(state.lastSystemCheckReport),
    time: new Date().toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }),
  });
  state.journal = state.journal.slice(0, 10);
  localStorage.setItem("propLabJournal", JSON.stringify(state.journal));
  renderJournal();
  auditExecution("system_check_journal_saved", state.lastSystemCheckReport);
  saveCloudJournalEntry("system_check_report", state.lastSystemCheckReport).then(loadCloudJournal);
  showToast("System check report saved to journal.");
}

async function buildPreviewFromSystemCheck() {
  const applied = applyAgentPreviewToExecutionForm();
  if (!applied) {
    const target = document.querySelector('[data-panel="bot-builder"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("No agent preview payload yet. Open Builder or run Full System Check first.");
    return;
  }
  const target = document.querySelector('[data-panel="bot-builder"]');
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  await buildOrderPreview();
}

async function runFullSystemCheck() {
  const button = $("#runSystemCheck");
  if (button) button.disabled = true;

  const steps = [
    ["running", "Data", "Refreshing chart prices, market board, news and economic calendar..."],
    ["waiting", "Risk", "Waiting for fresh market context."],
    ["waiting", "Bridge", "Waiting for risk gate."],
    ["waiting", "Agents", "Waiting for bridge status."],
    ["waiting", "Next click", "Waiting for supervisor decision."],
  ];

  const setStep = (index, stateLabel, title, help, status = "Running system check") => {
    steps[index] = [stateLabel, title, help];
    renderSystemCheckTimeline(steps, status);
  };

  renderSystemCheckTimeline(steps, "Running system check");
  agentConsoleLog("System check", "Full protected workflow started from Control Center.");

  try {
    const dataResults = await Promise.allSettled([marketData.refresh(), loadEconomicCalendar(), loadNewsFeed()]);
    const dataOk = dataResults.every((result) => result.status === "fulfilled") && state.market.status !== "connecting";
    setStep(
      0,
      dataOk ? "done" : "blocked",
      "Data",
      `${state.market.status || "unknown"} prices, ${state.news.items?.length || 0} news items, ${state.economicCalendar.events?.length || 0} calendar events.`,
    );

    buildSignal();
    updateRisk();
    renderStartHereFlow();
    const riskText = $("#preflightStatus")?.textContent || $("#guardStatus")?.textContent || "Risk calculated";
    const riskBlocked = String(riskText).toLowerCase().includes("block") || String(riskText).toLowerCase().includes("danger");
    setStep(1, riskBlocked ? "blocked" : "done", "Risk", riskText, "Risk gate checked");

    setStep(2, "running", "Bridge", "Checking MT5 bridge health. This does not submit an order.", "Checking bridge");
    await connectExchange();
    setStep(
      2,
      state.exchange.mt5Connected ? "done" : "blocked",
      "Bridge",
      state.exchange.mt5Connected ? "MT5 bridge connected." : "MT5 bridge is not connected. Preview can stay blocked until local/VPS bridge is online.",
      "Bridge checked",
    );

    setStep(3, "running", "Agents", "Running scanner, macro risk, strategy validator, prop rules and supervisor.", "Running agents");
    await runFullAgentChain();
    const decision = state.agentCycle?.final_decision || "WATCH";
    const supervisor = state.agentCycle?.agents?.find((agent) => agent.agent === "Supervisor Agent");
    setStep(
      3,
      decision === "BLOCK" ? "blocked" : "done",
      "Agents",
      `${decision}: ${supervisor?.summary || supervisor?.reason || "Supervisor completed."}`,
      "Agents finished",
    );

    const nextClick =
      decision === "READY_FOR_MANUAL_APPROVAL" && state.exchange.mt5Connected
        ? "Next: Build MT5 Preview, then approve manually only if the final preview still passes."
        : decision === "BLOCK"
          ? "Next: fix blockers or wait. Do not submit live orders."
          : "Next: keep in watch/preview-only mode until bridge, news and risk all pass.";
    setStep(4, decision === "BLOCK" ? "blocked" : "done", "Next click", nextClick, `System check: ${decision}`);
    state.lastSystemCheckReport = buildSystemCheckReport(decision, nextClick, riskText);
    renderSystemCheckReport();
    await auditExecution("system_check_completed", state.lastSystemCheckReport);
    agentConsoleLog("System check complete", nextClick);
    showToast(`System check complete: ${decision}.`);
  } catch (error) {
    setStep(4, "blocked", "System error", error.message, "System check blocked");
    state.lastSystemCheckReport = buildSystemCheckReport("BLOCK", `System error: ${error.message}`, "System check failed");
    renderSystemCheckReport();
    agentConsoleLog("System check failed", error.message);
    showToast("System check blocked. See Control Center timeline.");
  } finally {
    if (button) button.disabled = false;
  }
}

async function runOpenRouterAgent() {
  const button = $("#askOpenRouter");
  const output = $("#openRouterOutput");
  const model = $("#openRouterModel");
  const context = state.agentPlan || collectAgentContext();

  button.disabled = true;
  output.textContent = "OpenRouter agent is reviewing scanner logic, selected challenge rules, risk limits, and the selected strategy...";

  try {
    const response = await fetch("/api/openrouter-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });
    const data = await response.json();
    model.textContent = data.model || "openrouter/free";
    if (!response.ok) {
      output.textContent = data.fallback || localAgentReview(context);
      showToast(data.error || "OpenRouter key missing; using local review.");
      return;
    }
    output.textContent = data.content || localAgentReview(context);
    showToast("OpenRouter agent review complete.");
  } catch (error) {
    output.textContent = localAgentReview(context);
    showToast("OpenRouter unavailable; local review shown.");
  } finally {
    button.disabled = false;
  }
}

async function runBrowserAgentReview() {
  const button = $("#browserAgentReview");
  const output = $("#browserAgentOutput");
  const context = {
    ...(state.agentPlan || collectAgentContext()),
    browserAgent: {
      role: "Comet-style trading assistant inside the user browser",
      allowed: ["guide setup", "review FTMO/FundedElite rules", "explain market scan", "prepare MT5/manual order preview", "block unsafe trades"],
      locked: ["typing passwords", "bypassing 2FA", "blindly clicking broker live order buttons", "guaranteeing FTMO pass"],
    },
    exchangePreview: state.exchange.preview,
    selectedTarotCard: tarotReadingCards[state.selectedTarotIndex],
  };

  button.disabled = true;
  output.textContent = "Free AI agent is reviewing the browser workflow, challenge survival rules, and next safe action...";

  try {
    const response = await fetch("/api/openrouter-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });
    const data = await response.json();
    output.textContent = data.content || data.fallback || data.error || localAgentReview(context);
    showToast(response.ok ? "Browser agent review complete." : "Browser agent used fallback review.");
  } catch (error) {
    output.textContent = `Local fallback: keep the agent in protected live guidance mode, run scanner, build MT5 preview, require stop-loss/target/R:R, approve manually, and journal every signal. (${error.message})`;
    showToast("Browser agent fallback shown.");
  } finally {
    button.disabled = false;
  }
}

function buildSignal() {
  const ctx = riskContext();
  const ticker = $("#signalTicker").value.trim().toUpperCase() || "UNKNOWN";
  const direction = $("#signalDirection").value;
  const entry = numberValue("#signalEntry");
  const stop = numberValue("#signalStop");
  const target = numberValue("#signalTarget");
  const volume = numberValue("#signalVolume");
  const rsi = numberValue("#signalRsi");
  const spread = numberValue("#signalSpread");
  const news = $("#signalNews").value;
  const tradesToday = numberValue("#tradesToday");
  const dailyPnl = numberValue("#dailyPnl");

  const riskPerShare = Math.abs(entry - stop);
  const rewardPerShare = Math.abs(target - entry);
  const rewardRisk = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
  const riskAmount = ctx.initial * ctx.riskPct;
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const dailyLossLimit = Math.min(ctx.maxDailyLoss, ctx.initial * ((ctx.rule?.dailyStopPercent || 0.75) / 100));
  const maxTradesAllowed = clamp(numberValue("#agentMaxTrades") || 2, 1, 5);

  const checks = [
    ["Stop-loss exists", riskPerShare > 0],
    ["Risk per trade <= 1%", ctx.riskPct <= 0.01],
    ["Daily loss buffer open", dailyPnl > -dailyLossLimit && ctx.dailyBuffer > riskAmount],
    ["Max trades not reached", tradesToday < maxTradesAllowed],
    ["Reward/risk >= 2.0", rewardRisk >= 2],
    ["Spread acceptable", spread <= 0.08],
    ["Volume spike >= 1.5x", volume >= 1.5],
    ["RSI not stretched", direction === "LONG" ? rsi >= 45 && rsi <= 70 : rsi >= 30 && rsi <= 55],
    ["News risk not high", news !== "high"],
  ];

  const approved = checks.every(([, ok]) => ok) && positionSize > 0;
  const confidence = clamp(
    40 +
      (volume >= 2 ? 12 : 0) +
      (rewardRisk >= 2 ? 14 : 0) +
      (spread <= 0.05 ? 8 : 0) +
      (news === "low" ? 10 : news === "medium" ? 2 : -15) +
      (approved ? 8 : -10),
    0,
    100,
  );

  $("#preflightStatus").className = approved ? "status-chip safe" : "status-chip danger";
  $("#preflightStatus").textContent = approved ? "Protected OK" : "Blocked";

  $("#hardRules").innerHTML = checks
    .map(
      ([label, ok]) => `
        <div class="rule-item ${ok ? "" : "blocked"}">
          <span>${ok ? "OK" : "NO"}</span>
          <strong>${label}</strong>
        </div>
      `,
    )
    .join("");

  const reasons = approved
    ? [
        `${ticker} ${direction} passes the structured preflight.`,
        `Position size is based on ${fmtUsd.format(riskAmount)} max risk, not on desired profit.`,
        "Manual confirmation is still required before any MT5 live order.",
      ]
    : checks.filter(([, ok]) => !ok).map(([label]) => `Blocked: ${label}.`);

  $("#signalOutput").innerHTML = `
    <h3>${approved ? "SIGNAL FOUND" : "NO TRADE"}: ${ticker} ${direction}</h3>
    <dl>
      <div><dt>Position</dt><dd>${positionSize}</dd></div>
      <div><dt>Risk</dt><dd>${fmtUsd.format(riskAmount)}</dd></div>
      <div><dt>R:R</dt><dd>1:${rewardRisk.toFixed(2)}</dd></div>
      <div><dt>Entry</dt><dd>${entry.toFixed(2)}</dd></div>
      <div><dt>Stop</dt><dd>${stop.toFixed(2)}</dd></div>
      <div><dt>Target</dt><dd>${target.toFixed(2)}</dd></div>
    </dl>
    <p><strong>Confidence:</strong> ${Math.round(confidence)}/100. Invalidation: setup fails if price closes back through VWAP/structure before follow-through.</p>
    <ul>${reasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>
  `;
}

function renderIdeas() {
  const list = $("#ideaList");
  const filtered = ideas.filter((idea) => state.filter === "all" || idea.category === state.filter);
  list.innerHTML = filtered
    .map(
      (idea) => `
        <article class="idea-card">
          <div>
            <h3>${idea.title}</h3>
            <p>${idea.text}</p>
            <div class="tag-row">
              <span class="tag">${idea.source}</span>
              ${idea.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
          <div class="idea-score">
            <strong>${idea.score}</strong>
            <span>trust score</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderChecklist() {
  $("#checklist").innerHTML = checks
    .map(
      ([title, help], index) => `
        <label class="check-item">
          <input type="checkbox" data-check="${index}" ${state.checked.has(index) ? "checked" : ""} />
          <span>${title}<small>${help}</small></span>
        </label>
      `,
    )
    .join("");
  $("#validationScore").textContent = `${state.checked.size} / ${checks.length}`;
}

function renderJournal() {
  renderAuditSummary();
  const localEntries = state.journal
    .map(
      (entry) => `
        <article class="journal-entry local">
          <time>${entry.time}</time>
          <strong>Local note</strong>
          <p>${entry.text}</p>
        </article>
      `,
    )
    .join("");
  const cloudEntries = state.cloudJournal
    .map(
      (entry) => `
        <article class="journal-entry cloud">
          <time>${entry.time}</time>
          <strong>${entry.eventType}</strong>
          <p>${entry.text}</p>
        </article>
      `,
    )
    .join("");
  $("#journalEntries").innerHTML = `
    <div class="journal-sync-status">${state.cloudJournalStatus}</div>
    ${localEntries || '<article class="journal-entry"><strong>Local journal empty</strong><p>Add a reason before any trade exists.</p></article>'}
    ${cloudEntries ? `<div class="journal-section-label">Cloud audit</div>${cloudEntries}` : ""}
  `;
}

function renderAgentControlStatus() {
  const control = $("#agentControlStatus");
  if (!control) return;
  const rule = selectedChallengeRule();
  const mode = $("#agentControlMode")?.value || "manual-approval";
  const approvalRequired = $("#agentRequireApproval")?.checked !== false;
  control.textContent = state.user
    ? `Saved-control ready for ${state.user.name}: ${rule.label}, ${mode}, approval ${approvalRequired ? "required" : "not allowed for live submit"}.`
    : `Guest controls are session-only. Login/register to save ${rule.label} agent policy.`;
}

function renderAgentDock() {
  const log = $("#agentDockLog");
  if (!log) return;
  const entries = state.agentConsole?.length
    ? state.agentConsole
    : [
        {
          stamp: new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          title: "Agent console ready",
          detail: "Click any button and this panel will show what the browser agent is doing.",
        },
      ];
  log.innerHTML = entries
    .map(
      (entry) => `
        <article class="agent-dock-entry">
          <strong>${entry.stamp} - ${entry.title}</strong>
          <small>${entry.detail}</small>
        </article>
      `,
    )
    .join("");
}

function agentConsoleLog(title, detail) {
  state.agentConsole = state.agentConsole || [];
  state.agentConsole.unshift({
    stamp: new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    title,
    detail,
  });
  state.agentConsole = state.agentConsole.slice(0, 12);
  renderAgentDock();
}

function renderActiveAgent(advance = false) {
  if (state.agentPaused && advance) {
    advance = false;
  }

  if (advance) {
    state.activeAgentStep = (state.activeAgentStep + 1) % activeAgentStages.length;
  }

  const elapsed = Math.floor((Date.now() - state.agentStartedAt) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const current = activeAgentStages[state.activeAgentStep];
  const progress = ((state.activeAgentStep + 1) / activeAgentStages.length) * 100;

  $("#agentHeartbeat").textContent = `${minutes}:${seconds}`;
  $("#agentLoopState").textContent = state.agentPaused ? "Paused by user" : `${current.title} active`;
  $("#agentLoopState").className = state.agentPaused ? "status-chip warning" : "status-chip safe";
  $("#agentRuntimeBar").style.width = `${progress}%`;
  renderAgentControlStatus();

  $("#activeAgentPipeline").innerHTML = activeAgentStages
    .map(
      (stage, index) => `
        <article class="agent-stage ${index === state.activeAgentStep ? "active" : ""} ${index < state.activeAgentStep ? "done" : ""}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${stage.title}</strong>
            <small>${stage.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");

  if (advance || state.agentLog.length === 0) {
    const stamp = new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    state.agentLog.unshift({
      stamp,
      title: current.title,
      text: current.output,
    });
    state.agentLog = state.agentLog.slice(0, 7);
  }

  $("#activeAgentLogs").innerHTML = state.agentLog
    .map(
      (entry) => `
        <article class="agent-log-row">
          <time>${entry.stamp}</time>
          <strong>${entry.title}</strong>
          <span>${entry.text}</span>
        </article>
      `,
    )
    .join("");
}

function startActiveAgentLoop() {
  renderActiveAgent(false);
  window.setInterval(() => {
    if (!state.agentPaused && !state.agentChainRunning) {
      renderActiveAgent(true);
    }
  }, 4200);
}

function renderAgentCycle(data = {}) {
  const summary = $("#agentCycleSummary");
  const output = $("#agentChainOutput");
  if (!summary || !output) return;
  const cycle = data.cycle || state.agentCycle;
  if (!cycle) {
    summary.textContent = data.error ? `Agent cycle error: ${data.error}` : "No backend agent cycle yet.";
    output.innerHTML = "";
    return;
  }
  const decision = cycle.final_decision || "UNKNOWN";
  summary.className = `agent-cycle-summary ${decision === "BLOCK" ? "blocked" : decision === "READY_FOR_MANUAL_APPROVAL" ? "passed" : "warning"}`;
  summary.textContent = `${decision}: ${cycle.agents?.find((agent) => agent.agent === "Supervisor Agent")?.summary || "Agent cycle completed."}`;
  output.innerHTML = (cycle.agents || [])
    .map(
      (agent) => `
        <article class="agent-cycle-card ${agent.status || ""}">
          <div>
            <strong>${agent.agent || "Agent"}</strong>
            <span>${agent.status || "waiting"}</span>
          </div>
          <small>${agent.reason || agent.explanation || agent.summary || agent.rejection_reason || "Completed."}</small>
        </article>
      `,
    )
    .join("");
}

async function runFullAgentChain() {
  if (state.agentChainRunning) return;
  state.agentPaused = false;
  state.agentChainRunning = true;
  state.activeAgentStep = 0;
  state.agentLog = [];
  renderActiveAgent(false);
  agentConsoleLog("Agent cycle", "Backend multi-agent run-cycle started.");

  for (let index = 1; index < activeAgentStages.length; index += 1) {
    if (state.agentPaused) break;
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    state.activeAgentStep = index;
    renderActiveAgent(false);
    const stage = activeAgentStages[index];
    const stamp = new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    state.agentLog.unshift({ stamp, title: stage.title, text: stage.output });
    state.agentLog = state.agentLog.slice(0, 7);
    renderActiveAgent(false);
  }

  try {
    const payload = collectExecutionPayload(false);
    payload.relativeVolume = numberValue("#signalVolume") || 1.7;
    payload.rsi = numberValue("#signalRsi") || 58;
    payload.minRewardRisk = 1.5;
    const response = await fetch("/api/agent/run-cycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    state.agentCycle = data.cycle || null;
    renderAgentCycle(data);
    if (data.cycle?.preview?.preview_ready) {
      state.exchange.preview = {
        ...(state.exchange.preview || {}),
        exchange: "mt5-bridge",
        mode: $("#executionModeSelect").value,
        symbol: data.cycle.preview.mt5_payload.symbol,
        side: data.cycle.preview.mt5_payload.direction === "SHORT" ? "SELL" : "BUY",
        entry: data.cycle.preview.mt5_payload.entry,
        stopLoss: data.cycle.preview.mt5_payload.stop_loss,
        takeProfit: data.cycle.preview.mt5_payload.take_profit,
        quantity: data.cycle.preview.mt5_payload.lot_size,
        riskAmount: data.cycle.preview.mt5_payload.estimated_loss,
        rewardRisk: data.cycle.preview.mt5_payload.rr_ratio,
        approved: data.cycle.final_decision === "READY_FOR_MANUAL_APPROVAL",
        blockers: data.cycle.agents.find((agent) => agent.agent === "Supervisor Agent")?.exact_blockers || [],
      };
      applyAgentPreviewToExecutionForm();
    }
    addExchangeLog("Agent cycle complete", data.cycle?.final_decision || data.reason || "No decision", response.ok ? "approved" : "blocked");
  } catch (error) {
    renderAgentCycle({ ok: false, error: error.message });
    addExchangeLog("Agent cycle unavailable", error.message, "blocked");
  }

  state.agentChainRunning = false;
  showToast(state.agentPaused ? "Agent chain paused by user." : "Full agent chain completed to journal gate.");
}

function toggleAgentPause() {
  state.agentPaused = !state.agentPaused;
  const button = $("#pauseAgentChain");
  if (button) button.textContent = state.agentPaused ? "Resume Agents" : "Pause Agents";
  renderActiveAgent(false);
  showToast(state.agentPaused ? "Agent chain paused." : "Agent chain resumed.");
}

function tarotReadingDetail(card) {
  return `
    <article class="tarot-reading-detail is-open" id="tarotReadingDetail">
      <span>Selected card</span>
      <h3>${card.name}</h3>
      <strong>${card.role}</strong>
      <p>${card.reading}</p>
      <small>${card.action}</small>
    </article>
  `;
}

function tarotStageCard(card, index, selectedIndex) {
  const isOpen = index === selectedIndex;
  let offset = index - selectedIndex;
  if (offset < -2) offset += tarotReadingCards.length;
  if (offset > 2) offset -= tarotReadingCards.length;
  const positionClass = `tarot-pos-${offset + 2}`;
  return `
    <button
      class="tarot-stage-card tarot-stage-card-${index} ${positionClass} ${isOpen ? "is-open" : ""}"
      type="button"
      data-tarot-card="${index}"
      aria-label="Open ${card.name}: ${card.label}"
    >
      <span class="tarot-card-frame">
        <span class="tarot-card-face">
          ${cardArt(card)}
        </span>
        <span class="tarot-card-copy">
          <span>${card.glyph}</span>
          <strong>${card.name}</strong>
          <small>${card.subtitle}</small>
        </span>
      </span>
    </button>
  `;
}

function renderPremiumTarotStage(summary, selectedIndex = state.selectedTarotIndex) {
  const safeIndex = clamp(selectedIndex, 0, tarotReadingCards.length - 1);
  state.selectedTarotIndex = safeIndex;
  const selectedCard = tarotReadingCards[safeIndex];
  const tarotCards = $("#tarotCards");
  tarotCards.className = "tarot-cards tarot-tradingview-scene";
  tarotCards.innerHTML = `
    <div class="tradingview-tarot-stage" aria-label="Trading tarot card spread">
      ${tarotReadingCards.map((card, index) => tarotStageCard(card, index, safeIndex)).join("")}
    </div>
    <div class="tarot-card-picker" aria-label="Open tarot card">
      ${tarotReadingCards
        .map(
          (card, index) => `
            <button class="${index === safeIndex ? "active" : ""}" type="button" data-tarot-card="${index}">
              ${card.name.replace("The ", "")}
            </button>
          `,
        )
        .join("")}
    </div>
    ${tarotReadingDetail(selectedCard)}
  `;
  $("#tarotSummary").textContent = summary;
}

function cardArt(card) {
  const scenes = {
    "The Moon": {
      paper: "#d9cfad",
      banner: "#efe2c2",
      title: "THE MOON",
      body: `
        <path d="M0 206 C44 174 70 226 112 196 C150 169 178 199 220 176 L220 300 L0 300 Z" fill="#d8b47a"/>
        <path d="M22 206 C58 188 82 218 110 199 C141 177 170 193 203 178" fill="none" stroke="#75492b" stroke-width="2" opacity=".5"/>
        <circle cx="112" cy="70" r="42" fill="#e7c25b" stroke="#171717" stroke-width="5"/>
        <path d="M95 54 C124 56 130 84 106 97 C135 91 147 60 126 41 C115 31 99 34 90 45 C96 43 101 47 103 52 Z" fill="#242421"/>
        <path d="M43 241 L104 126 L122 154 L93 158 L137 236" fill="none" stroke="#118b89" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M41 242 C51 222 76 226 79 249 C63 253 50 250 41 242 Z" fill="#d55b36" stroke="#171717" stroke-width="3"/>
        <path d="M151 244 C161 222 189 224 192 248 C175 254 160 252 151 244 Z" fill="#f0e4bd" stroke="#171717" stroke-width="3"/>
        <path d="M33 105 L50 126 L67 104 M154 104 L171 126 L188 104" fill="none" stroke="#171717" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M25 283 C76 263 142 264 202 283" fill="none" stroke="#171717" stroke-width="3"/>`,
    },
    "The Oracle": {
      paper: "#e5be6b",
      banner: "#d69b38",
      title: "VWAP ORACLE",
      body: `
        <path d="M0 205 C40 185 75 209 105 188 C139 166 174 192 220 160 L220 300 L0 300 Z" fill="#88aaa2"/>
        <path d="M12 224 C55 202 85 230 121 205 C153 183 184 200 211 184" fill="none" stroke="#f7ebc7" stroke-width="5" opacity=".9"/>
        <path d="M110 34 C146 52 158 96 134 130 C112 162 70 149 62 111 C55 78 77 48 110 34 Z" fill="#1f2523"/>
        <path d="M110 62 L110 212" stroke="#111413" stroke-width="17" stroke-linecap="round"/>
        <path d="M96 210 L84 264" stroke="#b82822" stroke-width="9" stroke-linecap="round"/>
        <path d="M118 210 L139 264" stroke="#161817" stroke-width="9" stroke-linecap="round"/>
        <path d="M37 151 C63 131 89 160 115 140 C144 117 170 130 195 106" fill="none" stroke="#069895" stroke-width="8" stroke-linecap="round"/>
        <path d="M166 104 L196 106 L181 131" fill="none" stroke="#069895" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M49 54 L60 66 M54 45 L54 75 M170 66 L182 79 M176 56 L176 88" stroke="#fff4cf" stroke-width="4" stroke-linecap="round"/>
        <path d="M37 233 C76 216 127 217 170 234" fill="none" stroke="#f7efcf" stroke-width="6"/>
        <path d="M42 263 H176" stroke="#1b1712" stroke-width="4" stroke-linecap="round"/>`,
    },
    "The Balance": {
      paper: "#d9c08b",
      banner: "#d7a64a",
      title: "RISK GATE",
      body: `
        <path d="M110 40 L110 224" stroke="#151515" stroke-width="8" stroke-linecap="round"/>
        <path d="M55 88 L165 88" stroke="#151515" stroke-width="7" stroke-linecap="round"/>
        <path d="M66 90 L38 162 L96 162 Z" fill="#75a87a" stroke="#151515" stroke-width="4"/>
        <path d="M154 90 L124 162 L184 162 Z" fill="#c44c39" stroke="#151515" stroke-width="4"/>
        <path d="M42 163 C58 177 78 177 94 163" fill="none" stroke="#f7e8b8" stroke-width="5"/>
        <path d="M126 163 C143 173 168 173 184 163" fill="none" stroke="#f7e8b8" stroke-width="5"/>
        <path d="M77 206 C95 190 126 190 145 206 L158 248 L62 248 Z" fill="#202725" stroke="#151515" stroke-width="4"/>
        <path d="M70 226 L150 226" stroke="#e8c85b" stroke-width="5"/>
        <path d="M77 214 L99 193 L118 209 L145 178" fill="none" stroke="#14a082" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M145 178 L145 202 L124 190" fill="none" stroke="#14a082" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="43" y="41" width="42" height="24" rx="4" fill="#efe1b7" stroke="#151515" stroke-width="3"/>
        <rect x="135" y="41" width="42" height="24" rx="4" fill="#efe1b7" stroke="#151515" stroke-width="3"/>
        <path d="M50 57 H78 M142 57 H170" stroke="#b8372c" stroke-width="4" stroke-linecap="round"/>`,
    },
    "The Chariot": {
      paper: "#e0b765",
      banner: "#d59b3f",
      title: "VWAP ORACLE",
      body: `
        <path d="M0 224 C50 202 92 232 126 205 C158 178 190 204 220 184 L220 300 L0 300 Z" fill="#9bb7ac"/>
        <path d="M110 39 C143 54 154 96 133 127 C112 158 72 148 63 112 C55 80 75 51 110 39 Z" fill="#212421"/>
        <path d="M111 67 L108 207" stroke="#151515" stroke-width="18" stroke-linecap="round"/>
        <path d="M105 205 L91 260" stroke="#b62721" stroke-width="9" stroke-linecap="round"/>
        <path d="M113 205 L129 260" stroke="#191919" stroke-width="9" stroke-linecap="round"/>
        <path d="M54 228 C89 212 127 214 168 228" fill="none" stroke="#f9f1cc" stroke-width="6"/>
        <path d="M47 156 C74 136 100 167 125 146 C150 126 174 137 196 119" fill="none" stroke="#0a8f8d" stroke-width="7" stroke-linecap="round"/>
        <path d="M168 118 L197 119 L183 143" fill="none" stroke="#0a8f8d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M39 54 L49 65 M44 47 L44 72 M170 64 L181 76 M176 56 L176 84" stroke="#fff7d4" stroke-width="4" stroke-linecap="round"/>`,
    },
    "The Tower": {
      paper: "#c17d4a",
      banner: "#c9472d",
      title: "THE TOWER",
      body: `
        <path d="M0 142 C58 122 86 145 135 126 C168 113 192 124 220 111 L220 300 L0 300 Z" fill="#d99b56"/>
        <path d="M67 245 L98 74 L150 88 L137 245 Z" fill="#2d2f31" stroke="#111" stroke-width="5"/>
        <path d="M112 28 L96 84 L128 72 L110 134" fill="none" stroke="#f7df58" stroke-width="8" stroke-linejoin="round"/>
        <path d="M54 178 L166 198" stroke="#8b1f1d" stroke-width="8"/>
        <path d="M48 210 L152 225" stroke="#171717" stroke-width="4"/>
        <path d="M41 260 C82 232 133 230 182 260" fill="none" stroke="#3f2418" stroke-width="4"/>
        <path d="M38 102 C76 88 105 105 136 88 C165 72 188 78 208 64" fill="none" stroke="#efe1bf" stroke-width="5"/>
        <path d="M83 64 L91 50 L101 65 M141 83 L153 68 L160 88" fill="none" stroke="#171717" stroke-width="4" stroke-linecap="round"/>`,
    },
    Temperance: {
      paper: "#cfd6b1",
      banner: "#8fa77a",
      title: "PATIENCE",
      body: `
        <circle cx="110" cy="62" r="37" fill="#efc65f" stroke="#151515" stroke-width="4"/>
        <path d="M104 105 L85 228 M116 105 L138 228" stroke="#181818" stroke-width="8" stroke-linecap="round"/>
        <path d="M58 116 C84 145 136 145 162 116" fill="none" stroke="#0b806f" stroke-width="8" stroke-linecap="round"/>
        <path d="M66 165 C91 184 127 184 154 165" fill="none" stroke="#1b88a5" stroke-width="6"/>
        <path d="M36 244 C80 226 142 226 186 244" fill="none" stroke="#171717" stroke-width="4"/>
        <rect x="42" y="88" width="36" height="48" rx="8" fill="#ad4c38" stroke="#151515" stroke-width="4"/>
        <rect x="142" y="88" width="36" height="48" rx="8" fill="#d4b453" stroke="#151515" stroke-width="4"/>
        <path d="M81 139 C110 128 131 161 158 149" fill="none" stroke="#f8f0cc" stroke-width="5" stroke-linecap="round"/>`,
    },
    Justice: {
      paper: "#dbc087",
      banner: "#d4a648",
      title: "RISK GATE",
      body: `
        <path d="M110 48 L110 228" stroke="#171717" stroke-width="8" stroke-linecap="round"/>
        <path d="M61 94 L159 94" stroke="#171717" stroke-width="7" stroke-linecap="round"/>
        <path d="M70 96 L45 160 L95 160 Z" fill="#77a879" stroke="#171717" stroke-width="4"/>
        <path d="M150 96 L125 160 L175 160 Z" fill="#d85c43" stroke="#171717" stroke-width="4"/>
        <path d="M73 194 C95 182 126 182 148 194 L159 244 L62 244 Z" fill="#202625" stroke="#171717" stroke-width="4"/>
        <path d="M72 224 L148 224" stroke="#e7c25b" stroke-width="5"/>
        <path d="M82 210 L104 188 L121 205 L143 174" fill="none" stroke="#f4d45d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M143 174 L142 196 L124 185" fill="none" stroke="#f4d45d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    "The Sun": {
      paper: "#ead184",
      banner: "#e0b24a",
      title: "CLARITY",
      body: `
        <circle cx="110" cy="78" r="42" fill="#f4c641" stroke="#151515" stroke-width="5"/>
        <path d="M110 14 L110 36 M110 120 L110 144 M46 78 L70 78 M150 78 L174 78 M64 32 L78 48 M156 32 L142 48 M64 124 L80 108 M156 124 L140 108" stroke="#151515" stroke-width="5" stroke-linecap="round"/>
        <path d="M30 220 C76 172 136 172 190 220 L190 300 L30 300 Z" fill="#86ad73" stroke="#171717" stroke-width="4"/>
        <path d="M72 230 L96 198 L119 214 L147 176" fill="none" stroke="#148a78" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M147 176 L146 203 L124 190" fill="none" stroke="#148a78" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M42 246 H178" stroke="#171717" stroke-width="4" stroke-linecap="round"/>
        <circle cx="92" cy="79" r="4" fill="#171717"/><circle cx="128" cy="79" r="4" fill="#171717"/>
        <path d="M95 96 C104 105 118 105 127 96" fill="none" stroke="#171717" stroke-width="4" stroke-linecap="round"/>`,
    },
  };

  const scene = scenes[card.name] || scenes.Justice;
  const safeId = card.glyph.replace(/[^A-Z0-9]/g, "");
  return `
    <svg viewBox="0 0 220 300" aria-hidden="true">
      <defs>
        <linearGradient id="cardSheen-${safeId}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#fff6c8" stop-opacity=".34"/>
          <stop offset=".42" stop-color="#fff6c8" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity=".18"/>
        </linearGradient>
        <radialGradient id="cardGlow-${safeId}" cx="50%" cy="36%" r="62%">
          <stop offset="0" stop-color="#fff2bb" stop-opacity=".24"/>
          <stop offset=".58" stop-color="#fff2bb" stop-opacity=".04"/>
          <stop offset="1" stop-color="#000" stop-opacity=".18"/>
        </radialGradient>
        <pattern id="etch-${safeId}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path d="M0 0 H8" stroke="#3a2a1a" stroke-width=".8" opacity=".18"/>
        </pattern>
        <filter id="paperNoise-${safeId}" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.16"/>
          </feComponentTransfer>
          <feBlend mode="multiply" in2="SourceGraphic"/>
        </filter>
      </defs>
      <rect width="220" height="300" rx="7" fill="#120f0d"/>
      <rect x="10" y="10" width="200" height="280" rx="8" fill="${scene.paper}" stroke="#151515" stroke-width="5"/>
      <rect x="22" y="22" width="176" height="226" rx="6" fill="${scene.paper}" stroke="#2a2117" stroke-width="3" filter="url(#paperNoise-${safeId})"/>
      <rect x="22" y="22" width="176" height="226" rx="6" fill="url(#cardGlow-${safeId})"/>
      <rect x="28" y="30" width="164" height="211" rx="5" fill="url(#etch-${safeId})"/>
      <rect x="22" y="22" width="176" height="226" rx="6" fill="none" stroke="#f7ecc8" stroke-width="2" opacity=".45"/>
      <path d="M22 22 H198 L22 248 Z" fill="#fff7d6" opacity=".11"/>
      <path d="M31 37 H189 M31 232 H189 M37 31 V239 M183 31 V239" stroke="#2a2117" stroke-width="2" opacity=".5"/>
      <path d="M38 43 C69 31 83 51 110 39 C139 27 155 46 183 36" fill="none" stroke="#8a5a36" stroke-width="2" opacity=".35"/>
      <text x="38" y="58" font-size="24" font-family="Georgia, serif" font-weight="900" fill="#171717" opacity=".82">${card.glyph}</text>
      <path d="M169 42 L177 54 L190 54 L180 62 L184 75 L171 67 L159 75 L163 62 L153 54 L166 54 Z" fill="#fff7d2" stroke="#171717" stroke-width="2" opacity=".82"/>
      <g transform="translate(0,0)">${scene.body}</g>
      <rect x="22" y="22" width="176" height="226" rx="6" fill="url(#cardSheen-${safeId})"/>
      <path d="M33 71 C66 60 92 73 116 62 C145 50 166 59 188 48 M33 219 C68 202 96 218 124 203 C151 189 171 195 190 184" fill="none" stroke="#251d15" stroke-width="1.5" opacity=".26"/>
      <rect x="28" y="251" width="164" height="34" rx="4" fill="${scene.banner}" stroke="#151515" stroke-width="3"/>
      <text x="110" y="275" text-anchor="middle" font-size="18" font-family="Georgia, serif" font-weight="700" fill="#171717">${scene.title}</text>
    </svg>`;
}

function cardBackArt() {
  return `
    <svg viewBox="0 0 220 300" aria-hidden="true">
      <rect width="220" height="300" fill="#17151e"/>
      <rect x="16" y="16" width="188" height="268" rx="14" fill="#241d31" stroke="#e6c16a" stroke-width="5"/>
      <circle cx="110" cy="148" r="54" fill="none" stroke="#e6c16a" stroke-width="5"/>
      <path d="M110 72 L126 128 L184 128 L138 162 L154 218 L110 184 L66 218 L82 162 L36 128 L94 128 Z" fill="#d9ff37" opacity="0.85"/>
      <text x="110" y="156" text-anchor="middle" font-size="34" font-family="Impact, sans-serif" fill="#080908">ZT</text>
    </svg>`;
}

function renderTarotPlaceholder() {
  renderPremiumTarotStage("Cards are openable now. Click a card to open its reading, or use Draw Cards for a fresh risk pause.", 2);
}

function drawTarot() {
  const nextIndex = Math.floor(Math.random() * tarotReadingCards.length);
  renderPremiumTarotStage("Fresh reading opened. If bias, volatility, position size, or invalidation is unclear, the correct action is no trade.", nextIndex);
  const stage = $(".tradingview-tarot-stage");
  stage.classList.remove("tarot-reshuffle");
  window.requestAnimationFrame(() => stage.classList.add("tarot-reshuffle"));
}

function renderExecution() {
  $("#executionMode").className = "status-chip warning";
  $("#executionMode").textContent = "Protected Live";
  $("#liveGuard").innerHTML = `
    <article class="live-guard-card">
      <strong>Cloudflare + OpenRouter + MT5 bridge flow are wired for protected live supervision.</strong>
      <span>The agent can review strategy live and prepare MT5 orders, but every submit requires SL/TP, risk pass, bridge health, manual approval, and audit logging.</span>
    </article>
  `;

  const steps = [
    ["Cloudflare live", "Frontend, Pages Worker, custom domain, and OpenRouter strategy endpoint are live."],
    ["AI strategy review", "OpenRouter reviews the selected challenge setup, risk plan, invalidation, news filter, bridge status, and approve/block verdict."],
    ["MT5 bridge preview", "Local/VPS MT5 bridge previews quote, lot size, equity, SL/TP, and order request."],
    ["Manual approve", "Human approval is required. No blind copy trading and no revenge trading."],
    ["Kill switch", "Flatten/stop route is available for protected live risk control."],
  ];

  $("#executionSteps").innerHTML = steps
    .map(
      ([title, help], index) => `
        <article class="execution-step">
          <span>${index + 1}</span>
          <div>
            <strong>${title}</strong>
            <small>${help}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderReadiness() {
  const items = [
    ["Domain", "Live", false],
    ["Cloudflare Pages", "Live", false],
    ["OpenRouter AI", "Live", false],
    ["Challenge rules", "Wired", false],
    ["MT5 bridge adapter", "Wired", false],
    ["Manual approval", "Required", false],
    ["Oddpool/Polymarket intel", "Context", false],
    ["Kill switch", "Wired", false],
    ["Tarot risk pause", "Wired", false],
    ["Backtest/journal", "Local", false],
    ["Blind auto-click", "Blocked", true],
  ];

  $("#readinessList").innerHTML = items
    .map(
      ([label, status, locked]) => `
        <article class="readiness-item ${locked ? "locked" : ""}">
          <strong>${label}</strong>
          <span>${status}</span>
        </article>
      `,
    )
    .join("");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
  agentConsoleLog("UI feedback", message);
}

function bindEvents() {
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const label = button.textContent.trim() || button.id || "button";
      agentConsoleLog("Button clicked", `${label} -> browser event received.`);
      $("#agentDock")?.classList.add("open");
      if ($("#agentDockToggle")) $("#agentDockToggle").textContent = "Close";
    },
    true,
  );

  $("#agentDockToggle").addEventListener("click", () => {
    const dock = $("#agentDock");
    dock.classList.toggle("open");
    $("#agentDockToggle").textContent = dock.classList.contains("open") ? "Close" : "Open";
  });

  $("#agentDockForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#agentDockInput");
    const question = input.value.trim();
    if (!question) return;
    agentConsoleLog("User message", question);
    agentConsoleLog("Agent next action", "Run the challenge rules agent, build an MT5 preview, then require manual approval before submit.");
    input.value = "";
  });

  $("#heroPreflight").addEventListener("click", () => {
    buildAgentPlan();
    buildSignal();
    const target = document.querySelector('[data-panel="signal"]');
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast("Risk gate rebuilt. Review hard rules before any live order.");
  });

  $("#heroTarot").addEventListener("click", () => {
    drawTarot();
    const target = document.querySelector('[data-panel="tarot"]');
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast("Tarot risk check refreshed.");
  });

  setAuthMode(state.authMode);
  $$(".auth-tabs button").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });
  $("#authForm").addEventListener("submit", submitAuth);
  $("#authLogout").addEventListener("click", logoutUser);
  $("#saveProfile").addEventListener("click", saveProfileSettings);

  $$(".quick-jump").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(`[data-panel="${button.dataset.quickTarget}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (button.dataset.quickTarget === "tarot") {
        drawTarot();
      }
      if (button.dataset.quickTarget === "active-agent") {
        renderActiveAgent(true);
      }
      if (button.textContent.toLowerCase().includes("preview")) {
        buildBotConfig();
        setExchangeStatus("Use Build Order Preview inside Exchange Execution.", "warning");
      }
      showToast("Jumped to the next bot setup step.");
    });
  });

  [
    "#phaseSelect",
    "#initialCapital",
    "#dayStartBalance",
    "#currentEquity",
    "#riskPerTrade",
    "#challengePhase",
    "#highWaterEquity",
    "#totalProfit",
    "#bestDayProfit",
    "#profitableDays",
  ].forEach((selector) => {
    $(selector).addEventListener("input", () => {
      if (selector === "#phaseSelect") syncChallengeSelects("#phaseSelect");
      updateRisk();
      buildSignal();
      buildAgentPlan();
      buildBotConfig();
      renderAgentControlStatus();
    });
  });

  $("#symbolSelect").addEventListener("input", () => {
    renderPremiumChart();
    buildSignal();
    showToast(`${$("#symbolSelect").value} loaded in chart cockpit.`);
  });

  ["#agentChallenge", "#agentMarket", "#agentStyle", "#agentDays", "#agentMaxTrades"].forEach((selector) => {
    $(selector).addEventListener("input", () => {
      if (selector === "#agentChallenge") syncChallengeSelects("#agentChallenge");
      updateRisk();
      buildAgentPlan();
      buildBotConfig();
      renderAgentControlStatus();
    });
  });

  ["#agentControlMode", "#agentRequireApproval"].forEach((selector) => {
    $(selector)?.addEventListener("input", () => {
      renderAgentControlStatus();
      buildAgentPlan();
    });
  });

  $("#generateAgentPlan").addEventListener("click", () => {
    buildAgentPlan();
    showToast("Protected live agent plan regenerated.");
  });

  $("#buildBotConfig").addEventListener("click", () => {
    buildBotConfig();
    showToast("Protected live bot configuration rebuilt.");
  });

  $("#connectExchange").addEventListener("click", connectExchange);
  $("#buildOrderPreview").addEventListener("click", buildOrderPreview);
  $("#approveTestnetTrade").addEventListener("click", approveTestnetTrade);
  $("#killSwitch").addEventListener("click", killSwitch);
  $("#clearKillSwitch")?.addEventListener("click", clearKillSwitch);

  [
    "#executionPlatform",
    "#executionModeSelect",
    "#mt5BridgeUrl",
    "#executionSymbol",
    "#executionSide",
    "#executionEntry",
    "#executionStop",
    "#executionTarget",
    "#executionDailyPnl",
    "#executionLosses",
    "#executionJournal",
  ].forEach((selector) => {
    $(selector).addEventListener("input", () => {
      state.exchange.preview = null;
      state.exchange.approvalToken = "";
      $("#approveTestnetTrade").disabled = true;
      setExchangeStatus("Preview required", "warning");
    });
  });

  $("#scrollBotScanner").addEventListener("click", () => {
    const target = document.querySelector('[data-panel="scanner"]');
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    marketData.refresh();
    showToast("Live scanner refreshed for bot review.");
  });

  $("#refreshLiveDesk")?.addEventListener("click", () => {
    marketData.refresh();
    loadEconomicCalendar();
    loadNewsFeed();
    renderAdminDashboard();
    renderStartHereFlow();
    showToast("Live desk refreshed: chart, scanner and calendar.");
  });

  $("#refreshCommandCenter")?.addEventListener("click", () => {
    marketData.refresh();
    loadEconomicCalendar();
    loadNewsFeed();
    renderStrategyLibrary();
    renderAdminDashboard();
    renderStartHereFlow();
    showToast("Control Center refreshed.");
  });

  $("#runSystemCheck")?.addEventListener("click", runFullSystemCheck);
  $("#systemCheckSaveJournal")?.addEventListener("click", saveSystemCheckReportToJournal);
  $("#systemCheckBuildPreview")?.addEventListener("click", buildPreviewFromSystemCheck);
  $("#systemCheckOpenBuilder")?.addEventListener("click", () => {
    const target = document.querySelector('[data-panel="bot-builder"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#startLoadData")?.addEventListener("click", () => {
    marketData.refresh();
    loadEconomicCalendar();
    loadNewsFeed();
    renderStartHereFlow();
    showToast("Live data, calendar and news are refreshing.");
  });

  $("#startRunRisk")?.addEventListener("click", () => {
    buildSignal();
    updateRisk();
    renderStartHereFlow();
    const target = document.querySelector('[data-panel="signal"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Risk gate refreshed.");
  });

  $("#adminSaveShortcut")?.addEventListener("click", () => {
    const target = document.querySelector('[data-panel="profile"]');
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    saveProfileSettings();
  });

  $("#loadNewsFeed")?.addEventListener("click", loadNewsFeed);
  $("#refreshJournalCloud")?.addEventListener("click", loadCloudJournal);
  $("#exportAuditBundle")?.addEventListener("click", exportAuditBundle);

  $("#controlChatForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runControlCenterChat();
  });

  $$(".route-action-grid [data-route-desk]").forEach((button) => {
    button.addEventListener("click", () => routeControlDesk(button.dataset.routeDesk));
  });

  $("#quickMarketBoard")?.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-market-symbol]");
    if (!tile) return;
    const asset = getMarketAsset(tile.dataset.marketSymbol);
    if (!asset) return;
    const selectValue = asset.label === "XAUUSD" ? "XAUUSD" : asset.label === "BTCUSD" ? "BTCUSD" : asset.symbol;
    if (selectHasValue("#symbolSelect", selectValue)) $("#symbolSelect").value = selectValue;
    renderPremiumChart();
    buildSignal();
    showToast(`${asset.label} opened in chart.`);
  });

  $("#strategyLibrary")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-strategy-select]");
    if (!button) return;
    const id = button.dataset.strategySelect;
    const map = {
      "ftmo-survival": "trend",
      "gold-session": "vwap",
      "vwap-momentum": "vwap",
      "polymarket-event": "riskpause",
      "crypto-bot": "ema",
    };
    if (selectHasValue("#botStrategy", map[id])) $("#botStrategy").value = map[id];
    if (id === "polymarket-event") {
      const target = document.querySelector('[data-panel="clob-wallet"]');
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      buildBotConfig();
      const target = document.querySelector('[data-panel="bot-builder"]');
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    renderStartHereFlow();
    showToast("Strategy selected for protected builder.");
  });

  $$(".chat-shortcuts [data-chat-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#agentDock")?.classList.add("open");
      if ($("#agentDockToggle")) $("#agentDockToggle").textContent = "Close";
      const prompt = button.dataset.chatPrompt;
      if ($("#agentDockInput")) $("#agentDockInput").value = prompt;
      if ($("#controlChatInput")) $("#controlChatInput").value = prompt;
      runControlCenterChat(prompt);
    });
  });

  $("#guidedFlowSteps")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-guided-target]");
    if (!button) return;
    renderGuidedFlow(button.dataset.guidedStep);
    const target = document.querySelector(`[data-panel="${button.dataset.guidedTarget}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (button.dataset.guidedStep === "agents") runFullAgentChain();
    if (button.dataset.guidedStep === "data") {
      marketData.refresh();
      loadEconomicCalendar();
    }
    if (button.dataset.guidedStep === "preview") buildOrderPreview();
  });

  $("#loadEconomicCalendar")?.addEventListener("click", loadEconomicCalendar);
  ["#calendarFocus", "#calendarPolicy"].forEach((selector) => {
    $(selector)?.addEventListener("input", () => renderEconomicCalendar());
  });

  $("#loadBotConnectors")?.addEventListener("click", loadBotConnectors);
  $("#buildConnectorPreview")?.addEventListener("click", buildConnectorPreview);
  $("#openSelectedConnector")?.addEventListener("click", openSelectedConnector);
  ["#connectorSelect", "#connectorUseCase", "#connectorSymbol", "#connectorRisk", "#connectorNoWithdraw", "#connectorManualApproval"].forEach((selector) => {
    $(selector)?.addEventListener("input", () => {
      $("#botConnectorStatus").className = "status-chip warning";
      $("#botConnectorStatus").textContent = "Preview required";
    });
  });

  $("#loadPredictionMarkets").addEventListener("click", loadPredictionMarkets);
  ["#predictionQuery", "#predictionSource"].forEach((selector) => {
    $(selector).addEventListener("input", () => {
      $("#predictionStatus").className = "status-chip warning";
      $("#predictionStatus").textContent = "Needs refresh";
    });
  });
  $("#loadClobMarkets").addEventListener("click", loadClobMarkets);
  $("#runClobCompliance").addEventListener("click", runClobCompliance);
  $("#connectPhantomWallet").addEventListener("click", connectPhantomWallet);
  $("#signClobApproval").addEventListener("click", signClobApproval);
  $("#buildClobPreview").addEventListener("click", buildClobPreview);
  $("#submitClobLocked").addEventListener("click", submitClobLocked);
  $("#clobMarkets").addEventListener("click", (event) => {
    const row = event.target.closest("[data-clob-market]");
    if (!row) return;
    selectClobMarket(Number(row.dataset.clobMarket));
  });

  ["#botName", "#botMarket", "#botStrategy", "#botDemoDays", "#botRisk", "#botExecution"].forEach((selector) => {
    $(selector).addEventListener("input", buildBotConfig);
  });

  $$(".bot-indicator").forEach((input) => {
    input.addEventListener("change", buildBotConfig);
  });

  $("#askOpenRouter").addEventListener("click", runOpenRouterAgent);

  $("#agentPulseButton").addEventListener("click", () => {
    renderActiveAgent(true);
    showToast("Agent cycle advanced. Protected live gate remains active.");
  });
  $("#runAgentChain").addEventListener("click", runFullAgentChain);
  $("#pauseAgentChain").addEventListener("click", toggleAgentPause);
  $("#browserAgentReview").addEventListener("click", runBrowserAgentReview);

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".nav-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const target = document.querySelector(`[data-panel="${button.dataset.section}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  $("#scanMarket").addEventListener("click", () => {
    state.scannerRun += 1;
    marketData.refresh();
    showToast("Scanner refreshed with live/simulated market data.");
  });

  [
    "#signalTicker",
    "#signalDirection",
    "#signalEntry",
    "#signalStop",
    "#signalTarget",
    "#signalVolume",
    "#signalRsi",
    "#signalSpread",
    "#signalNews",
    "#tradesToday",
    "#dailyPnl",
  ].forEach((selector) => {
    $(selector).addEventListener("input", buildSignal);
  });

  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".segment").forEach((segment) => segment.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.dataset.filter;
      renderIdeas();
    });
  });

  $("#checklist").addEventListener("change", (event) => {
    const index = Number(event.target.dataset.check);
    if (event.target.checked) {
      state.checked.add(index);
    } else {
      state.checked.delete(index);
    }
    renderChecklist();
  });

  $("#resetChecklist").addEventListener("click", () => {
    state.checked.clear();
    renderChecklist();
  });

  $("#drawCards").addEventListener("click", drawTarot);

  $("#tarotCards").addEventListener("click", (event) => {
    const hotspot = event.target.closest("[data-tarot-card]");
    if (!hotspot) return;
    const index = Number(hotspot.dataset.tarotCard);
    renderPremiumTarotStage(`${tarotReadingCards[index].name} opened. Use this as a discipline check before any protected live plan.`, index);
    showToast(`${tarotReadingCards[index].name} reading opened.`);
  });

  $("#addJournal").addEventListener("click", () => {
    const text = $("#journalText").value.trim();
    if (!text) {
      showToast("Write the hypothesis before saving.");
      return;
    }
    state.journal.unshift({
      text,
      time: new Date().toLocaleString("hr-HR", { dateStyle: "medium", timeStyle: "short" }),
    });
    state.journal = state.journal.slice(0, 6);
    localStorage.setItem("propLabJournal", JSON.stringify(state.journal));
    $("#journalText").value = "";
    renderJournal();
    saveCloudJournalEntry("manual_journal_note", { text }).then(loadCloudJournal);
    showToast("Journal note saved locally.");
  });

  $("#saveSnapshot").addEventListener("click", () => {
    const snapshot = {
      phase: rules[$("#phaseSelect").value].label,
      symbol: $("#symbolSelect").value,
      equity: numberValue("#currentEquity"),
      score: `${state.checked.size}/${checks.length}`,
      signal: $("#signalOutput").textContent.trim().slice(0, 500),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("propLabSnapshot", JSON.stringify(snapshot));
    showToast("Snapshot saved in this browser.");
  });
}

function bootStep(label, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Zeus boot] ${label}`, error);
    agentConsoleLog("Boot warning", `${label}: ${error.message}`);
  }
}

bootStep("agent dock", renderAgentDock);
bootStep("events", bindEvents);
bootStep("risk", updateRisk);
bootStep("agent plan", buildAgentPlan);
bootStep("pipeline", renderPipeline);
bootStep("market status", updateMarketStatus);
bootStep("premium chart cockpit", renderPremiumChart);
bootStep("ticker", renderTickerTape);
bootStep("market board", renderQuickMarketBoard);
bootStep("scanner", renderScanner);
bootStep("prediction markets", renderPredictionMarkets);
bootStep("economic calendar", renderEconomicCalendar);
bootStep("news feed", renderNewsFeed);
bootStep("strategy library", renderStrategyLibrary);
bootStep("admin dashboard", renderAdminDashboard);
bootStep("start here flow", renderStartHereFlow);
bootStep("system check timeline", renderSystemCheckTimeline);
bootStep("system check report", renderSystemCheckReport);
bootStep("guided flow", renderGuidedFlow);
bootStep("bot connectors", renderBotConnectors);
bootStep("clob terminal", renderClobMarkets);
bootStep("clob wallet gates", updateClobWalletUi);
bootStep("bot config", buildBotConfig);
bootStep("exchange log", renderExchangeLog);
bootStep("kill switch status", syncKillSwitchState);
bootStep("current user", loadCurrentUser);
bootStep("agent control", renderAgentControlStatus);
bootStep("ideas", renderIdeas);
bootStep("checklist", renderChecklist);
bootStep("journal", renderJournal);
bootStep("cloud journal", loadCloudJournal);
bootStep("tarot", renderTarotPlaceholder);
bootStep("agent loop", startActiveAgentLoop);
bootStep("execution", renderExecution);
bootStep("readiness", renderReadiness);
bootStep("signal", buildSignal);
bootStep("market data", () => marketData.start());
bootStep("calendar data", loadEconomicCalendar);
bootStep("news data", loadNewsFeed);
bootStep("bot connector data", loadBotConnectors);
