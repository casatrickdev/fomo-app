# Kite

Kite is an original, open-source **social-first crypto trading** app for iOS and Android. Follow other traders, watch a live tape of buys and sells, compete on leaderboards, and (later) swap across chains without managing gas or seed phrases.

This is an independent project. It is **not** affiliated with, derived from, or a clone of any existing trading app. Do not scrape private endpoints or reuse another product's name, logo, palette, or copy.

**Identity**

- Name: **Kite**
- Tagline: Follow the flow
- Palette: night indigo (`#070A12`) + amber kite fabric (`#FFC857`) + cyan tail (`#3DDCFF`)

## Milestone 1 (this repo)

1. Monorepo scaffold (Expo + NestJS + shared packages)
2. Email OTP auth → JWT session → protected routes
3. Embedded wallet provisioning behind a **stub** provider (no keys in the client)
4. Home feed + seeded Socket.IO live trades
5. Leaderboard backed by Postgres + seed data
6. CI, README, and architecture decision records

Later milestones (copy trading, real swaps, fiat on-ramp, indexer) are sketched in the UI and ADRs only.

## Monorepo

```
/apps
  /mobile        Expo React Native (SDK 57)
  /api           NestJS REST + Socket.IO + Prisma
/packages
  /shared-types  Zod schemas shared by mobile and API
  /ui            Design tokens (Kite visual identity)
/infra
  /adr           Architecture decision records
  docker-compose.yml
```

## Prerequisites

- Node.js 22.13+
- pnpm 10+
- Docker (for PostgreSQL)

## Setup

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# Edit JWT secrets in apps/api/.env before anything but local demos.

pnpm db:up
pnpm --filter @kite/shared-types build
pnpm --filter @kite/ui build
pnpm --filter @kite/api prisma:generate
pnpm db:migrate
pnpm db:seed
```

Run the API and the app:

```bash
pnpm dev:api
pnpm dev:mobile
```

On a physical phone, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (see `apps/mobile/.env.example`). Android emulators should use `http://10.0.2.2:3000`.

### Auth in development

`OTP_DEV_ECHO=true` includes `devCode` in `POST /v1/auth/otp/request` so you can verify without a mailer. The code is also logged by `ConsoleEmailProvider`. Never enable echo in production.

1. Open Kite → enter an email
2. Paste the six-digit code
3. Pick a handle
4. Optionally allow notifications
5. Home shows demo trades; Leaderboard reads Postgres

`GET /v1/users/me` is the protected-route check after login.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API | Postgres connection string |
| `JWT_ACCESS_SECRET` | API | Access token signing |
| `JWT_REFRESH_SECRET` | API | Reserved for rotating refresh hashing context |
| `OTP_EXPIRY_SECONDS` | API | OTP lifetime (default 300) |
| `OTP_DEV_ECHO` | API | Return OTP in JSON (dev only) |
| `WALLET_PROVIDER` | API | `stub` until a real SDK is chosen |
| `FEED_SIMULATOR_ENABLED` | API | Seeded live tape |
| `CORS_ORIGIN` | API | Browser origin (`*` in local dev) |
| `EXPO_PUBLIC_API_URL` | Mobile | API origin |

## Architecture

- **Auth:** email OTP, hashed in `OtpChallenge`. Sessions are JWT access tokens (15m) plus hashed refresh tokens in `Session`.
- **Wallets:** `WalletProvider` interface. Stub derives display addresses with SHA-256 and **never** creates keys. See `infra/adr/0002-wallet-provider.md`.
- **Feed:** `GET /v1/feed` plus Socket.IO namespace `/feed`. Empty follow graphs fall back to demo traders.
- **Leaderboard:** `GET /v1/leaderboard?window=24h|7d|30d|all` reads `LeaderboardEntry`. An hourly cron recomputes from positions/trades.
- **Market data / swaps:** not wired. Public APIs only when they land (DexScreener, CoinGecko, Birdeye, Jupiter, 0x/1inch). No undocumented third-party app APIs.

## Security

- No private keys, mnemonics, or signing in the mobile app
- Secrets stay in env files (gitignored) or a real secret manager
- Rate limits on OTP via `@nestjs/throttler`
- Treat swap/custody code as security-critical when it is implemented

## Legal / compliance (TODO)

Do **not** hardcode KYC/AML, licensing, or regional blocking. Before handling real user funds:

- [ ] Legal review of money-transmitter / VASP status per launch country
- [ ] KYC vendor and withdrawal gates
- [ ] Terms, risk disclosures, and copy-trading consent copy
- [ ] Whether the relayer spread is a regulated activity

Copy trading must stay opt-in, with a second confirmation above a configurable USD threshold.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev:api` | Nest watch mode |
| `pnpm dev:mobile` | Expo |
| `pnpm typecheck` | All packages |
| `pnpm test` | API unit tests |
| `pnpm lint` | API ESLint |
| `pnpm db:up` / `db:migrate` / `db:seed` | Postgres |

## License

MIT
