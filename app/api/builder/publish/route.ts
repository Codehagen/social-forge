import { NextRequest, NextResponse } from "next/server";
import { Sandbox } from "@vercel/sandbox";
import { getPublishService, PublishStrategy } from "@/lib/publish/PublishService";
import { promises as fs } from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";
import { getSandbox, reconnectSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";

async function readSandboxFiles(sandbox: Sandbox): Promise<Array<{ file: string; data: string }>> {
  const files: Array<{ file: string; data: string }> = [];

  const findResult = await sandbox.runCommand({
    cmd: "find",
    args: [
      ".",
      "-name",
      "node_modules",
      "-prune",
      "-o",
      "-name",
      ".git",
      "-prune",
      "-o",
      "-name",
      ".next",
      "-prune",
      "-o",
      "-name",
      "dist",
      "-prune",
      "-o",
      "-name",
      "build",
      "-prune",
      "-o",
      "-type",
      "f",
      "-print",
    ],
    cwd: "/vercel/sandbox",
  });

  const stdout = typeof findResult.stdout === "function" ? await findResult.stdout() : findResult.stdout ?? "";
  const filePaths = stdout.split("\n").filter((line) => line.trim() && !line.includes("node_modules") && !line.includes(".git"));

  for (const filePath of filePaths) {
    try {
      const readResult = await sandbox.runCommand({
        cmd: "base64",
        args: [filePath],
        cwd: "/vercel/sandbox",
      });

      const base64Content = typeof readResult.stdout === "function" ? (await readResult.stdout()).trim() : (readResult.stdout || "").trim();

      files.push({
        file: filePath.replace(/^\.\//, ""),
        data: base64Content,
      });
    } catch (error) {
      console.warn(`[publish] Failed to read file ${filePath}`, error);
    }
  }

  return files;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      workspaceId,
      taskId,
      strategy = process.env.PUBLISH_STRATEGY || "vercel",
    }: {
      name?: string;
      workspaceId?: string;
      taskId?: string;
      strategy?: string;
    } = body;

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!taskId) {
      return NextResponse.json({ error: "Missing required field: taskId" }, { status: 400 });
    }

    const task = await prisma.builderTask.findUnique({ where: { id: taskId } });

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.sandboxId) {
      return NextResponse.json({ error: "Sandbox is not active for this task" }, { status: 410 });
    }

    let sandbox = getSandbox(task.id);
    if (!sandbox) {
      sandbox = await reconnectSandbox(task.id, task.sandboxId);
    }

    if (!sandbox) {
      return NextResponse.json({ error: "Unable to access sandbox" }, { status: 410 });
    }

    const deploymentName = name ?? task.branchName ?? `deployment-${Date.now()}`;

    const files = await readSandboxFiles(sandbox);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found in sandbox" },
        { status: 400 }
      );
    }

    // Create a temporary directory with the files for publishing
    const tempDir = path.join(process.cwd(), "temp-publish", `project-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Write files to temp directory
      for (const file of files) {
        const filePath = path.join(tempDir, file.file);
        const dirPath = path.dirname(filePath);
        await fs.mkdir(dirPath, { recursive: true });

        const buffer = Buffer.from(file.data, 'base64');
        await fs.writeFile(filePath, buffer);
      }

      // Publish using the service
      const publishService = getPublishService(strategy as PublishStrategy);
      const result = await publishService.publish({
        projectDir: tempDir,
        name: deploymentName,
        workspaceId,
      });

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: result.url,
        deploymentId: result.deploymentId,
      });
    } finally {
      // Clean up temp directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Failed to clean up temp directory:', cleanupError);
      }
    }
  } catch (error) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
