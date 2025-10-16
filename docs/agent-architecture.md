# Coding Agent Integration Architecture

## Repository Layout
- `external/coding-agent-template/`
  - Git submodule pointing to [`vercel-labs/coding-agent-template`](https://github.com/vercel-labs/coding-agent-template).
  - Updated with `git submodule update --remote external/coding-agent-template` when we need upstream changes.
- `packages/agent-bridge/`
  - Shared TypeScript package exposing the minimal contracts used by both Social Forge and the coding agent template.
  - Currently exports typed stubs for workspace context resolution and agent task creation.
- `pnpm-workspace.yaml`
  - Registers the root app, shared packages, and submodules as a single pnpm workspace to simplify installs and linking.

## Local Development
1. Install dependencies once from the repository root:
   ```bash
   pnpm install
   ```
2. Run Social Forge as usual:
   ```bash
   pnpm dev
   ```
3. In a separate terminal, run the agent template:
   ```bash
   cd external/coding-agent-template
   pnpm install
   pnpm dev
   ```

Both apps can now evolve in parallel. Use the bridge package to keep shared logic typed and encapsulated.

## Next Steps
- [x] Implement the real `createAgentBridge` dependencies inside Social Forge (Better-auth session lookup, Prisma access).
- [x] Create a lightweight RPC layer so the agent template can call into Social Forge via the bridge contracts.
- [ ] Iterate on the integration while keeping the template repo close to upstream for simpler syncing.

## Bridge RPC Endpoint
- **Route**: `POST /api/agent/bridge`
- **Methods**: `resolveWorkspaceContext`, `listWorkspaces`, `createAgentTask`
- **Auth**: Relies on Better-auth session cookies; requests without a valid session are rejected.
- **CORS**: Allow origins via `AGENT_BRIDGE_ALLOWED_ORIGINS` (comma-delimited). In development empty config defaults to permissive mode.
- **Client integration**: The coding agent template invokes `createAgentTask` after successful task creation when `NEXT_PUBLIC_SOCIAL_FORGE_BRIDGE_ENABLED=true`, ensuring the Social Forge queue stays in sync.
- **Metadata**: Bridge requests carry the template task ID plus repository/model details via the `metadata` payload, allowing Social Forge to correlate local UI state with Prisma-backed tasks.
