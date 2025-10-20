import { Sandbox } from "@vercel/sandbox";
import { validateEnvironmentVariables, createAuthenticatedRepoUrl } from "@/lib/coding-agent/sandbox/config";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { generateId } from "@/lib/coding-agent/id";
import { SandboxConfig, SandboxResult } from "@/lib/coding-agent/sandbox/types";
import { redactSensitiveInfo } from "@/lib/coding-agent/logging";
import { TaskLogger } from "@/lib/coding-agent/task-logger";
import { detectPackageManager, installDependencies } from "@/lib/coding-agent/sandbox/package-manager";
import { registerSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";
import { resolveSandboxCredentials } from "@/lib/coding-agent/sandbox/env";
import { getSandboxCredentials } from "@/lib/coding-agent/sandbox/env";

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

export async function createSandbox(config: SandboxConfig, logger: TaskLogger): Promise<SandboxResult> {
  try {
    await logger.info("Processing repository URL");

    if (config.onCancellationCheck && (await config.onCancellationCheck())) {
      await logger.info("Task was cancelled before sandbox creation");
      return { success: false, cancelled: true };
    }

    if (config.onProgress) {
      await config.onProgress(20, "Validating environment variables...");
    }

    const envValidation = validateEnvironmentVariables(config.selectedAgent, config.githubToken, config.apiKeys);
    if (!envValidation.valid) {
      throw new Error(envValidation.error!);
    }
    await logger.info("Environment variables validated");

    const authenticatedRepoUrl = createAuthenticatedRepoUrl(config.repoUrl, config.githubToken);
    await logger.info("Added GitHub authentication to repository URL");

    const branchNameForEnv = config.existingBranchName;

    const timeoutMs = config.timeout ? parseInt(config.timeout.replace(/\D/g, ""), 10) * 60 * 1000 : 60 * 60 * 1000;

    const { token, teamId, projectId } = await resolveSandboxCredentials();
    if (!token || !teamId || !projectId) {
      throw new Error(
        "Missing Vercel sandbox credentials. Ensure SANDBOX_VERCEL_TOKEN (or SANDBOX_VERCEL_OIDC_TOKEN), SANDBOX_VERCEL_TEAM_ID, and SANDBOX_VERCEL_PROJECT_ID are configured."
      );
    }

    const sandboxConfig = {
      teamId,
      projectId,
      token,
      source: {
        type: "git" as const,
        url: authenticatedRepoUrl,
        revision: branchNameForEnv || "main",
        depth: 1,
      },
      timeout: timeoutMs,
      ports: config.ports || [3000],
      runtime: config.runtime || "node22",
      resources: { vcpus: config.resources?.vcpus || 4 },
    };

    if (config.onProgress) {
      await config.onProgress(25, "Validating configuration...");
    }

    let sandbox: Sandbox;
    let sandboxDomain: string | undefined;
    try {
      sandbox = await Sandbox.create(sandboxConfig);
      await logger.info("Sandbox created successfully");

      registerSandbox(config.taskId, sandbox, config.keepAlive || false);

      try {
        sandboxDomain = sandbox.domain(config.ports?.[0] ?? 3000);
      } catch (error) {
        console.warn("Failed to compute sandbox domain", error);
      }

      if (config.onCancellationCheck && (await config.onCancellationCheck())) {
        await logger.info("Task was cancelled after sandbox creation");
        return { success: false, cancelled: true };
      }

      if (config.onProgress) {
        await config.onProgress(30, "Sandbox created, installing dependencies...");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      const errorName = error instanceof Error ? error.name : "UnknownError";
      const errorCode =
        error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
      const errorResponse =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { status?: number; data?: unknown } }).response
          : undefined;

      if (errorMessage?.includes("timeout") || errorCode === "ETIMEDOUT" || errorName === "TimeoutError") {
        await logger.error(`Sandbox creation timed out after 5 minutes`);
        await logger.error(`This usually happens when the repository is large or has many dependencies`);
        throw new Error("Sandbox creation timed out. Try with a smaller repository or fewer dependencies.");
      }

      await logger.error("Sandbox creation failed");
      if (errorResponse) {
        await logger.error("HTTP error occurred");
        await logger.error("Error response received");
      }
      throw error;
    }

    if (config.installDependencies !== false) {
      await logger.info("Detecting project type and installing dependencies...");
    } else {
      await logger.info("Skipping dependency installation as requested by user");
    }

    const packageJsonCheck = await runCommandInSandbox(sandbox, "test", ["-f", "package.json"]);
    const requirementsTxtCheck = await runCommandInSandbox(sandbox, "test", ["-f", "requirements.txt"]);

    if (config.installDependencies !== false) {
      if (packageJsonCheck.success) {
        await logger.info("package.json found, installing Node.js dependencies...");

        const packageManager = await detectPackageManager(sandbox, logger);

        if (packageManager === "pnpm") {
          const pnpmCheck = await runCommandInSandbox(sandbox, "which", ["pnpm"]);
          if (!pnpmCheck.success) {
            await logger.info("Installing pnpm globally...");
            const pnpmGlobalInstall = await runCommandInSandbox(sandbox, "npm", ["install", "-g", "pnpm"]);
            if (!pnpmGlobalInstall.success) {
              await logger.error("Failed to install pnpm globally, falling back to npm");
              const npmResult = await installDependencies(sandbox, "npm", logger);
              if (!npmResult.success) {
                await logger.info("Warning: Failed to install Node.js dependencies, but continuing with sandbox setup");
              }
            } else {
              await logger.info("pnpm installed globally");
            }
          }
        } else if (packageManager === "yarn") {
          const yarnCheck = await runCommandInSandbox(sandbox, "which", ["yarn"]);
          if (!yarnCheck.success) {
            await logger.info("Installing yarn globally...");
            const yarnGlobalInstall = await runCommandInSandbox(sandbox, "npm", ["install", "-g", "yarn"]);
            if (!yarnGlobalInstall.success) {
              await logger.error("Failed to install yarn globally, falling back to npm");
              const npmResult = await installDependencies(sandbox, "npm", logger);
              if (!npmResult.success) {
                await logger.info("Warning: Failed to install Node.js dependencies, but continuing with sandbox setup");
              }
            } else {
              await logger.info("yarn installed globally");
            }
          }
        }

        if (config.onProgress) {
          await config.onProgress(35, "Installing Node.js dependencies...");
        }

        const installResult = await installDependencies(sandbox, packageManager, logger);

        if (config.onCancellationCheck && (await config.onCancellationCheck())) {
          await logger.info("Task was cancelled after dependency installation");
          return { success: false, cancelled: true };
        }

        if (!installResult.success && packageManager !== "npm") {
          await logger.info("Package manager failed, trying npm as fallback");

          if (config.onProgress) {
            await config.onProgress(37, `${packageManager} failed, trying npm fallback...`);
          }

          const npmFallbackResult = await installDependencies(sandbox, "npm", logger);
          if (!npmFallbackResult.success) {
            await logger.info("Warning: Failed to install Node.js dependencies, but continuing with sandbox setup");
          }
        } else if (!installResult.success) {
          await logger.info("Warning: Failed to install Node.js dependencies, but continuing with sandbox setup");
        }
      } else if (requirementsTxtCheck.success) {
        await logger.info("requirements.txt found, installing Python dependencies...");

        if (config.onProgress) {
          await config.onProgress(35, "Installing Python dependencies...");
        }

        const pipCheck = await runCommandInSandbox(sandbox, "python3", ["-m", "pip", "--version"]);

        if (!pipCheck.success) {
          await logger.info("pip not found, installing pip...");

          const getPipResult = await runCommandInSandbox(sandbox, "sh", [
            "-c",
            "cd /tmp && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 get-pip.py && rm -f get-pip.py",
          ]);

          if (!getPipResult.success) {
            await logger.info("Failed to install pip, trying alternative method...");
            const ensurePip = await runCommandInSandbox(sandbox, "python3", ["-m", "ensurepip", "--upgrade"]);
            if (!ensurePip.success) {
              await logger.info("Warning: Failed to install pip, continuing without Python dependencies");
            }
          }
        }

        const pipInstall = await runCommandInSandbox(sandbox, "pip3", ["install", "-r", "requirements.txt"]);
        if (!pipInstall.success) {
          await logger.info("Warning: Failed to install Python dependencies, but continuing with sandbox setup");
        }

        if (config.onCancellationCheck && (await config.onCancellationCheck())) {
          await logger.info("Task was cancelled after dependency installation");
          return { success: false, cancelled: true };
        }
      } else {
        await logger.info("No lockfile found, skipping dependency installation");
      }
    }

    if (config.onProgress) {
      await config.onProgress(40, "Repository ready in sandbox");
    }

    if (config.gitAuthorName || config.gitAuthorEmail) {
      if (config.gitAuthorName) {
        await runAndLogCommand(sandbox, "git", ["config", "user.name", config.gitAuthorName], logger);
      }
      if (config.gitAuthorEmail) {
        await runAndLogCommand(sandbox, "git", ["config", "user.email", config.gitAuthorEmail], logger);
      }
    }

    if (config.onProgress) {
      await config.onProgress(45, "Git configuration applied");
    }

    if (!branchNameForEnv && config.preDeterminedBranchName) {
      const createBranch = await runAndLogCommand(
        sandbox,
        "git",
        ["checkout", "-b", config.preDeterminedBranchName],
        logger
      );

      if (!createBranch.success) {
        await logger.info("Failed to create predetermined branch, falling back to unique branch name");

        const fallbackBranch = `agent-${generateId(6)}`;
        const fallbackResult = await runAndLogCommand(sandbox, "git", ["checkout", "-b", fallbackBranch], logger);
        if (!fallbackResult.success) {
          await logger.info("Failed to create fallback branch");
        } else {
          config.preDeterminedBranchName = fallbackBranch;
        }
      }
    }

    return {
      success: true,
      sandbox,
      branchName: config.preDeterminedBranchName,
      domain: sandboxDomain,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    await logger.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
