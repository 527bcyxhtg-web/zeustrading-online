# Cloudflare deploy

Default target for this project is Cloudflare.

## Frontend

Deploy static frontend from `public/`:

```bash
npx wrangler pages deploy public --project-name zeustrading-online --commit-dirty=true
```

## Domain

Add `zeustrading.online` to Cloudflare, then in GoDaddy change nameservers to the two Cloudflare nameservers shown in Cloudflare.

After Pages deploy, add custom domains in Cloudflare Pages:

- `zeustrading.online`
- `www.zeustrading.online`

## Backend

Use `api.zeustrading.online` later for the FastAPI execution API. Keep broker keys only on the backend.
