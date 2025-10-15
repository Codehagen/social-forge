# Agent Bridge

Adapter layer between Social Forge and the vendored coding agent template. This package should stay very small and only expose strongly typed helpers that both apps can depend on.

## Responsibilities
-	Define schemas and contracts for workspace context, agent task creation, and other cross-app interactions.
-	Proxy Better-auth session handling and Prisma-backed mutations when used within the Social Forge app.
-	Provide mockable entry points so the coding agent template can integrate without knowing Social Forge internals.

## Usage

```ts
import { createAgentBridge } from "@social-forge/agent-bridge";

const bridge = createAgentBridge({
	resolveWorkspaceContext,
	listWorkspaces,
	createAgentTask,
});
```

Each dependency can be supplied by either Social Forge (real implementation) or the coding agent template (bridge RPC calls).
