import { Sandbox } from "@vercel/sandbox";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { TaskLogger } from "@/lib/coding-agent/task-logger";

export async function pushChangesToBranch(
  sandbox: Sandbox,
  branchName: string,
  commitMessage: string,
  logger: TaskLogger
): Promise<{ success: boolean; pushFailed?: boolean }> {
  try {
    const statusResult = await runCommandInSandbox(sandbox, "git", ["status", "--porcelain"]);

    if (!statusResult.output?.trim()) {
      await logger.info("No changes to commit");
      return { success: true };
    }

    await logger.info("Changes detected, committing...");

    const addResult = await runCommandInSandbox(sandbox, "git", ["add", "."]);
    if (!addResult.success) {
      await logger.info("Failed to add changes");
      return { success: false };
    }

    const commitResult = await runCommandInSandbox(sandbox, "git", ["commit", "-m", commitMessage]);

    if (!commitResult.success) {
      await logger.info("Failed to commit changes");
      return { success: false };
    }

    await logger.info("Changes committed successfully");

    const pushResult = await runCommandInSandbox(sandbox, "git", ["push", "origin", branchName]);

    if (pushResult.success) {
      await logger.info("Successfully pushed changes to branch");
      return { success: true };
    }

    const errorMsg = pushResult.error || "Unknown error";
    await logger.info("Failed to push to branch");

    if (errorMsg.includes("Permission") || errorMsg.includes("access_denied") || errorMsg.includes("403")) {
      await logger.info(
        "Note: This appears to be a permission issue. The changes were committed locally but could not be pushed."
      );
      await logger.info("You may need to check repository permissions or authentication tokens.");
    }

    return { success: true, pushFailed: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    await logger.info("Error pushing changes");
    await logger.error(errorMessage);
    return { success: false };
  }
}

export async function shutdownSandbox(sandbox?: Sandbox): Promise<{ success: boolean; error?: string }> {
  try {
    if (sandbox) {
      try {
        await runCommandInSandbox(sandbox, "pkill", ["-f", "node"]);
        await runCommandInSandbox(sandbox, "pkill", ["-f", "python"]);
        await runCommandInSandbox(sandbox, "pkill", ["-f", "npm"]);
        await runCommandInSandbox(sandbox, "pkill", ["-f", "yarn"]);
        await runCommandInSandbox(sandbox, "pkill", ["-f", "pnpm"]);
      } catch {
        console.log("Best effort process cleanup completed");
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to shutdown sandbox";
    return { success: false, error: errorMessage };
  }
}
