"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  adminArchiveWorkspace,
  adminDeleteWorkspace,
  adminListWorkspaces,
  adminRestoreWorkspace,
  adminUpdateWorkspace,
} from "@/app/actions/control-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type WorkspaceSummary = Awaited<ReturnType<typeof adminListWorkspaces>> extends Array<infer T>
  ? T
  : never;

type WorkspacesTableProps = {
  initialWorkspaces: WorkspaceSummary[];
};

export function WorkspacesTable({ initialWorkspaces }: WorkspacesTableProps) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "archived">("all");
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(
    (options?: { showToast?: boolean }) => {
      startTransition(async () => {
        try {
          const updated = await adminListWorkspaces({
            query: query.trim() ? query : undefined,
            status,
          });
          setWorkspaces(updated);
          if (options?.showToast) {
            toast.success("Workspace list updated.");
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to refresh workspaces.";
          toast.error(message);
        }
      });
    },
    [query, status]
  );

  const handleFilter = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      refresh();
    },
    [refresh]
  );

  const handleReset = useCallback(() => {
    setQuery("");
    setStatus("all");
    startTransition(async () => {
      const updated = await adminListWorkspaces();
      setWorkspaces(updated);
    });
  }, []);

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card/50 p-4"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <Label htmlFor="workspace-query">Search</Label>
          <Input
            id="workspace-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, slug, or contact…"
            autoComplete="off"
            spellCheck={false}
            disabled={isPending}
          />
        </div>
        <div className="flex w-full min-w-[160px] flex-col gap-2 sm:w-auto">
          <Label className="sr-only" htmlFor="workspace-status">
            Status filter
          </Label>
          <Select
            value={status}
            onValueChange={(value: "all" | "active" | "archived") => setStatus(value)}
            disabled={isPending}
          >
            <SelectTrigger id="workspace-status" className="w-[160px]">
              <SelectValue aria-label={`Filter status: ${status}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Filtering…" : "Apply filters"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isPending}>
            Reset
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No workspaces match your filters. Adjust the search or create a new workspace.
                </TableCell>
              </TableRow>
            ) : (
              workspaces.map((workspace) => (
                <TableRow key={workspace.id} data-state={workspace.archivedAt ? "archived" : "active"}>
                  <TableCell className="max-w-[220px]">
                    <div className="font-medium text-foreground">{workspace.name}</div>
                    <div className="text-xs text-muted-foreground">{workspace.slug}</div>
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] md:table-cell">
                    {workspace.businessEmail ? (
                      <div className="text-sm text-foreground">{workspace.businessEmail}</div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not provided</span>
                    )}
                    {workspace.businessPhone ? (
                      <div className="text-xs text-muted-foreground">{workspace.businessPhone}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular-nums">{workspace._count.members}</TableCell>
                  <TableCell className="tabular-nums">{workspace._count.sites}</TableCell>
                  <TableCell>
                    {workspace.archivedAt ? (
                      <Badge variant="secondary">Archived</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(workspace.updatedAt ?? workspace.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <WorkspaceRowActions workspace={workspace} refresh={refresh} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type WorkspaceRowActionsProps = {
  workspace: WorkspaceSummary;
  refresh: (options?: { showToast?: boolean }) => void;
};

function WorkspaceRowActions({ workspace, refresh }: WorkspaceRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleArchiveToggle = useCallback(() => {
    startTransition(async () => {
      try {
        if (workspace.archivedAt) {
          await adminRestoreWorkspace(workspace.id);
          toast.success(`Workspace “${workspace.name}” restored.`);
        } else {
          await adminArchiveWorkspace(workspace.id);
          toast.success(`Workspace “${workspace.name}” archived.`);
        }
        refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "We couldn’t update the workspace status. Try again.";
        toast.error(message);
      }
    });
  }, [workspace, refresh]);

  const handleDelete = useCallback(() => {
    startDeleteTransition(async () => {
      try {
        await adminDeleteWorkspace(workspace.id);
        toast.success(`Workspace “${workspace.name}” deleted.`);
        refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete workspace.";
        toast.error(message);
      }
    });
  }, [workspace, refresh]);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/control-room/workspaces/${workspace.id}`}>Manage members</Link>
      </Button>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </DialogTrigger>
        <WorkspaceEditDialog
          workspace={workspace}
          onUpdated={() => {
            setEditOpen(false);
            refresh();
          }}
        />
      </Dialog>
      <Button
        variant={workspace.archivedAt ? "ghost" : "outline"}
        size="sm"
        onClick={handleArchiveToggle}
        disabled={isPending}
      >
        {isPending ? "Updating…" : workspace.archivedAt ? "Restore" : "Archive"}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeletePending}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {workspace.name}. Sites, members, and billing associations
              will be removed. This action can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletePending}
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            >
              {isDeletePending ? "Deleting…" : "Delete workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type WorkspaceEditDialogProps = {
  workspace: WorkspaceSummary;
  onUpdated: () => void;
};

function WorkspaceEditDialog({ workspace, onUpdated }: WorkspaceEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug ?? "");
  const [businessName, setBusinessName] = useState(workspace.businessName ?? "");
  const [businessEmail, setBusinessEmail] = useState(workspace.businessEmail ?? "");
  const [businessPhone, setBusinessPhone] = useState(workspace.businessPhone ?? "");

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      startTransition(async () => {
        try {
          await adminUpdateWorkspace(workspace.id, {
            name,
            slug,
            businessName,
            businessEmail,
            businessPhone,
          });
          toast.success("Workspace updated.");
          onUpdated();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update workspace.";
          toast.error(message);
        }
      });
    },
    [workspace.id, name, slug, businessName, businessEmail, businessPhone, onUpdated]
  );

  return (
    <DialogContent className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit workspace</DialogTitle>
        <DialogDescription>
          Update metadata, contact details, or regenerate the slug. Changes apply immediately.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`workspace-name-${workspace.id}`}>Name</Label>
          <Input
            id={`workspace-name-${workspace.id}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`workspace-slug-${workspace.id}`}>Slug</Label>
          <Input
            id={`workspace-slug-${workspace.id}`}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="workspace-slug"
            spellCheck={false}
            inputMode="lowercase"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to regenerate from the updated name.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`workspace-business-name-${workspace.id}`}>Business name</Label>
          <Input
            id={`workspace-business-name-${workspace.id}`}
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Acme Robotics LLC"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`workspace-email-${workspace.id}`}>Business email</Label>
          <Input
            id={`workspace-email-${workspace.id}`}
            value={businessEmail}
            onChange={(event) => setBusinessEmail(event.target.value)}
            type="email"
            spellCheck={false}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`workspace-phone-${workspace.id}`}>Business phone</Label>
          <Input
            id={`workspace-phone-${workspace.id}`}
            value={businessPhone}
            onChange={(event) => setBusinessPhone(event.target.value)}
            inputMode="tel"
            disabled={isPending}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
