# Zeus n8n Workflows

This folder contains n8n workflows that route signals through Zeus safety gates.

## BTCUSD EMA50 Protected Scanner

File:

```text
integrations/n8n/btcusd-ema50-zeus-protected.json
```

What it does:

1. Runs every hour.
2. Calls the MT5 bridge `/health` endpoint.
3. Stops before market scanning and sends a Zeus Telegram alert if the bridge is
   not demo-live ready.
4. Loads scanner strategies from the workflow config.
5. Fetches hourly crypto candles from CoinGecko only after the bridge passes.
6. Calculates each strategy condition, currently BTCUSD/ETHUSD EMA, RSI, MACD,
   and volume-spike variants.
7. If a strategy creates a candidate, sends it to:

```text
https://zeustrading.online/api/agentscope/orchestrate
```

8. Sends Telegram through the Zeus backend:

```text
https://zeustrading.online/api/telegram/alert
```

9. Optionally sends the result to the local/VPS MT5 bridge preview route:

```text
http://127.0.0.1:8789/order/preview
```

## Required n8n environment variables

```text
ZEUS_BASE_URL=https://zeustrading.online
MT5_BRIDGE_URL=http://127.0.0.1:8789
```

`ZEUS_BASE_URL` is safe to keep in n8n. Telegram secrets stay in Cloudflare and are not stored in the workflow.
The workflow expects the bridge health response used by Zeus MT5 bridge:
`ok`, `live_enabled`, `account.connected`, `account.trade_mode_label`,
`guard.ok`, and `guard.live_account_blockers`.

Strategy config lives in the `Load scanner strategies` node. Add symbols there
instead of copying the whole workflow. Each strategy can define `conditions`
such as `price_above_ema`, `price_below_ema`, `rsi_above`, `rsi_below`,
`macd_bullish`, `macd_bearish`, and `volume_spike`.

## Safety Contract

- The workflow creates candidates only.
- The workflow stops before CoinGecko scanning when the MT5 bridge is not ready.
- Multiple symbols/strategies are scanned from one config node.
- Indicator data is passed to Zeus AgentScope; OpenRouter/API secrets stay in
  the Zeus backend, not inside n8n.
- Telegram alerts are not trade instructions.
- MT5 receives preview requests only.
- Live submit still requires Zeus risk gate, manual approval token, SL/TP, kill switch availability, and audit logging.
- Do not add Telegram bot tokens, broker passwords, seed phrases, or withdrawal-enabled API keys to this JSON.

## Import

1. Open n8n.
2. Choose `Import from JSON`.
3. Paste the JSON from `btcusd-ema50-zeus-protected.json`.
4. Set `ZEUS_BASE_URL` and `MT5_BRIDGE_URL` in n8n environment variables if needed.
5. Activate after testing one manual run.
