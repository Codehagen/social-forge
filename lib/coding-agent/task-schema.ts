import { z } from "zod";

export const CreateTaskRequestSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().min(1, "Prompt is required"),
  repoUrl: z.string().url("Repository URL must be valid"),
  selectedAgent: z.string().optional(),
  selectedModel: z.string().optional(),
  installDependencies: z.boolean().optional(),
  maxDuration: z.number().int().positive().optional(),
  keepAlive: z.boolean().optional(),
  mcpConnectorIds: z.array(z.string()).optional(),
  workspaceId: z.string().optional(),
});

export const ContinueTaskRequestSchema = z.object({
  instruction: z.string().min(1, "Instruction is required"),
  keepAlive: z.boolean().optional(),
  selectedModel: z.string().optional(),
});
