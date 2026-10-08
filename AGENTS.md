<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# AGENTS.md

Bots is a pnpm + Turborepo TypeScript monorepo. This file is the one source of truth for how to work in it.
It is intentionally short — most things are enforced by `./bin/verify` and CI instead of described here, so
this file can't drift out of sync with reality the way a long hand-written doc would.

## 1. Where things live, and the boundaries

```
apps/
  web/      Vite + React + Tailwind UI. Static today — does not call the API yet.
  api/      Fastify HTTP server. Owns all HTTP concerns. Only app allowed to open a port.
  worker/   Background job processor. Empty stub — no real code yet.

packages/
  agent-runtime/    The AgentRuntime interface + InMemoryAgentRuntime stub. Real logic lives here, not in apps/api.
  agent-adapters/   Will hold provider-specific adapters (Pi, Claude, etc.) behind AgentRuntime. Empty stub.
  database/         Prisma schema + generated client. The ONLY package that may import @prisma/client directly.
  tools/ browser/ computers/ memory/ connectors/ events/ security/ telemetry/ ui/
                    Empty stubs (`export {}`). Do not add speculative cross-package imports or
                    TS project references to a stub package before it has real exports — see
                    the "no speculative references" rule below.
  vendor/           Third-party code copied in with attribution. See THIRD_PARTY_NOTICES.md.
```

Boundaries that matter:

- **apps/api is the only thing that talks to the outside world over HTTP.** apps/web never calls a
  database or provider SDK directly; it calls apps/api.
- **packages/database is the only thing that imports `@prisma/client`.** Other packages that need data
  take it as a parameter or call through an interface — they don't reach into the schema themselves.
- **packages/agent-runtime defines the contract; apps/api and apps/worker consume it.** Don't put agent
  orchestration logic inside apps/api route handlers.
- **No speculative TS project references.** A `tsconfig.json` `references` entry to another package is
  only added when code actually imports from that package, and both sides need `"composite": true` at
  that point. Two of these were added by mistake during scaffolding with no real import behind them and
  broke every build until removed (see git history on `packages/connectors` and `packages/memory`) — that
  mistake is the reason this rule exists.

## 2. Fast checks vs full checks

While actively editing one package:

```
bin/test <package-name-or-path>     # e.g. bin/test @bots/agent-runtime
```

Runs lint + test scoped to that one package via Turborepo's dependency graph. This is the loop to run on
every save-equivalent; it's seconds, not minutes.

Before a PR is ready:

```
bin/verify                          # build + lint + test, whole repo
bin/verify --json                   # same, machine-readable for a CI-consuming tool
```

`bin/verify` is also what CI runs. If `bin/verify` passes locally, CI should pass. If it doesn't, don't
open the PR yet.

Do not run `pnpm build`, `pnpm lint`, `pnpm test` individually and call that "verified" — `bin/verify` runs
all three in the order that catches real breakage (a stub test passing says nothing if the build is
broken). See the no-fake-checks rule in §6.

## 3. Verifying each kind of change

- **Pure logic** (e.g. `packages/agent-runtime`): add/extend a vitest test next to the file
  (`Foo.test.ts`), run `bin/test <package>`. Don't rely on `tsc` alone — type-checking is not behavior
  verification.
- **API** (`apps/api`): add a test using Fastify's `.inject()` in `*.test.ts` (no real network, no port
  binding — see `server.test.ts`). For a change you want to see live, start the server
  (`pnpm --filter @bots/api exec tsx src/index.ts` or run the built `dist/index.js`) and `curl` it, then
  kill the process. Don't claim "the endpoint works" from the unit test alone if the change touches
  startup/listen behavior — that path isn't covered by `.inject()`.
- **Database** (`packages/database`): run `pnpm --filter @bots/database test` (wraps
  `prisma validate`, no live DB needed for schema syntax). For a schema change that needs a migration,
  start Postgres (§4), run `prisma migrate dev --create-only` first to inspect the generated SQL, then
  apply it. Never run `prisma migrate reset` or `db push` against anything but a disposable local
  container.
- **UI** (`apps/web`): `pnpm --filter @bots/web dev` and look at it. There is no UI test harness yet — if
  you add interactive behavior (not just layout), add one (e.g. Vitest + Testing Library) rather than
  shipping an unverified interaction. Don't describe a layout change as "verified" without actually opening
  the dev server — a successful `vite build` only proves it compiles, not that it renders correctly.
- **Infrastructure** (`docker-compose.yml`, `.github/workflows/*`, `turbo.json`, `tsconfig.base.json`):
  changes here affect every package. Run `bin/verify` from a clean `dist/` (see §4 cleanup) — a stale
  Turborepo cache can hide a config regression (this happened once: a tsconfig fix didn't show up until
  `dist/` was cleared and the build re-run with `--force`). For `docker-compose.yml`, run
  `docker compose config` to validate before `up`.
- **Documentation** (`AGENTS.md`, `docs/*`, `README.md`): no automated check exists for doc accuracy.
  Verify by hand: follow the instructions you wrote, on a machine state that doesn't already have the
  thing you're describing set up.

## 4. Safe commands, dry runs, and cleanup

Safe to run any time, no side effects outside the working tree:

```
pnpm build / pnpm lint / pnpm test / bin/verify / bin/doctor
```

Requires a dry run or explicit care:

```
prisma migrate dev            # mutates the target database's schema — use --create-only to inspect first
docker compose up -d          # starts long-running containers; see cleanup below
pnpm install                  # can change pnpm-lock.yaml — check the diff before committing
```

Starting/stopping local infra:

```
docker compose up -d postgres redis     # start only what you need
docker compose ps                       # check status
docker compose down                     # stop and remove containers (keeps named volumes)
docker compose down -v                  # also wipe postgres_data/redis_data — only for a disposable reset
```

Cleanup after a verification run:

```
docker compose down            # stop containers started for the test
rm -rf **/dist                 # if you suspect stale build output (bin/verify does not do this for you)
```

## 5. Reporting what changed

Every PR description (the template is pre-filled, see `.github/pull_request_template.md`) must state:

- The behavior that changed, in terms a reviewer can act on without reading the diff first.
- Risk: what breaks if this is wrong, and who/what is affected.
- The exact verification commands run and their actual output (paste it, or link the CI run — not a
  paraphrase of what you expect it to say).
- Links to evidence: test output, an API response, a screenshot, a trace. Strip secrets before attaching
  anything.
- Verification gaps: what you did not check, and why.

## 6. Do not claim a check passed unless it actually ran

This is the rule the rest of this file exists to make unnecessary as often as possible. Concretely:

- Never write "tests pass" / "lint is clean" / "builds fine" without having just run the command in this
  session and seen its exit code. If you ran it before an edit and then made another edit, that result is
  stale — rerun it.
- Every package's `test` and `lint` script must do real work or not exist. This repo used to have
  `"test": "echo 'test foo'"` stubs in every package, which made `pnpm test` report "18 successful" while
  checking nothing. They were removed; a package without real logic simply has no `test` script (Turborepo
  skips packages that don't define a task) rather than a script that fakes success. If you're adding a new
  package and don't have real behavior yet, follow that pattern — don't add an `echo` stub test "to make CI
  green."
- `bin/verify` (and CI) is the only thing allowed to report a change as verified. A self-report from the
  same agent that wrote the change is not independent verification — see `bin/review-diff` for what a
  second, fresh agent or CI job should run instead of trusting the implementer's summary.

## Independent verification (for a fresh agent or CI, not the implementer)

```
bin/review-diff [base-ref]      # defaults to comparing HEAD against main
```

This reproduces the change rather than reading a summary of it: shows the diff stat, flags source changes
with no corresponding test change, runs `bin/verify` fresh, and (if a `PR_ACCEPTANCE.md` is present in the
branch) prints the stated acceptance criteria next to the diff for manual cross-check. It does not approve
or merge anything — it surfaces discrepancies for a human to judge.

## What still depends on judgment, not automation

These are not checked by any script and need a human (or careful agent) read:

- Whether a PR's stated "what changed" actually matches the diff's scope (no automated scope-creep
  detector exists).
- Whether a UI change looks right — no visual regression tooling is set up.
- Whether a database migration is safe to run against production data (migrations are not simulated
  against production-shaped data anywhere yet).
- Documentation accuracy (§3).
- Whether an agent-written PR description is honest about verification gaps, per §5/§6.

## Merging

Human approval is required to merge, and for anything production-impacting. Auto-merge is not enabled.
This stays true until this repo has a longer track record of CI actually catching real breakage and a
tested rollback path — neither exists yet (there is no deployment pipeline at all today).
