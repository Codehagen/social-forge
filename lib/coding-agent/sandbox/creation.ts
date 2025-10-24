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

type ParsedGitHubRepo = {
  owner: string;
  repo: string;
};

function parseGitHubRepo(repoUrl: string): ParsedGitHubRepo | null {
  try {
    const match = repoUrl.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
    if (!match) {
      return null;
    }
    return {
      owner: match[1],
      repo: match[2],
    };
  } catch {
    return null;
  }
}

function buildGitHubHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchDefaultBranch(repo: ParsedGitHubRepo, token?: string | null): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, {
      headers: buildGitHubHeaders(token),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { default_branch?: string } | null;
    if (data && typeof data.default_branch === "string" && data.default_branch.trim().length > 0) {
      return data.default_branch.trim();
    }
  } catch {
    // Ignore network/API errors and fall through to null.
  }
  return null;
}

async function branchExistsOnRemote(
  repo: ParsedGitHubRepo,
  branch: string,
  token?: string | null
): Promise<boolean | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/branches/${encodeURIComponent(branch)}`,
      {
        headers: buildGitHubHeaders(token),
      }
    );

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      return null;
    }

    return true;
  } catch {
    return null;
  }
}

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
    const parsedRepo = parseGitHubRepo(config.repoUrl);

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

    let existingBranch: string | null = config.existingBranchName ?? null;
    let branchNameForEnv = existingBranch ?? "main";

    if (parsedRepo) {
      const branchCheck = existingBranch
        ? await branchExistsOnRemote(parsedRepo, existingBranch, config.githubToken)
        : null;

      if (existingBranch && branchCheck === false) {
        await logger.info(`Branch ${existingBranch} not found on remote, cloning default branch instead`);
        existingBranch = null;
      }

      if (!existingBranch) {
        const defaultBranch = await fetchDefaultBranch(parsedRepo, config.githubToken);
        if (defaultBranch) {
          branchNameForEnv = defaultBranch;
        } else if (!config.existingBranchName) {
          await logger.info("Default branch could not be resolved, falling back to 'main'");
        }
      } else {
        branchNameForEnv = existingBranch;
      }
    }

    await logger.info(`Cloning repository branch "${branchNameForEnv}"`);

    const timeoutMs = Math.min(
      config.timeout ? parseInt(config.timeout.replace(/\D/g, ""), 10) * 60 * 1000 : 60 * 60 * 1000,
      2700000 // Vercel's maximum timeout limit (45 minutes)
    );

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
    try {
      sandbox = await Sandbox.create(sandboxConfig);
      await logger.info("Sandbox created successfully");

      registerSandbox(config.taskId, sandbox, config.keepAlive || false);

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
        await logger.error("Sandbox creation timed out after 5 minutes");
        await logger.error("This usually happens when the repository is large or has many dependencies");
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

            const aptResult = await runCommandInSandbox(sandbox, "apt-get", [
              "update",
              "&&",
              "apt-get",
              "install",
              "-y",
              "python3-pip",
            ]);

            if (!aptResult.success) {
              await logger.info("Warning: Could not install pip, skipping Python dependencies");
            } else {
              await logger.info("pip installed via apt-get");
            }
          }

          await logger.info("pip installed successfully");
        } else {
          await logger.info("pip is available");

          const pipUpgrade = await runCommandInSandbox(sandbox, "python3", ["-m", "pip", "install", "--upgrade", "pip"]);

          if (!pipUpgrade.success) {
            await logger.info("Warning: Failed to upgrade pip, continuing anyway");
          } else {
            await logger.info("pip upgraded successfully");
          }
        }

        const pipInstall = await runCommandInSandbox(sandbox, "python3", ["-m", "pip", "install", "-r", "requirements.txt"]);

        if (!pipInstall.success) {
          await logger.info("pip install failed");
          await logger.info("pip install failed with exit code");

          if (pipInstall.output) {
            await logger.info("pip stdout available");
          }
          if (pipInstall.error) {
            await logger.info("pip stderr available");
          }

          await logger.info("Warning: Failed to install Python dependencies, but continuing with sandbox setup");
        } else {
          await logger.info("Python dependencies installed successfully");
        }
      } else {
        await logger.info("No package.json or requirements.txt found, skipping dependency installation");
      }
    }

    const domain = sandbox.domain(config.ports?.[0] || 3000);
    console.log('[Sandbox Creation] Domain retrieved:', domain);

    if (packageJsonCheck.success) {
      await logger.info("Node.js project detected, sandbox ready for development");
      await logger.info("Sandbox available");
    } else if (requirementsTxtCheck.success) {
      await logger.info("Python project detected, sandbox ready for development");
      await logger.info("Sandbox available");

      const flaskAppCheck = await runCommandInSandbox(sandbox, "test", ["-f", "app.py"]);
      const djangoManageCheck = await runCommandInSandbox(sandbox, "test", ["-f", "manage.py"]);

      if (flaskAppCheck.success) {
        await logger.info("Flask app.py detected, you can run: python3 app.py");
      } else if (djangoManageCheck.success) {
        await logger.info("Django manage.py detected, you can run: python3 manage.py runserver");
      }
    } else {
      await logger.info("Project type not detected, sandbox ready for general development");
      await logger.info("Sandbox available");
    }

    if (config.onCancellationCheck && (await config.onCancellationCheck())) {
      await logger.info("Task was cancelled before Git configuration");
      return { success: false, cancelled: true };
    }

    const gitName = config.gitAuthorName || "Coding Agent";
    const gitEmail = config.gitAuthorEmail || "agent@example.com";
    await runCommandInSandbox(sandbox, "git", ["config", "user.name", gitName]);
    await runCommandInSandbox(sandbox, "git", ["config", "user.email", gitEmail]);

    await logger.info("Configuring Git ignore rules");
    const gitignoreCheck = await runCommandInSandbox(sandbox, "test", ["-f", ".gitignore"]);

    if (gitignoreCheck.success) {
      const checkPnpmStore = await runCommandInSandbox(sandbox, "grep", ["-q", ".pnpm-store", ".gitignore"]);
      const checkNodeModules = await runCommandInSandbox(sandbox, "grep", ["-q", "node_modules", ".gitignore"]);

      if (!checkPnpmStore.success) {
        await runCommandInSandbox(sandbox, "sh", ["-c", "echo \".pnpm-store\" >> .gitignore"]);
      }
      if (!checkNodeModules.success) {
        await runCommandInSandbox(sandbox, "sh", ["-c", "echo \"node_modules\" >> .gitignore"]);
      }
    } else {
      await runCommandInSandbox(sandbox, "sh", ["-c", "echo -e \".pnpm-store\\nnode_modules\" > .gitignore"]);
    }
    await logger.info("Git ignore rules configured");

    const gitRepoCheck = await runCommandInSandbox(sandbox, "git", ["rev-parse", "--git-dir"]);
    if (!gitRepoCheck.success) {
      await logger.info("Not in a Git repository, initializing...");
      const gitInit = await runCommandInSandbox(sandbox, "git", ["init"]);
      if (!gitInit.success) {
        throw new Error("Failed to initialize Git repository");
      }
      await logger.info("Git repository initialized");
    } else {
      await logger.info("Git repository detected");
    }

    let branchName: string;

    if (existingBranch) {
      await logger.info("Checking out existing branch");
      const checkoutResult = await runAndLogCommand(sandbox, "git", ["checkout", existingBranch], logger);

      if (!checkoutResult.success) {
        throw new Error("Failed to checkout existing branch");
      }

      await logger.info("Pulling latest changes from remote");
      const pullResult = await runAndLogCommand(sandbox, "git", ["pull", "origin", existingBranch], logger);

      if (pullResult.output) {
        await logger.info("Git pull completed");
      }

      branchName = existingBranch;
    } else if (config.preDeterminedBranchName) {
      await logger.info("Using pre-determined branch name");

      const branchExistsLocal = await runCommandInSandbox(sandbox, "git", [
        "show-ref",
        "--verify",
        "--quiet",
        `refs/heads/${config.preDeterminedBranchName}`,
      ]);

      if (branchExistsLocal.success) {
        await logger.info("Branch already exists locally, checking it out");
        const checkoutBranch = await runAndLogCommand(sandbox, "git", ["checkout", config.preDeterminedBranchName], logger);

        if (!checkoutBranch.success) {
          await logger.info("Failed to checkout existing branch");
          throw new Error("Failed to checkout Git branch");
        }

        branchName = config.preDeterminedBranchName;
      } else {
        const branchExistsRemote = await runCommandInSandbox(sandbox, "git", [
          "ls-remote",
          "--heads",
          "origin",
          config.preDeterminedBranchName,
        ]);

        if (branchExistsRemote.success && branchExistsRemote.output?.trim()) {
          await logger.info("Branch exists on remote, fetching and checking it out");

          const fetchBranch = await runCommandInSandbox(sandbox, "git", [
            "fetch",
            "origin",
            `${config.preDeterminedBranchName}:${config.preDeterminedBranchName}`,
          ]);

          if (!fetchBranch.success) {
            await logger.info("Failed to fetch remote branch, trying alternative method");

            const fetchAll = await runCommandInSandbox(sandbox, "git", ["fetch", "origin"]);
            if (!fetchAll.success) {
              await logger.info("Failed to fetch from origin");
              throw new Error("Failed to fetch from remote Git repository");
            }

            const checkoutTracking = await runAndLogCommand(
              sandbox,
              "git",
              ["checkout", "-b", config.preDeterminedBranchName, "--track", `origin/${config.preDeterminedBranchName}`],
              logger
            );

            if (!checkoutTracking.success) {
              await logger.info("Failed to checkout and track remote branch");
              throw new Error("Failed to checkout remote Git branch");
            }
          } else {
            const checkoutRemoteBranch = await runAndLogCommand(sandbox, "git", ["checkout", config.preDeterminedBranchName], logger);

            if (!checkoutRemoteBranch.success) {
              await logger.info("Failed to checkout remote branch");
              throw new Error("Failed to checkout remote Git branch");
            }
          }

          branchName = config.preDeterminedBranchName;
        } else {
          await logger.info("Creating new branch");
          const createBranch = await runAndLogCommand(sandbox, "git", ["checkout", "-b", config.preDeterminedBranchName], logger);

          if (!createBranch.success) {
            await logger.info("Failed to create branch");
            const gitStatus = await runCommandInSandbox(sandbox, "git", ["status"]);
            if (gitStatus.success || gitStatus.output || gitStatus.error) {
              await logger.info("Git status retrieved");
            }
            const gitBranch = await runCommandInSandbox(sandbox, "git", ["branch", "-a"]);
            if (gitBranch.success || gitBranch.output || gitBranch.error) {
              await logger.info("Git branches retrieved");
            }
            throw new Error("Failed to create Git branch");
          }

          await logger.info("Successfully created branch");
          branchName = config.preDeterminedBranchName;
        }
      }
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const suffix = generateId();
      branchName = `agent/${timestamp}-${suffix}`;

      await logger.info("No predetermined branch name, using timestamp-based branch");
      const createBranch = await runAndLogCommand(sandbox, "git", ["checkout", "-b", branchName], logger);

      if (!createBranch.success) {
        await logger.info("Failed to create branch");
        const gitStatus = await runCommandInSandbox(sandbox, "git", ["status"]);
        if (gitStatus.success || gitStatus.output || gitStatus.error) {
          await logger.info("Git status retrieved");
        }
        const gitBranch = await runCommandInSandbox(sandbox, "git", ["branch", "-a"]);
        if (gitBranch.success || gitBranch.output || gitBranch.error) {
          await logger.info("Git branches retrieved");
        }
        const gitLog = await runCommandInSandbox(sandbox, "git", ["log", "--oneline", "-5"]);
        if (gitLog.success || gitLog.output || gitLog.error) {
          await logger.info("Recent commits retrieved");
        }
        throw new Error("Failed to create Git branch");
      }

      await logger.info("Successfully created fallback branch");
    }

    return {
      success: true,
      sandbox,
      domain,
      branchName,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Sandbox creation error:", error);
    await logger.error("Error occurred during sandbox creation");
    return {
      success: false,
      error: errorMessage || "Failed to create sandbox",
    };
  }
}
