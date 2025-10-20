"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import prisma from "@/lib/prisma";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";
import { unregisterSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";
import { createTaskLogger } from "@/lib/coding-agent/task-logger";
import { createSandbox } from "@/lib/coding-agent/sandbox/creation";
import { getUserGitHubToken } from "@/lib/github/user-token";
import { getUserApiKeys } from "@/lib/coding-agent/api-keys";
import { mapBuilderAgentToCli } from "@/lib/coding-agent/utils";

const DEFAULT_TIMEOUT_MINUTES = Number.parseInt(process.env.MAX_SANDBOX_DURATION ?? "300", 10);

export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id, {
      messages: true,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.keepAlive) {
      return NextResponse.json({ error: "Keep-alive is not enabled for this task" }, { status: 400 });
    }

    if (!task.repoUrl) {
      return NextResponse.json({ error: "Task does not have a repository URL" }, { status: 400 });
    }

    const logger = createTaskLogger(task.id);

    if (task.sandboxId) {
      try {
        const existing = await resolveSandbox(taskId, task.sandboxId);
        if (existing) {
          const ping = await existing.runCommand("echo", ["ok"]);
          if (ping.exitCode === 0) {
            return NextResponse.json({ error: "Sandbox is already running" }, { status: 400 });
          }
        }
      } catch {
        // ignore and recreate
      }

      unregisterSandbox(taskId);
      await prisma.builderTask.update({
        where: { id: task.id },
        data: { sandboxId: null, sandboxUrl: null },
      });
    }

    await logger.info("Creating sandbox environment");

    const githubToken = await getUserGitHubToken();
    const apiKeys = await getUserApiKeys(task.userId ?? undefined);

    const sandboxResult = await createSandbox(
      {
        taskId: task.id,
        repoUrl: task.repoUrl,
        githubToken,
        gitAuthorName: session.user.name ?? session.user.email ?? "Social Forge User",
        gitAuthorEmail: session.user.email ?? "agent@example.com",
        apiKeys,
        timeout: `${task.maxDuration ?? DEFAULT_TIMEOUT_MINUTES}m`,
        ports: [3000],
        runtime: "node22",
        resources: { vcpus: 4 },
        selectedAgent: mapBuilderAgentToCli(task.selectedAgent),
        selectedModel: task.selectedModel ?? undefined,
        installDependencies: task.installDependencies ?? false,
        keepAlive: task.keepAlive,
        preDeterminedBranchName: task.branchName ?? undefined,
        existingBranchName: task.branchName ?? undefined,
      },
      logger
    );

    if (!sandboxResult.success || !sandboxResult.sandbox) {
      return NextResponse.json({ error: sandboxResult.error ?? "Failed to create sandbox" }, { status: 500 });
    }

    const sandbox = sandboxResult.sandbox;
    const sandboxId =
      (sandbox as unknown as { sandboxId?: string; id?: string }).sandboxId ??
      (sandbox as unknown as { id?: string }).id ??
      null;

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        sandboxId,
        sandboxUrl: sandboxResult.domain ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sandboxId,
      sandboxUrl: sandboxResult.domain ?? null,
    });
  } catch (error) {
    console.error("Error starting sandbox", error);
    return NextResponse.json({ error: "Failed to start sandbox" }, { status: 500 });
  }
}
