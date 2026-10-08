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

## Chat UI shell (static, not yet wired to the API)

- **Entry point:** `apps/web` root route, rendered by `App.tsx`.
- **Code:** `apps/web/src/App.tsx`.
- **Reproduce:** `pnpm --filter @bots/web dev`, open the printed localhost URL.
- **Expected behavior:** sidebar nav + a hardcoded example conversation render. No backend call is made —
  this is layout only. Do not describe this as "chat works" in a PR; it's a static mock.
- **Evidence:** screenshot from the dev server, or `pnpm --filter @bots/web build` output.

Add the next entry (e.g. "send a chat message end-to-end") once the web UI actually calls the API and the
API actually calls the agent runtime — that integration doesn't exist yet.
