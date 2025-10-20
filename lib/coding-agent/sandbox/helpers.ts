"use server";

import { Sandbox } from "@vercel/sandbox";
import { getSandbox } from "@/lib/coding-agent/sandbox/sandbox-registry";
import { getSandboxCredentials } from "@/lib/coding-agent/sandbox/env";

export async function resolveSandbox(taskId: string, sandboxId: string | null) {
  if (!sandboxId) return null;

  let sandbox = getSandbox(taskId);
  if (sandbox) return sandbox;

  const { token, teamId, projectId } = getSandboxCredentials();

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
