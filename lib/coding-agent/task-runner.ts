"use server";

import { Sandbox } from "@vercel/sandbox";
import { BuilderAgent, BuilderTask, BuilderTaskStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createTaskLogger } from "@/lib/coding-agent/task-logger";
import { createTaskMessage, updateTaskMessageContent } from "@/lib/coding-agent/messages";
import { createSandbox } from "@/lib/coding-agent/sandbox/creation";
import { executeAgentInSandbox } from "@/lib/coding-agent/sandbox/agents";
import { pushChangesToBranch, shutdownSandbox } from "@/lib/coding-agent/sandbox/git";
import { unregisterSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";
import { getUserApiKeys } from "@/lib/coding-agent/api-keys";
import { getUserConnectors } from "@/lib/coding-agent/connectors";
import { BuilderTaskMessageRole } from "@prisma/client";
import { generateId } from "@/lib/coding-agent/id";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { detectPackageManager } from "@/lib/coding-agent/sandbox/package-manager";
import { mapBuilderAgentToCli, sanitizeInstruction } from "@/lib/coding-agent/utils";

type RunTaskOptions = {
  task: BuilderTask;
  prompt: string;
  repoUrl: string;
  selectedAgent: BuilderAgent;
  selectedModel?: string;
  installDependencies: boolean;
  maxDuration: number;
  keepAlive: boolean;
};

function createFallbackBranchName(taskId: string) {
  return `agent-${taskId.slice(0, 6)}`;
}

export async function runBuilderTask(options: RunTaskOptions) {
  const { task } = options;
  const logger = createTaskLogger(task.id);
  let sandbox: Sandbox | null = null;

  try {
    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        status: BuilderTaskStatus.PROCESSING,
      },
    });

    await logger.updateProgress(5, "Initializing task execution...");

    await createTaskMessage(task.id, BuilderTaskMessageRole.USER, options.prompt);

    const branchName = task.branchName ?? createFallbackBranchName(task.id);
    if (task.branchName !== branchName) {
      await prisma.builderTask.update({
        where: { id: task.id },
        data: { branchName },
      });
    }

    const apiKeys = await getUserApiKeys(task.userId ?? undefined);
    const connectors = task.userId ? await getUserConnectors(task.userId) : [];
    const agentType = mapBuilderAgentToCli(options.selectedAgent);

    const sanitizedPrompt = sanitizeInstruction(options.prompt);

    await logger.updateProgress(15, "Creating sandbox environment");

    const sandboxResult = await createSandbox(
      {
        taskId: task.id,
        repoUrl: options.repoUrl,
        githubToken: undefined,
        gitAuthorName: "Social Forge Agent",
        gitAuthorEmail: "agent@socialforge.dev",
        apiKeys,
        timeout: `${options.maxDuration}m`,
        ports: [3000],
        runtime: "node22",
        resources: { vcpus: 4 },
        taskPrompt: sanitizedPrompt,
        selectedAgent: agentType,
        selectedModel: options.selectedModel,
        installDependencies: options.installDependencies,
        keepAlive: options.keepAlive,
        preDeterminedBranchName: branchName,
      },
      logger
    );

    if (!sandboxResult.success || !sandboxResult.sandbox) {
      throw new Error(sandboxResult.error || "Failed to initialize sandbox");
    }

    sandbox = sandboxResult.sandbox;

    const sandboxId = (sandbox as unknown as { sandboxId?: string; id?: string }).sandboxId ??
      (sandbox as unknown as { id?: string }).id ??
      null;

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        sandboxId,
        sandboxUrl: sandboxResult.domain ?? null,
        ...(sandboxResult.branchName && !task.branchName ? { branchName: sandboxResult.branchName } : {}),
      },
    });

    await logger.updateProgress(40, "Sandbox ready, executing agent");

    const agentMessageId = generateId(12);
    const agentResult = await executeAgentInSandbox(
      sandbox,
      sanitizedPrompt,
      agentType,
      logger,
      options.selectedModel,
      connectors,
      undefined,
      apiKeys,
      false,
      undefined,
      task.id,
      agentMessageId
    );

    if (!agentResult.success) {
      throw new Error(agentResult.error || "Agent execution failed");
    }

    if (agentResult.agentResponse) {
      if (agentMessageId) {
        await updateTaskMessageContent(agentMessageId, agentResult.agentResponse);
      } else {
        await createTaskMessage(task.id, BuilderTaskMessageRole.AGENT, agentResult.agentResponse);
      }
    }

    await logger.updateProgress(70, "Applying git operations");

    const commitMessage = `${options.prompt.substring(0, 50)}${options.prompt.length > 50 ? "..." : ""}`;
    const pushResult = await pushChangesToBranch(sandbox, branchName, commitMessage, logger);

    if (pushResult.pushFailed) {
      throw new Error("Failed to push changes to repository. Commit was created locally.");
    }

    if (options.keepAlive) {
      try {
        await logger.info("Keep alive enabled – attempting to start development server.");
        const packageJsonCheck = await runCommandInSandbox(sandbox, "test", ["-f", "package.json"]);

        if (packageJsonCheck.success) {
          const packageJsonRead = await runCommandInSandbox(sandbox, "cat", ["package.json"]);
          if (packageJsonRead.success && packageJsonRead.output) {
            const pkg = JSON.parse(packageJsonRead.output);
            const hasDevScript = pkg?.scripts?.dev;

            if (hasDevScript) {
              const packageManager = await detectPackageManager(sandbox, logger);
              const devCommand = packageManager === "npm" ? "npm" : packageManager;
              const devArgs = packageManager === "npm" ? ["run", "dev"] : ["dev"];

              await sandbox.runCommand({
                cmd: devCommand,
                args: devArgs,
                detached: true,
              });

              await logger.info("Development server started inside sandbox.");
            } else {
              await logger.info("No dev script found; skipping dev server startup.");
            }
          }
        }
      } catch (devError) {
        console.error("Failed to start dev server", devError);
        await logger.info("Unable to start development server. You can run it manually inside the sandbox.");
      }
    }

    await logger.updateProgress(95, "Finalizing task");

    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        agentSessionId: agentResult.sessionId ?? null,
        completedAt: new Date(),
      },
    });

    await logger.updateProgress(100, "Task completed successfully");
    await logger.updateStatus(BuilderTaskStatus.COMPLETED);
    await logger.success("Task completed successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logger.error(message);
    await logger.updateStatus(BuilderTaskStatus.ERROR, message);
    await prisma.builderTask.update({
      where: { id: task.id },
      data: {
        error: message,
      },
    });
  } finally {
    if (sandbox) {
      try {
        if (options.keepAlive) {
          await logger.info("Sandbox kept alive for follow-up instructions.");
        } else {
          unregisterSandbox(task.id);
          await shutdownSandbox(sandbox);
          await prisma.builderTask.update({
            where: { id: task.id },
            data: {
              sandboxId: null,
              sandboxUrl: null,
            },
          });
        }
      } catch (shutdownError) {
        console.error("Failed to shutdown sandbox", shutdownError);
      }
    }
  }
}
