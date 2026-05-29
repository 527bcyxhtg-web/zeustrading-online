# Zeus MT5 Bridge

Local/VPS bridge for protected live MT5 execution.

## Run

```bash
./scripts/start_mt5_bridge.sh
```

Dashboard URL:

```text
http://127.0.0.1:8789
```

n8n/VPS health check aliases:

```text
GET /health
GET /status
GET /guard
```

Order routes:

```text
POST /order/preview
POST /order/submit
```

Guard and paper routes:

```text
POST /kill
POST /kill/clear
POST /positions/flatten
POST /paper/reset
POST /paper/close
```

The legacy `/send_order` route is intentionally blocked. n8n must call
`/order/preview` first and live submit must still pass Zeus manual approval.

## Live Mode

By default the bridge is safe: it previews and journals but will not submit live orders.
Approved submits are recorded as paper positions while `MT5_ENABLE_LIVE=false`.

To enable real MT5 order routing on a machine with MetaTrader 5 open and logged in
to a demo account:

```powershell
$env:MT5_LOGIN = "12345678"
$env:MT5_PASSWORD = "your-demo-password"
$env:MT5_SERVER = "YourBroker-Demo"
powershell -ExecutionPolicy Bypass -File scripts/start_mt5_bridge_live_windows.ps1
```

Do not commit MT5 credentials. Keep them in local/VPS environment variables. The
bridge reports only whether credentials are configured; it never journals the
password.

Hard rules stay enforced by the dashboard and bridge:

- stop-loss required
- take-profit required
- approved Zeus preview required
- manual approval token required
- spread cap checked
- hard bridge guard blocks preview/submit when kill switch or drawdown rules are active
- daily loss and static drawdown buffers are persisted in `logs/mt5_guard_state.json`
- `/positions/flatten` activates the kill switch before closing or dry-running closes
- optional `MT5_KILL_TOKEN` protects `/kill`, `/kill/clear`, `/paper/reset`, and `/paper/close`
- dry-run submit creates a paper ledger position instead of contacting MT5
- `MT5_REQUIRE_DEMO_ACCOUNT=true` blocks live submit unless MT5 reports a demo/contest account
- real accounts are blocked unless `MT5_ALLOW_REAL_ACCOUNT=true` is explicitly set
- every preview/submit/flatten action is journaled

Recommended production environment:

```text
MT5_ENABLE_LIVE=true
MT5_REQUIRE_TERMINAL=true
MT5_REQUIRE_DEMO_ACCOUNT=true
MT5_ALLOW_REAL_ACCOUNT=false
MT5_LOGIN=your-demo-login
MT5_PASSWORD=your-demo-password
MT5_SERVER=your-broker-demo-server
MT5_KILL_TOKEN=long-random-admin-token
MT5_GUARD_INITIAL_BALANCE=100000
MT5_GUARD_DAILY_LOSS_LIMIT_PERCENT=0.03
MT5_GUARD_MAX_TOTAL_DRAWDOWN_PERCENT=0.06
```
