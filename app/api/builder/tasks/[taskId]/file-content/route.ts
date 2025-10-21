"use server";

import { NextRequest, NextResponse } from "next/server";
import type { Octokit } from "@octokit/rest";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getOctokit, parseGitHubUrl } from "@/lib/coding-agent/github";
import { resolveSandbox } from "@/lib/coding-agent/sandbox/helpers";

function getLanguageFromFilename(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
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

async function readFileFromGitHub(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
  isImage: boolean
) {
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
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 404) {
      return { content: "", isBase64: false };
    }
    throw error;
  }

  return { content: "", isBase64: false };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const rawFilename = searchParams.get("filename");
    const mode = searchParams.get("mode") ?? "remote";

    if (!rawFilename) {
      return NextResponse.json({ error: "Missing filename parameter" }, { status: 400 });
    }

    const filename = decodeURIComponent(rawFilename);
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.branchName || !task.repoUrl) {
      return NextResponse.json({ error: "Task does not have branch or repository information" }, { status: 400 });
    }

    const isImage = isImageFile(filename);
    const isBinary = isBinaryFile(filename);

    if (isBinary && !isImage) {
      return NextResponse.json({
        success: true,
        data: {
          filename,
          language: getLanguageFromFilename(filename),
          isBinary: true,
          isImage: false,
          content: "",
          isBase64: false,
          message: "Binary file preview is not supported. Download the file to view its contents.",
        },
      });
    }

    if (mode === "local") {
      if (!task.sandboxId) {
        return NextResponse.json({ error: "Sandbox not available" }, { status: 400 });
      }
      const localContent = await readLocalFile(taskId, task.sandboxId, filename, isImage);
      return NextResponse.json(localContent);
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json({ error: "GitHub authentication required" }, { status: 401 });
    }

    const parsed = parseGitHubUrl(task.repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const content = await readFileFromGitHub(octokit, parsed.owner, parsed.repo, filename, task.branchName, isImage);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        language: getLanguageFromFilename(filename),
        isBinary,
        isImage,
        content: content.content,
        isBase64: content.isBase64,
      },
    });
  } catch (error) {
    console.error("Failed to read file content", error);
    return NextResponse.json({ error: "Failed to read file content" }, { status: 500 });
  }
}

async function readLocalFile(taskId: string, sandboxId: string, filename: string, isImage: boolean) {
  const sandbox = await resolveSandbox(taskId, sandboxId);

  if (!sandbox) {
    return {
      success: false,
      error: "Sandbox not found",
    };
  }

  const catResult = await sandbox.runCommand("cat", [filename]);
  if (catResult.exitCode !== 0) {
    return {
      success: false,
      error: "Failed to load file from sandbox",
    };
  }

  const rawContent = await catResult.stdout();
  return {
    success: true,
    data: {
      filename,
      language: getLanguageFromFilename(filename),
      isBinary: isBinaryFile(filename),
      isImage,
      content: rawContent,
      isBase64: false,
    },
  };
}
