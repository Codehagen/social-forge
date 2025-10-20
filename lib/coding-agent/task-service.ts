"use server";

import prisma from "@/lib/prisma";
import {
  BuilderAgent,
  BuilderTask,
  BuilderTaskStatus,
  BuilderTaskPrStatus,
} from "@prisma/client";
import { generateId } from "@/lib/coding-agent/id";
import { createTaskLogger } from "@/lib/coding-agent/task-logger";
import { TaskLogEntry } from "@/lib/coding-agent/logging";
import { resolveWorkspaceContext } from "@/lib/coding-agent/session";
import { getUserApiKeys } from "@/lib/coding-agent/api-keys";

const DEFAULT_MAX_DURATION = parseInt(process.env.MAX_SANDBOX_DURATION || "300", 10);

export type CreateBuilderTaskInput = {
  prompt: string;
  repoUrl?: string;
  selectedAgent?: string;
  selectedModel?: string;
  installDependencies?: boolean;
  maxDuration?: number;
  keepAlive?: boolean;
  mcpConnectorIds?: string[];
  workspaceId?: string;
};

function mapAgent(agent?: string): BuilderAgent {
  const normalized = agent?.toUpperCase();
  if (!normalized) return BuilderAgent.CLAUDE;
  if (normalized in BuilderAgent) {
    return BuilderAgent[normalized as keyof typeof BuilderAgent];
  }
  return BuilderAgent.CLAUDE;
}

export async function createBuilderTask(userId: string, input: CreateBuilderTaskInput): Promise<BuilderTask> {
  const { workspaceId } = await resolveWorkspaceContext(input.workspaceId);
  const id = generateId(12);

  return prisma.builderTask.create({
    data: {
      id,
      userId,
      workspaceId,
      prompt: input.prompt,
      repoUrl: input.repoUrl,
      selectedAgent: mapAgent(input.selectedAgent),
      selectedModel: input.selectedModel,
      installDependencies: input.installDependencies ?? false,
      maxDuration: input.maxDuration ?? DEFAULT_MAX_DURATION,
      keepAlive: input.keepAlive ?? false,
      status: BuilderTaskStatus.PENDING,
      progress: 0,
      logs: [] as TaskLogEntry[],
      mcpServerIds: input.mcpConnectorIds ?? [],
    },
  });
}

export async function listBuilderTasks(userId: string) {
  return prisma.builderTask.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getBuilderTask(id: string, userId: string) {
  return prisma.builderTask.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function updateBuilderTask(id: string, data: Partial<BuilderTask>) {
  return prisma.builderTask.update({
    where: { id },
    data,
  });
}

export async function markTaskStatus(id: string, status: BuilderTaskStatus, message?: string) {
  const logger = createTaskLogger(id);
  if (message) {
    await logger.info(message);
  }
  await prisma.builderTask.update({
    where: { id },
    data: { status },
  });
}

export async function markTaskError(id: string, error: string) {
  const logger = createTaskLogger(id);
  await logger.error(error);
  await prisma.builderTask.update({
    where: { id },
    data: {
      status: BuilderTaskStatus.ERROR,
      error,
    },
  });
}

export async function appendTaskLogs(id: string, entries: TaskLogEntry | TaskLogEntry[]) {
  const logs = Array.isArray(entries) ? entries : [entries];
  await prisma.$transaction(async (tx) => {
    const current = await tx.builderTask.findUnique({
      where: { id },
      select: { logs: true },
    });

    const existing = Array.isArray(current?.logs) ? (current!.logs as TaskLogEntry[]) : [];
    await tx.builderTask.update({
      where: { id },
      data: {
        logs: [...existing, ...logs],
      },
    });
  });
}

export async function recordTaskCompletion(id: string, data: Partial<BuilderTask>) {
  await prisma.builderTask.update({
    where: { id },
    data: {
      status: BuilderTaskStatus.COMPLETED,
      completedAt: new Date(),
      ...data,
    },
  });
}
