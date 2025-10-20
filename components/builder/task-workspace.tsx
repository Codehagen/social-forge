"use client";

import Link from "next/link";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { BuilderTask, BuilderTaskMessage } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageAvatar, MessageContent } from "@/components/ai-elements/message";

type TaskLogEntry = {
  type: "info" | "command" | "error" | "success";
  message: string;
  timestamp: string;
};

type TaskWithMessages = BuilderTask & {
  messages: BuilderTaskMessage[];
};

type TaskWorkspaceProps = {
  initialTasks: TaskWithMessages[];
  initialTask: TaskWithMessages | null;
  currentTaskId?: string | null;
};

type BuilderTasksResponse = {
  tasks: TaskWithMessages[];
};

type BuilderTaskResponse = {
  task: TaskWithMessages;
};

export function TaskWorkspace({ initialTasks, initialTask, currentTaskId }: TaskWorkspaceProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    currentTaskId ?? initialTask?.id ?? initialTasks[0]?.id ?? null
  );
  const [tasks, setTasks] = useState<TaskWithMessages[]>(initialTasks);
  const [currentTask, setCurrentTask] = useState<TaskWithMessages | null>(
    initialTask ?? initialTasks.find((task) => task.id === selectedTaskId) ?? null
  );
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  const tasksPollingRef = useRef<NodeJS.Timeout | null>(null);
  const taskPollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        const response = await fetch("/api/builder/tasks", { cache: "no-store" });
        if (!response.ok) return;
        const data: BuilderTasksResponse = await response.json();
        if (!isMounted) return;
        setTasks(data.tasks ?? []);
      } catch (error) {
        console.error("Failed to refresh tasks", error);
      }
    };

    loadTasks();
    tasksPollingRef.current = setInterval(loadTasks, 5000);

    return () => {
      isMounted = false;
      if (tasksPollingRef.current) clearInterval(tasksPollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedTaskId) {
      setCurrentTask(null);
      return;
    }

    let isMounted = true;

    const loadTask = async () => {
      try {
        const response = await fetch(`/api/builder/tasks/${selectedTaskId}`, { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 404 && isMounted) {
            setCurrentTask(null);
          }
          return;
        }
        const data: BuilderTaskResponse = await response.json();
        if (!isMounted) return;
        setCurrentTask(data.task);
      } catch (error) {
        console.error("Failed to refresh task", error);
      }
    };

    loadTask();
    taskPollingRef.current = setInterval(loadTask, 3000);

    return () => {
      isMounted = false;
      if (taskPollingRef.current) clearInterval(taskPollingRef.current);
    };
  }, [selectedTaskId]);

  useEffect(() => {
    if (selectedTaskId) return;
    const fallback = tasks[0] ?? null;
    if (fallback) {
      setSelectedTaskId(fallback.id);
      setCurrentTask(fallback);
    }
  }, [selectedTaskId, tasks]);

  const logs = useMemo<TaskLogEntry[]>(() => {
    if (!currentTask?.logs || !Array.isArray(currentTask.logs)) {
      return [];
    }
    return (currentTask.logs as unknown as TaskLogEntry[]).map((log) => ({
      ...log,
      timestamp: log.timestamp || new Date(currentTask?.createdAt ?? Date.now()).toISOString(),
    }));
  }, [currentTask?.logs]);

  const handleSelectTask = useCallback(
    (id: string) => {
      setSelectedTaskId(id);
      setError(null);
      setPublishUrl(null);
    },
    []
  );

  const handleFollowUp = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedTaskId) return;
      if (!followUp.trim()) {
        setError("Enter an instruction to continue the task.");
        return;
      }

      setIsSending(true);
      setError(null);
      try {
        const response = await fetch(`/api/builder/tasks/${selectedTaskId}/continue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction: followUp }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: "Failed to continue task" }));
          throw new Error(data.error || "Failed to continue task");
        }
        setFollowUp("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to continue task");
      } finally {
        setIsSending(false);
      }
    },
    [followUp, selectedTaskId]
  );

  const handlePublish = useCallback(async () => {
    if (!selectedTaskId) return;
    setIsPublishing(true);
    setError(null);
    try {
      const response = await fetch("/api/builder/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: selectedTaskId, name: currentTask?.branchName ?? undefined }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to publish");
      }
      setPublishUrl(data.url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  }, [currentTask?.branchName, selectedTaskId]);

  const conversation = useMemo(() => currentTask?.messages ?? [], [currentTask?.messages]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      <TaskSidebar tasks={tasks} selectedTaskId={selectedTaskId} onSelectTask={handleSelectTask} />
      <div className="flex-1 space-y-4 overflow-hidden rounded-xl border bg-card">
        {currentTask ? (
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">{currentTask.prompt}</h2>
                <p className="text-sm text-muted-foreground">{currentTask.repoUrl}</p>
              </div>
              <Badge variant={currentTask.status === "ERROR" ? "destructive" : "secondary"}>
                {currentTask.status}
              </Badge>
            </header>
            <div className="flex-1 overflow-hidden">
              <div className="grid h-full grid-rows-[1fr_auto]">
                <ScrollArea className="px-6 pt-4">
                  <div className="space-y-4">
                    <section>
                      <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Conversation</h3>
                      <div className="rounded-lg border bg-background">
                        <Conversation className="h-[320px]">
                          <ConversationContent>
                            {conversation.map((message) => (
                              <Message key={message.id} from={message.role === "USER" ? "user" : "assistant"}>
                                <MessageAvatar
                                  src={message.role === "USER" ? "/avatars/user.svg" : "/avatars/bot.svg"}
                                  name={message.role === "USER" ? "You" : "Agent"}
                                />
                                <MessageContent>
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                    {message.content}
                                  </p>
                                </MessageContent>
                              </Message>
                            ))}
                          </ConversationContent>
                          <ConversationScrollButton />
                        </Conversation>
                      </div>
                    </section>
                    <section>
                      <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Logs</h3>
                      <div className="space-y-2 rounded-lg border bg-background p-3 text-xs">
                        {logs.length === 0 ? (
                          <p className="text-muted-foreground">No logs recorded yet.</p>
                        ) : (
                          logs.map((log, index) => (
                            <div
                              key={`${log.timestamp}-${index}`}
                              className={cn(
                                "rounded-md border px-2 py-1",
                                log.type === "error" && "border-destructive bg-destructive/10 text-destructive",
                                log.type === "command" && "border-primary bg-primary/10 text-primary"
                              )}
                            >
                              <span className="mr-2 font-medium">[
                                {new Date(log.timestamp).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              ]</span>
                              {log.message}
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </div>
                </ScrollArea>
                <div className="border-t px-6 py-4">
                  <form className="space-y-3" onSubmit={handleFollowUp}>
                    <Textarea
                      placeholder="Describe the follow-up change you want the agent to make"
                      rows={3}
                      value={followUp}
                      onChange={(event) => setFollowUp(event.target.value)}
                      disabled={isSending || currentTask.status === "PROCESSING"}
                    />
                    {error ? <p className="text-xs text-destructive">{error}</p> : null}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <Button disabled={isSending || !followUp.trim()} type="submit">
                          {isSending ? "Sending…" : "Send Follow-up"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isPublishing || !currentTask.sandboxId}
                          onClick={handlePublish}
                        >
                          {isPublishing ? "Publishing…" : "Publish to Vercel"}
                        </Button>
                      </div>
                      {publishUrl ? (
                        <Link
                          className="text-xs text-primary underline"
                          href={`https://${publishUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {publishUrl}
                        </Link>
                      ) : null}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p>Select a task to view its conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type TaskSidebarProps = {
  tasks: BuilderTask[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
};

function TaskSidebar({ tasks, selectedTaskId, onSelectTask }: TaskSidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Tasks</h2>
      </div>
      <ScrollArea className="h-[calc(100%-48px)]">
        <div className="space-y-2 p-3">
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tasks yet. Create one from the main builder page.</p>
          ) : (
            tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  task.id === selectedTaskId
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/60 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{task.prompt}</span>
                  <Badge variant={task.status === "ERROR" ? "destructive" : "secondary"} className="text-xs">
                    {task.status}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{task.repoUrl}</p>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
