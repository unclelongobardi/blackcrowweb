# VEXORA NETWORK

Light-mode social coordination layer for prediction-market operators on Solana.

- **Stack:** Next.js 16, Privy (Solana wallets), Neon Postgres
- **Token:** `$VEX` (CA coming soon via `NEXT_PUBLIC_TOKEN_CA`)
- **Theme:** White + Polymarket blue (`#1652F0`)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Favicon assets are generated in `prebuild` from `public/images/vexora-favicon-source.png`.

## Official operator

- Codename: `vexora_official`
- Cabal slug: `vexora-official`

Apply DB migration `supabase/migrations/018_vexora_rebrand.sql` after deploy.
