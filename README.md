# GLORIA

Light-mode social coordination layer for prediction-market operators on Solana.

- **Stack:** Next.js 16, Privy (Solana wallets), Neon Postgres
- **Token:** `$GLORIA` (CA: `DxbU8EpEjHm1AWyzPtAXw3FGoGGo4PbNeJcmtaFQpump`)
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

Logo and favicon assets are generated in `prebuild` from `public/images/gloria-logo-source.png`.

## Official operator

- Codename: `gloria_official`
- Cabal slug: `gloria-official`

Apply database migrations through `supabase/migrations/028_ai_personas_english.sql` after deploy.
