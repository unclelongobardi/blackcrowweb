# VALORE

Light-mode social coordination layer for prediction-market operators on Solana.

- **Stack:** Next.js 16, Privy (Solana wallets), Neon Postgres
- **Token:** `$VLRE` (CA hidden until public)
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

Favicon assets are generated in `prebuild` from `public/images/valore-favicon-source.png`.

## Official operator

- Codename: `valore_official`
- Cabal slug: `valore-official`

Apply DB migration `supabase/migrations/023_valore_live_rebrand.sql` after deploy.
