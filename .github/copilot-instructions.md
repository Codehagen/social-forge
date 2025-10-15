# Copilot Instructions

## Architecture Snapshot
- Next.js App Router with route groups in `app/`: marketing `app/(marketing)`, auth `app/(auth)`, vendored builder `app/(builder)`, and authenticated dashboard under `app/dashboard`.
- The workspace-centric domain sits in Prisma (`prisma/schema.prisma`) and server actions (`app/actions`); always scope queries to the active workspace rather than trusting client input.
- Authentication flows through Better-auth (`lib/auth.ts`, `lib/auth-client.ts`); middleware only checks for the session cookie—real auth must happen in server actions/components.

## Server Actions & Authorization
- New mutations belong in `app/actions/*.ts` with the `"use server"` directive, fetching the session via `auth.api.getSession({ headers: await headers() })`.
- Reuse `resolveWorkspaceContext` and the `assert*` helpers in `app/actions/site.ts` to enforce membership, prevent cross-workspace access, and normalize workspace fallbacks.
- After writes, call `revalidatePath` for `/dashboard` and feature routes (e.g. `/dashboard/projects`) to keep server components in sync.
- When context is missing, redirect early (`redirect("/sign-in")`, `/onboarding`) as shown in `app/dashboard/page.tsx` and `app/onboarding/page.tsx`.

## Data & Prisma
- Import the singleton Prisma client from `lib/prisma.ts` (Accelerate enabled); do not instantiate raw `new PrismaClient()` outside `lib/auth`.
- Prisma scripts must pass `--no-engine`; use the provided commands (`pnpm prisma:generate`, `pnpm prisma:push`, `pnpm prisma:migrate`) instead of ad hoc CLI calls.
- Keep site lifecycle logic aligned with `SiteStatus`, `BuilderSessionStatus`, and transfer models—see `app/actions/site.ts` for the authoritative behavior.

## UI & Content Patterns
- Default to server components and add `"use client"` only when hooks/events are required; follow existing patterns in `components/dashboard` and `components/ui`.
- Tailwind utilities plus the `cn` helper (`lib/utils.ts`) and `class-variance-authority` power styling—reuse existing variants before introducing new ones.
- Metadata comes from `constructMetadata` (`lib/constructMetadata.tsx`) which relies on `HOME_DOMAIN`; adjust both when changing domains.
- MDX content is managed by `content-collections.ts`; define new docs by extending the collections rather than manual MDX loading.

## Builder Integration
- The AI builder is vendored under `app/(builder)/builder` with supporting UI in `components/lovable/` and deployment logic in `lib/publish/*`.
- Builder sessions persist through Prisma (`BuilderSession`); mutations should extend the helpers in `app/actions/site.ts` to maintain audit trails and workspace scoping.
- When touching builder styling, rebuild assets with `pnpm build:lovable:css` to refresh generated CSS.

## Local Workflows & Tooling
- Core commands: `pnpm dev` (Turbopack), `pnpm build`, `pnpm lint`; run linting with `--fix` before sharing patches to honor repo formatting.
- Database bootstrap: `pnpm prisma:generate` followed by `pnpm prisma:push` against a disposable development database.
- Required env vars live in `.env.example`; builder features need API keys (Anthropic, OpenAI, Firecrawl) plus Vercel tokens for publishing.
- Theme and state providers are wired in `app/layout.tsx` (Geist fonts, `ThemeProvider`, `NuqsAdapter`, `Toaster`); wrap new layouts accordingly.
