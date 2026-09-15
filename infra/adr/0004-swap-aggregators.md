# ADR 0004 — Swap aggregators (planned)

- Status: proposed
- Date: 2026-09-15

## Context

Gasless swaps should hit the best public liquidity per chain. The product brief names Jupiter (Solana) and 0x / 1inch (EVM). Quotes, signing, and submission must happen on the server or via the embedded-wallet provider — never in the client.

## Decision (intent, not implemented)

When swap execution ships:

1. `SwapProvider` interface per chain (`quote`, `buildTransaction`).
2. Solana: Jupiter Ultra / v6 API.
3. EVM: 0x Swap API or 1inch Aggregation, plus a relayer that sponsors gas and takes a documented spread.
4. Fiat on-ramp: Stripe / MoonPay / Ramp behind another interface.

No aggregator is wired in milestone 1. Token detail UI is a placeholder so navigation from the feed works.

## Consequences

- Contributors should add a new ADR when the first real provider is chosen.
- Fee/spread logic belongs next to the relayer, with tests, not in the mobile app.
