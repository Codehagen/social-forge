"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BuilderTask } from "@prisma/client";
import { generateId } from "@/lib/coding-agent/id";

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
  addTaskOptimistically: (input: AddTaskOptimisticallyInput, id?: string) => {
    id: string;
    optimisticTask: BuilderTask;
  };
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isSidebarResizing: boolean;
  setSidebarResizing: (resizing: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
};

const BuilderTasksContext = createContext<BuilderTasksContextValue | null>(null);

export function BuilderTasksProvider({ 
  children, 
  initialTasks,
  initialSidebarOpen = true,
  initialSidebarWidth = 288
}: { 
  children: React.ReactNode; 
  initialTasks: BuilderTask[];
  initialSidebarOpen?: boolean;
  initialSidebarWidth?: number;
}) {
  const [tasks, setTasks] = useState<BuilderTask[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(initialSidebarOpen);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [sidebarWidth, setSidebarWidthState] = useState(initialSidebarWidth);

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
    (input: AddTaskOptimisticallyInput, providedId?: string) => {
      const id = providedId ?? generateId(12);
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    setSidebarWidthState(width);
  }, []);

  const setSidebarResizing = useCallback((resizing: boolean) => {
    setIsSidebarResizing(resizing);
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshTasks, 5000);
    return () => clearInterval(interval);
  }, [refreshTasks]);

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      refreshTasks,
      addTaskOptimistically,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
      isSidebarResizing,
      setSidebarResizing,
      sidebarWidth,
      setSidebarWidth,
    }),
    [
      tasks,
      isLoading,
      refreshTasks,
      addTaskOptimistically,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
      isSidebarResizing,
      setSidebarResizing,
      sidebarWidth,
      setSidebarWidth,
    ]
  );

  return <BuilderTasksContext.Provider value={value}>{children}</BuilderTasksContext.Provider>;
}

export function useBuilderTasks() {
  const ctx = useContext(BuilderTasksContext);
  if (!ctx) {
    throw new Error("useBuilderTasks must be used within BuilderTasksProvider");
  }
  return ctx;
}
