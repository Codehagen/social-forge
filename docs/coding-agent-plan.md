# Coding Agent Integration Plan

## Objectives
- Embed Vercel Labs coding agent template inside Social Forge without breaking existing builder workflows.
- Support workspace-scoped agent sessions that can operate on Social Forge sites, builder sessions, and deployment pipelines.
- Add Git sync so agent-driven branches stay in step with upstream repositories.

## Workstreams

- [x] Decide hosting shape for agent runner (embed as App Router routes + server actions vs background worker) and sandbox orchestration.
- [x] Define Git sync requirements: repository credential storage per workspace, branch naming, conflict strategy, push/pull triggers.

#### 1.1 Template vs Social Forge Snapshot
- **Frontend**: Both use Next.js App Router with shadcn/ui + Tailwind; Social Forge already on 15.x with server components, so UI pieces port cleanly once we replace NextAuth with Better-auth adapters.
- **Auth**: Template relies on NextAuth + OAuth; Social Forge mandates Better-auth with `auth.api.getSession` and workspace scoping helpers. Agent endpoints must call `resolveWorkspaceContext` and avoid trusting client-provided workspace IDs.
- **ORM**: Template uses Drizzle tables (`tasks`, `connectors`, `keys`, `accounts`); Social Forge centralizes on Prisma schema (see `prisma/schema.prisma`). We must remodel agent persistence in Prisma and align enums/status states with existing `BuilderSessionStatus`, `SiteStatus`, etc.
- **Sandbox & Git**: Template provisions Vercel Sandbox per task and runs chosen CLI agent, committing changes via per-user GitHub tokens. Social Forge currently manages deployments through `lib/publish/*` and Vercel projects tied to `SiteEnvironment`; we need a bridge so sandbox output can flow into builder sessions or git sync before publishing.
- **Task Lifecycle**: Template stores task state, streams logs, and auto-generates branch names with AI SDK `after()`. Social Forge lacks task tables but has `BuilderSession` and prospect workflows; we will introduce `AgentTask` models linked to `Workspace`, `Site`, optional `BuilderSession`, and store logs/artifacts to power dashboard UI.
- **Repo Layout**: Coding agent template now lives as a git submodule under `external/coding-agent-template`, linked through pnpm workspace tooling with shared bridge code in `packages/agent-bridge`.

#### 1.2 Builder & Workflow Touchpoints
- Live agent traffic will be handled by Next.js server actions under `app/actions/agent.ts` and streaming API routes (`app/api/agent/*`). Task creation stays within App Router so Better-auth sessions and workspace context remain intact.
- Long-running edits run inside Vercel Sandbox instances triggered by a dedicated `lib/agent/runner.ts` helper. The runner will:
	1. Fetch task + workspace context from Prisma.
	2. Provision sandbox via Vercel API using stored team/project IDs.
	3. Execute the selected agent CLI (Claude Code, Codex CLI, etc.).
	4. Stream stdout/stderr back through Next.js route handlers using Edge-friendly streaming APIs.
	5. Record log chunks in Prisma for reliable resume history.
- A lightweight `AgentJob` table (defined later) acts as a queue. Server actions mark jobs `QUEUED`; a background cron (Vercel cron + route) or user-triggered `POST /api/agent/jobs/[id]/start` kicks off the sandbox run to avoid blocking the initial request.
- For local development we fallback to spawning the agent CLI directly using Node child processes guarded by feature flag (`AGENT_SANDBOX_PROVIDER=local`).

#### 1.3 Git Sync Requirements
- Each workspace may connect one or more git repositories. We’ll start with GitHub via Better-auth-connected OAuth tokens stored encrypted (reuse encryption helpers from template, keyed by `ENCRYPTION_KEY`).
- New Prisma models will track `WorkspaceRepository` (repo URL, default branch, lastSyncedSha, feature flags) and `WorkspaceRepositoryCredential` (token metadata scoped to user or workspace).
- When creating an agent task we must ensure the workspace has a synced repository; server action will fetch latest default branch commit using GitHub API before starting sandbox run.
- Sandbox runner clones the repo at the requested commit, creates an AI-generated branch name (reuse template logic via AI SDK `after()` hook), applies agent changes, commits, and pushes back using the connected credential.
- After push, we store resulting branch info in Prisma and optionally open a PR via GitHub API. Social Forge dashboard should display sync state and warn if upstream has diverged.
- Conflict strategy: if push fails due to non-fast-forward we mark task `AWAITING_MERGE` and surface instructions; later iterations can attempt rebase via sandbox rerun.
- `app/actions/site.ts`: authoritative for workspace assertions, builder session lifecycle, deployments, domain management; new agent actions must reuse these helpers to avoid bypassing membership checks.
- `BuilderSession` model + `lib/publish/*`: capture current builder runs and deployment triggers; agent should either spawn new builder sessions or convert tasks into `SiteVersion` updates using these modules.
- Prospect workflow (`app/actions/prospect*.ts`, `app/preview/[token]/page.tsx`): informs where agent-initiated changes impact downstream reviews/deployments.
- Git/deployment config stored in `SiteEnvironment` (Vercel project IDs) and domain docs in `DOMAIN_MANAGEMENT.md`; necessary when wiring git sync and sandbox output to production environments.

### 2. Data Model & Persistence
- [x] Draft Prisma schema additions for agent `Task`, `Run`, `Log`, `Artifact`, `Credential` tables referencing `Workspace`/`User`/`Site`.
- [x] Identify migrations needed for git sync metadata (connected repo URL, default branch, last sync SHA).
- [x] Plan data access helpers in `lib/agent/repository.ts` to encapsulate Prisma queries and enforce workspace scoping.

#### 2.1 Proposed Prisma Models
```prisma
model AgentTask {
	id              String        @id @default(cuid())
	workspaceId     String
	workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
	siteId          String?
	site            Site?         @relation(fields: [siteId], references: [id], onDelete: SetNull)
	createdById     String
	createdBy       User          @relation(fields: [createdById], references: [id], onDelete: Cascade)
	repositoryId    String?
	repository      WorkspaceRepository? @relation(fields: [repositoryId], references: [id], onDelete: SetNull)
	title           String
	prompt          String
	agentType       AgentType
	status          AgentTaskStatus @default(QUEUED)
	currentRunId    String?
	currentRun      AgentRun?      @relation("TaskCurrentRun", fields: [currentRunId], references: [id], onDelete: SetNull)
	branchName      String?
	targetRef       String?
	baseSha         String?
	headSha         String?
	metadata        Json?
	createdAt       DateTime       @default(now())
	updatedAt       DateTime       @updatedAt
	runs            AgentRun[]
	logs            AgentLog[]
	artifacts       AgentArtifact[]
}

enum AgentTaskStatus {
	QUEUED
	RUNNING
	SUCCEEDED
	FAILED
	CANCELLED
	AWAITING_MERGE
}

enum AgentType {
	CLAUDE_CODE
	OPENAI_CODEX
	CURSOR_CLI
	GEMINI_CLI
	OPEN_CODE
}

model AgentRun {
	id            String          @id @default(cuid())
	taskId        String
	task          AgentTask       @relation(fields: [taskId], references: [id], onDelete: Cascade)
	sandboxId     String?
	sandboxProvider SandboxProvider @default(VERCEL)
	status        AgentRunStatus  @default(PENDING)
	startedAt     DateTime?
	completedAt   DateTime?
	exitCode      Int?
	errorMessage  String?
	logSequence   Int             @default(0)
	metadata      Json?
	createdAt     DateTime        @default(now())
	updatedAt     DateTime        @updatedAt
	logs          AgentLog[]
}

enum AgentRunStatus {
	PENDING
	STARTING
	STREAMING
	COMPLETED
	ERRORED
	CANCELLED
}

model AgentLog {
	id        String     @id @default(cuid())
	taskId    String
	runId     String?
	sequence  Int
	level     AgentLogLevel @default(INFO)
	message   String?
	payload   Json?
	createdAt DateTime   @default(now())

	task AgentTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
	run  AgentRun? @relation(fields: [runId], references: [id], onDelete: Cascade)

	@@index([taskId, sequence])
	@@index([runId, sequence])
}

enum AgentLogLevel {
	DEBUG
	INFO
	WARN
	ERROR
}

model AgentArtifact {
	id        String   @id @default(cuid())
	taskId    String
	task      AgentTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
	type      AgentArtifactType
	name      String
	path      String?
	diff      Json?
	metadata  Json?
	createdAt DateTime @default(now())

	@@index([taskId])
}

enum AgentArtifactType {
	DIFF
	FILE
	LOG
	SCREENSHOT
	OTHER
}

model WorkspaceRepository {
	id              String   @id @default(cuid())
	workspaceId     String
	workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
	provider        RepositoryProvider
	externalId      String
	owner           String
	name            String
	defaultBranch   String
	lastSyncedSha   String?
	installationId  String?
	isDefault       Boolean  @default(false)
	createdById     String
	createdBy       User      @relation(fields: [createdById], references: [id], onDelete: Cascade)
	createdAt       DateTime @default(now())
	updatedAt       DateTime @updatedAt
	tasks           AgentTask[]
	credentials     WorkspaceRepositoryCredential[]

	@@unique([workspaceId, provider, owner, name])
	@@index([workspaceId, isDefault])
}

enum RepositoryProvider {
	GITHUB
	GITLAB
	BITBUCKET
}

model WorkspaceRepositoryCredential {
	id             String   @id @default(cuid())
	repositoryId   String
	repository     WorkspaceRepository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
	userId         String?
	user           User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
	accessTokenEnc String   // encrypted blob stored via ENCRYPTION_KEY
	refreshTokenEnc String?
	expiresAt      DateTime?
	scopes         String?
	createdAt      DateTime @default(now())
	updatedAt      DateTime @updatedAt

	@@index([repositoryId])
	@@index([userId])
}
```

- Enums extend existing schema by reusing `SandboxProvider` and adding new agent/git enums scoped to Social Forge.
- `AgentRun.logSequence` keeps track of monotonic ordering for streaming log inserts.
- Credentials allow either workspace-wide tokens (null userId) or per-user overrides; encrypted fields will use the same helper as the template’s `keys` table.

#### 2.2 Migration Considerations
- New enums (`AgentTaskStatus`, `AgentType`, `AgentRunStatus`, `AgentLogLevel`, `AgentArtifactType`, `RepositoryProvider`) must be added via Prisma migration. Validate there are no naming collisions with existing enums.
- Migrations will create six new tables: `AgentTask`, `AgentRun`, `AgentLog`, `AgentArtifact`, `WorkspaceRepository`, `WorkspaceRepositoryCredential`.
- Ensure foreign key cascade rules match existing patterns (sites/workspaces). Soft deletes are not required initially; leverage `status` fields for lifecycle.
- Index `AgentLog` heavily since streaming viewers will paginate by sequence.
- Consider future `AgentToolInvocation` table for audit trails; can be added later without blocking initial release.

#### 2.3 Repository Helper Plan
- Create `lib/agent/repository.ts` exporting workflow-safe helpers:
	- `getWorkspaceAgentContext({ workspaceId, taskId })` → loads workspace, repo, and active credentials enforcing membership via `resolveWorkspaceContext`.
	- `createAgentTask({ workspaceId, siteId, createdById, repositoryId, title, prompt, agentType, metadata })` → wraps Prisma create and auto-enqueues initial run record.
	- `appendRunLog({ runId, level, message, payload })` → increments `logSequence` atomically using `run.logSequence` + `prisma.agentLog.create` inside transaction.
	- `updateTaskStatus(taskId, status, data)` → updates status, branch info, `currentRunId`, emits `revalidatePath` triggers.
	- `storeArtifact({ taskId, type, name, diff, path })` → persists artifacts and returns record for UI download.
	- `getTaskWithRelations({ taskId, workspaceId })` → central read used by dashboard pages, selecting runs, latest logs, artifacts with pagination parameters.
- Helper module should never accept raw workspace IDs from clients; always call `resolveWorkspaceContext` at the call site before invoking.
- Use Zod validators to coerce/enforce payload shapes before hitting Prisma; align with existing patterns in `app/actions/*`.

### 3. Authentication & Authorization
- [x] Reuse `resolveWorkspaceContext` and Better-auth session retrieval inside new agent server actions.
- [x] Define permission model (who can run agents, manage git connections, view logs) aligned with `workspaceMember` roles.
- [x] Extend session persistence so active workspace context flows into agent task execution and sandbox provisioning.

#### 3.1 Session Access Pattern
- All server actions in `app/actions/agent.ts` begin with:
	```ts
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) throw new Error("Unauthorized");
	const { workspaceId } = await resolveWorkspaceContext(input.workspaceId);
	```
	ensuring caller is authenticated and member of the target workspace.
- Streaming API handlers under `app/api/agent/*` will call a shared helper `getAuthenticatedWorkspaceRequest(req)` that uses `auth.api.getSession` with request headers and validates membership before returning workspace context.
- Background job triggers (cron route) rely on service tokens. Introduce `AGENT_SERVICE_TOKEN` env var checked against `Authorization: Bearer` header before executing queued jobs, preventing anonymous starts.

#### 3.2 Permission Matrix
- **Owner/Admin**: Full access—configure git repositories, connect credentials, run/cancel tasks, view all logs/artifacts.
- **Member**: Create and monitor tasks for workspaces they belong to; cannot modify git credentials but can select available repositories. Allowed to view logs/artifacts for tasks they created or that are linked to sites they have edit rights on.
- **Viewer**: Read-only access to task list + basic status (no logs/diffs); cannot trigger new runs. Enforced via conditional selects in dashboard components and server action guards.
- Implement helper `assertAgentPermission({ userId, workspaceId, action, siteId? })` returning boolean/throwing based on `WorkspaceMember.role` and site collaborator roles.
- Git credential mutations (`POST /api/agent/repositories`) require Owner/Admin; server action will check roles before allowing `WorkspaceRepository` updates.

#### 3.3 Token & Credential Handling
- Encrypt repository tokens using existing crypto utilities (similar to template’s `keys` table) stored in `WorkspaceRepositoryCredential.accessTokenEnc`.
- When a user connects GitHub, we store tokens with `userId` reference, scope-limited to `repo` (+ `workflow` if needed). Workspace-level tokens (null `userId`) can be added by Owner/Admin for shared agents.
- Before running an agent task, helper pulls credential preference: prefer task creator’s token if available; fallback to workspace token. Reject run if no valid credential (status `FAILED` with actionable message).

#### 3.4 Active Workspace Propagation
- `Session.activeWorkspaceId` already tracks user’s last scope. When creating an agent task we rely on `resolveWorkspaceContext` to pick this value if input is absent, then persist `workspaceId` directly on `AgentTask`.
- Enqueue payload includes `taskId`, `workspaceId`, `userId`, and optional `siteId`. The runner validates the workspace + user membership before starting to guard against stale tokens.
- Dashboard UI respects active workspace selection by reusing existing providers (`WorkspaceSwitcher`) so all agent views automatically scoped.

### 4. Server Actions & API Surface
- [x] Create `app/actions/agent.ts` for task lifecycle (create, cancel, retry) with `"use server"` and `auth.api.getSession` pattern.
- [x] Add streaming endpoints under `app/api/agent/*` for real-time logs and git diff previews, following template conventions but converted to Prisma.
- [x] Trigger `revalidatePath` for `/dashboard/agent` and site detail routes after task state changes.

#### 4.1 Server Action Outline (`app/actions/agent.ts`)
- `createAgentTaskAction(input)`
	- Validate session & permissions.
	- Use `zod` schema for input (prompt, repositoryId, siteId, agentType).
	- Call `agentRepository.createAgentTask` helper; create initial `AgentRun` record with status `PENDING`.
	- Enqueue job via `enqueueAgentJob(taskId)` (wrapping Vercel cron or background queue).
	- `revalidatePath("/dashboard/agent")` and `revalidatePath(`/dashboard/sites/${siteId}`)` when site scoped.
	- Return task summary for optimistic UI update.
- `cancelAgentTaskAction({ taskId })`
	- Ensure user has cancellation rights (Owner/Admin or task creator before completion).
	- Update task status to `CANCELLED`, signal runner to stop sandbox (if running) via `cancelAgentRun(taskId)`.
- `retryAgentTaskAction({ taskId })`
	- Only allowed when previous status `FAILED` or `AWAITING_MERGE`.
	- Create new `AgentRun`, enqueue job, update task `status=QUEUED`.
- `connectRepositoryAction` / `disconnectRepositoryAction`
	- Manage workspace repo records & credentials (Owner/Admin only).
- All actions defined with `"use server"` directive per Social Forge pattern.

#### 4.2 API Routes (`app/api/agent/*`)
- `app/api/agent/bridge/route.ts`
	- Acts as the RPC boundary for the vendored coding agent template.
	- Supports `resolveWorkspaceContext`, `listWorkspaces`, and `createAgentTask` methods.
	- Enforces Better-auth sessions and CORS via `AGENT_BRIDGE_ALLOWED_ORIGINS`.
		  - Template client calls `createAgentTask` after local task creation when `NEXT_PUBLIC_SOCIAL_FORGE_BRIDGE_ENABLED=true`, keeping Prisma tasks aligned and forwarding local metadata (external task ID, repo URL, selected agent/model, runtime preferences).
- `app/api/agent/tasks/[taskId]/logs/route.ts`
	- GET returns SSE stream (`text/event-stream`) pulling new logs via `AgentLog` sequence ordering.
	- Supports `cursor` query for pagination fallback.
- `app/api/agent/tasks/[taskId]/diff/route.ts`
	- GET provides diff artifact download (JSON/patch) using stored `AgentArtifact` records.
- `app/api/agent/jobs/route.ts`
	- POST (service token protected) used by Vercel cron to dequeue next `AgentRun` and start sandbox.
	- PATCH for heartbeats/cancel ack updates from runner.
- `app/api/agent/repositories/route.ts`
	- POST to register repository connection using user OAuth code exchange.
	- DELETE to revoke repository access.

#### 4.3 Revalidation Strategy
- After any task status mutation (`QUEUED` → `RUNNING`, etc.), call:
	```ts
	revalidatePath("/dashboard/agent")
	if (task.siteId) {
		revalidatePath(`/dashboard/sites/${task.siteId}`)
	}
	```
- For git repository updates, also `revalidatePath("/dashboard/settings/git")` (pending UI path) to reflect connection status.
- Streaming routes rely on incremental fetch; no revalidation needed but dashboards should poll/subscribe using log SSE.

### 5. Agent Runtime & Tooling
- [x] Port core runner modules into `lib/agent/*`, swapping Drizzle with Prisma and wiring Social Forge specific tools.
- [x] Implement tools for builder operations (generate site, publish deployment, manage prospect workflow) using existing actions/services.
- [x] Implement git toolchain abstraction that can fallback to template sandbox git helpers but uses stored credentials + Social Forge repo config.
- [x] Ensure long-running operations respect workspace quotas and log status transitions into Prisma.

#### 5.1 Runtime Structure
- Create `lib/agent/index.ts` exporting `runAgentTask(taskId)` which orchestrates:
	1. Fetch task/run/context via repository helpers.
	2. Determine agent implementation (Claude Code, etc.) from `AgentType`.
	3. Prepare sandbox environment variables (repo URL, branch name, tokens, Social Forge API base for callbacks).
	4. Invoke provider-specific runner under `lib/agent/runners/{agent}.ts`.
	5. Stream logs back via `appendRunLog`, update run status transitions, store artifacts/diffs.
	6. On completion, call git sync helper to push branch and optionally open PR.
- `lib/agent/sandbox/vercel.ts` encapsulates Vercel Sandbox lifecycle using `@vercel/sandbox` client (mirroring template) but parameterized by workspace configuration.
- Provide `lib/agent/sandbox/local.ts` for dev fallback using child processes.

#### 5.2 Tool Implementations
- `lib/agent/tools/site.ts`
	- `createBuilderSessionTool` → reuses `createBuilderSession` logic from `app/actions/site.ts` with additional audit logging.
	- `publishSiteTool` → wraps `triggerDeployment` for specific environment.
	- `updateProspectStatusTool` → interacts with `app/actions/prospect.ts` to align with approval workflow.
- `lib/agent/tools/git.ts`
	- `checkoutRepository`, `applyPatch`, `commitChanges`, `pushBranch`, `fetchUpstream` using `simple-git` or direct CLI inside sandbox.
	- Accepts credential payload (token, repo slug) and handles remote URL formatting.
- `lib/agent/tools/documentation.ts`
	- Optional: allows agent to read Social Forge docs from `content/` (non-destructive) when generating instructions.
- Tools exposed to agent CLI via JSON-RPC or environment variables depending on provider capability (Claude Code supports MCP servers; others rely on shell scripts). For Claude, map to MCP server config referencing Social Forge endpoints.

#### 5.3 Git Toolchain Abstraction
- Define `GitProvider` interface with methods `clone`, `status`, `commit`, `push`, `createPullRequest`.
- Implement `GithubProvider` using `@octokit/rest` plus git CLI commands; integrate branch naming using AI SDK `generateBranchName()`.
- Provide fallback to template’s git diff view components by generating artifacts (`AgentArtifact` with `DIFF` type) that the dashboard can render with `@git-diff-view/react` (already in template dependencies; add to Social Forge if missing).

#### 5.4 Quota & Long-Running Safeguards
- Introduce `AGENT_MAX_RUNTIME_MS` env var (default 20 minutes). Runner tracks elapsed time and aborts sandbox when exceeded, logging cancellation reason.
- Record workspace usage counters in `Workspace` (new columns `agentTasksLast24h`, etc.) or derived via metrics service; enforce limit (e.g., 30 tasks/day) before enqueueing new jobs.
- Use `AgentRun.status=ERRORED` with `errorMessage="runtime_limit_exceeded"` when sandbox stops due to timeout; dashboard surfaces friendly message.
- Future integration with billing can adjust limits dynamically; structure logging so analytics can compute usage per workspace.

### 6. UI Integration
- [x] Introduce dashboard views at `app/dashboard/agent` to list tasks, show run detail, stream logs, review diffs, and approve merges.
- [x] Add navigation entry via `components/app-sidebar.tsx` when feature flag enabled.
- [x] Build client components (with `"use client"` when necessary) for streaming updates, but keep main pages as server components consuming agent queries.
- [x] Provide modals/forms for connecting repos, configuring agent preferences, and initiating runs from builder context.

#### 6.1 Page Structure
- `app/dashboard/agent/page.tsx` (server component)
	- Fetches agent tasks via repository helpers scoped to active workspace.
	- Renders summary metrics + task table with filters.
	- Utilizes `Suspense` boundaries and incremental rendering consistent with existing dashboard pages.
- `app/dashboard/agent/[taskId]/page.tsx`
	- Server component fetching task detail, runs, artifacts.
	- Embeds client log viewer and diff viewer components for real-time updates.
- `app/dashboard/agent/layout.tsx` extends dashboard layout for breadcrumbs, ensures `WorkspaceSwitcher` context available.
- `app/(builder)/builder/page.tsx` (existing builder entry) gets enhanced to surface "Run Agent" CTA and task status sidebar when `ENABLE_AGENT` is active.
- `app/(builder)/builder/(routes)/[siteId]/page.tsx` (or equivalent detail routes) display inline agent activity logs tied to the active `Site` so builders can review changes without leaving the flow.
- Embedded surfaces such as `app/dashboard/projects/[id]/builder/embedded-builder-preview.tsx` must include a compact agent status widget to keep third-party embeds informed about ongoing tasks, with read-only access respecting viewer permissions.

#### 6.2 Client Components
- `components/agent/task-filters.tsx` (`"use client"`) handles search/status filters and debounced query params.
- `components/agent/log-stream.tsx` subscribes to SSE endpoint, supports pause/resume, level filtering, fallback polling.
- `components/agent/diff-viewer.tsx` wraps `@git-diff-view/react` for per-file diff tabs, accessible keyboard navigation.
- `components/agent/run-actions.tsx` provides cancel/retry buttons via server actions with `useTransition` states.

#### 6.3 Navigation & Feature Flag
- Update `components/app-sidebar.tsx` to show "AI Agent" item when `isAgentEnabled()` returns true and member role ≥ Member.
- Feature flag derived from env (`ENABLE_AGENT`) surfaced through `lib/config.ts`.
- Include onboarding tooltip/badge for first-time discovery using existing tooltip primitives.

#### 6.4 Modal & Builder Hooks
- `components/agent/connect-repo-dialog.tsx` for OAuth handshake and repository selection.
- `components/agent/run-agent-dialog.tsx` invoked from builder surfaces (e.g., `app/(builder)/builder/page.tsx` actions menu) to seed prompt with current site metadata; uses server action to create task.
- Within builder workspace (`app/(builder)/builder/...`), embed compact task list component so users can monitor agent progress alongside manual edits.
- For embedded builder previews, provide a simplified read-only status panel (no destructive controls) that consumes the same SSE feed but hides repository links.
- Provide quick-start modal accessible from marketing onboarding linking to docs.

#### 6.5 DX & Accessibility
- Reuse shadcn/ui components, avoid custom styling.
- Ensure SSE components degrade gracefully; log viewer provides copy/export functionality.
- Verify all interactive elements meet a11y guidelines (focus traps in dialogs, ARIA labels on diff viewer).

### 7. Git Sync Compatibility
- [x] Allow workspace admins to connect a Git provider (Github to start) and authorize repo access; store encrypted tokens.
- [x] Track upstream branch metadata and implement periodic pull or on-demand fetch before agent runs.
- [x] After agent run, push branch updates and optionally open PR using user token; expose status in dashboard.
- [x] Handle merge conflicts gracefully with retry guidance or manual intervention tools.

#### 7.1 Provider Connection Flow
- OAuth integration for GitHub using Better-auth account linking: new route `app/api/agent/github/callback` exchanges code → stores tokens in `WorkspaceRepositoryCredential` with encryption.
- Dashboard settings page lists connected repositories; Owner/Admin can set default repo per workspace.
- Support multiple repositories per workspace; agent task creation UI loads options via server component.

#### 7.2 Sync Mechanics
- Before each run, `gitProvider.fetchUpstream()` ensures local sandbox clone is up to date, capturing `baseSha` stored on task.
- Post-run, `gitProvider.pushBranch()` writes changes; if push succeeds, we update `AgentTask.headSha` and optionally call `gitProvider.createPullRequest()` (configurable).
- Implement `syncWorkspaceRepository(workspaceId)` helper triggered manually or via cron to refresh `lastSyncedSha` and detect divergence; surfaces status banner in dashboard.

#### 7.3 Conflict Handling
- If push fails due to divergence, mark task `status=AWAITING_MERGE`, attach artifact detailing conflict files, and notify via dashboard toast/email (future).
- Provide server action `prepareMergeResolution(taskId)` that re-runs agent with latest base or prompts user with instructions.
- Maintain audit log entry in `AgentLog` with level `WARN` describing conflict.

#### 7.4 Future Enhancements
- Extend provider support to GitLab/Bitbucket by implementing additional `GitProvider` classes and OAuth flows.
- Consider webhook-based sync (GitHub push hooks) to invalidate cached metadata promptly.

### 8. Configuration & Secrets
- [x] Extend `.env.example` with sandbox, AI, git credentials (Vercel Sandbox, AI Gateway, Anthropic/OpenAI, Git provider client IDs).
- [x] Update `lib/config.ts` to surface new env vars with validation and defaults.
- [x] Document local setup (sandbox CLI requirements, env generation) in `docs/agent-integration.md` or README sections.

#### 8.1 Environment Variables
- Add entries to `.env.example`:
	- `ENABLE_AGENT=true` (feature flag)
	- `AGENT_SERVICE_TOKEN=` (cron job auth)
	- `AGENT_MAX_RUNTIME_MS=1200000`
	- `SANDBOX_VERCEL_TEAM_ID=`, `SANDBOX_VERCEL_PROJECT_ID=`, `SANDBOX_VERCEL_TOKEN=`
	- `AI_GATEWAY_API_KEY=`, `ANTHROPIC_API_KEY=`, `OPENAI_API_KEY=`, `CURSOR_API_KEY=`, `GEMINI_API_KEY=`
	- `NEXT_PUBLIC_GITHUB_CLIENT_ID=`, `GITHUB_CLIENT_SECRET=` (if not already present) for agent-specific GitHub OAuth scopes
	- `ENCRYPTION_KEY=` (reuse existing requirement but emphasize for agent credentials)

#### 8.2 Config Module
- Update `lib/config.ts` with getters (e.g., `getAgentConfig()`) returning strongly typed values.
- Validate required vars at runtime with descriptive errors; use `process.env` guard to avoid undefined behavior.
- Export `isAgentEnabled()` consumed by server components and feature flag contexts.

#### 8.3 Documentation
- Expand `docs/coding-agent-plan.md` references and create `docs/agent-integration.md` covering setup steps, env var explanations, sandbox CLI install instructions, OAuth app creation.
- Update README and marketing docs to mention agent feature and required configuration steps.

### 9. Testing & Rollout
- [x] Define manual QA matrix across workspaces, git sync flows, builder integration, failure modes.
- [x] Add automated tests where feasible (unit for Prisma helpers, integration for server actions) once infra in place.
- [x] Gate rollout behind feature flag; pilot with internal workspace; capture metrics on task success rate and git sync health.
- [x] Update marketing/help docs describing agent-assisted builder experience.

#### 9.1 QA Plan
- Manual matrix covers: task creation with/without git connection, sandbox timeout handling, run cancel/retry, repository conflict scenarios, builder-triggered runs, prospect workflow interactions.
- Test across role types (Owner/Admin/Member/Viewer) to ensure permissions enforced.
- Verify SSE log streaming works in Chrome/Safari/Firefox and fallback polling engages when SSE unavailable.

#### 9.2 Automated Coverage
- Add unit tests for `lib/agent/repository.ts` using Prisma test db (Vitest + Prisma test env) to validate permission enforcement.
- Integration tests for server actions via Next.js request mocks to ensure revalidation and status transitions.
- Consider contract tests for git provider abstraction using in-memory git repos or fixture repos.

#### 9.3 Rollout Strategy
- Keep behind `ENABLE_AGENT` feature flag; initial pilot with internal workspace collecting feedback.
- Instrument metrics (task success, avg runtime, git conflict rate) via existing analytics pipeline; log to `AgentLog` for fallback.
- Gradually expand to beta customers once stability confirmed; update flag via config service.

#### 9.4 Documentation & Comms
- Update marketing site with new "AI Agent" section outlining capabilities.
- Expand docs (`docs/agent-integration.md`, help center) covering usage, troubleshooting, git sync steps.
- Prepare release notes and in-app changelog entry highlighting feature rollout and limitations.

## Open Questions
- Confirm timeline for adding GitLab/Bitbucket support after initial GitHub launch.
- Determine analytics destination for agent usage metrics (existing pipeline vs new service).
- Decide on user-facing pricing/limits messaging before GA.

---
Use this document as the living source of work. Update checkboxes as milestones complete and add context links to implementation PRs.
