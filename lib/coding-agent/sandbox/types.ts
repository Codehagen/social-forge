import { Sandbox } from "@vercel/sandbox";
import { TaskLogEntry } from "@/lib/coding-agent/logging";

export type SandboxConfig = {
  taskId: string;
  repoUrl: string;
  githubToken?: string | null;
  gitAuthorName?: string;
  gitAuthorEmail?: string;
  apiKeys?: {
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    CURSOR_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    AI_GATEWAY_API_KEY?: string;
  };
  timeout?: string;
  ports?: number[];
  runtime?: string;
  resources?: {
    vcpus?: number;
  };
  taskPrompt?: string;
  selectedAgent?: string;
  selectedModel?: string;
  installDependencies?: boolean;
  keepAlive?: boolean;
  preDeterminedBranchName?: string;
  existingBranchName?: string;
  onProgress?: (progress: number, message: string) => Promise<void>;
  onCancellationCheck?: () => Promise<boolean>;
};

export type SandboxResult = {
  success: boolean;
  sandbox?: Sandbox;
  domain?: string;
  branchName?: string;
  error?: string;
  cancelled?: boolean;
};

export type AgentExecutionResult = {
  success: boolean;
  output?: string;
  agentResponse?: string;
  cliName?: string;
  changesDetected?: boolean;
  error?: string;
  streamingLogs?: unknown[];
  logs?: TaskLogEntry[];
  sessionId?: string;
};
