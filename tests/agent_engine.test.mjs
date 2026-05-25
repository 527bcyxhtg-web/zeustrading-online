import assert from "node:assert/strict";
import { fundedEliteDrawdownState, positionSize, riskGate, runAgentCycle } from "../lib/agentEngine.mjs";

const base = {
  symbol: "XAUUSD",
  direction: "LONG",
  entry: 2380,
  stopLoss: 2375,
  takeProfit: 2390,
  riskPercent: 0.25,
  spreadPercent: 0.03,
  newsRisk: "low",
  account: {
    phase: "evaluation",
    accountSize: 100000,
    initialBalance: 100000,
    startOfDayBalance: 100000,
    currentEquity: 100000,
  },
};

const drawdown = fundedEliteDrawdownState(base.account);
assert.equal(drawdown.profitTarget, 6000);
assert.equal(drawdown.staticDrawdownFloor, 94000);
assert.equal(drawdown.dailyLossBufferRemaining, 3000);

const sizing = positionSize({ accountSize: 100000, riskPercent: 0.25, entry: 2380, stopLoss: 2375, maxAllowedLoss: 3000, symbol: "XAUUSD" });
assert.equal(sizing.riskAmount, 250);
assert.ok(sizing.lotSize > 0);

const blocked = riskGate({
  ...base,
  newsRisk: "high",
  account: { ...base.account, currentEquity: 97000, startOfDayBalance: 100000 },
});
assert.equal(blocked.risk_pass, false);
assert.ok(blocked.blockers.some((item) => item.includes("High-impact news")));

const approved = riskGate(base);
assert.equal(approved.risk_pass, true);
assert.equal(approved.rr_ratio, 2);

const liveConsistency = fundedEliteDrawdownState({
  phase: "live",
  accountSize: 100000,
  initialBalance: 100000,
  startOfDayBalance: 103000,
  currentEquity: 103000,
  highWaterEquity: 104000,
  totalProfit: 3000,
  bestDayProfit: 1500,
  profitableDays: 2,
});
assert.equal(liveConsistency.consistencyStatus, "warning");
assert.ok(liveConsistency.extraProfitRequiredForConsistency > 0);

const cycle = runAgentCycle(base);
assert.notEqual(cycle.final_decision, "BLOCK");
assert.ok(cycle.preview.preview_ready);

const killed = runAgentCycle({ ...base, killSwitchActive: true });
assert.equal(killed.final_decision, "BLOCK");

console.log("agent_engine.test.mjs passed");
