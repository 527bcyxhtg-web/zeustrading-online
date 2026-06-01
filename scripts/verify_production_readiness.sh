#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Zeus production readiness checks =="

echo "Checking required files..."
test -f public/_worker.js
test -f public/index.html
test -f integrations/n8n/btcusd-ema50-zeus-protected.json
test -f integrations/n8n/crypto-backtest-zeus.json
test -f mt5_bridge/server.py
test -f wrangler.toml

echo "Checking JavaScript syntax..."
node --check app.js
node --check public/app.js
node --check public/_worker.js

echo "Checking workflow JSON and links..."
node - <<'NODE'
const fs = require("fs");
for (const file of [
  "integrations/n8n/btcusd-ema50-zeus-protected.json",
  "integrations/n8n/crypto-backtest-zeus.json",
]) {
  const workflow = JSON.parse(fs.readFileSync(file, "utf8"));
  const names = new Set(workflow.nodes.map((node) => node.name));
  for (const [from, cfg] of Object.entries(workflow.connections || {})) {
    if (!names.has(from)) throw new Error(`${file}: missing source node ${from}`);
    for (const target of (cfg.main || []).flat(2)) {
      if (target.node && !names.has(target.node)) throw new Error(`${file}: missing target node ${target.node}`);
    }
  }
}
console.log("workflow links ok");
NODE

echo "Running Node tests..."
node tests/agent_engine.test.mjs
node tests/agentscope_runtime.test.mjs
node tests/n8n_workflow.test.mjs
node tests/n8n_backtest_workflow.test.mjs
node tests/audit_export.test.mjs
node tests/telegram_live_data.test.mjs

echo "Checking Python bridge syntax..."
PYTHON_BIN="${PYTHON_BIN:-python3}"
PYTHONPYCACHEPREFIX="${PYTHONPYCACHEPREFIX:-/private/tmp/zeus_pycache}" "$PYTHON_BIN" -m py_compile mt5_bridge/server.py

echo "All local readiness checks passed."
