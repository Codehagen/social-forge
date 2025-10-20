"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBuilderTasks } from "@/components/builder/app-layout-context";

const AGENT_OPTIONS = [
  { value: "claude", label: "Claude (Recommended)", disabled: false },
  { value: "codex", label: "OpenAI Codex", disabled: true },
  { value: "cursor", label: "Cursor CLI", disabled: true },
  { value: "copilot", label: "GitHub Copilot", disabled: true },
  { value: "gemini", label: "Gemini CLI", disabled: true },
  { value: "opencode", label: "OpenCode", disabled: true },
];

type TaskFormState = {
  prompt: string;
  repoUrl: string;
  selectedAgent: string;
  selectedModel: string;
  installDependencies: boolean;
  keepAlive: boolean;
  maxDuration: number;
  isSubmitting: boolean;
  error?: string;
};

const initialFormState: TaskFormState = {
  prompt: "",
  repoUrl: "",
  selectedAgent: "claude",
  selectedModel: "",
  installDependencies: false,
  keepAlive: false,
  maxDuration: 60,
  isSubmitting: false,
};

export function BuilderApp() {
  const { tasks, isLoading, refreshTasks } = useBuilderTasks();
  const [formState, setFormState] = useState<TaskFormState>(initialFormState);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks, refreshToken]);

  useEffect(() => {
    const interval = setInterval(() => setRefreshToken((token) => token + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!formState.prompt.trim() || !formState.repoUrl.trim()) {
        setFormState((prev) => ({ ...prev, error: "Prompt and repository URL are required." }));
        return;
      }

      setFormState((prev) => ({ ...prev, isSubmitting: true, error: undefined }));

      try {
        const response = await fetch("/api/builder/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: formState.prompt,
            repoUrl: formState.repoUrl,
            selectedAgent: formState.selectedAgent,
            selectedModel: formState.selectedModel || undefined,
            installDependencies: formState.installDependencies,
            keepAlive: formState.keepAlive,
            maxDuration: formState.maxDuration,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Failed to create task" }));
          throw new Error(data.error || data.message || "Failed to create task");
        }

        setFormState(initialFormState);
        setRefreshToken((token) => token + 1);
      } catch (error) {
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          error: error instanceof Error ? error.message : "Something went wrong",
        }));
        return;
      }

      setFormState(initialFormState);
    },
    [formState]
  );

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());
  }, [tasks]);

  const handleTaskChanged = useCallback(() => {
    setRefreshToken((token) => token + 1);
    void refreshTasks();
  }, [refreshTasks]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>New Coding Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repository URL</label>
              <Input
                required
                placeholder="https://github.com/owner/repo"
                value={formState.repoUrl}
                onChange={(event) => setFormState((prev) => ({ ...prev, repoUrl: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Task Prompt</label>
              <Textarea
                required
                rows={6}
                placeholder="Describe the coding task you want the agent to complete"
                value={formState.prompt}
                onChange={(event) => setFormState((prev) => ({ ...prev, prompt: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select
                value={formState.selectedAgent}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, selectedAgent: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} disabled={option.disabled} value={option.value}>
                      {option.label}
                      {option.disabled ? " – coming soon" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Duration (minutes)</label>
                <Input
                  type="number"
                  min={10}
                  max={300}
                  value={formState.maxDuration}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, maxDuration: Number(event.target.value) || 10 }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Install Dependencies</label>
                <div className="flex h-10 items-center justify-between rounded-md border px-3">
                  <Switch
                    checked={formState.installDependencies}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, installDependencies: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Keep Sandbox Alive After Completion</label>
              <div className="flex h-10 items-center justify-between rounded-md border px-3">
                <Switch
                  checked={formState.keepAlive}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, keepAlive: checked }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Keep alive support is experimental. Tasks may still shut down automatically after completion.
              </p>
            </div>

            {formState.error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formState.error}
              </div>
            )}

            <Button className="w-full" disabled={formState.isSubmitting} type="submit">
              {formState.isSubmitting ? "Creating task…" : "Create Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Task History</CardTitle>
          <Button onClick={() => setRefreshToken((token) => token + 1)} size="sm" variant="outline">
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading tasks…</p>
          ) : sortedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet. Create a task to get started.</p>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <TaskCard key={task.id} onTaskChanged={handleTaskChanged} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type TaskCardProps = {
  task: BuilderTaskRecord;
  onTaskChanged: () => void;
};

function TaskCard({ task, onTaskChanged }: TaskCardProps) {
  const statusVariant = useMemo(() => {
    switch (task.status) {
      case "COMPLETED":
        return "secondary" as const;
      case "ERROR":
        return "destructive" as const;
      case "PROCESSING":
        return "default" as const;
      default:
        return "outline" as const;
    }
  }, [task.status]);

  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [followUpError, setFollowUpError] = useState<string | undefined>();
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [isStoppingSandbox, setIsStoppingSandbox] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const canSendFollowUp = Boolean(task.keepAlive && task.sandboxId);
  const canPublish = Boolean(task.sandboxId);

  const handleFollowUp = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!followUpPrompt.trim()) {
        setFollowUpError("Enter an instruction to continue the session.");
        return;
      }

      setIsSubmittingFollowUp(true);
      setFollowUpError(undefined);

      try {
        const response = await fetch(`/api/builder/tasks/${task.id}/continue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction: followUpPrompt }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Failed to continue task" }));
          throw new Error(data.error || data.message || "Failed to continue task");
        }

        setFollowUpPrompt("");
        onTaskChanged();
      } catch (error) {
        setFollowUpError(error instanceof Error ? error.message : "Failed to continue task");
      } finally {
        setIsSubmittingFollowUp(false);
      }
    },
    [followUpPrompt, onTaskChanged, task.id]
  );

  const handleStopSandbox = useCallback(async () => {
    setIsStoppingSandbox(true);
    try {
      const response = await fetch(`/api/builder/tasks/${task.id}/stop`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to stop sandbox" }));
        throw new Error(data.error || data.message || "Failed to stop sandbox");
      }

      onTaskChanged();
    } catch (error) {
      setFollowUpError(error instanceof Error ? error.message : "Failed to stop sandbox");
    } finally {
      setIsStoppingSandbox(false);
    }
  }, [onTaskChanged, task.id]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    setFollowUpError(undefined);
    try {
      const response = await fetch(`/api/builder/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          name: task.branchName ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to publish project");
      }

      setPublishUrl(data.url ?? null);
    } catch (error) {
      setFollowUpError(error instanceof Error ? error.message : "Failed to publish project");
    } finally {
      setIsPublishing(false);
    }
  }, [task.branchName, task.id]);

  return (
    <div className="rounded-lg border">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="font-medium">{task.prompt}</p>
          <p className="text-xs text-muted-foreground">{task.repoUrl}</p>
        </div>
        <Badge variant={statusVariant}>{task.status}</Badge>
      </div>
      <div className="space-y-2 px-4 py-3 text-sm">
        <p>
          <span className="font-medium">Agent:</span> {task.selectedAgent}
        </p>
        <p>
          <span className="font-medium">Progress:</span> {task.progress ?? 0}%
        </p>
        {task.branchName ? (
          <p>
            <span className="font-medium">Branch:</span> {task.branchName}
          </p>
        ) : null}
        {task.logs && task.logs.length > 0 ? (
          <div className="space-y-1">
            <p className="font-medium">Logs</p>
            <div className="max-h-48 overflow-y-auto rounded-md bg-muted/40 p-3">
              <ol className="space-y-1 text-xs">
                {task.logs.map((log, index) => (
                  <li
                    key={`${task.id}-${index}`}
                    className={cn(
                      "rounded-md px-2 py-1",
                      log.type === "error" && "bg-destructive/10 text-destructive",
                      log.type === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      log.type === "command" && "bg-blue-500/10 text-blue-500"
                    )}
                  >
                    <span className="font-medium">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
        {task.keepAlive ? (
          <div className="space-y-2 rounded-md border border-dashed px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Live Sandbox</p>
              <Button
                size="sm"
                variant="outline"
                disabled={isStoppingSandbox}
                onClick={handleStopSandbox}
              >
                {isStoppingSandbox ? "Stopping…" : "Stop Sandbox"}
              </Button>
            </div>
            {task.sandboxUrl ? (
              <a className="text-sm text-primary underline" href={task.sandboxUrl} target="_blank" rel="noreferrer">
                Open preview ({task.sandboxUrl})
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">Sandbox preview will appear once the dev server is running.</p>
            )}
            <form className="space-y-2" onSubmit={handleFollowUp}>
              <Textarea
                placeholder="Describe the follow-up change you want the agent to make"
                value={followUpPrompt}
                onChange={(event) => setFollowUpPrompt(event.target.value)}
                disabled={isSubmittingFollowUp || !canSendFollowUp}
                rows={3}
              />
              {followUpError ? (
                <p className="text-xs text-destructive">{followUpError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The sandbox stays alive for the remaining timeout. Send additional instructions while it is active.
                </p>
              )}
              <Button className="w-full" disabled={!canSendFollowUp || isSubmittingFollowUp} type="submit">
                {isSubmittingFollowUp ? "Sending…" : "Send Follow-up"}
              </Button>
            </form>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>Open the full chat interface to iterate on this task.</span>
          <Button asChild size="sm" variant="outline">
            <Link href={`/builder/tasks/${task.id}`}>Open Task</Link>
          </Button>
        </div>
        <div className="space-y-2 rounded-md border border-dashed px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Deployment</p>
            <Button disabled={isPublishing || !canPublish} onClick={handlePublish} size="sm">
              {isPublishing ? "Publishing…" : "Publish to Vercel"}
            </Button>
          </div>
          {publishUrl ? (
            <a
              className="text-xs text-primary underline"
              href={`https://${publishUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              {publishUrl}
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">
              {canPublish
                ? "Creates a deployment from the current sandbox snapshot using your configured publish strategy."
                : "Publish is available while a sandbox is active. Relaunch a task with keep alive to deploy."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
