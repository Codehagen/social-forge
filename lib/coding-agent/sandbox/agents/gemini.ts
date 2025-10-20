import { Sandbox } from "@vercel/sandbox";
import { AgentExecutionResult } from "@/lib/coding-agent/sandbox/types";
import { TaskLogger } from "@/lib/coding-agent/task-logger";
import type { Connector } from "@/lib/coding-agent/connectors";

export async function executeGeminiInSandbox(
  _sandbox: Sandbox,
  instruction: string,
  logger: TaskLogger,
  selectedModel?: string,
  _mcpServers?: Connector[]
): Promise<AgentExecutionResult> {
  await logger.info(`Gemini agent not yet implemented. Instruction: ${instruction.substring(0, 120)}...`);
  return {
    success: false,
    error: "Gemini agent integration is not yet available.",
    cliName: "gemini",
    changesDetected: false,
  };
}
