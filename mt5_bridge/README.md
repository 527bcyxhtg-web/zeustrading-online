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

## Live Mode

By default the bridge is safe: it previews and journals but will not submit live orders.

To enable real MT5 order routing on a machine with MetaTrader 5 open and logged in:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_mt5_bridge_live_windows.ps1
```

Hard rules stay enforced by the dashboard and bridge:

- stop-loss required
- take-profit required
- approved Zeus preview required
- manual approval token required
- spread cap checked
- kill switch route available
- every preview/submit/flatten action is journaled
