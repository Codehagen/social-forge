import * as React from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/actions/user";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ControlRoomSidebar } from "@/components/control-room/control-room-sidebar";
import { getControlRoomSidebarMetrics } from "@/app/actions/control-room";

type ControlRoomLayoutProps = {
  children: React.ReactNode;
};

export default async function ControlRoomLayout({
  children,
}: ControlRoomLayoutProps) {
  const user = await getCurrentUser();

  if (!user || (!user.superAdmin && !user.agent)) {
    redirect("/dashboard");
  }

  const sidebarMetrics = await getControlRoomSidebarMetrics();

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <ControlRoomSidebar
        user={user}
        variant="inset"
        metrics={{
          pendingWorkspaceApprovals: sidebarMetrics.pendingWorkspaceInvites,
          billingAlerts: sidebarMetrics.delinquentSubscriptions,
          payoutReviews: sidebarMetrics.pendingAffiliatePayouts,
        }}
      />
      <SidebarInset className="min-h-screen bg-background">
        <header className="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="size-8 rounded-full border border-border/60 bg-transparent text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Control room
                </h1>
                <p className="text-sm text-muted-foreground">
                  Operate the platform, review partner programs, and keep
                  revenue healthy.
                </p>
              </div>
            </div>
          </div>
          <SidebarSeparator className="mx-auto max-w-6xl bg-border/80" />
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
