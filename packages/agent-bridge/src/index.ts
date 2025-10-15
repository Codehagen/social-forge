import { z } from "zod";

export const workspaceContextSchema = z.object({
	workspaceId: z.string(),
	userId: z.string(),
});

export type WorkspaceContext = z.infer<typeof workspaceContextSchema>;

export const agentTaskInputSchema = z.object({
	workspaceId: z.string().optional(),
	siteId: z.string().nullable().optional(),
	title: z.string().min(1),
	prompt: z.string().min(1),
	agentType: z.string().min(1),
});

export type AgentTaskInput = z.infer<typeof agentTaskInputSchema>;

export type WorkspaceSummary = {
	id: string;
	name: string;
	slug: string;
	role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
};

type BridgeDependencies = {
	resolveWorkspaceContext?: (input: {
		workspaceId?: string | null;
	}) => Promise<WorkspaceContext>;
	listWorkspaces?: (userId: string) => Promise<WorkspaceSummary[]>;
	createAgentTask?: (input: AgentTaskInput & { userId: string }) => Promise<{ taskId: string }>;
};

const missingImplementation = (name: string): never => {
	throw new Error(`Agent bridge dependency \"${name}\" is not wired yet.`);
};

export const createAgentBridge = (dependencies: BridgeDependencies = {}) => {
	const resolveWorkspaceContext = async (input: {
		workspaceId?: string | null;
	}) => {
		if (!dependencies.resolveWorkspaceContext) {
			return missingImplementation("resolveWorkspaceContext");
		}
		return dependencies.resolveWorkspaceContext(input);
	};

	const listWorkspaces = async (userId: string) => {
		if (!dependencies.listWorkspaces) {
			return missingImplementation("listWorkspaces");
		}
		return dependencies.listWorkspaces(userId);
	};

	const createAgentTask = async (input: AgentTaskInput & { userId: string }) => {
		if (!dependencies.createAgentTask) {
			return missingImplementation("createAgentTask");
		}
		agentTaskInputSchema.parse(input);
		return dependencies.createAgentTask(input);
	};

	return {
		resolveWorkspaceContext,
		listWorkspaces,
		createAgentTask,
	};
};

type AgentBridge = ReturnType<typeof createAgentBridge>;

export type { AgentBridge };
