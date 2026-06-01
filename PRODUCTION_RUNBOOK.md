# Zeus Trading Production Runbook

This runbook connects the frontend, Cloudflare backend, n8n automation, MT5 bridge, Telegram, and audit flow.

## 0. Safety Model

Zeus is a protected trading assistant, not a guaranteed-pass or blind auto-trading bot.

Hard rules:

- No live order without stop-loss and take-profit.
- No live order without Zeus risk gate approval.
- No live order without manual approval token.
- No direct `/send_order`.
- MT5 real accounts are blocked unless `MT5_ALLOW_REAL_ACCOUNT=true`.
- Keep `MT5_REQUIRE_DEMO_ACCOUNT=true` for demo-live testing.
- Keep broker, Telegram, OpenRouter, and MT5 secrets out of git and browser JavaScript.

## 1. Repository And Tests

Run from the project root:

```bash
./scripts/verify_production_readiness.sh
```

Manual equivalent:

```bash
node --check app.js
node --check public/app.js
node --check public/_worker.js
node tests/agent_engine.test.mjs
node tests/agentscope_runtime.test.mjs
node tests/n8n_workflow.test.mjs
node tests/n8n_backtest_workflow.test.mjs
node tests/audit_export.test.mjs
```

Python MT5 tests require `fastapi`, `pytest`, and the bridge dependencies:

```bash
python -m pip install -r mt5_bridge/requirements.txt pytest
python -m pytest tests/test_mt5_bridge.py -q
```

## 2. Cloudflare Frontend And Worker

Cloudflare Pages is the active frontend and web backend.

Deploy:

```bash
npx wrangler pages deploy public --project-name zeustrading-online --commit-dirty=true
```

Required Cloudflare secrets:

```text
OPENROUTER_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Required Cloudflare D1 binding in `wrangler.toml`:

```text
binding = "zeustrading_users"
database_name = "zeustrading-users"
```

Production smoke checks:

```bash
curl https://zeustrading.online/api/economic-calendar
curl https://zeustrading.online/api/audit-summary
```

Do not put MT5 or broker credentials in Cloudflare Pages public variables.

## 3. n8n Workflows

Import these JSON files into n8n:

```text
integrations/n8n/btcusd-ema50-zeus-protected.json
integrations/n8n/crypto-backtest-zeus.json
```

Required n8n environment variables:

```text
ZEUS_BASE_URL=https://zeustrading.online
MT5_BRIDGE_URL=http://YOUR_MT5_BRIDGE_HOST:8789
```

Scanner workflow order:

1. MT5 bridge `/health`.
2. Zeus economic calendar blocker.
3. Strategy config.
4. CoinGecko candles.
5. EMA/RSI/MACD/volume conditions.
6. Rejected/no-signal journal.
7. AgentScope review for candidates.
8. Telegram alert through Zeus backend.
9. Optional MT5 `/order/preview`.

The workflow never calls `/order/submit`.

## 4. MT5 Demo-Live Bridge

Run the bridge only on the machine/VPS where MetaTrader 5 is installed and logged into a demo account.

Windows PowerShell example:

```powershell
$env:MT5_ENABLE_LIVE = "true"
$env:MT5_REQUIRE_TERMINAL = "true"
$env:MT5_REQUIRE_DEMO_ACCOUNT = "true"
$env:MT5_ALLOW_REAL_ACCOUNT = "false"
$env:MT5_LOGIN = "YOUR_DEMO_LOGIN"
$env:MT5_PASSWORD = "YOUR_DEMO_PASSWORD"
$env:MT5_SERVER = "YOUR_BROKER_DEMO_SERVER"
$env:MT5_KILL_TOKEN = "LONG_RANDOM_ADMIN_TOKEN"
powershell -ExecutionPolicy Bypass -File scripts/start_mt5_bridge_live_windows.ps1
```

Local safe dry-run:

```bash
MT5_ENABLE_LIVE=false uvicorn mt5_bridge.server:app --host 127.0.0.1 --port 8789
```

Bridge checks:

```bash
curl http://127.0.0.1:8789/health
curl http://127.0.0.1:8789/guard
```

Manual kill:

```bash
curl -X POST http://127.0.0.1:8789/kill \
  -H "Content-Type: application/json" \
  -H "X-Zeus-Token: LONG_RANDOM_ADMIN_TOKEN" \
  -d '{"reason":"manual stop"}'
```

Clear only after review:

```bash
curl -X POST http://127.0.0.1:8789/kill/clear \
  -H "Content-Type: application/json" \
  -H "X-Zeus-Token: LONG_RANDOM_ADMIN_TOKEN" \
  -d '{"reason":"review complete"}'
```

## 5. First End-To-End Demo-Live Test

1. Start MT5 and confirm the account is demo/contest.
2. Start the bridge with `MT5_ALLOW_REAL_ACCOUNT=false`.
3. Check `/health`; it must show:
   - `live_enabled: true`
   - `account.connected: true`
   - `account.trade_mode_label: demo` or `contest`
   - `guard.ok: true`
4. Import and manually run the n8n protected scanner.
5. Confirm Telegram receives either:
   - bridge blocked
   - macro blocked
   - candidate alert
6. Confirm Zeus journal receives rejected/no-signal entries.
7. Confirm optional `/order/preview` returns preview only.
8. Do not submit live orders until the manual approval UI and bridge approval token path are tested.

## 6. Backtest Workflow

Run manually in n8n:

```text
Zeus Crypto Strategy Backtest
```

Expected output:

- journal event `n8n_backtest_result`
- Telegram summary with trades, win rate, net P/L, profit factor, and max drawdown

Backtest results are research-only and do not unlock execution.

## 7. Go/No-Go Gates

Demo-live can run only when:

- Cloudflare Worker routes respond.
- Telegram alert route works.
- n8n scanner imports without credential secrets.
- MT5 bridge `/health` is demo-ready.
- Kill switch works.
- Rejected signals journal correctly.
- Backtest workflow runs manually.

Real-money live remains locked until:

- 30+ demo trading days are journaled.
- Positive expectancy is verified.
- Drawdown and consistency rules are respected.
- Kill switch is tested.
- Broker reconciliation is tested.
- User explicitly sets `MT5_ALLOW_REAL_ACCOUNT=true` on the bridge host.
