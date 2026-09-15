# ADR 0003 — Socket.IO for the live feed

- Status: accepted
- Date: 2026-09-15

## Context

The home feed needs pull-to-refresh plus push of new trades. Native `ws` is smaller; Socket.IO adds reconnection, namespaces, and rooms, and NestJS ships `@nestjs/websockets` + `@nestjs/platform-socket.io`.

## Decision

Use **Socket.IO** on namespace `/feed`. Clients authenticate with the access JWT (`handshake.auth.token`). All connected clients join room `live`. A later change can fan out only to `user:{id}` rooms filtered by the follow graph.

A development `FeedSimulatorService` writes demo trades and emits `trade` events every 4.5s (`FEED_SIMULATOR_ENABLED`).

## Consequences

- Mobile uses `socket.io-client`.
- Production should disable the simulator and emit from the indexer/worker instead.
