import { Sandbox } from "@vercel/sandbox";
import { getSandboxCredentials } from "@/lib/coding-agent/sandbox/env";

const activeSandboxes = new Map<string, Sandbox>();

export function registerSandbox(taskId: string, sandbox: Sandbox, _keepAlive = false): void {
  activeSandboxes.set(taskId, sandbox);
}

export function unregisterSandbox(taskId: string): void {
  activeSandboxes.delete(taskId);
}

export function getSandbox(taskId: string): Sandbox | undefined {
  return activeSandboxes.get(taskId);
}

export async function reconnectSandbox(taskId: string, sandboxId: string) {
  try {
    const { token, teamId, projectId } = getSandboxCredentials();
    if (!token || !teamId || !projectId) {
      throw new Error("Missing sandbox credentials");
    }

    const sandbox = await Sandbox.get({
      sandboxId,
      token,
      teamId,
      projectId,
    });

    registerSandbox(taskId, sandbox);
    return sandbox;
  } catch (error) {
    console.error("Failed to reconnect sandbox", error);
    return undefined;
  }
}

export async function killSandbox(taskId: string): Promise<{ success: boolean; error?: string }> {
  const sandbox = activeSandboxes.get(taskId);

  if (!sandbox) {
    if (activeSandboxes.size > 0) {
      const firstEntry = activeSandboxes.entries().next().value;
      if (firstEntry) {
        const [oldTaskId] = firstEntry;
        activeSandboxes.delete(oldTaskId);
        return { success: true, error: `Killed sandbox for task ${oldTaskId} (fallback)` };
      }
    }
    return { success: false, error: "No active sandbox found for this task" };
  }

  try {
    activeSandboxes.delete(taskId);
    try {
      await sandbox.stop();
    } catch (stopError) {
      console.log("Sandbox stop completed or was already stopped", stopError);
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to kill sandbox";
    return { success: false, error: errorMessage };
  }
}

export function getActiveSandboxCount(): number {
  return activeSandboxes.size;
}
