# ADR 0002 — Embedded wallet provider behind an interface

- Status: accepted
- Date: 2026-09-15

## Context

Users must never see a seed phrase. EVM accounts should be ERC-4337-style smart accounts (Base, Ethereum); Solana needs an embedded keypair from the same vendor. Candidate SDKs: Alchemy Account Kit, Privy, Turnkey.

We cannot pick a production vendor until keys, SLAs, and sponsorship are contracted. Shipping a real SDK now would bake secrets and vendor lock-in into the first milestone.

## Decision

Define `WalletProvider` in `apps/api/src/wallets/providers/wallet-provider.interface.ts`.

The default implementation is `StubWalletProvider`:

- Derives **display addresses only** with SHA-256. It does not generate, store, or return private keys.
- Provisions Solana + Base + Ethereum rows on first OTP verify.
- Is bound with `WALLET_PROVIDER` so a real SDK can replace it without touching auth.

## Consequences

- Milestone 1 can complete signup → session → `/wallets/me` without custody risk.
- A later ADR will record the chosen vendor and the mapping of their user id onto `Wallet.providerRef`.
- **Never** put signing material in the React Native app.
