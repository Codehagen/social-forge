import { getCurrentUser } from "@/app/actions/user";
import { getCurrentWorkspace, getUserWorkspaces } from "@/app/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconFolder, IconUsers, IconGlobe } from "@tabler/icons-react";

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Welcome Header */}
      <div className="mb-8">
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

      <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <IconFolder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Ready to create your first website
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  Just you for now
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Websites Created</CardTitle>
                <IconGlobe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Let's build something amazing
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with Social Forge by creating your first website project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button className="justify-start h-auto p-4" variant="outline">
                  <div className="text-left">
                    <div className="font-medium">Transform Existing Website</div>
                    <div className="text-sm text-muted-foreground">
                      Enter a URL and let AI modernize your website
                    </div>
                  </div>
                </Button>
                <Button asChild className="justify-start h-auto p-4" variant="outline">
                  <Link href="/builder">
                    <div className="text-left">
                      <div className="font-medium">Create from Scratch</div>
                      <div className="text-sm text-muted-foreground">
                        Answer questions and build a custom website
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your workspace activity will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <IconFolder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No projects yet. Create your first website to get started!</p>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Workspace Switcher (if multiple workspaces) */}
      {workspaces.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Your Workspaces</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className={currentWorkspace?.id === workspace.id ? "ring-2 ring-primary" : ""}>
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
