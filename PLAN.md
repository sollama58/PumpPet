# PumpPet — Project Plan

## Overview

PumpPet is a Render-deployed web app where users connect their Solana wallet and watch a digital pet dog (styled after the "This is Fine" meme) react in real time to their trading performance. The pet grows happier with profitable trades and progressively more distressed with losses. A daily Net P&L tracker resets at midnight UTC, and trade history is persisted in a PostgreSQL database.

---

## Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Historical vs current prices | **Historical prices at trade time** via Birdeye + transaction-derived amounts |
| 2 | Pet art style | **SVG-in-code** (layered, CSS-animatable) |
| 3 | P&L persistence | **PostgreSQL database** — history stored across sessions |
| 4 | Mobile support | **Both desktop and mobile** — Mobile Wallet Adapter for in-app browsers |

---

## Core Features

1. **Solana Wallet Connection** — Connect/disconnect via Phantom, Solflare, or any Wallet Adapter-compatible wallet on desktop or mobile.
2. **Trade Monitoring** — Parse the wallet's recent DEX transactions (Jupiter, Raydium, Orca) to detect buys and sells of SPL tokens.
3. **P&L Calculation** — Compute realized P&L per trade using historical USD prices at trade time; accumulate a daily Net P&L figure.
4. **Reactive Pet** — The "This is Fine" dog animates into one of several emotional states based on current P&L.
5. **Persistence** — Trade history and P&L records stored in PostgreSQL; resumes correctly on reconnect.
6. **Render Blueprint Deployment** — `render.yaml` defines frontend static site, backend API service, and database.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast build, strong ecosystem |
| Styling | Tailwind CSS + CSS animations | Utility-first, lightweight keyframe animations |
| Wallet (desktop) | `@solana/wallet-adapter-react` + `@solana/wallet-adapter-wallets` | Standard Solana wallet integration |
| Wallet (mobile) | `@solana-mobile/wallet-adapter-mobile` | Deep-link support for Phantom Mobile, Solflare Mobile |
| Solana RPC | Helius RPC (free tier) | Enhanced transaction parsing, reliable |
| Transaction Parsing | Helius Enhanced Transactions API | Structured swap event data with token amounts |
| Historical SOL Price | Birdeye REST API (`/defi/history_price`) | Per-timestamp SOL/USD price for non-stablecoin trades |
| Current Prices | Jupiter Price API v2 | Free, no key needed — used for live portfolio value |
| Backend | Node.js + Express (TypeScript) | Lightweight API proxy |
| Database | PostgreSQL (Render managed) | Persist trade history and daily P&L per wallet |
| ORM | Prisma | Type-safe DB access, easy migrations |
| Deployment | Render (Static Site + Web Service + PostgreSQL) | Blueprint YAML, free/starter tier viable |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Render (render.yaml)                       │
│                                                                    │
│  ┌──────────────────┐   ┌─────────────────────┐  ┌────────────┐  │
│  │ Frontend (Static)│   │ Backend (Web Service)│  │ PostgreSQL │  │
│  │ React + Vite     │◄──►  Express + Prisma   │◄─►  (Render) │  │
│  │ /client          │   │ /server              │  └────────────┘  │
│  └──────────────────┘   └──────────┬──────────┘                  │
└──────────────────────────────────────┼──────────────────────────-─┘
                                       │
          ┌────────────────────────────┼────────────────────────┐
          │                            │                         │
 ┌────────▼───────┐       ┌────────────▼──────┐   ┌────────────▼──────┐
 │  Helius RPC     │       │ Helius Enhanced   │   │ Birdeye           │
 │  (Solana RPC)  │       │ Transactions API  │   │ Historical Prices │
 └────────────────┘       └───────────────────┘   └───────────────────┘
```

### Frontend (`/client`)
- Wallet connection UI with `WalletMultiButton` (desktop) and deep-link modal (mobile)
- Pet component with state-driven CSS animation classes
- Daily P&L dashboard panel
- Recent trades list with per-trade P&L

### Backend (`/server`)
- `GET /api/trades?wallet=<address>` — fetches new swaps via Helius, upserts into DB, returns enriched records
- `GET /api/pnl?wallet=<address>&date=<YYYY-MM-DD>` — returns daily Net P&L from DB
- `GET /api/prices?mints=<mint1,mint2,...>` — proxies Jupiter current price lookups
- Handles CORS, rate-limiting, and API key secrecy (keys never exposed to client)

---

## Historical P&L Pricing Strategy

The transaction itself contains the most important data: the **exact token amounts swapped** and a **Unix timestamp**. This is the foundation of the pricing strategy:

### USDC / USDT quoted trades
- Helius returns `tokenIn` and `tokenOut` with mint addresses
- If either side is USDC (`EPjFW...`) or USDT (`Es9vM...`), the stablecoin amount **is** the USD value — no external price API needed
- `realizedPnlUsd = usdcOut - usdcIn` (or equivalent for sells)

### SOL quoted trades
- Extract SOL amount (lamports → SOL) from the swap event
- Call Birdeye `GET /defi/history_price?address=So11...&type=1m&time_from=<ts-60>&time_to=<ts+60>` to get SOL/USD price at that minute
- `usdValue = solAmount * solPriceAtTimestamp`

### Token-to-token trades
- Route through both sides: `usdIn = tokenInAmount * birdeyePriceAtTs(tokenInMint)`, same for out
- Only falls back to this for non-SOL, non-stablecoin pairs (rare in practice)

### Cost basis tracking (for round-trip P&L)
- On a **buy** (SOL/USDC → TOKEN): record `costBasisUsd` in the trade row
- On a **sell** (TOKEN → SOL/USDC): look up prior buy(s) for that mint, compute `realizedPnlUsd = proceedsUsd - costBasisUsd` (FIFO)
- Store both `costBasisUsd` and `realizedPnlUsd` per trade row in PostgreSQL

---

## Database Schema (Prisma)

```prisma
model Wallet {
  address   String   @id
  createdAt DateTime @default(now())
  trades    Trade[]
}

model Trade {
  id              String   @id @default(cuid())
  walletAddress   String
  wallet          Wallet   @relation(fields: [walletAddress], references: [address])
  signature       String   @unique      // Solana tx signature
  timestamp       DateTime
  tokenInMint     String
  tokenInAmount   Float
  tokenInSymbol   String?
  tokenOutMint    String
  tokenOutAmount  Float
  tokenOutSymbol  String?
  usdValueIn      Float                 // historical USD at trade time
  usdValueOut     Float
  costBasisUsd    Float?                // set on buys
  realizedPnlUsd  Float?                // set on sells
  createdAt       DateTime @default(now())

  @@index([walletAddress, timestamp])
}
```

---

## Pet States & Triggers

The dog is drawn with SVG layers so individual parts (eyes, mouth, tail, fire, tears, room) can be toggled or animated independently.

| State | Trigger | Visual |
|---|---|---|
| `neutral` | No trades today / first load | Dog sitting calmly, room on fire, flat expression |
| `happy` | Daily Net P&L > 0 (small gain) | Dog smiling, tail wag animation, flames turn orange-gold |
| `ecstatic` | Daily Net P&L > +10% of portfolio | Dog grinning wide, flames become rainbow/gold, confetti particles |
| `worried` | Daily Net P&L < 0 (small loss) | Dog frowning, eyebrows furrowed, more smoke |
| `sad` | Daily Net P&L < -5% of portfolio | Dog crying, tear animations, flames grow higher |
| `rugged` | Daily Net P&L < -20% of portfolio | Dog lying on the ground, room fully engulfed, skull particles |

State transitions use CSS class swaps with smooth `transition` properties. Each new trade event triggers a brief "pulse" animation before settling into the new state.

---

## Mobile Wallet Support

- Add `@solana-mobile/wallet-adapter-mobile` to the wallet adapter array
- This handles deep-link URI routing for Phantom and Solflare on iOS/Android
- Detect mobile UA on the client and render a QR-code modal fallback for desktop users scanning from phone
- Responsive layout: single-column on mobile (pet full-width top, P&L panel below), two-column on desktop

---

## Project Structure

```
PumpPet/
├── render.yaml                       # Render Blueprint
├── client/                           # Frontend (Vite + React)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Pet/
│   │   │   │   ├── Pet.tsx           # Orchestrates pet state
│   │   │   │   ├── PetSVG.tsx        # "This is Fine" dog layered SVG
│   │   │   │   └── pet.css           # Keyframe animations
│   │   │   ├── WalletButton.tsx      # Desktop + mobile wallet connect
│   │   │   ├── PnLDashboard.tsx      # Daily Net P&L display
│   │   │   └── TradeList.tsx         # Recent trades with per-trade P&L
│   │   ├── hooks/
│   │   │   ├── useTrades.ts          # Fetches + polls trade data
│   │   │   └── usePnL.ts             # Reads daily P&L from API
│   │   ├── lib/
│   │   │   └── api.ts                # Typed fetch helpers for /api/*
│   │   └── types.ts
│   └── package.json
├── server/                           # Backend (Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── trades.ts             # GET /api/trades
│   │   │   ├── pnl.ts                # GET /api/pnl
│   │   │   └── prices.ts             # GET /api/prices
│   │   └── lib/
│   │       ├── helius.ts             # Helius API client
│   │       ├── birdeye.ts            # Birdeye historical price client
│   │       ├── jupiter.ts            # Jupiter Price API client
│   │       └── pnl.ts                # P&L calculation logic (FIFO cost basis)
│   ├── tsconfig.json
│   └── package.json
└── PLAN.md
```

---

## Render Blueprint (`render.yaml`)

```yaml
databases:
  - name: pumppet-db
    databaseName: pumppet
    plan: free

services:
  - type: web
    name: pumppet-api
    env: node
    rootDir: server
    buildCommand: npm install && npx prisma generate && npm run build && npx prisma migrate deploy
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: pumppet-db
          property: connectionString
      - key: HELIUS_API_KEY
        sync: false
      - key: BIRDEYE_API_KEY
        sync: false
      - key: NODE_ENV
        value: production

  - type: web
    name: pumppet-frontend
    env: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        fromService:
          name: pumppet-api
          type: web
          property: host
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## Build Order

### Phase 1 — Scaffolding
- [ ] Initialize `client/` with Vite + React + TypeScript + Tailwind
- [ ] Initialize `server/` with Express + TypeScript + Prisma
- [ ] Write `render.yaml`
- [ ] Write Prisma schema and initial migration

### Phase 2 — Wallet + Data Pipeline
- [ ] Integrate `@solana/wallet-adapter-react` + `@solana-mobile/wallet-adapter-mobile` in client
- [ ] Build Helius Enhanced Transactions client in server
- [ ] Build Birdeye historical price client in server
- [ ] Build P&L calculation logic (FIFO cost basis, stablecoin detection, SOL-quoted trades)
- [ ] Implement trade ingestion endpoint (`POST /api/trades/sync`)
- [ ] Implement `useTrades` hook with 30s polling
- [ ] Implement `usePnL` hook (reads from `/api/pnl`, daily aggregation)

### Phase 3 — Pet
- [ ] Draw "This is Fine" dog as a layered SVG (`PetSVG.tsx`)
- [ ] Define CSS keyframe animations (tail wag, tears, fire flicker, confetti, skulls)
- [ ] Build `Pet.tsx` state machine (`neutral → happy → ecstatic → worried → sad → rugged`)
- [ ] Wire pet state to live P&L value from `usePnL`

### Phase 4 — UI Polish
- [ ] `PnLDashboard.tsx` — daily P&L, color-coded green/red, percent change
- [ ] `TradeList.tsx` — last 10 trades with per-trade realized P&L
- [ ] Responsive layout (mobile single-column, desktop two-column)
- [ ] Dark theme, meme-appropriate font (Comic Neue or similar)
- [ ] Trade event toast notifications

### Phase 5 — Deployment
- [ ] Test full flow locally with a real devnet/mainnet wallet
- [ ] Push to GitHub
- [ ] Connect repo to Render, apply Blueprint
- [ ] Set `HELIUS_API_KEY` and `BIRDEYE_API_KEY` env vars in Render dashboard

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `HELIUS_API_KEY` | Server (secret) | Helius RPC + Enhanced Transactions API key |
| `BIRDEYE_API_KEY` | Server (secret) | Birdeye historical price API key |
| `DATABASE_URL` | Server (secret) | PostgreSQL connection string (auto-set by Render) |
| `VITE_API_URL` | Client (build-time) | URL of the deployed backend API |
| `PORT` | Server | Injected by Render automatically |

---

## External API Notes

- **Helius**: Free tier gives 100k credits/month. Enhanced Transaction fetches cost ~1–5 credits each. Sign up at helius.dev.
- **Birdeye**: Free tier gives 1000 requests/month. Used only for non-stablecoin, non-SOL historical prices (uncommon). Sign up at birdeye.so.
- **Jupiter Price API**: Completely free, no key needed. `https://lite-api.jup.ag/price/v2?ids=<mint>` — used for live current prices only.
- **Solana RPC**: Use Helius RPC endpoint (`https://mainnet.helius-rpc.com/?api-key=...`) for reliable mainnet access.
