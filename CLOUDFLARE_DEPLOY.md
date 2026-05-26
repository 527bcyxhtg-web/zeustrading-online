# Cloudflare deploy

Default target for this project is Cloudflare.

## Frontend

Deploy static frontend from `public/`:

```bash
npx wrangler pages deploy public --project-name zeustrading-online --commit-dirty=true
```

## GitHub Auto Deploy

The repository includes `.github/workflows/cloudflare-pages.yml`.

Required GitHub secret:

```text
CLOUDFLARE_API_TOKEN
```

Create the token in Cloudflare with Pages edit/deploy permissions for
`zeustrading-online`, then save it in GitHub:

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo 527bcyxhtg-web/zeustrading-online
```

After that, every push to `main` validates:

```bash
node --check app.js
node --check public/app.js
node --check public/_worker.js
node tests/agent_engine.test.mjs
```

and deploys `public/` to Cloudflare Pages.

## Domain

Add `zeustrading.online` to Cloudflare, then in GoDaddy change nameservers to the two Cloudflare nameservers shown in Cloudflare.

After Pages deploy, add custom domains in Cloudflare Pages:

- `zeustrading.online`
- `www.zeustrading.online`

## Backend

Cloudflare Pages Worker is the active web backend.

The protected MT5 bridge is local/VPS-only because it must run next to an open
MetaTrader 5 terminal:

```bash
uvicorn mt5_bridge.server:app --host 127.0.0.1 --port 8789
```

Live order routing is disabled by default. Enable it only on the MT5 machine:

```bash
export MT5_ENABLE_LIVE=true
export MT5_REQUIRE_TERMINAL=true
```

Keep broker keys only on backend/local bridge machines. Never store them in
browser JavaScript.
