# Prop Research Lab

Static prototype plus Python MVP skeleton for an FTMO-style demo trading research cockpit.

Open `index.html` in a browser. The app keeps journal notes and snapshots in local storage only.

## What This Project Does

- Tracks FTMO-style risk limits for 1-Step and 2-Step demo modes.
- Treats TradingView, Myfxbook, CME, and Investopedia content as education and hypothesis material.
- Scores ideas by process quality instead of blindly copying signals.
- Includes a "Tarot Check" module inspired by TradingView's trader tarot concept, but only as a reflection tool for bias, risk, and patience.
- Provides a journal-first workflow before any demo trade is taken.
- Adds a scanner/preflight flow for volume spike, VWAP reclaim, breakout, continuation, news risk, technical checks, position sizing, and manual confirmation.
- Includes Python modules for risk management, VWAP reclaim signal generation, and basic backtest metrics.
- Upgrades the backend skeleton with mock market data, news filter, economic calendar, strategy engine, execution guard, SQLite audit log, broker order previews, Telegram message builder, and daily reporting utilities.

## MVP Agent Workflow

The first real version should stay paper-only:

1. Data collector pulls OHLCV, quotes, spread, news, and economic-calendar risk.
2. Market scanner filters for VWAP reclaim, EMA 9/21 momentum, opening range breakout, volume spike, RSI range, ATR, and liquidity.
3. News filter blocks high-impact macro events, earnings risk, regulatory shocks, lawsuits, and large analyst changes.
4. Strategy engine creates a structured signal with entry, stop, target, setup, invalidation, and confidence.
5. Risk manager approves or rejects using account risk, daily max loss, max trades, spread, stop distance, position size, and minimum R:R.
6. AI explanation turns the structured signal into a short human-readable plan.
7. Telegram/dashboard sends the signal for manual approval.
8. Broker layer can send only paper orders in v1.
9. Journal saves every accepted and rejected signal.
10. Backtester and daily report compute win rate, expectancy, drawdown, profit factor, and rule violations.

## Safety Rules

- No trade without stop-loss.
- Risk per trade defaults to 0.5% and must stay below the configured max.
- Stop trading after daily max loss or max trades.
- No revenge trading or position increase after loss.
- No market order when spread is too wide.
- No low-liquidity tickers.
- No trade around high-impact macro/news events.
- Every signal, including rejected signals, must be logged.
- Kill switch must block execution on rule breach or broker disconnect.
- Live trading stays locked until paper trading and backtests prove an edge.

## Agent Algorithm

1. Collect an idea from forum discussion, TradingView education, CME/Investopedia learning material, or the user's own chart.
2. Extract the claim: instrument, direction, timeframe, key level, invalidation, and risk.
3. Rebuild the idea on the user's own chart.
4. Reject the idea if invalidation or position sizing is unclear.
5. Require trend context, support/resistance, volatility/news context, and fixed stop loss.
6. Size from allowed loss, never from desired profit.
7. Log the hypothesis before entry.
8. Review outcome against the hypothesis, not against emotion.

## Python Skeleton

Current starter modules:

- `risk/risk_manager.py`: account risk, daily loss, max trades, spread, news risk, R:R, and position sizing.
- `risk/kill_switch.py`: manual pause, broker disconnect, and daily-loss kill switch.
- `data/market_data.py`: normalized candle, quote, and snapshot models plus a mock market data client.
- `data/news_data.py`: high-impact news filter for earnings, CPI, FOMC, NFP, SEC/regulatory, downgrade, lawsuit, and investigation language.
- `data/calendar_data.py`: high-impact macro event blocker.
- `strategies/vwap_reclaim.py`: VWAP reclaim + EMA 9/21 + volume spike + RSI filter.
- `strategies/ema_momentum.py`: EMA 9/21/50 continuation above VWAP.
- `strategies/opening_range_breakout.py`: premarket/opening range breakout logic.
- `backtesting/metrics.py`: expectancy, profit factor, and max drawdown.
- `backtesting/backtest_runner.py`: summary object for strategy test results.
- `agent/signal_explainer.py`: human-readable signal plan and rejection explanation.
- `agent/news_interpreter.py`: compact news-risk explanation.
- `agent/trade_reviewer.py`: daily report metrics.
- `broker/order_manager.py`: paper bracket preview with `transmit=False` plus a live execution guard that blocks live routing until explicit unlock, manual confirm, broker reconciliation, audit logging, kill switch state, and live risk cap pass.
- `broker/credentials.py`: paper/live credential loading, endpoint validation, and live acknowledgement phrase check.
- `broker/reconciliation.py`: broker connected/buying-power/open-order readiness checks.
- `broker/live_executor.py`: dry-run first Alpaca execution preparer, with real submit path only after guard approval.
- `broker/alpaca_client.py`: Alpaca bracket order request builder with `client_order_id` and authenticated submit method.
- `broker/ibkr_client.py`: IBKR bracket order preview builder with parent/take-profit/stop-loss legs and last-child transmit gate.
- `database/db.py`: SQLite migrations, audit log, and signal journal.
- `notifications/telegram_bot.py`: Telegram message builder that stays disabled until token/chat are configured.
- `app/main.py`: orchestrates scan -> news -> strategy -> risk -> kill switch -> execution guard -> journal.
- `tests/`: focused tests for the first risk and backtest calculations.

Run a local mock scan:

```bash
python3 -m app.main
```

The scan uses mock data and writes only to local SQLite. It does not send broker orders.

## Live Readiness Checklist

Live execution remains fail-closed until all of these are true:

1. `BROKER_MODE=live`.
2. `LIVE_EXECUTION_UNLOCKED=true`.
3. `LIVE_EXECUTION_ACK=I_ACCEPT_LIVE_RISK`.
4. Live broker credentials are present and validated against a live endpoint, not paper.
5. Manual confirmation is supplied for the specific signal.
6. Kill switch is inactive.
7. SQLite audit log is writable.
8. Broker account, buying power, open orders, and positions are reconciled.
9. Signal has stop-loss, take-profit, position size, and minimum R:R.
10. Live risk per trade is below the live cap, currently defaulted to 0.25%.

Use `.env.example` as the template, but keep the real `.env` out of git.

## Live/Paper CLI

Do not paste broker keys into chat. Put them in a local `.env` file copied from `.env.example`.

Check credentials and mode:

```bash
python3 -m app.live_cli preflight --mode paper
python3 -m app.live_cli preflight --mode live
```

Run a mock strategy scan:

```bash
python3 -m app.live_cli scan --symbol AMD
```

Prepare an order request without submitting it:

```bash
python3 -m app.live_cli dry-run --mode paper --symbol AMD --entry 100 --stop 99 --target 102
RISK_PER_TRADE=0.001 python3 -m app.live_cli dry-run --mode live --symbol AMD --entry 100 --stop 99 --target 102
```

Reconcile broker account state before any submit:

```bash
python3 -m app.live_cli reconcile --mode paper --symbol AMD --required-buying-power 5000
```

Submitting is intentionally separate. Paper submit can be used for broker sandbox tests. Live submit requires the exact confirmation phrase:

```bash
python3 -m app.live_cli submit --mode paper --symbol AMD --entry 100 --stop 99 --target 102
python3 -m app.live_cli submit --mode live --symbol AMD --entry 100 --stop 99 --target 102 --confirm I_CONFIRM_THIS_LIVE_ORDER
```

Every dry-run and submit attempt is written to the SQLite audit log.

## Hosting And Domain

Recommended production split:

- Frontend dashboard: Netlify static site from `public/`.
- Backend execution API: Docker host such as Render, Fly.io, Railway, VPS, or private server.
- Domain: point `www.yourdomain.com` to Netlify and `api.yourdomain.com` to the backend host.
- Broker keys: backend env vars only. Never put broker keys in Netlify public env or frontend JS.

Static frontend deploy config is in `netlify.toml`. Replace `https://REPLACE_WITH_BACKEND_DOMAIN` with your backend URL after the API is hosted.

Backend local run:

```bash
cp .env.production.example .env
docker compose up --build
```

Then test:

```bash
curl http://localhost:8000/health
curl -H "X-Admin-Token: YOUR_TOKEN" http://localhost:8000/preflight/paper
```

Production backend env must include at least:

```text
TRADING_ENV=production
BROKER_MODE=paper
DATABASE_PATH=/data/trading_agent.sqlite3
API_ADMIN_TOKEN=<strong-random-token>
ENABLE_SUBMIT_ENDPOINT=false
CORS_ORIGINS=https://www.yourdomain.com
```

For live mode, keep `ENABLE_SUBMIT_ENDPOINT=false` until paper submit, audit log, broker reconciliation, and kill switch have been tested end to end.

Suggested next folders from the blueprint:

```text
app/                FastAPI entrypoint, config, scheduler
data/               market, news, calendar adapters
strategies/         VWAP reclaim, EMA momentum, opening range breakout
risk/               risk manager, position sizing, kill switch
broker/             Alpaca paper first, IBKR later
agent/              signal explainer, news interpreter, trade reviewer
backtesting/        runner and metrics
database/           SQLite first, PostgreSQL/Timescale later
notifications/      Telegram and email alerts
dashboard/          Streamlit or React dashboard
tests/              risk, strategy, broker/order tests
```

## Broker Roadmap

Version 1 should use Alpaca paper trading because it is the fastest MVP path. Alpaca documents paper trading as a separate paper account/key/endpoint flow, commonly using the paper API base URL. Keep paper keys separate from live keys.

Live execution can exist, but only as controlled live execution. It should never be the default route. The current code has a live guard scaffold, not a real broker adapter. Before real order routing, add broker credentials outside git, full audit logging, account/order reconciliation, and a physical/manual kill switch.

IBKR belongs in a later version. The IBKR TWS API docs include TWS/Gateway setup, paper-trading notes, pacing limitations, API connection flow, memory allocation settings, order precautions, and bracket/profit-taker/stop-loss order patterns. For this project, IBKR should be wrapped by an execution gate that requires:

- paper mode first;
- unique order IDs and order status reconciliation;
- bracket order or equivalent entry + stop + target plan;
- disconnect handling and kill switch;
- audit log for every request/response;
- manual unlock before any live route exists;
- first live risk cap lower than paper risk, for example 0.10%-0.25% per trade.

## Source Notes

- FTMO rules should be verified against the official Trading Objectives page before any real challenge: https://ftmo.com/en/trading-objectives/
- Alpaca paper trading docs: https://docs.alpaca.markets/docs/trading/paper-trading/
- Alpaca Trading API getting started docs: https://docs.alpaca.markets/us/docs/getting-started-with-trading-api
- IBKR TWS API docs: https://ibkrcampus.com/campus/ibkr-api-page/twsapi-doc/
- Myfxbook community/forum can help identify common risk-management concerns and suspicious claims: https://www.myfxbook.com/community
- TradingView ideas are educational hypotheses, not automatic trade instructions: https://www.tradingview.com/ideas/
- TradingView student material is useful for a research-first workflow: https://www.tradingview.com/students/
- TradingView tarot inspired the reflection module, not the trade logic: https://www.tradingview.com/zoli-tarot-reading/
- Investopedia and CME Group are useful for baseline market concepts and risk-first thinking: https://www.investopedia.com/ and https://www.cmegroup.com/

## Future Agent Inputs

- `account`: initial capital, current balance, current equity, phase, daily start balance.
- `idea`: instrument, timeframe, direction, author/source, key levels, invalidation, claimed reason.
- `validation`: trend context, support/resistance, volatility/news, confirmation, risk/reward, journal status.
- `risk`: max loss per trade, daily buffer, max loss buffer, open exposure, stop distance.
- `decision`: demo-only allow, wait, reject, or review manually.

This is not financial advice and does not promise profit or prop-firm passing.
