# Feature registry

One entry per real, exercisable user-facing flow. A package with no behavior yet does not get an entry —
add one when it does something a user or client can trigger.

## API health check

- **Entry point:** `GET /health` on the `@bots/api` Fastify server (`apps/api/src/server.ts`).
- **Code:** `apps/api/src/server.ts` (`buildServer`), started by `apps/api/src/index.ts`.
- **Reproduce:**
  - Unit level (no network, no process): `pnpm --filter @bots/api test` — uses Fastify's `.inject()`.
  - Live: `pnpm --filter @bots/api exec tsx src/index.ts` (or `node --loader` once built), then
    `curl -s localhost:3000/health`.
- **Expected behavior:** `200` with body `{"status":"ok"}`.
- **Evidence:** `apps/api/src/server.test.ts` assertion output from `pnpm --filter @bots/api test`.

## Core chat loop (Phase 1)

- **Entry points:** `POST /conversations`, `GET /conversations/:id`, `POST /conversations/:id/messages` on `@bots/api`.
- **Code:** `apps/api/src/routes.ts` (routes + seed helpers), `apps/api/src/server.ts` (registration),
  `packages/database/prisma/schema.prisma` (schema), `packages/agent-runtime/src/InMemoryAgentRuntime.ts` (simulated agent).
- **Web UI:** `apps/web/src/App.tsx` creates a conversation on first send, posts messages, and displays
  the full message list (user + assistant) with timestamps and loading state.
- **Reproduce:**
  - API tests: `bin/test apps/api` (8 tests, SQLite-backed, no Docker).
  - Web tests: `bin/test apps/web` (5 tests, Vitest + Testing Library).
  - Live: start both servers (`pnpm --filter @bots/api exec tsx src/index.ts` + `pnpm --filter @bots/web dev`),
    open the web dev URL, type a message, and see the assistant's canned reply.
- **Expected behavior:** sending a message creates a conversation if needed, persists it in the database,
  triggers the `InMemoryAgentRuntime` (returns simulated streaming text), and the UI displays both
  user and assistant messages with correct roles and timestamps.
- **Evidence:** `apps/api/src/routes.test.ts` and `apps/web/src/App.test.tsx` test output from `bin/test`.

## Chat UI shell (static, not yet wired to the API)

- **Entry point:** `apps/web` root route, rendered by `App.tsx`.
- **Code:** `apps/web/src/App.tsx`.
- **Reproduce:** `pnpm --filter @bots/web dev`, open the printed localhost URL.
- **Expected behavior:** sidebar nav + a hardcoded example conversation render. No backend call is made —
  this is layout only. Do not describe this as "chat works" in a PR; it's a static mock.
- **Evidence:** screenshot from the dev server, or `pnpm --filter @bots/web build` output.
