"use server";

import { Sandbox } from "@vercel/sandbox";
import { getSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";

export async function resolveSandbox(taskId: string, sandboxId: string | null) {
  if (!sandboxId) return null;

  let sandbox = getSandbox(taskId);
  if (sandbox) return sandbox;

  const token = process.env.SANDBOX_VERCEL_TOKEN;
  const teamId = process.env.SANDBOX_VERCEL_TEAM_ID;
  const projectId = process.env.SANDBOX_VERCEL_PROJECT_ID;

  if (!token || !teamId || !projectId) return null;

  try {
    sandbox = await Sandbox.get({
      sandboxId,
      teamId,
      projectId,
      token,
    });
    return sandbox;
  } catch (error) {
    console.error("Failed to reconnect sandbox", error);
    return null;
  }
}
