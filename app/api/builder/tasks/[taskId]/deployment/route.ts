"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBuilderTaskForUser } from "@/lib/coding-agent/task-utils";
import { getOctokit, parseGitHubUrl } from "@/lib/coding-agent/github";

function convertFeedbackUrl(url: string) {
  const match = url.match(/vercel\.live\/open-feedback\/(.+)/);
  return match ? `https://${match[1]}` : url;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const task = await getBuilderTaskForUser(taskId, session.user.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.previewUrl) {
      const previewUrl = convertFeedbackUrl(task.previewUrl);
      if (previewUrl !== task.previewUrl) {
        await prisma.builderTask.update({
          where: { id: task.id },
          data: { previewUrl },
        });
      }

      return NextResponse.json({
        success: true,
        data: { hasDeployment: true, previewUrl, cached: true },
      });
    }

    if (!task.branchName || !task.repoUrl) {
      return NextResponse.json({
        success: true,
        data: {
          hasDeployment: false,
          message: "Task does not have branch or repository information",
        },
      });
    }

    const parsed = parseGitHubUrl(task.repoUrl);
    if (!parsed) {
      return NextResponse.json({
        success: true,
        data: { hasDeployment: false, message: "Invalid GitHub repository URL" },
      });
    }

    const octokit = await getOctokit();
    if (!octokit.auth) {
      return NextResponse.json({
        success: true,
        data: { hasDeployment: false, message: "GitHub account not connected" },
      });
    }

    const { owner, repo } = parsed;
    let latestCommitSha: string | null = null;

    try {
      const branch = await octokit.rest.repos.getBranch({ owner, repo, branch: task.branchName });
      latestCommitSha = branch.data.commit.sha;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 404) {
        return NextResponse.json({
          success: true,
          data: { hasDeployment: false, message: "Branch not found" },
        });
      }
      throw error;
    }

    if (!latestCommitSha) {
      return NextResponse.json({
        success: true,
        data: { hasDeployment: false, message: "Unable to determine latest commit" },
      });
    }

    const checks = await octokit.rest.checks.listForRef({
      owner,
      repo,
      ref: latestCommitSha,
      per_page: 100,
    });

    const extractPreview = (check: {
      output?: { summary?: string | null; text?: string | null } | null;
      details_url?: string | null;
    }) => {
      const summary = check.output?.summary ?? "";
      const text = check.output?.text ?? "";

      const combined = `${summary}\n${text}`;
      const urlMatch = combined.match(/https?:\/\/[^\s)\]]+\.vercel\.app/);
      if (urlMatch) {
        return urlMatch[0];
      }
      if (check.details_url) {
        return convertFeedbackUrl(check.details_url);
      }
      return null;
    };

    const previewCheck = checks.data.check_runs.find(
      (check) => check.app?.slug === "vercel" && check.name === "Vercel Preview Comments" && check.status === "completed"
    );

    const deploymentCheck = checks.data.check_runs.find(
      (check) =>
        check.app?.slug === "vercel" &&
        check.name === "Vercel" &&
        check.status === "completed" &&
        check.conclusion === "success"
    );

    const previewUrl = extractPreview(previewCheck ?? deploymentCheck ?? {});

    if (previewUrl) {
      await prisma.builderTask.update({
        where: { id: task.id },
        data: { previewUrl, updatedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        data: {
          hasDeployment: true,
          previewUrl,
          checkId: deploymentCheck?.id ?? previewCheck?.id,
          createdAt: deploymentCheck?.completed_at ?? previewCheck?.completed_at ?? null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { hasDeployment: false, message: "No deployment detected for latest commit" },
    });
  } catch (error) {
    console.error("Failed to look up deployment", error);
    return NextResponse.json({ error: "Failed to look up deployment" }, { status: 500 });
  }
}
