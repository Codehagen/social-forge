import { Sandbox } from "@vercel/sandbox";
import { AgentExecutionResult } from "@/lib/coding-agent/sandbox/types";
import { executeClaudeInSandbox } from "@/lib/coding-agent/sandbox/agents/claude";
import { executeCodexInSandbox } from "@/lib/coding-agent/sandbox/agents/codex";
import { executeCopilotInSandbox } from "@/lib/coding-agent/sandbox/agents/copilot";
import { executeCursorInSandbox } from "@/lib/coding-agent/sandbox/agents/cursor";
import { executeGeminiInSandbox } from "@/lib/coding-agent/sandbox/agents/gemini";
import { executeOpenCodeInSandbox } from "@/lib/coding-agent/sandbox/agents/opencode";
import { TaskLogger } from "@/lib/coding-agent/task-logger";
import type { Connector } from "@/lib/coding-agent/connectors";

export type AgentType = "claude" | "codex" | "copilot" | "cursor" | "gemini" | "opencode";

export async function executeAgentInSandbox(
  sandbox: Sandbox,
  instruction: string,
  agentType: AgentType,
  logger: TaskLogger,
  selectedModel?: string,
  mcpServers?: Connector[],
  onCancellationCheck?: () => Promise<boolean>,
  apiKeys?: {
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    CURSOR_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    AI_GATEWAY_API_KEY?: string;
  },
  isResumed?: boolean,
  sessionId?: string,
  taskId?: string,
  agentMessageId?: string
): Promise<AgentExecutionResult> {
  if (onCancellationCheck && (await onCancellationCheck())) {
    await logger.info("Task was cancelled before agent execution");
    return {
      success: false,
      error: "Task was cancelled",
      cliName: agentType,
      changesDetected: false,
    };
  }

  let githubToken: string | undefined;
  if (agentType === "copilot") {
    const { getUserGitHubToken } = await import("@/lib/github/user-token");
    githubToken = (await getUserGitHubToken()) || undefined;
  }

  const originalEnv = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CURSOR_API_KEY: process.env.CURSOR_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    GH_TOKEN: process.env.GH_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };

  if (apiKeys?.OPENAI_API_KEY) process.env.OPENAI_API_KEY = apiKeys.OPENAI_API_KEY;
  if (apiKeys?.GEMINI_API_KEY) process.env.GEMINI_API_KEY = apiKeys.GEMINI_API_KEY;
  if (apiKeys?.CURSOR_API_KEY) process.env.CURSOR_API_KEY = apiKeys.CURSOR_API_KEY;
  if (apiKeys?.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = apiKeys.ANTHROPIC_API_KEY;
  if (apiKeys?.AI_GATEWAY_API_KEY) process.env.AI_GATEWAY_API_KEY = apiKeys.AI_GATEWAY_API_KEY;
  if (githubToken) {
    process.env.GH_TOKEN = githubToken;
    process.env.GITHUB_TOKEN = githubToken;
  }

  try {
    switch (agentType) {
      case "claude":
        return await executeClaudeInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
          agentMessageId
        );

      case "codex":
        return await executeCodexInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
          agentMessageId
        );

      case "copilot":
        return await executeCopilotInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId
        );

      case "cursor":
        return await executeCursorInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
          agentMessageId
        );

      case "gemini":
        return await executeGeminiInSandbox(sandbox, instruction, logger, selectedModel, mcpServers, isResumed, sessionId, taskId, agentMessageId);

      case "opencode":
        return await executeOpenCodeInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
          agentMessageId
        );

      default:
        return {
          success: false,
          error: `Unknown agent type: ${agentType}`,
          cliName: agentType,
          changesDetected: false,
        };
    }
  } finally {
    process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
    process.env.GEMINI_API_KEY = originalEnv.GEMINI_API_KEY;
    process.env.CURSOR_API_KEY = originalEnv.CURSOR_API_KEY;
    process.env.ANTHROPIC_API_KEY = originalEnv.ANTHROPIC_API_KEY;
    process.env.AI_GATEWAY_API_KEY = originalEnv.AI_GATEWAY_API_KEY;
    process.env.GH_TOKEN = originalEnv.GH_TOKEN;
    process.env.GITHUB_TOKEN = originalEnv.GITHUB_TOKEN;
  }
}
