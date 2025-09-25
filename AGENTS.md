# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Next.js App Router routes, server actions, and API handlers; keep feature logic close to the route directories.
- `components/` stores shared UI built with shadcn/Radix; co-locate snapshots or tests under `__tests__`.
- `lib/` centralizes domain utilities, AI provider clients, and server actions; `lib/db/` works with Drizzle schema and migration runner while generated SQL sits in `drizzle/`.
- `config/` holds AI model profiles and integrations, `docs/` expands on deployment/configuration, `public/` serves static assets, and `scripts/` includes Bun CLIs such as `chat-cli.ts`.
- Environment templates live in `.env.local.example`; update secrets locally and never commit `.env`.

## Build, Test, and Development Commands
- `bun install` syncs dependencies (target Bun 1.2.12+).
- `bun run dev` launches Next.js with the Turbo dev server; `bun run build` and `bun run start` produce and serve the optimized build.
- `bun run db:migrate` applies Drizzle migrations; use `bun run db:migrate:restricted` for restricted database roles.
- `bun run lint`, `bun run typecheck`, and `bun run format:check` gate changes; run `bun run format` before large refactors.
- `bun run test` executes Vitest suites once, while `bun run test:watch` keeps the feedback loop tight.

## Coding Style & Naming Conventions
- Prettier enforces 2-space indentation, no semicolons, single quotes, and trailing comma removal; rely on the project VS Code settings or `bun run format`.
- ESLint extends `next/core-web-vitals` and requires `simple-import-sort` groups that prioritize React/Next, third-party packages, then `@/` aliases.
- Prefer PascalCase React components inside `components/`, camelCase utilities in `lib/`, and hyphenated route folders under `app/`.
- Use the `@/...` alias for internal imports instead of deep relative paths.

## Testing Guidelines
- Tests live beside features in `__tests__` folders and use Vitest with Testing Library (`vitest.setup.ts` wires jsdom and matchers).
- Name files `*.test.ts` or `*.test.tsx` so Vitest picks them up; integration suites for database logic belong in `lib/db/__tests__`.
- Before pushing, run `bun run test` plus `bun run lint` to keep CI green; target meaningful assertions over snapshots.
- Database-dependent specs require a configured `DATABASE_URL`; use disposable schemas to avoid polluting shared instances.

## Commit & Pull Request Guidelines
- Follow conventional commit prefixes from history (`feat:`, `fix:`, `refactor:`) with imperative, lowercase summaries under 72 characters.
- Scope each commit to one logical change and isolate configuration updates in standalone commits when possible.
- PRs should describe intent, list key changes, and link related issues; attach screenshots or terminal output when UI or CLI behavior changes.
- Confirm lint, type check, tests, and migrations have run locally before requesting review; note any skipped steps explicitly.
