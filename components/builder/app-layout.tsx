"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useBuilderTasks } from "@/components/builder/app-layout-context";
import { cn } from "@/lib/utils";
import { TaskSidebar } from "@/components/builder/task-sidebar";
import { ConnectorsProvider } from "@/components/builder/connectors-provider";

type BuilderAppLayoutProps = {
  children: React.ReactNode;
};

export function BuilderAppLayout({ children }: BuilderAppLayoutProps) {
  const {
    tasks,
    isLoading,
    refreshTasks,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    isSidebarResizing,
    setSidebarResizing,
    sidebarWidth,
    setSidebarWidth,
  } = useBuilderTasks();
  const [hasMounted, setHasMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => (typeof window === "undefined" ? true : window.innerWidth >= 1024));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isSidebarResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const min = 240;
      const max = 480;
      const width = Math.min(Math.max(event.clientX, min), max);
      setSidebarWidth(width);
    };

    const handleMouseUp = () => {
      setSidebarResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isSidebarResizing, setSidebarResizing, setSidebarWidth]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isSidebarOpen) {
        setSidebarOpen(true);
      }
      setSidebarResizing(true);
    },
    [isSidebarOpen, setSidebarOpen, setSidebarResizing]
  );

  const layoutStyle = useMemo(
    () =>
      ({
        "--sidebar-width": `${sidebarWidth}px`,
      }) as CSSProperties,
    [sidebarWidth]
  );

  return (
    <ConnectorsProvider>
      <div
        className="relative flex h-dvh bg-background"
        style={layoutStyle}
        suppressHydrationWarning
        data-sidebar-open={isSidebarOpen ? "true" : "false"}
      >
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-background/60 backdrop-blur-sm transition-opacity lg:hidden"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r bg-card transition-transform duration-300 ease-out will-change-transform",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          style={{ width: sidebarWidth }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">Tasks</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refreshTasks()}>
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                Hide
              </Button>
            </div>
          </div>
          {isLoading && tasks.length === 0 ? (
            <ScrollArea className="h-[calc(100vh-60px)] p-3">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-[70px] w-full" />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <TaskSidebar tasks={tasks} />
          )}
        </aside>

        <div
          className={cn(
            "fixed inset-y-0 left-0 hidden cursor-col-resize items-center justify-center px-[1px] lg:flex",
            isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
            isSidebarResizing || !hasMounted ? "" : "transition-opacity duration-150 ease-in-out"
          )}
          style={{ transform: `translateX(${isSidebarOpen ? sidebarWidth : 0}px)` }}
          onMouseDown={handleResizeStart}
        >
          <div className="h-20 w-[3px] rounded-full bg-border transition-colors group-hover:bg-primary" />
        </div>

        {!isSidebarOpen && (
          <div className="fixed left-3 top-3 z-10 lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              Show Tasks
            </Button>
          </div>
        )}

        <main
          className={cn(
            "relative flex-1 overflow-hidden",
            isSidebarResizing || !hasMounted ? "" : "transition-[margin] duration-300 ease-out"
          )}
          style={{
            marginLeft: isDesktop ? (isSidebarOpen ? sidebarWidth : 0) : 0,
          }}
        >
          {children}
        </main>
      </div>
    </ConnectorsProvider>
  );
}
