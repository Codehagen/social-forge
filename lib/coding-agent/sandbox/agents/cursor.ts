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
  selectedModel?: string,
  _mcpServers?: Connector[],
  isResumed?: boolean,
  sessionId?: string,
  taskId?: string,
  agentMessageId?: string
): Promise<AgentExecutionResult> {
  try {
    // Create initial empty agent message in database if streaming
    if (taskId && agentMessageId) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, "", agentMessageId);
    }

    // Check if Cursor CLI is available
    const cliCheck = await runCommandInSandbox(sandbox, "which", ["cursor-agent"]);
    
    if (!cliCheck.success) {
      await logger.info("Installing Cursor CLI...");
      
      // Try multiple installation methods
      const installCommands = [
        'curl -fsSL https://cursor.com/install | bash',
        'npm install -g @cursor/cli',
        'curl -fsSL https://download.cursor.sh/linux/appImage/x86_64 -o cursor.AppImage && chmod +x cursor.AppImage && sudo mv cursor.AppImage /usr/local/bin/cursor-agent'
      ];

      let installSuccess = false;
      let lastError = "";

      for (const installCommand of installCommands) {
        await logger.info(`Trying installation method: ${installCommand.split(' ')[0]}...`);
      const installResult = await runAndLogCommand(sandbox, "sh", ["-c", installCommand], logger);
        
        if (installResult.success) {
          installSuccess = true;
          await logger.info("Cursor CLI installation successful");
          break;
        } else {
          lastError = installResult.error || "Unknown error";
          await logger.info(`Installation method failed: ${lastError}`);
        }
      }

      if (!installSuccess) {
        return {
          success: false,
          error: `Failed to install Cursor CLI with all methods. Last error: ${lastError}`,
          cliName: "cursor",
          changesDetected: false,
        };
      }

      // Verify installation worked
      const verifyCheck = await runCommandInSandbox(sandbox, "which", ["cursor-agent"]);
      if (!verifyCheck.success) {
        return {
          success: false,
          error: "Cursor CLI installation completed but CLI still not found",
          cliName: "cursor",
          changesDetected: false,
        };
      }
    }

    // Get Cursor CLI version for debugging
    const versionCheck = await runAndLogCommand(sandbox, "cursor-agent", ["--version"], logger);
    if (versionCheck.success) {
      await logger.info("Cursor CLI version verified");
    } else {
      await logger.info("Warning: Could not verify Cursor CLI version");
    }

    // Check if Cursor API key is available
    if (!process.env.CURSOR_API_KEY) {
      await logger.info("Warning: CURSOR_API_KEY not found, Cursor CLI may not work properly");
    }

    // Prepare command arguments
    const args = ["exec", instruction];
    
    // Add model selection if provided
    if (selectedModel) {
      args.push("--model", selectedModel);
      await logger.info(`Using selected model: ${selectedModel}`);
    }

    // Add session resumption if resuming
    if (isResumed) {
      if (sessionId) {
        args.push("--session", sessionId);
        await logger.info("Resuming specific Cursor session");
      } else {
        args.push("--continue");
        await logger.info("Continuing last Cursor session");
      }
    }

    // Add dangerous flag for automated changes
    args.push("--dangerously-apply-changes");

    await logger.info("Executing Cursor CLI...");
    const redactedCommand = `cursor-agent ${args.join(' ')}`;
    await logger.command(redactedCommand);

    // Execute Cursor CLI
    const execution = await sandbox.runCommand({
      cmd: "cursor-agent",
      args: args,
      env: {
        CURSOR_API_KEY: process.env.CURSOR_API_KEY || "",
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

    // Check if any files were modified
    const gitStatus = await runAndLogCommand(sandbox, "git", ["status", "--porcelain"], logger);
    const hasChanges = gitStatus.success && gitStatus.output?.trim();

    // Update agent message if we have one
    if (agentMessageId && stdout) {
      await updateTaskMessageContent(agentMessageId, stdout);
    } else if (taskId && stdout) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, stdout);
    }

    // Log additional debugging info if no changes were made
    if (!hasChanges) {
      await logger.info("No changes detected. Checking if files exist...");
      await runAndLogCommand(sandbox, "find", [".", "-name", "README*", "-o", "-name", "readme*"], logger);
      await runAndLogCommand(sandbox, "ls", ["-la"], logger);
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

    // Handle specific error types
    if (stderr.includes("authentication") || stderr.includes("API key")) {
      return {
        success: false,
        error: `Cursor CLI authentication failed. Please set CURSOR_API_KEY environment variable. Error: ${stderr}`,
        agentResponse: stdout,
        cliName: "cursor",
        changesDetected: !!hasChanges,
      };
    }

    return {
      success: false,
      error: `Cursor CLI failed (exit code ${execution.exitCode}): ${stderr || "No error message"}`,
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
