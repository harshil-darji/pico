# Bots

**Bots** is an original platform for persistent, self-hosted AI teammates. Inspired by the concept of always-on AI companions but built from scratch as an independent project, Bots gives you full control over your AI's personality, memory, tools, and integrations — all running on your own infrastructure.

> This platform is inspired by the general concept of AI bots (popularized by products like Grok Bots), but Bots is an independent build with its own architecture, codebase, and design. We are not copying any existing product; we are building a fresh, open, self-hosted alternative.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# Run all services in dev mode
pnpm dev
```

## Architecture

This monorepo uses [Turborepo](https://turbo.build/) for task orchestration and [pnpm workspaces](https://pnpm.io/workspaces) for package management.

| Workspace     | Description                        |
| ------------- | ---------------------------------- |
| `apps/web`    | Web UI / dashboard                 |
| `apps/api`    | REST/GraphQL API server            |
| `apps/worker` | Background job processor           |
| `packages/*`  | Shared libraries and abstractions  |

See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for third-party code attribution.
