# PR Acceptance Criteria — Phase 1: Chat Loop

## Scope
This PR implements Phase 1 of the roadmap on the `feature/phase-1-chat-loop` branch:
- API routes for creating conversations and posting messages (with persistence via Prisma/SQLite in tests).
- Web UI that wires `App.tsx` to call the API for sending/receiving messages.
- Tests for both the API (Fastify `.inject()`) and the Web UI (Vitest + Testing Library).

## Acceptance Criteria

### 1. API Routes
- `POST /conversations` creates a conversation seeded from the default Bot and returns it.
- `GET /conversations/:id` returns the conversation with its message history.
- `POST /conversations/:id/messages` posts a user message, triggers the agent runtime (InMemoryAgentRuntime), and returns the full message list.
- All routes are registered in Fastify via `server.ts`.

### 2. Database
- Prisma schema defines `Conversation` and `Message` models matching the production Postgres schema.
- Tests use an SQLite-based Prisma client (`test-db.ts`) — no Docker dependency.
- `test-db.ts` auto-generates the schema via `prisma db push` on import.

### 3. Web UI
- `App.tsx` replaces the static mock UI with a chat interface that:
  - Shows a welcome message when no conversation exists.
  - Creates a conversation on first message send (calls `POST /conversations`).
  - Sends messages via `POST /conversations/:id/messages`.
  - Displays both user and assistant messages with timestamps.
  - Shows a loading indicator while waiting for a response.
  - Disables input and send button while a request is in flight.
  - Sends on Enter key press (not Shift+Enter).
- The Vite dev server proxies `/conversations` to `localhost:3000` (the API).

### 4. Tests
- **API tests** (`routes.test.ts`): 8 tests covering creation, retrieval, and messaging.
- **Web tests** (`App.test.tsx`): 5 tests covering initial render, send flow, loading state, and keyboard interaction.
- All tests use mocked fetch/SQLite — no external services needed.

### 5. Code Quality
- `bin/verify` passes (build + lint + test, full repo).
- No unused imports/variables (per `@typescript-eslint` rules).
- Follows AGENTS.md conventions: `.inject()` for HTTP tests, no speculative TS references.

## Verification Commands
```bash
bin/verify              # build + lint + test — full repo
bin/test apps/api       # API package tests
bin/test apps/web       # Web package tests
```

## Risk Assessment
- **Low**: The InMemoryAgentRuntime returns canned text only — no external provider dependency.
- **Low**: SQLite in tests avoids Docker/runtime mismatches that previously broke CI.
- **Known gap**: The API only creates a conversation on first send but doesn't yet fetch the initial conversation state on page load. A real SPA would call `GET /conversations/:id` on mount. This is acceptable for Phase 1 (the conversation is created inline).

## Verification Gaps
- No end-to-end browser test (Playwright/Cypress not set up yet).
- No auth/multi-tenancy — everything runs under the single seeded user.
- No streaming UI — the API returns the full response after the agent loop completes, so the UI updates atomically.
