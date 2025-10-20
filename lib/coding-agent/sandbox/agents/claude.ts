import { Sandbox } from "@vercel/sandbox";
import { Writable } from "stream";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { AgentExecutionResult } from "@/lib/coding-agent/sandbox/types";
import { redactSensitiveInfo } from "@/lib/coding-agent/logging";
import { TaskLogger } from "@/lib/coding-agent/task-logger";
import type { Connector } from "@/lib/coding-agent/connectors";
import { BuilderTaskMessageRole } from "@prisma/client";
import {
  createTaskMessage,
  updateTaskMessageContent,
} from "@/lib/coding-agent/messages";

async function runAndLogCommand(sandbox: Sandbox, command: string, args: string[], logger: TaskLogger) {
  const fullCommand = args.length > 0 ? `${command} ${args.join(" ")}` : command;
  const redactedCommand = redactSensitiveInfo(fullCommand);

  await logger.command(redactedCommand);

  const result = await runCommandInSandbox(sandbox, command, args);

  if (result && result.output && result.output.trim()) {
    const redactedOutput = redactSensitiveInfo(result.output.trim());
    await logger.info(redactedOutput);
  }

  if (result && !result.success && result.error) {
    const redactedError = redactSensitiveInfo(result.error);
    await logger.error(redactedError);
  }

  return result;
}

export async function installClaudeCLI(
  sandbox: Sandbox,
  logger: TaskLogger,
  selectedModel?: string,
  mcpServers?: Connector[]
): Promise<{ success: boolean }> {
  const existingCLICheck = await runCommandInSandbox(sandbox, "which", ["claude"]);

  let claudeInstall: { success: boolean; output?: string; error?: string } = { success: true };

  if (existingCLICheck.success && existingCLICheck.output?.includes("claude")) {
    await logger.info("Claude CLI already installed, skipping installation");
  } else {
    await logger.info("Installing Claude CLI...");
    claudeInstall = await runCommandInSandbox(sandbox, "npm", ["install", "-g", "@anthropic-ai/claude-code"]);
  }

  if (!claudeInstall.success) {
    await logger.info("Failed to install Claude CLI");
    return { success: false };
  }

  await logger.info("Claude CLI installed successfully");

  if (process.env.ANTHROPIC_API_KEY) {
    await logger.info("Authenticating Claude CLI...");
    await runCommandInSandbox(sandbox, "mkdir", ["-p", "$HOME/.config/claude"]);

    if (mcpServers && mcpServers.length > 0) {
      await logger.info("Adding MCP servers");

      for (const server of mcpServers) {
        const serverName = server.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

        if (server.mode === "local") {
          const envPrefix = `ANTHROPIC_API_KEY="${process.env.ANTHROPIC_API_KEY}"`;
          let addMcpCmd = `${envPrefix} claude mcp add "${serverName}" -- ${server.command}`;

          if (server.env && Object.keys(server.env).length > 0) {
            const envVars = Object.entries(server.env)
              .map(([key, value]) => `--env ${key}="${value}"`)
              .join(" ");
            addMcpCmd = addMcpCmd.replace(" --", ` ${envVars} --`);
          }

          const addResult = await runCommandInSandbox(sandbox, "sh", ["-c", addMcpCmd]);

          if (addResult.success) {
            await logger.info("Successfully added local MCP server");
          } else {
            await logger.info("Failed to add MCP server");
          }
        } else {
          const envPrefix = `ANTHROPIC_API_KEY="${process.env.ANTHROPIC_API_KEY}"`;
          let addMcpCmd = `${envPrefix} claude mcp add --transport http "${serverName}" "${server.baseUrl}"`;

          if (server.oauthClientSecret) {
            addMcpCmd += ` --header "Authorization: Bearer ${server.oauthClientSecret}"`;
          }

          if (server.oauthClientId) {
            addMcpCmd += ` --header "X-Client-ID: ${server.oauthClientId}"`;
          }

          const addResult = await runCommandInSandbox(sandbox, "sh", ["-c", addMcpCmd]);

          if (addResult.success) {
            await logger.info("Successfully added remote MCP server");
          } else {
            await logger.info("Failed to add MCP server");
          }
        }
      }
    }

    const modelToUse = selectedModel || "claude-sonnet-4-5-20250929";
    const configFileCmd = `mkdir -p $HOME/.config/claude && cat > $HOME/.config/claude/config.json << 'EOF'
{
  "api_key": "${process.env.ANTHROPIC_API_KEY}",
  "default_model": "${modelToUse}"
}
EOF`;
    const configFileResult = await runCommandInSandbox(sandbox, "sh", ["-c", configFileCmd]);

    if (configFileResult.success) {
      await logger.info("Claude CLI config file created successfully");
    } else {
      await logger.info("Warning: Failed to create Claude CLI config file");
    }

    const verifyAuth = await runCommandInSandbox(sandbox, "sh", [
      "-c",
      `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY} claude --version`,
    ]);
    if (verifyAuth.success) {
      await logger.info("Claude CLI authentication verified");
    } else {
      await logger.info("Warning: Claude CLI authentication could not be verified");
    }
  } else {
    await logger.info("Warning: ANTHROPIC_API_KEY not found, Claude CLI may not work");
  }

  return { success: true };
}

export async function executeClaudeInSandbox(
  sandbox: Sandbox,
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string,
  mcpServers?: Connector[],
  isResumed?: boolean,
  sessionId?: string,
  taskId?: string,
  agentMessageId?: string
): Promise<AgentExecutionResult> {
  let extractedSessionId: string | undefined;
  try {
    const cliCheck = await runAndLogCommand(sandbox, "which", ["claude"], logger);

    if (cliCheck.success) {
      await runAndLogCommand(sandbox, "claude", ["--version"], logger);
      await runAndLogCommand(sandbox, "claude", ["--help"], logger);
    } else {
      const installResult = await installClaudeCLI(sandbox, logger, selectedModel, mcpServers);

      if (!installResult.success) {
        return {
          success: false,
          error: "Failed to install Claude CLI",
          cliName: "claude",
          changesDetected: false,
        };
      }

      const verifyCheck = await runAndLogCommand(sandbox, "which", ["claude"], logger);
      if (!verifyCheck.success) {
        return {
          success: false,
          error: "Claude CLI installation completed but CLI still not found",
          cliName: "claude",
          changesDetected: false,
        };
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        success: false,
        error: "ANTHROPIC_API_KEY environment variable is required but not found",
        cliName: "claude",
        changesDetected: false,
      };
    }

    const modelToUse = selectedModel || "claude-sonnet-4-5-20250929";
    await logger.info(
      `Attempting to execute Claude CLI with model ${modelToUse} and instruction: ${instruction.substring(0, 100)}...`
    );

    const envPrefix = `ANTHROPIC_API_KEY="${process.env.ANTHROPIC_API_KEY}"`;
    const mcpList = await runCommandInSandbox(sandbox, "sh", ["-c", `${envPrefix} claude mcp list`]);
    await logger.info("MCP servers list retrieved");
    if (mcpList.error) {
      await logger.info("MCP list error occurred");
    }

    if (taskId && agentMessageId) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, "", agentMessageId);
    }

    let fullCommand = `${envPrefix} claude --model "${modelToUse}" --dangerously-skip-permissions --output-format stream-json --verbose`;

    if (isResumed) {
      if (sessionId) {
        fullCommand += ` --resume "${sessionId}"`;
        await logger.info("Resuming specific Claude chat session");
      } else {
        fullCommand += ` --resume`;
        await logger.info("Resuming previous Claude conversation");
      }
    }

    fullCommand += ` "${instruction}"`;

    await logger.info("Executing Claude CLI with --dangerously-skip-permissions for automated file changes...");

    const redactedCommand = fullCommand.replace(process.env.ANTHROPIC_API_KEY!, "[REDACTED]");
    await logger.command(redactedCommand);

    let capturedOutput = "";
    let accumulatedContent = "";
    let isCompleted = false;

    const captureStdout = new Writable({
      write(chunk, _encoding, callback) {
        const text = chunk.toString();

        if (!agentMessageId || !taskId) {
          capturedOutput += text;
        }

        if (agentMessageId && taskId) {
          const lines = text.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("//")) continue;

            try {
              const parsed = JSON.parse(trimmed);

              if (parsed.type === "assistant" && parsed.message?.content) {
                for (const contentBlock of parsed.message.content) {
                  if (contentBlock.type === "text" && contentBlock.text) {
                    accumulatedContent += contentBlock.text;
                    updateTaskMessageContent(agentMessageId, accumulatedContent).catch((error) =>
                      console.error("Failed to update message", error)
                    );
                  } else if (contentBlock.type === "tool_use") {
                    let statusMsg = "";
                    const toolName = contentBlock.name;

                    if (toolName === "Write" || toolName === "Edit") {
                      statusMsg = `Editing ${contentBlock.input?.path || "file"}`;
                    } else if (toolName === "Read") {
                      statusMsg = `Reading ${contentBlock.input?.path || "file"}`;
                    } else if (toolName === "Glob") {
                      statusMsg = `Searching files`;
                    } else if (toolName === "Bash") {
                      statusMsg = `Running command`;
                    } else {
                      statusMsg = `Using ${toolName}`;
                    }

                    accumulatedContent += `\n\n${statusMsg}\n\n`;
                    updateTaskMessageContent(agentMessageId, accumulatedContent).catch((error) =>
                      console.error("Failed to update message", error)
                    );
                  }
                }
              } else if (parsed.type === "result") {
                if (parsed.session_id) {
                  extractedSessionId = parsed.session_id;
                }
                isCompleted = true;
              }
            } catch {
              // ignore non-JSON lines
            }
          }
        }

        callback();
      },
    });

    const captureStderr = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    await sandbox.runCommand({
      cmd: "sh",
      args: ["-c", fullCommand],
      sudo: false,
      detached: true,
      stdout: captureStdout,
      stderr: captureStderr,
    });

    await logger.info("Claude command started with output capture, monitoring for completion...");

    while (!isCompleted) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await logger.info("Claude completed successfully");

    const gitStatusCheck = await runAndLogCommand(sandbox, "git", ["status", "--porcelain"], logger);

    const hasChanges = gitStatusCheck.success && gitStatusCheck.output?.trim();

    if (!hasChanges) {
      await logger.info("No changes detected. Checking if files exist...");
      await runAndLogCommand(sandbox, "find", [".", "-name", "README*", "-o", "-name", "readme*"], logger);
      await runAndLogCommand(sandbox, "ls", ["-la"], logger);
    }

    return {
      success: true,
      output: `Claude CLI executed successfully${hasChanges ? " (Changes detected)" : " (No changes made)"}`,
      agentResponse: agentMessageId ? undefined : capturedOutput || "No detailed response available",
      cliName: "claude",
      changesDetected: !!hasChanges,
      sessionId: extractedSessionId,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to execute Claude CLI in sandbox";
    await logger.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
      cliName: "claude",
      changesDetected: false,
    };
  }
}
