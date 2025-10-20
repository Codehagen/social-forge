import { Sandbox } from "@vercel/sandbox";
import { AgentExecutionResult } from "@/lib/coding-agent/sandbox/types";
import { TaskLogger } from "@/lib/coding-agent/task-logger";
import type { Connector } from "@/lib/coding-agent/connectors";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { redactSensitiveInfo } from "@/lib/coding-agent/logging";
import { BuilderTaskMessageRole } from "@prisma/client";
import { createTaskMessage, updateTaskMessageContent } from "@/lib/coding-agent/messages";

async function runAndLogCommand(sandbox: Sandbox, command: string, args: string[], logger: TaskLogger) {
  const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;
  await logger.command(redactSensitiveInfo(fullCommand));
  const result = await runCommandInSandbox(sandbox, command, args);

  if (result.output && result.output.trim()) {
    await logger.info(redactSensitiveInfo(result.output.trim()));
  }

  if (!result.success && result.error) {
    await logger.error(redactSensitiveInfo(result.error));
  }

  return result;
}

function resolveGitHubToken() {
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
}

export async function executeCopilotInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string,
  _mcpServers?: Connector[],
  _isResumed?: boolean,
  _sessionId?: string,
  taskId?: string,
  agentMessageId?: string
): Promise<AgentExecutionResult> {
  try {
    if (taskId && agentMessageId) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, "", agentMessageId);
    }

    const token = resolveGitHubToken();
    if (!token) {
      return {
        success: false,
        error: "GitHub token not available. Connect your GitHub account before using Copilot.",
        cliName: "copilot",
        changesDetected: false,
      };
    }

    // Install CLI if needed
    const cliCheck = await runCommandInSandbox(sandbox, "which", ["copilot"]);
    if (!cliCheck.success) {
      await logger.info("Installing GitHub Copilot CLI…");
      const installResult = await runAndLogCommand(sandbox, "npm", ["install", "-g", "@github/copilot"], logger);
      if (!installResult.success) {
        return {
          success: false,
          error: `Failed to install Copilot CLI: ${installResult.error ?? "Unknown error"}`,
          cliName: "copilot",
          changesDetected: false,
        };
      }
    }

    const modelFlag = selectedModel ? ["--model", selectedModel] : [];
    const commandArgs = [
      "exec",
      "--dangerously-allow-file-modifications",
      "--no-prompt",
      ...modelFlag,
      instruction,
    ];

    await logger.info("Executing GitHub Copilot CLI instruction…");
    const execution = await sandbox.runCommand({
      cmd: "copilot",
      args: commandArgs,
      env: {
        GH_TOKEN: token,
        GITHUB_TOKEN: token,
      },
    });

    const stdout = typeof execution.stdout === "function" ? await execution.stdout() : execution.stdout ?? "";
    const stderr = typeof execution.stderr === "function" ? await execution.stderr() : execution.stderr ?? "";

    if (stdout.trim()) {
      await logger.info(redactSensitiveInfo(stdout.trim()));
    }

    if (stderr.trim()) {
      await logger.error(redactSensitiveInfo(stderr.trim()));
    }

    const gitStatus = await runAndLogCommand(sandbox, "git", ["status", "--porcelain"], logger);
    const hasChanges = gitStatus.success && gitStatus.output?.trim();

    if (agentMessageId && stdout) {
      await updateTaskMessageContent(agentMessageId, stdout);
    } else if (taskId && stdout) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, stdout);
    }

    if (execution.exitCode === 0) {
      return {
        success: true,
        output: `Copilot CLI executed successfully${hasChanges ? " (Changes detected)" : " (No changes made)"}`,
        agentResponse: stdout || "Copilot CLI completed the task",
        cliName: "copilot",
        changesDetected: !!hasChanges,
      };
    }

    return {
      success: false,
      error: stderr || "Copilot CLI failed",
      agentResponse: stdout,
      cliName: "copilot",
      changesDetected: !!hasChanges,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to execute Copilot CLI in sandbox";
    await logger.error(message);
    return {
      success: false,
      error: message,
      cliName: "copilot",
      changesDetected: false,
    };
  }
}
