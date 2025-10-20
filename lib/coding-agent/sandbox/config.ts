import { getSandboxCredentials } from "@/lib/coding-agent/sandbox/env";

export function validateEnvironmentVariables(
  selectedAgent: string | undefined = "CLAUDE",
  githubToken?: string | null,
  apiKeys?: {
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    CURSOR_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    AI_GATEWAY_API_KEY?: string;
  }
) {
  const agent = (selectedAgent ?? "CLAUDE").toLowerCase();
  const errors: string[] = [];

  const hasAnthropic = apiKeys?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const hasAiGateway = apiKeys?.AI_GATEWAY_API_KEY || process.env.AI_GATEWAY_API_KEY;

  if (agent === "claude" && !hasAnthropic && !hasAiGateway) {
    errors.push(
      "Claude CLI requires Anthropic access. Provide ANTHROPIC_API_KEY or configure AI_GATEWAY_API_KEY to proxy requests."
    );
  }

  if (agent === "cursor" && !apiKeys?.CURSOR_API_KEY && !process.env.CURSOR_API_KEY) {
    errors.push("CURSOR_API_KEY is required for Cursor CLI. Please add your API key in your profile.");
  }

  if (agent === "codex" && !apiKeys?.AI_GATEWAY_API_KEY && !process.env.AI_GATEWAY_API_KEY) {
    errors.push("AI_GATEWAY_API_KEY is required for Codex CLI. Please add your API key in your profile.");
  }

  if (agent === "gemini" && !apiKeys?.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    errors.push("GEMINI_API_KEY is required for Gemini CLI. Please add your API key in your profile.");
  }

  if (agent === "opencode") {
    if (!hasAiGateway && !hasAnthropic) {
      errors.push(
        "Either AI_GATEWAY_API_KEY or ANTHROPIC_API_KEY is required for OpenCode CLI. Please add at least one API key in your profile."
      );
    }
  }

  if (!githubToken) {
    errors.push(
      "GitHub is required for repository access. Connect your GitHub account or set GITHUB_PERSONAL_ACCESS_TOKEN in your environment."
    );
  }

  const { token, teamId, projectId } = getSandboxCredentials();

  if (!teamId) {
    errors.push(
      "SANDBOX_VERCEL_TEAM_ID is required for sandbox creation (or ensure SANDBOX_VERCEL_OIDC_TOKEN contains owner_id)."
    );
  }

  if (!projectId) {
    errors.push(
      "SANDBOX_VERCEL_PROJECT_ID is required for sandbox creation (or ensure SANDBOX_VERCEL_OIDC_TOKEN contains project_id)."
    );
  }

  if (!token) {
    errors.push("SANDBOX_VERCEL_TOKEN is required for sandbox creation (or provide SANDBOX_VERCEL_OIDC_TOKEN).");
  }

  return {
    valid: errors.length === 0,
    error: errors.length > 0 ? errors.join(", ") : undefined,
  };
}

export function createAuthenticatedRepoUrl(repoUrl: string, githubToken?: string | null): string {
  if (!githubToken) {
    return repoUrl;
  }

  try {
    const url = new URL(repoUrl);
    if (url.hostname === "github.com") {
      url.username = githubToken;
      url.password = "x-oauth-basic";
    }
    return url.toString();
  } catch {
    return repoUrl;
  }
}

export function createSandboxConfiguration(config: {
  repoUrl: string;
  timeout?: string;
  ports?: number[];
  runtime?: string;
  resources?: { vcpus?: number };
  branchName?: string;
}) {
  return {
    template: "node",
    git: {
      url: config.repoUrl,
      branch: config.branchName || "main",
    },
    timeout: config.timeout || "20m",
    ports: config.ports || [3000],
    runtime: config.runtime || "node22",
    resources: config.resources || { vcpus: 4 },
  };
}
