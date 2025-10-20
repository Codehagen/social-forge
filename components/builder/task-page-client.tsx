'use client';

import { useMemo, useState } from "react";
import type { BuilderTask, BuilderTaskStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/builder/page-header";
import { TaskDetails } from "@/components/builder/task-details";
import { LogsPane } from "@/components/builder/logs-pane";
import { useBuilderTask } from "@/lib/coding-agent/hooks/use-builder-task";
import { useBuilderTasks } from "@/components/builder/app-layout-context";

type TaskPageClientProps = {
  taskId: string;
  maxSandboxDuration?: number;
};

function statusVariant(status: BuilderTaskStatus | null | undefined) {
  switch (status) {
    case "COMPLETED":
      return "secondary" as const;
    case "ERROR":
      return "destructive" as const;
    case "PROCESSING":
      return "default" as const;
    default:
      return "outline" as const;
  }
}

function statusLabel(status: BuilderTaskStatus | null | undefined) {
  if (!status) return "UNKNOWN";
  return status.replace(/_/g, " ");
}

export function TaskPageClient({ taskId, maxSandboxDuration = 300 }: TaskPageClientProps) {
  const { task, isLoading, error } = useBuilderTask(taskId);
  const { toggleSidebar } = useBuilderTasks();
  const [logsPaneHeight, setLogsPaneHeight] = useState(40);

  const headerLeft = useMemo(() => {
    if (!task) {
      return <span className="text-sm font-semibold">Task</span>;
    }
    return (
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{task.prompt}</span>
        {task.repoUrl ? <span className="truncate text-xs text-muted-foreground">{task.repoUrl}</span> : null}
      </div>
    );
  }, [task]);

  const headerActions = useMemo(() => {
    if (!task) return null;
    return <Badge variant={statusVariant(task.status)}>{statusLabel(task.status)}</Badge>;
  }, [task]);

  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading task…</div>
    );
  } else if (error || !task) {
    content = (
      <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
        {error ?? "Task not found."}
      </div>
    );
  } else {
    content = <TaskDetails task={task} maxSandboxDuration={maxSandboxDuration} />;
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b px-3">
        <PageHeader showMobileMenu onToggleMobileMenu={toggleSidebar} leftActions={headerLeft} actions={headerActions} />
      </div>
      <div
        className="flex-1 min-h-0 overflow-hidden px-3 pb-3"
        style={task ? { paddingBottom: `${logsPaneHeight}px` } : undefined}
      >
        {content}
      </div>
      {task ? <LogsPane task={task as BuilderTask} onHeightChange={setLogsPaneHeight} /> : null}
    </div>
  );
}
