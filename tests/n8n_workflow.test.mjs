import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = JSON.parse(readFileSync("integrations/n8n/btcusd-ema50-zeus-protected.json", "utf8"));
const readme = readFileSync("integrations/n8n/README.md", "utf8");

const nodeNames = workflow.nodes.map((node) => node.name);

assert.equal(workflow.name, "Zeus Protected BTCUSD EMA50 Scanner");
assert.ok(nodeNames.includes("MT5 bridge health precheck"));
assert.ok(nodeNames.includes("Normalize bridge readiness"));
assert.ok(nodeNames.includes("Bridge demo-live ready?"));
assert.ok(nodeNames.includes("Load scanner strategies"));
assert.ok(nodeNames.includes("Fetch crypto hourly history"));
assert.ok(nodeNames.includes("Calculate strategy candidate"));
assert.ok(nodeNames.includes("Zeus AgentScope risk review"));
assert.ok(nodeNames.includes("Send Zeus Telegram alert"));
assert.ok(nodeNames.includes("Send bridge blocked Telegram alert"));
assert.ok(nodeNames.includes("Optional MT5 preview only"));

const serialized = JSON.stringify(workflow);
assert.match(serialized, /\/health/);
assert.match(serialized, /bridge_ready/);
assert.match(serialized, /demo_live_ready/);
assert.match(serialized, /ETHUSD/);
assert.match(serialized, /EMA20_PULLBACK/);
assert.match(serialized, /n8n-generalized-scanner/);
assert.match(serialized, /api\/agentscope\/orchestrate/);
assert.match(serialized, /api\/telegram\/alert/);
assert.match(serialized, /\/order\/preview/);
assert.doesNotMatch(serialized, /YOUR_TELEGRAM_BOT_TOKEN|YOUR_CHAT_ID|\/send_order|\/order\/submit/);
assert.match(serialized, /manual-approval/);

assert.match(readme, /Safety Contract/);
assert.match(readme, /stops before CoinGecko scanning/);
assert.match(readme, /MT5 receives preview requests only/);

console.log("n8n_workflow.test.mjs passed");
