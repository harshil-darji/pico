# Roadmap

This is the phase breakdown for the full Bots platform, checked in so any agent or session
picking up this repo sees the same plan without re-deriving it from chat history. Update this
file when a phase starts, lands, or gets reordered — treat it like `docs/features.md`: it
should describe reality, not aspiration.

Phase and package boundaries follow the structure already laid out in `AGENTS.md` §1.

## Status

| Phase | Slice | Touches | State |
|---|---|---|---|
| 0 | Scaffold, Prisma schema, `AgentRuntime` interface + in-memory stub, agent-friendly engineering workflow (`AGENTS.md`, CI, `bin/*`) | everything | Done |
| 1 | Core chat loop: `apps/web` → `apps/api` → `packages/agent-runtime`, persisted via `Conversation`/`Message`, basic single-user session | `apps/web`, `apps/api`, `packages/agent-runtime` | Not started |
| 2 | Real agent adapter (e.g. Claude or Pi) behind `AgentRuntime`, model/secret config per bot | `packages/agent-adapters` | Not started (empty stub) |
| 3 | Bot management: create/edit/configure a bot, multi-bot UI, ownership via `Bot`/`User` | `apps/api`, `apps/web`, `packages/database` | Not started (schema only) |
| 4 | Real auth + multi-tenancy, per-user data isolation | `apps/api`, `packages/security` | Not started (empty stub) |
| 5 | Tool execution + approval workflow (`Approval` model) | `packages/tools` | Not started (empty stub) |
| 6 | Memory/RAG: embeddings, retrieval per bot/conversation (`Memory` model) | `packages/memory` | Not started (empty stub) |
| 7 | Browser + computer use: sandboxed automation, screenshots (`BrowserProfile`/`Computer` models) | `packages/browser`, `packages/computers` | Not started (empty stubs) |
| 8 | External integrations — Slack/Discord/webhooks (`Connector` model) | `packages/connectors` | Not started (empty stub) |
| 9 | Background jobs / scheduling, turn worker into a real processor (`Schedule` model) | `apps/worker`, `packages/events` | Not started (empty stub) |
| 10 | Observability: logging, tracing, usage/cost metrics | `packages/telemetry` | Not started (empty stub) |
| 11 | Artifacts: generated files/outputs surfaced in UI (`Artifact` model) | `packages/database`, `apps/web` | Not started (schema only) |
| 12 | Production hardening: deployment pipeline, rollback, security review | infra-wide | Not started (no deployment pipeline exists at all) |

## Sequencing

Phases 1-4 are a dependency chain, not independent slices — building bot management (3) or
auth (4) before the chat loop (1) exists is wasted work, since there's nothing real for either
to attach to yet. Do these in order, one at a time.

Phases 5-11 are genuinely independent of each other once 1-4 land: each owns a single package
with no cross-imports into another phase's package (`AGENTS.md`'s "no speculative TS project
references" rule keeps this true). These are safe to parallelize — run as separate branches,
separate worktrees, separate PRs.

Phase 12 isn't a slice, it's ongoing hardening that starts once there's something worth
deploying and a track record of CI catching real breakage.

## Running phases 5-11 in parallel

- One git worktree and one branch per phase. Don't let two in-flight phases share a worktree.
- Each PR gets its own `PR_ACCEPTANCE.md` stating what it claims to do, so `bin/review-diff`
  (or a fresh agent/CI) can check the claim against the diff without trusting the implementer's
  summary.
- Merge one at a time, not all at once — even with disjoint package code, every PR touches
  `pnpm-lock.yaml` and potentially `turbo.json`, which will conflict if merged concurrently.
- Rebase each open phase branch after every merge rather than letting several drift against a
  stale `main` simultaneously.

## Carrying this forward

A new session or agent (Claude or otherwise) doesn't need this conversation replayed: `CLAUDE.md`
points to `AGENTS.md` for how to work in the repo, `docs/features.md` lists what's actually
exercisable today, and this file lists what's planned and in what order. Keep all three current
instead of re-deriving the plan from chat history each time.
