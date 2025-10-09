import { getCurrentUser } from "@/app/actions/user";
import { getUserWorkspaces, createWorkspace } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function WorkspacesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const workspaces = await getUserWorkspaces();

  async function createWorkspaceAction(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    if (!name?.trim()) {
      throw new Error("Workspace name is required");
    }

    const workspace = await createWorkspace(name.trim());
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <p className="text-muted-foreground">
          Manage your workspaces and collaborate with your team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Workspace */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Workspace</CardTitle>
            <CardDescription>
              Start a new workspace for your projects and team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createWorkspaceAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Awesome Workspace"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Workspace
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle>Your Workspaces</CardTitle>
            <CardDescription>
              {workspaces.length === 0
                ? "No workspaces yet. Create your first one!"
                : `You have ${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workspaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create your first workspace to get started with Social Forge.
              </p>
            ) : (
              <div className="space-y-3">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{workspace.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {workspace.role} • Created {new Date(workspace.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <form action={async (formData: FormData) => {
                      "use server";
                      const workspaceId = formData.get("workspaceId") as string;
                      if (workspaceId) {
                        await switchWorkspace(workspaceId);
                        redirect("/dashboard");
                      }
                    }}>
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <Button variant="outline" size="sm" type="submit">
                        Switch
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
