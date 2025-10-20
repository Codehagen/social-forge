import { Sandbox } from "@vercel/sandbox";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { TaskLogger } from "@/lib/coding-agent/task-logger";

export async function detectPackageManager(
  sandbox: Sandbox,
  logger: TaskLogger
): Promise<"pnpm" | "yarn" | "npm"> {
  const pnpmLockCheck = await runCommandInSandbox(sandbox, "test", ["-f", "pnpm-lock.yaml"]);
  if (pnpmLockCheck.success) {
    await logger.info("Detected pnpm package manager");
    return "pnpm";
  }

  const yarnLockCheck = await runCommandInSandbox(sandbox, "test", ["-f", "yarn.lock"]);
  if (yarnLockCheck.success) {
    await logger.info("Detected yarn package manager");
    return "yarn";
  }

  const npmLockCheck = await runCommandInSandbox(sandbox, "test", ["-f", "package-lock.json"]);
  if (npmLockCheck.success) {
    await logger.info("Detected npm package manager");
    return "npm";
  }

  await logger.info("No lock file found, defaulting to npm");
  return "npm";
}

export async function installDependencies(
  sandbox: Sandbox,
  packageManager: "pnpm" | "yarn" | "npm",
  logger: TaskLogger
): Promise<{ success: boolean; error?: string }> {
  let installCommand: string[];
  let logMessage: string;

  switch (packageManager) {
    case "pnpm": {
      const configStore = await runCommandInSandbox(sandbox, "pnpm", ["config", "set", "store-dir", "/tmp/pnpm-store"]);
      if (!configStore.success) {
        await logger.error("Failed to configure pnpm store directory");
      } else {
        await logger.info("Configured pnpm store directory");
      }

      installCommand = ["pnpm", "install", "--frozen-lockfile"];
      logMessage = "Attempting pnpm install";
      break;
    }
    case "yarn":
      installCommand = ["yarn", "install", "--frozen-lockfile"];
      logMessage = "Attempting yarn install";
      break;
    default:
      installCommand = ["npm", "install", "--no-audit", "--no-fund"];
      logMessage = "Attempting npm install";
      break;
  }

  await logger.info(logMessage);

  const installResult = await runCommandInSandbox(sandbox, installCommand[0], installCommand.slice(1));

  if (installResult.success) {
    await logger.info("Node.js dependencies installed");
    return { success: true };
  }

  await logger.error("Package manager install failed");

  if (installResult.exitCode !== undefined) {
    await logger.error("Install failed with exit code");
    if (installResult.output) await logger.error("Install stdout available");
    if (installResult.error) await logger.error("Install stderr available");
  } else {
    await logger.error("Install error occurred");
  }

  return { success: false, error: installResult.error };
}
