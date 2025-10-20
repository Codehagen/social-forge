"use server";

import { NextRequest, NextResponse } from "next/server";
import type { Octokit } from "@octokit/rest";
import { getServerSession } from "@/lib/coding-agent/session";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getOctokit, parseGitHubUrl } from "@/lib/coding-agent/github";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    sh: "bash",
    yaml: "yaml",
    yml: "yaml",
    json: "json",
    xml: "xml",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",
    md: "markdown",
    sql: "sql",
  };
  return langMap[ext ?? ""] ?? "text";
}

function isImageFile(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp", "ico", "tiff", "tif"].includes(ext ?? "");
}

function isBinaryFile(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const binaryExtensions = [
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "bz2",
    "exe",
    "dll",
    "so",
    "dylib",
    "db",
    "sqlite",
    "sqlite3",
    "mp3",
    "mp4",
    "avi",
    "mov",
    "wav",
    "flac",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "ttf",
    "otf",
    "woff",
    "woff2",
    "eot",
    "bin",
    "dat",
    "dmg",
    "iso",
    "img",
  ];
  return binaryExtensions.includes(ext ?? "") || isImageFile(filename);
}

async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
  isImage: boolean
): Promise<{ content: string; isBase64: boolean }> {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if ("content" in response.data && typeof response.data.content === "string") {
      if (isImage) {
        return { content: response.data.content, isBase64: true };
      }
      return {
        content: Buffer.from(response.data.content, "base64").toString("utf-8"),
        isBase64: false,
      };
    }

    return { content: "", isBase64: false };
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 404) {
      return { content: "", isBase64: false };
    }
    throw error;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename");
    const mode = searchParams.get("mode");

    if (!filename) {
      return NextResponse.json({ error: "Missing filename parameter" }, { status: 400 });
    }

    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.branchName || !task.repoUrl) {
      return NextResponse.json({ error: "Task does not have branch or repository information" }, { status: 400 });
    }

    if (mode === "local") {
      if (!task.sandboxId) {
        return NextResponse.json({ error: "Sandbox not available" }, { status: 400 });
      }
      const diff = await getLocalDiff(taskId, task.sandboxId, filename);
      return NextResponse.json(diff);
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json({ error: "GitHub authentication required" }, { status: 401 });
    }

    const parsed = parseGitHubUrl(task.repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const isImage = isImageFile(filename);
    const isBinary = isBinaryFile(filename);

    const [baseFile, headFile] = await Promise.all([
      getFileContent(octokit, parsed.owner, parsed.repo, filename, "main", isImage),
      getFileContent(octokit, parsed.owner, parsed.repo, filename, task.branchName, isImage),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        language: getLanguageFromFilename(filename),
        isImage,
        isBinary,
        baseContent: baseFile.content,
        baseIsBase64: baseFile.isBase64,
        headContent: headFile.content,
        headIsBase64: headFile.isBase64,
      },
    });
  } catch (error) {
    console.error("Failed to compute diff", error);
    return NextResponse.json({ error: "Failed to compute diff" }, { status: 500 });
  }
}

async function getLocalDiff(taskId: string, sandboxId: string, filename: string) {
  const { getSandbox } = await import("@/lib/coding-agent/sandbox/sandbox-registry");
  const { Sandbox } = await import("@vercel/sandbox");

  const sandbox = await resolveSandbox(taskId, sandboxId);

  if (!sandbox) {
    return {
      success: false,
      error: "Sandbox not found",
    };
  }

  const diffResult = await sandbox.runCommand("git", ["diff", "HEAD", "--", filename]);
  if (diffResult.exitCode !== 0) {
    return {
      success: false,
      error: "Failed to generate diff",
    };
  }

  const diff = await diffResult.stdout();
  return {
    success: true,
    data: {
      filename,
      language: getLanguageFromFilename(filename),
      isImage: isImageFile(filename),
      isBinary: isBinaryFile(filename),
      diff,
    },
  };
}
