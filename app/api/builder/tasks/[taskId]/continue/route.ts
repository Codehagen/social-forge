"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { ContinueTaskRequestSchema } from "@/lib/coding-agent/task-schema";
import { checkRateLimit } from "@/lib/coding-agent/rate-limit";
import { createTaskLogger } from "@/lib/coding-agent/task-logger";
import { createTaskMessage, updateTaskMessageContent } from "@/lib/coding-agent/messages";
import { BuilderTaskMessageRole, BuilderTaskStatus } from "@prisma/client";
import { getUserApiKeys } from "@/lib/coding-agent/api-keys";
import { getUserConnectors } from "@/lib/coding-agent/connectors";
import { executeAgentInSandbox } from "@/lib/coding-agent/sandbox/agents";
import { pushChangesToBranch } from "@/lib/coding-agent/sandbox/git";
import { detectPackageManager } from "@/lib/coding-agent/sandbox/package-manager";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { generateId } from "@/lib/coding-agent/id";
import { mapBuilderAgentToCli, sanitizeInstruction } from "@/lib/coding-agent/utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

type RouteParams = {
  params: {
    taskId: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.taskId;
    const task = await prisma.builderTask.findUnique({ where: { id: taskId } });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ error: "Sandbox is no longer available for this task" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = ContinueTaskRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const rateLimit = await checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You have reached the daily limit of ${rateLimit.total} messages. Limit resets at ${rateLimit.resetAt.toISOString()}`,
          remaining: rateLimit.remaining,
        },
        { status: 429 }
      );
    }

    const logger = createTaskLogger(task.id);
    await logger.updateStatus(BuilderTaskStatus.PROCESSING, "Running follow-up instruction");
    await logger.updateProgress(10, "Preparing sandbox session");

    await createTaskMessage(task.id, BuilderTaskMessageRole.USER, parsed.data.instruction);

    const sandbox = await resolveSandbox(task.id, task.sandboxId);
    if (!sandbox) {
      await logger.error("Unable to reconnect to sandbox. It may have expired.");
      await logger.updateStatus(BuilderTaskStatus.ERROR, "Sandbox is no longer active");
      return NextResponse.json({ error: "Sandbox unavailable" }, { status: 410 });
    }

    const apiKeys = await getUserApiKeys(task.userId ?? undefined);
    const connectors = task.userId ? await getUserConnectors(task.userId) : [];
    const agentType = mapBuilderAgentToCli(task.selectedAgent);

    const sanitizedInstruction = sanitizeInstruction(parsed.data.instruction);

    const agentMessageId = generateId(12);

    const agentResult = await executeAgentInSandbox(
      sandbox,
      sanitizedInstruction,
      agentType,
      logger,
      parsed.data.selectedModel ?? task.selectedModel ?? undefined,
      connectors,
      undefined,
      apiKeys,
      true,
      task.agentSessionId ?? undefined,
      task.id,
      agentMessageId
    );

    if (!agentResult.success) {
      await logger.error(agentResult.error ?? "Agent execution failed");
      await logger.updateStatus(BuilderTaskStatus.ERROR, agentResult.error ?? "Agent execution failed");
      return NextResponse.json({ error: agentResult.error ?? "Agent execution failed" }, { status: 500 });
    }

    if (agentResult.agentResponse) {
      if (agentMessageId) {
        await updateTaskMessageContent(agentMessageId, agentResult.agentResponse);
      } else {
        await createTaskMessage(task.id, BuilderTaskMessageRole.AGENT, agentResult.agentResponse);
      }
    }

    await logger.updateProgress(70, "Applying git operations");

    const branchName = task.branchName ?? `agent-${task.id.slice(0, 6)}`;
    const commitMessage = `Follow-up: ${parsed.data.instruction.substring(0, 50)}${
      parsed.data.instruction.length > 50 ? "..." : ""
    }`;
    const pushResult = await pushChangesToBranch(sandbox, branchName, commitMessage, logger);

    if (pushResult.pushFailed) {
      await logger.error("Failed to push follow-up changes to repository");
      await logger.updateStatus(BuilderTaskStatus.ERROR, "Failed to push follow-up changes");
      return NextResponse.json({ error: "Failed to push changes to repository" }, { status: 500 });
    }

    if (task.keepAlive) {
      try {
        const packageJsonCheck = await runCommandInSandbox(sandbox, "test", ["-f", "package.json"]);
        if (packageJsonCheck.success) {
          const packageJsonRead = await runCommandInSandbox(sandbox, "cat", ["package.json"]);
          if (packageJsonRead.success && packageJsonRead.output) {
            const pkg = JSON.parse(packageJsonRead.output);
            if (pkg?.scripts?.dev) {
              const packageManager = await detectPackageManager(sandbox, logger);
              const devCommand = packageManager === "npm" ? "npm" : packageManager;
              const devArgs = packageManager === "npm" ? ["run", "dev"] : ["dev"];
              await sandbox.runCommand({ cmd: devCommand, args: devArgs, detached: true });
              await logger.info("Development server restarted after follow-up instruction.");
            }
          }
        }
      } catch (devServerError) {
        console.warn("Failed to restart dev server", devServerError);
      }
    }

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        status: BuilderTaskStatus.COMPLETED,
        progress: 100,
        agentSessionId: agentResult.sessionId ?? task.agentSessionId,
        updatedAt: new Date(),
      },
    });

    await logger.updateProgress(100, "Follow-up completed successfully");
    await logger.success("Follow-up instruction processed successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow-up execution failed", error);
    return NextResponse.json({ error: "Failed to continue task" }, { status: 500 });
  }
}
