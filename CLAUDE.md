# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use **pnpm** for package management.

## Development Commands

```bash
# Development
pnpm dev                  # Start dev server with Turbopack

# Build
pnpm build                # Production build with Turbopack
pnpm build:lovable:css    # Build Lovable builder CSS

# Linting
pnpm lint                 # Run ESLint

# Database (Prisma)
pnpm prisma:generate      # Generate Prisma client (uses --no-engine flag)
pnpm prisma:push          # Push schema changes to database
pnpm prisma:migrate       # Run migrations (uses --no-engine flag)

# Note: All Prisma generation commands MUST use the --no-engine flag
```

## Architecture

### Dual-Layer System

Social Forge uses a **dual-layer architecture** separating authentication from business logic:

1. **Authentication Layer** (Better-auth)
   - User identity and session management
   - OAuth providers (Google, GitHub)
   - Cookie-based session handling
   - Server: `lib/auth.ts` with `auth.api.getSession()`
   - Client: `lib/auth-client.ts` with `authClient` and `useSession()` hook

2. **Application Layer** (Multi-tenant Workspaces)
   - Workspace-based multi-tenancy for agency/client management
   - Role-based access control: OWNER, ADMIN, MEMBER, VIEWER
   - Site/project organization within workspaces
   - Active workspace tracking via session context

### Database Architecture

**Prisma ORM** with PostgreSQL (via Prisma Accelerate):

- **User**: Identity layer (Better-auth managed)
- **Workspace**: Multi-tenant containers for clients/projects
- **WorkspaceMember**: User-workspace relationship with roles
- **Site**: Website projects with versioning and deployment tracking
- **SiteVersion**: Immutable snapshots of site states
- **SiteEnvironment**: Development/Preview/Production environments
- **BuilderSession**: AI builder conversation tracking
- **Client**: Optional client organization within workspaces

**Key Pattern**: Prisma client is instantiated in `lib/prisma.ts` with Accelerate extension and global singleton pattern for dev hot-reloading.

### App Router Structure

```
app/
├── (marketing)/         # Public marketing pages (no auth)
├── (auth)/              # Authentication pages (sign-in, etc.)
├── (builder)/builder/   # Vendored Open Lovable AI builder
├── dashboard/           # Main dashboard (protected)
├── onboarding/          # First-time user onboarding
├── actions/             # Next.js server actions
│   ├── dashboard.ts     # Dashboard data operations
│   ├── workspace.ts     # Workspace CRUD and switching
│   ├── site.ts          # Site/project operations
│   └── onboarding.ts    # Onboarding flow
└── api/                 # API routes
    ├── auth/            # Better-auth endpoints
    ├── builder/publish/ # Builder publish endpoint
    └── workspace/switch/# Workspace switching API
```

**Route Groups**: Parentheses indicate route groups that don't affect URL structure but allow layout/middleware grouping.

### Server Actions Pattern

Server actions in `app/actions/` use the `"use server"` directive and follow this pattern:

1. Get session via `auth.api.getSession({ headers: await headers() })`
2. Verify user authorization
3. Perform database operations via Prisma
4. Use `revalidatePath()` for cache invalidation
5. Return serializable data (no functions, Date objects as strings)

**Example**: `workspace.ts` - `switchWorkspace()` updates session's `activeWorkspaceId` and revalidates dashboard.

### Workspace Context System

The **active workspace** determines what data users see:

1. Session table has `activeWorkspaceId` field
2. `getCurrentWorkspace()` checks: session activeWorkspace → user defaultWorkspace → first joined workspace
3. `switchWorkspace()` updates all user sessions to new workspace
4. Workspace switching triggers redirect to `/dashboard` for context refresh

**Important**: Always verify workspace membership before operations.

### Middleware

`middleware.ts` performs **cookie-based pre-checks** (not full auth verification):

- Redirects authenticated users away from `/sign-in`
- Redirects unauthenticated users from protected routes (`/dashboard`)
- Protected routes list: `["/dashboard", "/settings"]`

**Note**: Actual authentication verification happens in server components/actions, not middleware.

## Coding Agent Workspace

- The coding agent lives at `/builder` and is the primary UI for sandboxed automation.
- Tasks are created via `POST /api/builder/tasks` and persisted in the `BuilderTask` Prisma model.
- Follow-up prompts reuse `POST /api/builder/tasks/:id/continue` while the sandbox is alive.
- Publishing wraps `/api/builder/publish` and expects an active sandbox (the endpoint now accepts `taskId`).

### Agent Environment Variables

| Agent | Required variables |
| --- | --- |
| Claude | `ANTHROPIC_API_KEY` |
| Codex | `AI_GATEWAY_API_KEY` |
| Copilot | GitHub OAuth (provides `GITHUB_TOKEN`) + optional `AI_GATEWAY_API_KEY` |
| Cursor | `CURSOR_API_KEY` |
| Gemini | `GEMINI_API_KEY` |
| OpenCode | `AI_GATEWAY_API_KEY` or `ANTHROPIC_API_KEY` |

Only Claude is enabled in the UI by default; the other agents are scaffolded and will surface descriptive errors until their CLI requirements are satisfied.

### Sandbox Credentials

The following variables must be present to create and reconnect Vercel sandboxes:

- `SANDBOX_VERCEL_TEAM_ID`
- `SANDBOX_VERCEL_PROJECT_ID`
- `SANDBOX_VERCEL_TOKEN`

## Site Lifecycle States

Sites progress through these states (see `prisma/schema.prisma` - `SiteStatus`):

1. **DRAFT**: Initial creation and editing
2. **REVIEW**: Ready for internal review
3. **READY_FOR_TRANSFER**: Prepared for client handoff
4. **LIVE**: Deployed and active
5. **ARCHIVED**: Soft-deleted

**Site Transfers**: `SiteTransfer` model handles workspace-to-workspace handoff (PENDING → ACCEPTED/DECLINED).

## Environment Variables

Required in `.env` or `.env.local`:

```bash
# Database (Prisma Accelerate or standard PostgreSQL)
DATABASE_URL="prisma+postgres://..."

# Authentication (Better-auth)
BETTER_AUTH_SECRET="..."           # Min 32 chars, generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Builder APIs (removed - no longer needed)
# FIRECRAWL_API_KEY="..."           # Web scraping for URL cloning
# ANTHROPIC_API_KEY="..."           # Claude models
# OPENAI_API_KEY="..."              # GPT models
# GEMINI_API_KEY="..."              # Gemini models
# GROQ_API_KEY="..."                # Groq models

# Sandbox/Deployment (removed - no longer needed)
# SANDBOX_PROVIDER="vercel"
# VERCEL_TOKEN="..."                # For Vercel deployment
# VERCEL_TEAM_ID="..."
# PUBLISH_STRATEGY="vercel"         # Options: vercel | zip | workspaceSave
```

## Key Technical Details

### Better-auth Configuration

- **Adapter**: Prisma adapter with "sqlite" provider designation (works with PostgreSQL)
- **Providers**: Email/password + Google OAuth
- **Session**: Cookie-based with `nextCookies()` plugin
- **Server Helper**: `getCurrentUser()` in `lib/auth.ts`
- **Client Exports**: `signIn()`, `signOut()`, `signUp()`, `useSession()` from `lib/auth-client.ts`

### Content Collections

Uses `@content-collections/next` for MDX content (blog posts, etc.):

- Config: `content-collections.ts`
- Content: `content/` directory
- Wrap Next config: `withContentCollections(nextConfig)`

### UI Components

- **Shadcn/ui**: Component library in `components/ui/`
- **Lovable Components**: Namespaced in `components/lovable/`
- **Dashboard Components**: `components/dashboard/`
- **Tailwind**: Custom config merges app and builder styles

### Type Safety

- **TypeScript**: Strict mode enabled
- **Prisma Types**: Auto-generated in `node_modules/.prisma/client/`
- **Build Config**: `typescript: { ignoreBuildErrors: true }` in `next.config.ts` (should be addressed in production)

## Common Patterns

### Getting Current User

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
const user = session?.user;
```

### Database Queries

```typescript
import prisma from "@/lib/prisma";

const workspace = await prisma.workspace.findUnique({
  where: { id: workspaceId },
  include: { members: true }
});
```

### Workspace-Scoped Queries

```typescript
const sites = await prisma.site.findMany({
  where: { workspaceId: currentWorkspace.id },
  include: { activeVersion: true }
});
```

### Server Actions

```typescript
"use server";

export async function myAction(data: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  // Perform operation
  await prisma.something.create({ ... });

  revalidatePath("/dashboard");
  return { success: true };
}
```

## Important Gotchas

1. **Prisma Generate**: Always use `npx prisma generate --no-engine` (not `pnpm prisma generate` directly)
2. **Workspace Context**: Always check workspace membership before allowing operations
3. **Middleware**: Only checks cookie existence, not session validity - verify auth in components
4. **Builder Routes**: Builder routes are mocked and show placeholder content
5. **Session Updates**: After workspace switch or auth changes, redirect to force context refresh
6. **Build Errors**: `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` are set - fix TS/lint issues properly
