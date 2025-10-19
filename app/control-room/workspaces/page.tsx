import { Metadata } from "next";

import { adminListWorkspaces } from "@/app/actions/control-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CreateWorkspaceForm } from "./_components/create-workspace-form";
import { WorkspacesTable } from "./_components/workspaces-table";

export const metadata: Metadata = {
  title: "Workspaces • Control room",
};

export default async function ControlRoomWorkspacesPage() {
  const workspaces = await adminListWorkspaces();

  return (
    <div className="space-y-10">
      <section id="create-workspace" className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and retire workspaces. Every change is logged and applied instantly.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Create workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="manage-workspaces" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">All workspaces</h2>
          <p className="text-sm text-muted-foreground">
            Search by name or slug. Archive deprecated organizations to keep analytics clean.
          </p>
        </div>
        <WorkspacesTable initialWorkspaces={workspaces} />
      </section>
    </div>
  );
}
