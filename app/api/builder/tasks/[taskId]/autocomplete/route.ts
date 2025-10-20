"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const { partial, cwd } = await request.json();

    if (typeof partial !== "string") {
      return NextResponse.json({ success: false, error: "Partial text is required" }, { status: 400 });
    }

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ success: false, error: "No sandbox found for this task" }, { status: 400 });
    }

    const sandbox = await resolveSandbox(taskId, task.sandboxId);
    if (!sandbox) {
      return NextResponse.json({ success: false, error: "Sandbox not available" }, { status: 400 });
    }

    const pwdResult = await sandbox.runCommand("sh", ["-c", "pwd"]);
    let actualCwd = cwd || "/home/vercel-sandbox";

    try {
      const pwdOutput = await pwdResult.stdout();
      if (pwdOutput?.trim()) {
        actualCwd = pwdOutput.trim();
      }
    } catch {
      // ignore
    }

    const tokens = partial.split(/\s+/);
    const lastToken = tokens[tokens.length - 1] ?? "";

    let directory = actualCwd;
    let prefix = "";

    if (lastToken.includes("/")) {
      const lastSlash = lastToken.lastIndexOf("/");
      const pathPart = lastToken.substring(0, lastSlash + 1);
      prefix = lastToken.substring(lastSlash + 1);

      if (pathPart.startsWith("/")) {
        directory = pathPart;
      } else if (pathPart.startsWith("~/")) {
        directory = `/home/vercel-sandbox/${pathPart.substring(2)}`;
      } else {
        directory = `${actualCwd}/${pathPart}`;
      }
    } else {
      prefix = lastToken;
    }

    const escapedDir = `'${directory.replace(/'/g, "'\\''")}'`;
    const lsCommand = `cd ${escapedDir} 2>/dev/null && ls -1ap 2>/dev/null || echo ""`;
    const listResult = await sandbox.runCommand("sh", ["-c", lsCommand]);

    let stdout = "";
    try {
      stdout = await listResult.stdout();
    } catch {
      // ignore
    }

    if (!stdout) {
      return NextResponse.json({ success: true, data: { completions: [], prefix } });
    }

    const completions = stdout
      .trim()
      .split("\n")
      .filter((entry) => entry && entry.toLowerCase().startsWith(prefix.toLowerCase()))
      .map((entry) => ({ name: entry, isDirectory: entry.endsWith("/") }));

    return NextResponse.json({ success: true, data: { completions, prefix } });
  } catch (error) {
    console.error("Error in autocomplete endpoint:", error);
    return NextResponse.json({ success: false, error: "Failed to get completions" }, { status: 500 });
  }
}
