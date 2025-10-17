import { Sandbox } from '@vercel/sandbox'
import { AgentExecutionResult } from '../types'
import { executeClaudeInSandbox } from './claude'
// import { executeCodexInSandbox } from './codex'
import { executeCopilotInSandbox } from './copilot'
import { executeCursorInSandbox } from './cursor'
import { executeGeminiInSandbox } from './gemini'
import { executeOpenCodeInSandbox } from './opencode'
import { TaskLogger } from '@/lib/utils/task-logger'
import { Connector } from '@/lib/db/schema'

export type AgentType = 'claude' | 'codex' | 'copilot' | 'cursor' | 'gemini' | 'opencode'

// Simple OpenAI implementation for MVP
async function executeSimpleOpenAI(
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string
): Promise<AgentExecutionResult> {
  try {
    const { generateText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });

    await logger.info("Initializing OpenAI...");

    const model = selectedModel || "gpt-4o";
    const systemPrompt = `You are an expert software developer. Generate clean, well-documented code based on the user's request.
    Provide only the code without explanations, unless specifically asked for documentation.
    Use modern JavaScript/TypeScript best practices.
    Include appropriate imports and exports.`;

    await logger.info("Sending request to OpenAI...");
    const result = await generateText({
      model: openai(model),
      system: systemPrompt,
      prompt: `Generate code for: ${instruction}`,
    });

    await logger.success("Code generated successfully");

    return {
      success: true,
      output: "OpenAI code generation completed",
      agentResponse: result.text,
      cliName: "codex",
      changesDetected: false,
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    await logger.error("Failed to generate code with OpenAI");
    return {
      success: false,
      error: "Failed to generate code with OpenAI",
      cliName: "codex",
      changesDetected: false,
    };
  }
}

// Re-export types
export type { AgentExecutionResult } from '../types'

// Main agent execution function
export async function executeAgentInSandbox(
  sandbox: Sandbox,
  instruction: string,
  agentType: AgentType,
  logger: TaskLogger,
  selectedModel?: string,
  mcpServers?: Connector[],
  onCancellationCheck?: () => Promise<boolean>,
  apiKeys?: {
    OPENAI_API_KEY?: string
    GEMINI_API_KEY?: string
    CURSOR_API_KEY?: string
    ANTHROPIC_API_KEY?: string
    AI_GATEWAY_API_KEY?: string
  },
  isResumed?: boolean,
  sessionId?: string,
  taskId?: string,
  agentMessageId?: string,
): Promise<AgentExecutionResult> {
  // Check for cancellation before starting agent execution
  if (onCancellationCheck && (await onCancellationCheck())) {
    await logger.info('Task was cancelled before agent execution')
    return {
      success: false,
      error: 'Task was cancelled',
      cliName: agentType,
      changesDetected: false,
    }
  }

  // Temporarily override process.env with user's API keys if provided
  const originalEnv = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CURSOR_API_KEY: process.env.CURSOR_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  }

  if (apiKeys?.OPENAI_API_KEY) process.env.OPENAI_API_KEY = apiKeys.OPENAI_API_KEY
  if (apiKeys?.GEMINI_API_KEY) process.env.GEMINI_API_KEY = apiKeys.GEMINI_API_KEY
  if (apiKeys?.CURSOR_API_KEY) process.env.CURSOR_API_KEY = apiKeys.CURSOR_API_KEY
  if (apiKeys?.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = apiKeys.ANTHROPIC_API_KEY
  if (apiKeys?.AI_GATEWAY_API_KEY) process.env.AI_GATEWAY_API_KEY = apiKeys.AI_GATEWAY_API_KEY

  try {
    switch (agentType) {
      case 'claude':
        return await executeClaudeInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
          agentMessageId,
        )

      case 'codex':
        // For MVP, use simple OpenAI implementation
        return await executeSimpleOpenAI(instruction, logger, selectedModel)

      case 'copilot':
        return await executeCopilotInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
          agentMessageId,
        )

      case 'cursor':
        return await executeCursorInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
          taskId,
        )

      case 'gemini':
        // For MVP, use simple Gemini implementation
        return await executeSimpleGemini(instruction, logger, selectedModel)

      case 'opencode':
        return await executeOpenCodeInSandbox(
          sandbox,
          instruction,
          logger,
          selectedModel,
          mcpServers,
          isResumed,
          sessionId,
        )

      default:
        return {
          success: false,
          error: `Unknown agent type: ${agentType}`,
          cliName: agentType,
          changesDetected: false,
        }
    }
  } finally {
    // Restore original environment variables
    process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY
    process.env.GEMINI_API_KEY = originalEnv.GEMINI_API_KEY
    process.env.CURSOR_API_KEY = originalEnv.CURSOR_API_KEY
    process.env.ANTHROPIC_API_KEY = originalEnv.ANTHROPIC_API_KEY
    process.env.AI_GATEWAY_API_KEY = originalEnv.AI_GATEWAY_API_KEY
  }
}

// Simple Gemini implementation for MVP
async function executeSimpleGemini(
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string
): Promise<AgentExecutionResult> {
  try {
    const { generateText } = await import("ai");
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");

    const gemini = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    await logger.info("Initializing Gemini...");

    const model = selectedModel || "gemini-1.5-flash";
    const systemPrompt = `You are an expert software developer. Generate clean, well-documented code based on the user's request.
    Provide only the code without explanations, unless specifically asked for documentation.
    Use modern JavaScript/TypeScript best practices.
    Include appropriate imports and exports.`;

    await logger.info("Sending request to Gemini...");
    const result = await generateText({
      model: gemini(model),
      system: systemPrompt,
      prompt: `Generate code for: ${instruction}`,
    });

    await logger.success("Code generated successfully");

    return {
      success: true,
      output: "Gemini code generation completed",
      agentResponse: result.text,
      cliName: "gemini",
      changesDetected: false,
    };
  } catch (error) {
    console.error("Gemini error:", error);
    await logger.error("Failed to generate code with Gemini");
    return {
      success: false,
      error: "Failed to generate code with Gemini",
      cliName: "gemini",
      changesDetected: false,
    };
  }
}
