export const fundedEliteFlashRules = {
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

export function numberValue(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function fundedEliteDrawdownState(input = {}) {
  const mode = input.phase === "live" ? "live" : "evaluation";
  const accountSize = Math.max(numberValue(input.accountSize, 100000), 1);
  const initialBalance = Math.max(numberValue(input.initialBalance, accountSize), 1);
  const startOfDayBalance = Math.max(numberValue(input.startOfDayBalance, accountSize), 1);
  const currentEquity = Math.max(numberValue(input.currentEquity, accountSize), 0);
  const highWaterEquity = Math.max(numberValue(input.highWaterEquity, currentEquity), initialBalance, currentEquity);
  const realizedPnl = numberValue(input.realizedPnl, currentEquity - initialBalance);
  const unrealizedPnl = numberValue(input.unrealizedPnl, 0);
  const dailyPnl = numberValue(input.dailyPnl, currentEquity - startOfDayBalance);
  const totalProfit = Math.max(numberValue(input.totalProfit, currentEquity - initialBalance), 0);
  const bestDayProfit = Math.max(numberValue(input.bestDayProfit, 0), 0);
  const profitableDays = numberValue(input.profitableDays, 0);

  const maxDailyLoss = startOfDayBalance * fundedEliteFlashRules.evaluation.maxDailyDrawdownPercent;
  const dailyLoss = Math.max(-dailyPnl, 0);
  const dailyLossBufferRemaining = maxDailyLoss - dailyLoss;
  const evaluationFloor = initialBalance - initialBalance * fundedEliteFlashRules.evaluation.maxTotalDrawdownPercent;
  const liveTrailingFloor = highWaterEquity - initialBalance * fundedEliteFlashRules.live.totalDrawdownPercent;
  const floor = mode === "live" ? liveTrailingFloor : evaluationFloor;
  const maxDrawdownBufferRemaining = currentEquity - floor;

  const minPositiveDay = accountSize * fundedEliteFlashRules.live.minProfitableDayPercent;
  const consistencyLimit = totalProfit * fundedEliteFlashRules.live.bestDayMaxShareOfProfit;
  const consistencyViolated = mode === "live" && totalProfit > 0 && bestDayProfit > consistencyLimit;
  const extraProfitRequiredForConsistency = consistencyViolated
    ? Math.max(bestDayProfit / fundedEliteFlashRules.live.bestDayMaxShareOfProfit - totalProfit, 0)
    : 0;

  const blockers = [];
  const warnings = [];
  if (dailyLoss >= maxDailyLoss) blockers.push("FundedElite daily drawdown limit is breached.");
  if (currentEquity <= floor) blockers.push("FundedElite total drawdown floor is breached.");
  if (dailyLossBufferRemaining <= maxDailyLoss * 0.15) warnings.push("Daily drawdown buffer is close to breach.");
  if (maxDrawdownBufferRemaining <= initialBalance * 0.01) warnings.push("Total drawdown buffer is thin.");
  if (mode === "live" && profitableDays < fundedEliteFlashRules.live.minProfitableDays) {
    warnings.push("Live payout eligibility needs at least 3 profitable trading days.");
  }
  if (mode === "live" && consistencyViolated) {
    warnings.push("Consistency rule warning: best day is above 30% of total profit.");
  }

  return {
    mode,
    accountSize,
    initialBalance,
    startOfDayBalance,
    currentEquity,
    highWaterEquity,
    realizedPnl,
    unrealizedPnl,
    dailyPnl,
    totalProfit,
    bestDayProfit,
    profitableDays,
    profitTarget: initialBalance * fundedEliteFlashRules.evaluation.profitTargetPercent,
    maxDailyLoss,
    staticDrawdownFloor: evaluationFloor,
    trailingDrawdownFloor: liveTrailingFloor,
    activeDrawdownFloor: floor,
    dailyLossBufferRemaining,
    maxDrawdownBufferRemaining,
    maxAllowedLossForNextTrade: Math.max(Math.min(dailyLossBufferRemaining, maxDrawdownBufferRemaining) * 0.8, 0),
    consistencyStatus: consistencyViolated ? "warning" : "ok",
    extraProfitRequiredForConsistency,
    minPositiveDay,
    blockers,
    warnings,
  };
}

export function positionSize({ accountSize, riskPercent, entry, stopLoss, maxAllowedLoss, symbol = "" } = {}) {
  const size = Math.max(numberValue(accountSize, 100000), 1);
  const riskPct = clamp(numberValue(riskPercent, 0.25), 0, 5) / 100;
  const entryPrice = numberValue(entry);
  const stop = numberValue(stopLoss);
  const stopDistance = Math.abs(entryPrice - stop);
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

export function riskGate(input = {}) {
  const account = fundedEliteDrawdownState(input.account || input);
  const entry = numberValue(input.entry);
  const stopLoss = numberValue(input.stopLoss ?? input.stop);
  const takeProfit = numberValue(input.takeProfit ?? input.target);
  const direction = String(input.direction || "LONG").toUpperCase();
  const spreadPercent = numberValue(input.spreadPercent, 0.03);
  const minRewardRisk = numberValue(input.minRewardRisk, 1.5);
  const riskPercent = numberValue(input.riskPercent, 0.25);
  const blockers = [...account.blockers];

  if (input.killSwitchActive) blockers.push("Kill switch is active.");
  if (entry <= 0) blockers.push("Entry price is required.");
  if (stopLoss <= 0) blockers.push("Stop-loss is required.");
  if (takeProfit <= 0 && input.mode !== "manage-existing") blockers.push("Take-profit is required.");
  if (direction === "LONG" && stopLoss >= entry) blockers.push("LONG stop-loss must be below entry.");
  if (direction === "LONG" && takeProfit <= entry) blockers.push("LONG take-profit must be above entry.");
  if (direction === "SHORT" && stopLoss <= entry) blockers.push("SHORT stop-loss must be above entry.");
  if (direction === "SHORT" && takeProfit >= entry) blockers.push("SHORT take-profit must be below entry.");
  if (riskPercent > 0.5) blockers.push("Risk per trade is above FundedElite survival cap of 0.5%.");
  if (spreadPercent > 0.08) blockers.push("Spread is too high for protected live mode.");
  if (String(input.newsRisk || "low").toLowerCase() === "high") blockers.push("High-impact news blocks this trade.");

  const stopDistance = Math.abs(entry - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entry);
  const rrRatio = stopDistance > 0 ? rewardDistance / stopDistance : 0;
  if (rrRatio < minRewardRisk) blockers.push(`Reward/risk must be at least ${minRewardRisk}R.`);

  const sizing = positionSize({
    accountSize: account.accountSize,
    riskPercent,
    entry,
    stopLoss,
    maxAllowedLoss: account.maxAllowedLossForNextTrade,
    symbol: input.symbol,
  });
  if (sizing.riskAmount > account.maxAllowedLossForNextTrade) blockers.push("Trade risk would breach remaining drawdown buffer.");
  if (sizing.riskAmount <= 0 || sizing.lotSize <= 0) blockers.push("Position size is too small or unavailable.");

  return {
    risk_pass: blockers.length === 0,
    suggested_lot_size: sizing.lotSize,
    risk_amount: Number(sizing.riskAmount.toFixed(2)),
    risk_percent: Number(sizing.riskPercent.toFixed(3)),
    stop_loss: stopLoss,
    take_profit: takeProfit,
    rr_ratio: Number(rrRatio.toFixed(2)),
    rejection_reason: blockers.join(" "),
    blockers,
    account,
  };
}

export function marketScanner(input = {}) {
  const symbol = String(input.symbol || "XAUUSD").toUpperCase();
  const direction = String(input.direction || "LONG").toUpperCase();
  const entry = numberValue(input.entry, /BTC/.test(symbol) ? 78000 : /XAU|GOLD/.test(symbol) ? 2380 : 100);
  const atr = Math.max(numberValue(input.atr, entry * 0.004), 0.01);
  const stop = numberValue(input.stop ?? input.stopLoss, direction === "LONG" ? entry - atr : entry + atr);
  const target = numberValue(input.target ?? input.takeProfit, direction === "LONG" ? entry + atr * 2 : entry - atr * 2);
  const volume = numberValue(input.relativeVolume, 1.7);
  const rsi = numberValue(input.rsi, direction === "LONG" ? 58 : 42);
  const confidence = clamp(48 + (volume >= 1.5 ? 14 : -8) + (rsi > 45 && rsi < 68 ? 10 : 0) + (numberValue(input.spreadPercent, 0.03) <= 0.05 ? 8 : 0), 1, 95);
  return {
    agent: "Market Scanner Agent",
    status: "passed",
    candidate: {
      symbol,
      direction,
      setup: input.setup || "VWAP reclaim + EMA continuation",
      entry_idea: entry,
      invalidation: direction === "LONG" ? "Close below VWAP/structure or stop zone." : "Close above VWAP/structure or stop zone.",
      stop_loss_zone: stop,
      target_zone: target,
      rr_estimate: Number((Math.abs(target - entry) / Math.max(Math.abs(entry - stop), 0.0001)).toFixed(2)),
      confidence_score: Math.round(confidence),
      reason: `Candidate only: ${symbol} shows ${input.setup || "VWAP/EMA momentum"} with RVOL ${volume.toFixed(1)}x and RSI ${rsi}.`,
    },
  };
}

export function newsRisk(input = {}) {
  const risk = String(input.newsRisk || "low").toLowerCase();
  const high = risk === "high" || Boolean(input.highImpactNews);
  return {
    agent: "News/Macro Risk Agent",
    status: high ? "blocked" : risk === "medium" ? "warning" : "passed",
    risk_level: high ? "high" : risk === "medium" ? "medium" : "low",
    block_trade: high,
    reason: high ? "High-impact macro/news/platform risk blocks new trades." : risk === "medium" ? "Medium news risk: preview only unless setup is A+." : "No high-impact blocker detected.",
  };
}

export function strategyValidator(input = {}, candidate = {}) {
  const checks = [
    ["stop_loss_defined", numberValue(candidate.stop_loss_zone) > 0],
    ["target_defined", numberValue(candidate.target_zone) > 0],
    ["rr_above_minimum", numberValue(candidate.rr_estimate) >= numberValue(input.minRewardRisk, 1.5)],
    ["confidence_ok", numberValue(candidate.confidence_score) >= 60],
    ["volume_confirmation", numberValue(input.relativeVolume, 1.7) >= 1.5],
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  const valid = passed === checks.length;
  return {
    agent: "Strategy Validation Agent",
    status: valid ? "passed" : "blocked",
    setup_valid: valid,
    score: Math.round((passed / checks.length) * 100),
    checklist: Object.fromEntries(checks),
    explanation: valid ? "Setup matches the playbook confirmations." : "Setup is missing required confirmations.",
  };
}

export function propFirmRules(input = {}) {
  const state = fundedEliteDrawdownState(input.account || input);
  return {
    agent: "Prop Firm Rules Agent",
    status: state.blockers.length ? "blocked" : state.warnings.length ? "warning" : "passed",
    rule_pass: state.blockers.length === 0,
    nearest_rule_risk: state.dailyLossBufferRemaining < state.maxDrawdownBufferRemaining ? "daily_drawdown" : "total_drawdown",
    daily_loss_buffer_remaining: Number(state.dailyLossBufferRemaining.toFixed(2)),
    max_drawdown_buffer_remaining: Number(state.maxDrawdownBufferRemaining.toFixed(2)),
    consistency_status: state.consistencyStatus,
    max_allowed_loss_for_next_trade: Number(state.maxAllowedLossForNextTrade.toFixed(2)),
    warnings: state.warnings,
    blockers: state.blockers,
  };
}

export function supervisor({ scanner, news, strategy, rules, risk } = {}) {
  const blockers = [
    ...(news?.block_trade ? [news.reason] : []),
    ...(strategy?.setup_valid ? [] : [strategy?.explanation || "Strategy validation failed."]),
    ...(rules?.rule_pass ? [] : rules?.blockers || ["Prop firm rule failed."]),
    ...(risk?.risk_pass ? [] : risk?.blockers || ["Risk gate failed."]),
  ].filter(Boolean);
  let final_decision = "READY_FOR_MANUAL_APPROVAL";
  if (blockers.length) final_decision = "BLOCK";
  else if (news?.risk_level === "medium" || rules?.status === "warning") final_decision = "PREVIEW_ONLY";
  else if ((scanner?.candidate?.confidence_score || 0) < 70) final_decision = "WATCH";
  return {
    agent: "Supervisor Agent",
    status: blockers.length ? "blocked" : final_decision === "READY_FOR_MANUAL_APPROVAL" ? "passed" : "warning",
    final_decision,
    summary: blockers.length
      ? `Blocked: ${blockers.join(" ")}`
      : `Candidate can proceed as ${final_decision}. Manual approval and fresh risk re-check are still required.`,
    exact_blockers: blockers,
    next_safest_action: blockers.length ? "Do not trade. Fix blockers or wait." : "Build MT5 preview and require manual approval.",
  };
}

export function executionPreview(input = {}, risk = {}, decision = "BLOCK") {
  const previewReady = decision === "READY_FOR_MANUAL_APPROVAL" || decision === "PREVIEW_ONLY";
  return {
    agent: "Execution Preview Agent / MT5 Bridge Agent",
    status: previewReady ? "passed" : "blocked",
    preview_ready: previewReady,
    approval_required: true,
    mt5_payload: previewReady
      ? {
          symbol: String(input.symbol || "XAUUSD").toUpperCase(),
          direction: String(input.direction || "LONG").toUpperCase(),
          entry: numberValue(input.entry),
          stop_loss: risk.stop_loss,
          take_profit: risk.take_profit,
          lot_size: risk.suggested_lot_size,
          estimated_loss: risk.risk_amount,
          rr_ratio: risk.rr_ratio,
          timestamp: new Date().toISOString(),
        }
      : null,
  };
}

export function runAgentCycle(input = {}) {
  const scanner = marketScanner(input);
  const news = newsRisk(input);
  const strategy = strategyValidator(input, scanner.candidate);
  const rules = propFirmRules(input);
  const risk = riskGate({
    ...input,
    stopLoss: scanner.candidate.stop_loss_zone,
    takeProfit: scanner.candidate.target_zone,
    account: input.account || input,
  });
  const final = supervisor({ scanner, news, strategy, rules, risk });
  const preview = executionPreview(input, risk, final.final_decision);
  const agents = [scanner, news, strategy, rules, risk, final, preview];
  return {
    ok: final.final_decision !== "BLOCK",
    run_id: input.runId || `agent_${Date.now()}`,
    challenge: fundedEliteFlashRules,
    final_decision: final.final_decision,
    agents,
    candidate: scanner.candidate,
    preview,
    created_at: new Date().toISOString(),
  };
}
