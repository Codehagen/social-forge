import { getCurrentUser } from "@/app/actions/user";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { redirect } from "next/navigation";
import { WorkspacesClient } from "./workspaces-client";

export default async function WorkspacesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const workspaces = await getUserWorkspaces();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <p className="text-muted-foreground">
          Manage your workspaces and collaborate with your team.
        </p>
      </div>

      <WorkspacesClient
        workspaces={workspaces.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          role: workspace.role,
          createdAt: workspace.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
