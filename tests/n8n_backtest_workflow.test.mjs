import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = JSON.parse(readFileSync("integrations/n8n/crypto-backtest-zeus.json", "utf8"));
const readme = readFileSync("integrations/n8n/README.md", "utf8");
const nodeNames = workflow.nodes.map((node) => node.name);
const serialized = JSON.stringify(workflow);

assert.equal(workflow.name, "Zeus Crypto Strategy Backtest");
assert.ok(nodeNames.includes("Manual backtest trigger"));
assert.ok(nodeNames.includes("Load backtest strategies"));
assert.ok(nodeNames.includes("Fetch backtest history"));
assert.ok(nodeNames.includes("Run backtest simulation"));
assert.ok(nodeNames.includes("Save backtest journal"));
assert.ok(nodeNames.includes("Send backtest Telegram summary"));

assert.match(serialized, /n8n_backtest_result/);
assert.match(serialized, /profit_factor/);
assert.match(serialized, /max_drawdown/);
assert.match(serialized, /api\/journal/);
assert.match(serialized, /api\/telegram\/alert/);
assert.doesNotMatch(serialized, /\/order\/preview|\/order\/submit|\/send_order|MT5_PASSWORD|OPENROUTER_API_KEY/);

assert.match(readme, /Crypto Strategy Backtest/);
assert.match(readme, /research-only/);

console.log("n8n_backtest_workflow.test.mjs passed");
