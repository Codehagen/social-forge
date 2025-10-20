"use client";

import { useCallback, useEffect, useState } from "react";
import type { BuilderTask, BuilderTaskMessage } from "@prisma/client";

type TaskWithMessages = BuilderTask & {
  messages: BuilderTaskMessage[];
};

type BuilderTaskResponse = {
  task: TaskWithMessages;
};

export function useBuilderTask(taskId: string | null) {
  const [task, setTask] = useState<TaskWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setTask(null);
      setError("Task not found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/builder/tasks/${taskId}`, { cache: "no-store" });
      if (response.ok) {
        const data: BuilderTaskResponse = await response.json();
        setTask(data.task);
        setError(null);
      } else if (response.status === 404) {
        setTask(null);
        setError("Task not found");
      } else if (response.status === 401) {
        setTask(null);
        setError("You must be signed in to view this task.");
      } else {
        setError("Failed to fetch task");
      }
    } catch (err) {
      console.error("Failed to fetch task", err);
      setError("Failed to fetch task");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    setIsLoading(true);
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTask();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchTask]);

  return { task, isLoading, error, refetch: fetchTask };
}
