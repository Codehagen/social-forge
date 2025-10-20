"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BuilderTask } from "@prisma/client";

type AddTaskOptimisticallyInput = {
  prompt: string;
  repoUrl: string;
  selectedAgent: string;
  selectedModel: string;
  installDependencies: boolean;
  maxDuration: number;
};

type BuilderTasksContextValue = {
  tasks: BuilderTask[];
  isLoading: boolean;
  refreshTasks: () => Promise<void>;
  addTaskOptimistically: (input: AddTaskOptimisticallyInput) => { id: string; optimisticTask: BuilderTask };
};

const BuilderTasksContext = createContext<BuilderTasksContextValue | null>(null);

export function BuilderTasksProvider({ children, initialTasks }: { children: React.ReactNode; initialTasks: BuilderTask[] }) {
  const [tasks, setTasks] = useState<BuilderTask[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/builder/tasks", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTaskOptimistically = useCallback(
    (input: AddTaskOptimisticallyInput) => {
      const id = `optimistic-${Date.now()}`;
      const optimisticTask: BuilderTask = {
        id,
        prompt: input.prompt,
        repoUrl: input.repoUrl,
        selectedAgent: input.selectedAgent.toUpperCase(),
        selectedModel: input.selectedModel,
        installDependencies: input.installDependencies,
        maxDuration: input.maxDuration,
        keepAlive: false,
        status: "PROCESSING",
        progress: 0,
        logs: [],
        error: null,
        branchName: null,
        sandboxId: null,
        agentSessionId: null,
        sandboxUrl: null,
        previewUrl: null,
        prUrl: null,
        prNumber: null,
        prStatus: null,
        prMergeCommitSha: null,
        mcpServerIds: [],
        createdAt: new Date().toISOString() as unknown as Date,
        updatedAt: new Date().toISOString() as unknown as Date,
        completedAt: null,
        deletedAt: null,
        workspaceId: null,
        userId: "self",
      } as BuilderTask;

      setTasks((prev) => [optimisticTask, ...prev]);
      return { id, optimisticTask };
    },
    []
  );

  useEffect(() => {
    const interval = setInterval(refreshTasks, 5000);
    return () => clearInterval(interval);
  }, [refreshTasks]);

  const value = useMemo(() => ({ tasks, isLoading, refreshTasks, addTaskOptimistically }), [tasks, isLoading, refreshTasks, addTaskOptimistically]);

  return <BuilderTasksContext.Provider value={value}>{children}</BuilderTasksContext.Provider>;
}

export function useBuilderTasks() {
  const ctx = useContext(BuilderTasksContext);
  if (!ctx) {
    throw new Error("useBuilderTasks must be used within BuilderTasksProvider");
  }
  return ctx;
}
