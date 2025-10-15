# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Next.js routes, layouts, and server actions; keep new pages colocated with their route-specific components.
- Shared UI lives in `components/`, with primitives in `atoms/` and form logic in `hooks/`; reuse before adding new variants.
- Domain logic sits under `lib/` and `utils/`; expand these modules instead of scattering helpers in feature folders.
- Static assets and public fonts/icons belong in `public/`; MDX content enters through `content/` and is registered via `content-collections.ts`.

## Build, Test, and Development Commands
- `pnpm install` sets up dependencies and Prisma clients (runs `prisma generate` post-install).
- `pnpm dev` launches the Next.js dev server with Turbopack; watch for console warnings before committing.
- `pnpm build` compiles production bundles; run before release branches to catch build-time errors.
- `pnpm lint` enforces TypeScript, accessibility, and Tailwind conventions defined in `eslint.config.mjs`.
- `pnpm prisma:push` syncs schema to your dev database; use with a disposable playground DB only.

## Coding Style & Naming Conventions
- TypeScript is mandatory; keep files typed, prefer explicit return types for shared utilities.
- Follow the repository’s functional React pattern; use server components by default and convert to client components only when hooks or interactivity demand it.
- Use Tailwind classes plus component-level variants (`class-variance-authority`) instead of ad hoc inline styles.
- Match existing naming: `PascalCase` for components, `camelCase` for helpers, kebab-case for files, and prefix server actions with `action`.
- Run `pnpm lint --fix` before submitting; add minimal comments to explain non-obvious logic.

## Testing Guidelines
- No automated test harness ships yet; exercise new flows manually in Chromium, Safari, and mobile emulation.
- For interactive UI (drag/drop, forms), record test plans in the PR and ensure accessible keyboard paths match the WAI-ARIA APG patterns used in Radix components.
- When adding a testing framework, colocate specs under the relevant feature directory and mirror component naming (e.g., `component-name.test.tsx`).

## Commit & Pull Request Guidelines
- Recent commits follow concise, sentence-case imperatives (e.g., “Enhance user feedback…”). Continue that style and scope each commit to a single concern.
- Pull requests must describe the change, list verification steps (`pnpm lint`, `pnpm build`), and include screenshots or screen recordings for UI tweaks.
- Link to Linear/GitHub issues when applicable, call out schema or config updates, and confirm Prisma migrations are safe.
- Highlight any accessibility, performance, or UX improvements and note follow-up tasks as checklists.
