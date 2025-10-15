"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createWorkspace, switchWorkspace } from "@/app/actions/workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type WorkspaceSummary = {
  id: string;
  name: string;
  role: string;
  createdAt: string;
};

type WorkspacesClientProps = {
  workspaces: WorkspaceSummary[];
};

export function WorkspacesClient({ workspaces }: WorkspacesClientProps) {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [isSwitching, startSwitchTransition] = useTransition();

  const handleCreateWorkspace = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = workspaceName.trim();

    if (!trimmedName) {
      toast.error("Workspace name is required");
      return;
    }

    startCreateTransition(async () => {
      try {
        const workspace = await createWorkspace(trimmedName);
        toast.success(`Workspace “${workspace.name}” created`, {
          description: "We redirected you to the dashboard to get started.",
        });
        setWorkspaceName("");
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create workspace.";
        toast.error("Unable to create workspace", {
          description: message,
        });
      }
    });
  };

  const handleSwitchWorkspace = (workspaceId: string) => {
    setSwitchingId(workspaceId);
    startSwitchTransition(async () => {
      try {
        await switchWorkspace(workspaceId);
        toast.success("Workspace switched", {
          description: "Loading your dashboard in the selected workspace.",
        });
        setSwitchingId(null);
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to switch workspace.";
        toast.error("Unable to switch workspace", {
          description: message,
        });
        setSwitchingId(null);
      }
    });
  };

  const isSwitchButtonPending = (workspaceId: string) =>
    isSwitching && switchingId === workspaceId;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workspace</CardTitle>
          <CardDescription>
            Start a new workspace for your projects and team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                name="workspace-name"
                placeholder="My Awesome Workspace"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                disabled={isCreating}
                autoComplete="organization"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? <Spinner className="mr-2" /> : null}
              Create Workspace
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Workspaces</CardTitle>
          <CardDescription>
            {workspaces.length === 0
              ? "No workspaces yet. Create your first one!"
              : `You have ${workspaces.length} workspace${
                  workspaces.length === 1 ? "" : "s"
                }.`}
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
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <h3 className="font-medium">{workspace.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {workspace.role} • Created{" "}
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleSwitchWorkspace(workspace.id)}
                    disabled={isSwitching}
                    data-state={
                      isSwitchButtonPending(workspace.id) ? "loading" : undefined
                    }
                  >
                    {isSwitchButtonPending(workspace.id) ? (
                      <Spinner className="mr-2" />
                    ) : null}
                    Switch
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
