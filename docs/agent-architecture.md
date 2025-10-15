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
- Implement the real `createAgentBridge` dependencies inside Social Forge (Better-auth session lookup, Prisma access).
- Create a lightweight RPC layer so the agent template can call into Social Forge via the bridge contracts.
- Iterate on the integration while keeping the template repo close to upstream for simpler syncing.
