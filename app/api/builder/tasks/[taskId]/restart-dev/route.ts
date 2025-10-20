"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";
import { runCommandInSandbox } from "@/lib/coding-agent/sandbox/commands";
import { detectPackageManager } from "@/lib/coding-agent/sandbox/package-manager";
import { createTaskLogger } from "@/lib/coding-agent/task-logger";

export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ error: "Sandbox is not active" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ error: "Sandbox not available" }, { status: 400 });
    }

    const logger = createTaskLogger(taskId);

    const packageJsonCheck = await runCommandInSandbox(sandbox, "test", ["-f", "package.json"]);
    if (!packageJsonCheck.success) {
      return NextResponse.json({ error: "No package.json found in sandbox" }, { status: 400 });
    }

    const packageJsonRead = await runCommandInSandbox(sandbox, "cat", ["package.json"]);
    if (!packageJsonRead.success || !packageJsonRead.output) {
      return NextResponse.json({ error: "Could not read package.json" }, { status: 500 });
    }

    const packageJson = JSON.parse(packageJsonRead.output);
    if (!packageJson?.scripts?.dev) {
      return NextResponse.json({ error: "No dev script found in package.json" }, { status: 400 });
    }

    await runCommandInSandbox(sandbox, "sh", ["-c", "lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true"]);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const packageManager = await detectPackageManager(sandbox, logger);
    const devCommand = packageManager === "npm" ? "npm" : packageManager;
    const devArgs = packageManager === "npm" ? ["run", "dev"] : ["dev"];

    await sandbox.runCommand({
      cmd: devCommand,
      args: devArgs,
      detached: true,
    });

    return NextResponse.json({ success: true, message: "Dev server restarted successfully" });
  } catch (error) {
    console.error("Error restarting dev server:", error);
    return NextResponse.json({ error: "Failed to restart dev server" }, { status: 500 });
  }
}
