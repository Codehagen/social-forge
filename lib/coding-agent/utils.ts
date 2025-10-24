import { BuilderAgent } from "@prisma/client";
import { AgentType } from "@/lib/coding-agent/sandbox/agents";

export function mapBuilderAgentToCli(agent: BuilderAgent | null): AgentType {
  switch (agent) {
    case BuilderAgent.CODEX:
      return "codex";
    case BuilderAgent.COPILOT:
      return "copilot";
    case BuilderAgent.CURSOR:
      return "cursor";
    case BuilderAgent.GEMINI:
      return "gemini";
    case BuilderAgent.OPENCODE:
      return "opencode";
    case BuilderAgent.CLAUDE:
    default:
      return "claude";
  }
}

export function sanitizeInstruction(input: string) {
  return input
    .replace(/`/g, "'")
    .replace(/\$/g, "")
    .replace(/\\/g, "")
    .replace(/^-+/gm, " -");
}
