"use server";

import { headers } from "next/headers";
import { AgentJobStatus, AgentRunStatus, AgentTaskStatus, AgentType } from "@prisma/client";
import { createAgentBridge } from "@social-forge/agent-bridge";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function resolveWorkspaceContext(input: { workspaceId?: string | null }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	let targetWorkspaceId = input.workspaceId ?? null;

	if (!targetWorkspaceId) {
		const activeSession = await prisma.session.findFirst({
			where: {
				userId: session.user.id,
				activeWorkspaceId: {
					not: null,
				},
			},
			select: {
				activeWorkspaceId: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		targetWorkspaceId = activeSession?.activeWorkspaceId ?? null;
	}

	if (!targetWorkspaceId) {
		const membership = await prisma.workspaceMember.findFirst({
			where: {
				userId: session.user.id,
			},
			select: {
				workspaceId: true,
			},
			orderBy: {
				joinedAt: "asc",
			},
		});

		targetWorkspaceId = membership?.workspaceId ?? null;
	}

	if (!targetWorkspaceId) {
		throw new Error("Workspace not found");
	}

	const membership = await prisma.workspaceMember.findUnique({
		where: {
			userId_workspaceId: {
				userId: session.user.id,
				workspaceId: targetWorkspaceId,
			},
		},
	});

	if (!membership) {
		throw new Error("Not a member of this workspace");
	}

	return {
		userId: session.user.id,
		workspaceId: targetWorkspaceId,
	};
}

async function listWorkspaces(userId: string) {
	const memberships = await prisma.workspaceMember.findMany({
		where: { userId },
		include: {
			workspace: {
				select: {
					id: true,
					name: true,
					slug: true,
				},
			},
		},
		orderBy: {
			workspace: {
				name: "asc",
			},
		},
	});

	return memberships.map(({ workspace, role }) => ({
		id: workspace.id,
		name: workspace.name,
		slug: workspace.slug,
		role,
	}));
}

async function createAgentTask(input: {
	workspaceId?: string;
	siteId?: string | null;
	title: string;
	prompt: string;
	agentType: string;
	userId: string;
	repositoryId?: string | null;
}) {
	const { workspaceId, userId } = await resolveWorkspaceContext({ workspaceId: input.workspaceId ?? null });

	const agentTypeValues = Object.values(AgentType) as string[];

	if (!agentTypeValues.includes(input.agentType)) {
		throw new Error(`Unsupported agent type: ${input.agentType}`);
	}

	if (input.repositoryId) {
		const repository = await prisma.workspaceRepository.findUnique({
			where: {
				id: input.repositoryId,
				workspaceId,
			},
		});

		if (!repository) {
			throw new Error("Repository not found in workspace");
		}
	}

	if (input.siteId) {
		const site = await prisma.site.findFirst({
			where: {
				id: input.siteId,
				workspaceId,
			},
			select: { id: true },
		});

		if (!site) {
			throw new Error("Site not found in workspace");
		}
	}

	const agentTask = await prisma.agentTask.create({
		data: {
			workspaceId,
			siteId: input.siteId ?? null,
			createdById: userId,
			repositoryId: input.repositoryId ?? null,
			title: input.title,
			prompt: input.prompt,
			agentType: input.agentType as AgentType,
			status: AgentTaskStatus.QUEUED,
		},
	});

	const agentRun = await prisma.agentRun.create({
		data: {
			taskId: agentTask.id,
			status: AgentRunStatus.PENDING,
		},
	});

	await prisma.agentTask.update({
		where: { id: agentTask.id },
		data: {
			currentRunId: agentRun.id,
		},
	});

	await prisma.agentJob.create({
		data: {
			workspaceId,
			taskId: agentTask.id,
			runId: agentRun.id,
			status: AgentJobStatus.PENDING,
		},
	});

	return { taskId: agentTask.id };
}

export const agentBridge = createAgentBridge({
	resolveWorkspaceContext,
	listWorkspaces,
	createAgentTask,
});

export type AgentBridge = typeof agentBridge;