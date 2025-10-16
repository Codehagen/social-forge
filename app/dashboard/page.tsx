import { Suspense } from "react";
import { getCurrentUser } from "@/app/actions/user";
import {
  getCurrentWorkspace,
  getUserWorkspaces,
} from "@/app/actions/workspace";
import {
  getDashboardStats,
  getRecentProjects,
  getPendingActions,
  getActivityFeed,
} from "@/app/actions/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  IconFolder,
  IconUsers,
  IconSparkles,
  IconLink,
} from "@tabler/icons-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { PendingActions } from "@/components/dashboard/pending-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { EmptyDashboardState } from "@/components/dashboard/empty-state";
import {
  StatsCardsSkeleton,
  RecentProjectsSkeleton,
  ActivityFeedSkeleton,
  PendingActionsSkeleton,
} from "@/components/dashboard/dashboard-skeleton";

// Async component for stats
async function StatsSection() {
  const stats = await getDashboardStats();
  if (!stats) return null;
  return <StatsCards stats={stats} />;
}

// Async component for recent projects
async function RecentProjectsSection() {
  const projects = await getRecentProjects(6);
  if (projects.length === 0) return null;
  return <RecentProjects projects={projects} />;
}

// Async component for activity feed
async function ActivityFeedSection() {
  const activities = await getActivityFeed(10);
  return <ActivityFeed activities={activities} />;
}


// Async component for pending actions
async function PendingActionsSection() {
  const actions = await getPendingActions();
  return <PendingActions actions={actions} />;
}

// Quick check component (lightweight, no suspense needed)
async function DashboardCheck() {
  const stats = await getDashboardStats();
  return stats && stats.activeSites > 0;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [currentWorkspace, workspaces] = await Promise.all([
    getCurrentWorkspace(),
    getUserWorkspaces(),
  ]);

  // Redirect to onboarding if user has no workspace
  if (!currentWorkspace) {
    redirect("/onboarding");
  }

  // Quick check for empty state (lightweight query)
  const hasProjects = await DashboardCheck();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user.name || user.email}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Working in {currentWorkspace.name}
            </p>
          </div>
        </div>
      </div>

      {!hasProjects ? (
        <EmptyDashboardState />
      ) : (
        <>
          {/* Stats Cards with Suspense */}
          <Suspense fallback={<StatsCardsSkeleton />}>
            <StatsSection />
          </Suspense>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Button
                  asChild
                  className="justify-start h-auto p-4"
                  variant="outline"
                >
                  <Link href="/dashboard/projects">
                    <div className="text-left w-full">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <IconFolder className="h-4 w-4" />
                        View All Projects
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Manage your website projects
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="justify-start h-auto p-4"
                  variant="outline"
                >
                  <Link href="/dashboard/workspaces">
                    <div className="text-left w-full">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <IconUsers className="h-4 w-4" />
                        Team Settings
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Invite and manage team members
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button
                  className="justify-start h-auto p-4"
                  variant="outline"
                  disabled
                >
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <IconLink className="h-4 w-4" />
                      Import Website
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transform an existing website
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid with Suspense boundaries */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Takes 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Projects with Suspense */}
              <Suspense fallback={<RecentProjectsSkeleton />}>
                <RecentProjectsSection />
              </Suspense>

              {/* Activity Feed with Suspense */}
              <Suspense fallback={<ActivityFeedSkeleton />}>
                <ActivityFeedSection />
              </Suspense>
            </div>

            {/* Right Column - Takes 1/3 width */}
            <div className="space-y-6">
              {/* Pending Actions with Suspense */}
              <Suspense fallback={<PendingActionsSkeleton />}>
                <PendingActionsSection />
              </Suspense>
            </div>
          </div>
        </>
      )}

      {/* Workspace Switcher (if multiple workspaces) */}
      {workspaces.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Your Workspaces</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className={
                  currentWorkspace?.id === workspace.id
                    ? "ring-2 ring-primary"
                    : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{workspace.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {workspace.role}
                      </Badge>
                    </div>
                    {currentWorkspace?.id !== workspace.id && (
                      <Button variant="outline" size="sm">
                        Switch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
