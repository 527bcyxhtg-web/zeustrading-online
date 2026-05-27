# Windsurf / Blackbox Agent Redesign Prompt

Use this prompt inside Windsurf Blackbox Agent, Claude, Gemini, or another coding model.

```text
You are redesigning Zeus Trading at zeustrading.online.

Goal:
Make the app drastically simpler, clearer, and more premium while preserving all protected-live safety.

User must understand in the first 10 seconds:
1. Login/register creates an admin profile.
2. Live prices, news and economic calendar are context.
3. Strategy is selected from FTMO, XAUUSD, VWAP, Crypto bot, or Polymarket/CLOB.
4. Risk Gate must pass: SL, TP, R:R, daily drawdown, max drawdown, spread, news, kill switch.
5. Preview is built for MT5 bridge or wallet/CLOB.
6. Live execution requires manual approval and audit log.

Do:
- Improve index.html, styles.css, app.js and sync to public/.
- Keep the design dark/premium, but cleaner and less noisy.
- Make the first viewport a simple Start Here command center.
- Add obvious section labels, status chips, next-action buttons, and short helper text.
- Improve mobile layout and avoid horizontal overflow.
- Keep admin/profile obvious after registration.
- Keep chat functional and visible.
- Keep live prices board, news cards with images, economic calendar, strategy library, FTMO challenge area and Polymarket/CLOB route.
- Keep MT5 bridge protected-live flow.

Do not:
- Promise profit or FTMO passing.
- Add blind auto-trading.
- Type broker passwords or bypass 2FA.
- Store API keys, wallet seeds, private keys, or broker secrets in frontend code.
- Treat news, tarot, Polymarket odds or TradingView ideas as direct signals.

Required verification:
- cp index.html public/index.html && cp styles.css public/styles.css && cp app.js public/app.js
- node --check app.js
- node --check public/app.js
- node --check public/_worker.js
- node tests/agent_engine.test.mjs
- python3 -m pytest tests/test_mt5_bridge.py -q
- npx wrangler pages deploy public --project-name zeustrading-online --commit-dirty=true
```

## Recommended Windsurf Extensions

Already installed or recommended:

- Blackbox Agent
- OpenAI ChatGPT
- Python
- Python Debugger
- GitHub Actions
- REST Client
- ESLint
- Prettier
- YAML
- Docker
- Live Server

## Useful Tasks

Open Windsurf Command Palette:

- `Tasks: Run Task`
- `Zeus: Verify all`
- `Zeus: Sync public frontend`
- `Zeus: Run MT5 bridge safe`
- `Zeus: Deploy Cloudflare`

