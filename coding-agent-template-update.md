# Coding Agent Template Update Guide

This project consumes the upstream template stored one level above the repo at `../coding-agent-template`. Follow the rules below whenever you touch or extend any of the coding agent functionality.

## Core Rules

- **MUST** inspect `../coding-agent-template` before implementing new features or fixing bugs that live under `lib/coding-agent`, `app/builder`, or related surfaces.
- **MUST** track upstream changes (docs, components, scripts) and decide whether they need to be adopted here; log the decision in pull request notes.
- **MUST** prefer copy-syncing from the template over rewriting large sections by hand to preserve parity.
- **MUST** document any intentional deviations from the template in this file so future updates stay consistent.
- **SHOULD** check the template’s `README.md`, `AGENTS.md`, and `scripts/` for new capabilities before starting work.
- **SHOULD** run diffs (for example: `diff -ru ../coding-agent-template ./ | less`) to spot drift before and after changes.
- **SHOULD** open a tracking issue if upstream work cannot be adopted immediately.
- **NEVER** update coding-agent code paths in this repo without first confirming how the same area behaves upstream.

## Update Workflow

1. Open `../coding-agent-template` in your editor or split-pane terminal.
2. Identify the files or features you plan to change downstream.
3. Compare the corresponding upstream files (`git diff`, `meld`, or your preferred diff viewer).
4. Port over updates, adjusting imports, environment variables, and paths as needed.
5. Re-run local smoke tests (`pnpm lint`, `pnpm test`, `pnpm dev`) that apply to the affected areas.
6. Record any deliberate differences between upstream and downstream in this guide.
7. When the update is complete, mention in your PR description that you followed the steps in `coding-agent-template-update.md`.

Keeping this workflow tight ensures Social Forge stays aligned with improvements shipped in the shared coding agent template.

## Current Deviations

- The Builder experience in this repo lives under `app/builder/**` and `lib/coding-agent/**` (renamed from the template's `app/tasks/**` and `lib/**` structure). Maintain parity when upstream files move by mirroring the intent, not necessarily the exact path.
- Legacy `app/api/builder/tasks-api/**` routes from the template (Drizzle-based) have been removed in favor of the Prisma-backed endpoints under `app/api/builder/tasks/**`. Future upstream changes in those areas should be ported into the Prisma implementations.
- AI-generated branch naming now mirrors the template via `AI_GATEWAY_API_KEY` and the `lib/coding-agent/branch-names.ts` helper. When the key is absent or generation fails, tasks fall back to timestamped `agent/...` branch names captured in task logs.
- Builder landing experience mirrors the upstream layout, including GitHub OAuth, owner/repo selection, and deploy controls.
- **Authentication**: Uses `better-auth` instead of custom session management (upstream uses Jotai atoms for session state, we use better-auth OAuth with direct state management for compatibility with existing auth system).
- **API Session Handling**: All builder task APIs use `auth.api.getSession({ headers })` instead of upstream's custom session utilities to work with better-auth.
- **Session Utilities**: The `lib/coding-agent/session.ts` file has been adapted to use better-auth's `auth.api.getSession()` instead of NextAuth's `getServerSession()`.
- **OAuth Integration**: GitHub sign-in uses better-auth's `signIn.social()` method instead of manual redirects to ensure proper OAuth flow and redirect handling.
- **GitHub Token Management**: Updated GitHub token retrieval to use better-auth's `Account` table instead of `BuilderApiKey` table, ensuring proper OAuth token access for GitHub API calls.
- **API Response Structure**: Fixed GitHub repos API to return `{ repos: Repo[] }` structure expected by the RepoSelector component, preventing runtime errors.
- **Sandbox Timeout Limits**: Updated sandbox timeout configuration to respect Vercel's maximum limit of 45 minutes, preventing 400 errors during sandbox creation.
- **File Diff Viewer Error Handling**: Simplified error handling in FileDiffViewer to match upstream template, removing complex sandbox fallback logic that was causing issues.
- **Sandbox File Reading**: Updated file-content API to normalize file paths and add proper error handling for sandbox file operations, matching upstream implementation.
- **API Route Paths**: Updated task form API key check endpoint to use `/api/builder/api-keys/check` instead of `/api/api-keys/check` to match Social Forge's builder API route structure.
- **Database ORM**: Uses Prisma instead of Drizzle ORM. All database operations have been adapted to work with the existing Prisma schema and client.
- **Cookie Management**: Uses `js-cookie` dependency to maintain sync with upstream template for easier future updates.
- **Component Structure**: All coding agent components are organized under `components/builder/` and `components/auth/` for better organization within the Social Forge structure.
- **API Routes**: All coding agent API routes are prefixed with `/api/builder/` to maintain clear separation from other Social Forge functionality.

## Upstream Snapshot

- Source repository: `../coding-agent-template`
- Snapshot commit: `4f26ee7f2ba577464bc9a10fe5412ff6e4bcf922` (main)
- High-level architecture:
  - `app/` – Next.js routes; especially `app/tasks/**` for the builder UI and API routes.
  - `components/` – shared React components (task UI, layout, dialogs, sandboxes, etc.).
  - `lib/` – domain logic (auth, sandbox orchestration, GitHub, connectors, drizzle db schema, utility helpers).
  - `scripts/` – project automation (seeding, database utilities, maintenance scripts).
  - `drizzle.config.ts` & `lib/db/**` – Drizzle ORM configuration and schema (replaced here with Prisma models).
- Keep this section updated whenever we rebase from upstream; note the commit and any structural changes introduced there.
