'use client';

import { useState } from "react";
import { BuilderTask } from "@prisma/client";
import { useBuilderTask } from "@/lib/coding-agent/hooks/use-builder-task";
import { TaskWorkspace } from "@/components/builder/task-workspace";
import { useBuilderTasks } from "@/components/builder/app-layout-context";

type TaskPageClientProps = {
  taskId: string;
};

export function TaskPageClient({ taskId }: TaskPageClientProps) {
  const { task, isLoading, error } = useBuilderTask(taskId);
  const { tasks } = useBuilderTasks();
  const [currentTaskId] = useState(taskId);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading task…</div>;
  }

  if (error || !task) {
    return (
      <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
        {error ?? "Task not found."}
      </div>
    );
  }

  return (
    <TaskWorkspace
      initialTasks={tasks as BuilderTask[]}
      initialTask={task as BuilderTask & { messages: any[] }}
      currentTaskId={currentTaskId}
    />
  );
}
