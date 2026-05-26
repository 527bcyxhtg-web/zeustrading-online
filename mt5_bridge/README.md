# Zeus MT5 Bridge

Local/VPS bridge for protected live MT5 execution.

## Run

```bash
python3 -m venv .venv-mt5
source .venv-mt5/bin/activate
pip install -r mt5_bridge/requirements.txt
uvicorn mt5_bridge.server:app --host 127.0.0.1 --port 8789
```

Dashboard URL:

```text
http://127.0.0.1:8789
```

## Live Mode

By default the bridge is safe: it previews and journals but will not submit live orders.

To enable real MT5 order routing on a machine with MetaTrader 5 open and logged in:

```bash
export MT5_ENABLE_LIVE=true
export MT5_REQUIRE_TERMINAL=true
uvicorn mt5_bridge.server:app --host 127.0.0.1 --port 8789
```

Hard rules stay enforced by the dashboard and bridge:

- stop-loss required
- take-profit required
- approved Zeus preview required
- manual approval token required
- spread cap checked
- kill switch route available
- every preview/submit/flatten action is journaled

