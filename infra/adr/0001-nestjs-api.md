# ADR 0001 — NestJS for the API

- Status: accepted
- Date: 2026-09-15

## Context

Kite needs REST, a WebSocket gateway, cron jobs (leaderboard), request validation, and auth guards. Fastify is faster at the HTTP layer; NestJS gives modules, DI, and first-class Socket.IO + scheduling.

## Decision

Use **NestJS 11** (Express adapter) for `apps/api`. Keep the HTTP surface versioned under `/v1`.

## Consequences

- Contributors get a conventional module layout (`auth`, `wallets`, `feed`, `leaderboard`).
- We can swap the platform adapter later if we need Fastify performance.
- Prisma is wrapped in a global `PrismaService` rather than leaking the client into controllers.
