import { Sandbox } from "@vercel/sandbox";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { AgentExecutionResult } from "@/lib/coding-agent/sandbox/types";
import { redactSensitiveInfo } from "@/lib/coding-agent/logging";
import { TaskLogger } from "@/lib/coding-agent/task-logger";
import type { Connector } from "@/lib/coding-agent/connectors";
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

export async function executeCodexInSandbox(
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
  try {
    if (taskId && agentMessageId) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, "", agentMessageId);
    }

    const existingCliCheck = await runCommandInSandbox(sandbox, "which", ["codex"]);

    if (existingCliCheck.success && existingCliCheck.output?.includes("codex")) {
      await logger.info("Codex CLI already installed, skipping installation");
    } else {
      await logger.info("Installing Codex CLI…");
      const installResult = await runAndLogCommand(sandbox, "npm", ["install", "-g", "@openai/codex"], logger);

      if (!installResult.success) {
        return {
          success: false,
          error: `Failed to install Codex CLI: ${installResult.error ?? "Unknown error"}`,
          cliName: "codex",
          changesDetected: false,
        };
      }
    }

    const cliCheck = await runAndLogCommand(sandbox, "which", ["codex"], logger);
    if (!cliCheck.success) {
      return {
        success: false,
        error: "Codex CLI not found after installation.",
        cliName: "codex",
        changesDetected: false,
      };
    }

    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "AI Gateway API key not found. Set AI_GATEWAY_API_KEY in the environment.",
        cliName: "codex",
        changesDetected: false,
      };
    }

    const isVercelKey = apiKey.startsWith("vck_");
    const isOpenAIKey = apiKey.startsWith("sk-");

    if (!isVercelKey && !isOpenAIKey) {
      return {
        success: false,
        error: "Invalid AI Gateway API key format. Expected to start with 'vck_' or 'sk-'.",
        cliName: "codex",
        changesDetected: false,
      };
    }

    const modelToUse = selectedModel || "openai/gpt-4o";
    let configToml = `model = "${modelToUse}"
model_provider = "${isVercelKey ? "vercel-ai-gateway" : "openai"}"

`;

    if (isVercelKey) {
      configToml += `[model_providers.vercel-ai-gateway]
name = "Vercel AI Gateway"
base_url = "https://ai-gateway.vercel.sh/v1"
env_key = "AI_GATEWAY_API_KEY"
wire_api = "chat"

[debug]
log_requests = true
`;
    } else {
      configToml += `[model_providers.openai]
name = "OpenAI"
base_url = "https://api.openai.com/v1"
env_key = "AI_GATEWAY_API_KEY"
wire_api = "responses"

[debug]
log_requests = true
`;
    }

    if (mcpServers && mcpServers.length > 0) {
      const hasRemote = mcpServers.some((server) => server.mode === "remote");
      if (hasRemote) {
        configToml = `experimental_use_rmcp_client = true

` + configToml;
      }

      for (const server of mcpServers) {
        const serverName = server.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

        if (server.mode === "local") {
          const parts = (server.command ?? "").trim().split(/\s+/);
          const executable = parts[0];
          const args = parts.slice(1);

          configToml += `
[mcp_servers.${serverName}]
command = "${executable}"
`;

          if (args.length) {
            configToml += `args = [${args.map((arg) => `"${arg}"`).join(", ")}]
`;
          }

          if (server.env && Object.keys(server.env).length > 0) {
            configToml += `env = { ${Object.entries(server.env)
              .map(([key, value]) => `"${key}" = "${value}"`)
              .join(", ")} }
`;
          }

          await logger.info("Configured local MCP server");
        } else {
          configToml += `
[mcp_servers.${serverName}]
url = "${server.baseUrl ?? ""}"
`;
          if (server.oauthClientSecret) {
            configToml += `bearer_token = "${server.oauthClientSecret}"
`;
          }
          await logger.info("Configured remote MCP server");
        }
      }
    }

    await sandbox.runCommand({
      cmd: "sh",
      args: ["-c", `mkdir -p ~/.codex && cat > ~/.codex/config.toml << 'EOF'\n${configToml}EOF`],
      env: {},
      sudo: false,
    });

    const envPrefix = `AI_GATEWAY_API_KEY="${apiKey}" HOME="/home/vercel-sandbox" CI="true"`;
    let codexCommand = "codex exec --dangerously-bypass-approvals-and-sandbox";

    if (isResumed) {
      codexCommand = "codex resume --last";
      await logger.info("Resuming previous Codex conversation");
    }

    const fullCommand = `${envPrefix} ${codexCommand} "${instruction}"`;
    await logger.command(fullCommand);

    const execution = await runCommandInSandbox(sandbox, "sh", ["-c", fullCommand]);

    if (execution.output && execution.output.trim()) {
      await logger.info(redactSensitiveInfo(execution.output.trim()));
    }

    if (execution.error && execution.error.trim()) {
      await logger.error(redactSensitiveInfo(execution.error.trim()));
    }

    let extractedSessionId: string | undefined = sessionId;
    try {
      const match = execution.output?.match(/(?:session[_\s-]?id|Session)[:\s]+([a-f0-9-]+)/i);
      if (match) {
        extractedSessionId = match[1];
      }
    } catch {
      // ignore
    }

    const gitStatusCheck = await runAndLogCommand(sandbox, "git", ["status", "--porcelain"], logger);
    const hasChanges = gitStatusCheck.success && gitStatusCheck.output?.trim();

    if (agentMessageId && execution.output) {
      await updateTaskMessageContent(agentMessageId, execution.output);
    } else if (taskId && execution.output) {
      await createTaskMessage(taskId, BuilderTaskMessageRole.AGENT, execution.output);
    }

    if (execution.success || execution.exitCode === 0) {
      return {
        success: true,
        output: `Codex CLI executed successfully${hasChanges ? " (Changes detected)" : " (No changes made)"}`,
        agentResponse: execution.output || "Codex CLI completed the task",
        cliName: "codex",
        changesDetected: !!hasChanges,
        sessionId: extractedSessionId,
      };
    }

    return {
      success: false,
      error: `Codex CLI failed${execution.exitCode !== undefined ? ` (exit code ${execution.exitCode})` : ""}: ${
        execution.error || "Unknown error"
      }`,
      agentResponse: execution.output,
      cliName: "codex",
      changesDetected: !!hasChanges,
      sessionId: extractedSessionId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to execute Codex CLI in sandbox";
    await logger.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
      cliName: "codex",
      changesDetected: false,
    };
  }
}
