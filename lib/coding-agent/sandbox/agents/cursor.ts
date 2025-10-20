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

export async function executeCursorInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger: TaskLogger,
  _selectedModel?: string,
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

    const cliCheck = await runCommandInSandbox(sandbox, "which", ["cursor-agent"]);
    if (!cliCheck.success) {
      await logger.info("Installing Cursor CLI…");
      const installCommand = 'curl -fsSL https://cursor.com/install | bash';
      const installResult = await runAndLogCommand(sandbox, "sh", ["-c", installCommand], logger);
      if (!installResult.success) {
        return {
          success: false,
          error: `Failed to install Cursor CLI: ${installResult.error ?? "Unknown error"}`,
          cliName: "cursor",
          changesDetected: false,
        };
      }
    }

    const execution = await sandbox.runCommand({
      cmd: "cursor-agent",
      args: ["exec", instruction, "--dangerously-apply-changes"],
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
        output: `Cursor CLI executed successfully${hasChanges ? " (Changes detected)" : " (No changes made)"}`,
        agentResponse: stdout || "Cursor CLI completed the task",
        cliName: "cursor",
        changesDetected: !!hasChanges,
      };
    }

    return {
      success: false,
      error: stderr || "Cursor CLI failed",
      agentResponse: stdout,
      cliName: "cursor",
      changesDetected: !!hasChanges,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to execute Cursor CLI in sandbox";
    await logger.error(message);
    return {
      success: false,
      error: message,
      cliName: "cursor",
      changesDetected: false,
    };
  }
}
