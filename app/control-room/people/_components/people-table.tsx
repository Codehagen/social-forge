"use client";

import { useCallback, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  adminListPeople,
  adminRemoveOperator,
  adminUpdateUserRoles,
} from "@/app/actions/control-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

type Operator = Awaited<ReturnType<typeof adminListPeople>> extends Array<infer T> ? T : never;

type PeopleTableProps = {
  initialPeople: Operator[];
};

export function PeopleTable({ initialPeople }: PeopleTableProps) {
  const [people, setPeople] = useState(initialPeople);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(
    (opts?: { showToast?: boolean }) => {
      startTransition(async () => {
        try {
          const next = await adminListPeople({
            query: query.trim() ? query : undefined,
          });
          setPeople(next);
          if (opts?.showToast) {
            toast.success("Operator list updated.");
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to refresh operators.";
          toast.error(message);
        }
      });
    },
    [query]
  );

  const handleFilter = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      refresh();
    },
    [refresh]
  );

  const resetFilters = useCallback(() => {
    setQuery("");
    startTransition(async () => {
      const next = await adminListPeople();
      setPeople(next);
    });
  }, []);

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card/50 p-4"
      >
        <div className="flex min-w-[220px] flex-1 flex-col gap-2">
          <Label htmlFor="people-query">Search</Label>
          <Input
            id="people-query"
            placeholder="Filter by name or email…"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Filtering…" : "Apply filters"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters} disabled={isPending}>
            Reset
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Operator</TableHead>
              <TableHead>Workspaces</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Super admin</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No operators yet. Promote a teammate to grant them access.
                </TableCell>
              </TableRow>
            ) : (
              people.map((person) => (
                <PeopleRow key={person.id} person={person} refresh={refresh} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PeopleRow({ person, refresh }: { person: Operator; refresh: (opts?: { showToast?: boolean }) => void }) {
  const [isAgentPending, startAgentTransition] = useTransition();
  const [isSuperPending, startSuperTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();

  const toggleAgent = useCallback(
    (nextState: boolean) => {
      startAgentTransition(async () => {
        try {
          await adminUpdateUserRoles({
            userId: person.id,
            agent: nextState,
            superAdmin: nextState ? person.superAdmin : false,
          });
          toast.success(nextState ? "Agent access granted." : "Agent access removed.");
          refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update operator.";
          toast.error(message);
        }
      });
    },
    [person, refresh]
  );

  const toggleSuperAdmin = useCallback(
    (nextState: boolean) => {
      startSuperTransition(async () => {
        try {
          await adminUpdateUserRoles({
            userId: person.id,
            superAdmin: nextState,
            agent: nextState || person.agent,
          });
          toast.success(nextState ? "Super admin granted." : "Super admin removed.");
          refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to update super admin access.";
          toast.error(message);
        }
      });
    },
    [person, refresh]
  );

  const handleRemove = useCallback(() => {
    startRemoveTransition(async () => {
      try {
        await adminRemoveOperator(person.id);
        toast.success("Operator demoted.");
        refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to demote operator.";
        toast.error(message);
      }
    });
  }, [person, refresh]);

  return (
    <TableRow>
      <TableCell className="max-w-[260px]">
        <div className="font-medium text-foreground">
          {person.name ?? "Unknown operator"}
        </div>
        <div className="text-xs text-muted-foreground">{person.email}</div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="tabular-nums">
          {person._count.workspaces}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={person.agent || person.superAdmin}
          onCheckedChange={(checked) => toggleAgent(Boolean(checked))}
          disabled={isAgentPending || isSuperPending || isRemovePending}
          aria-label={`Toggle agent access for ${person.email}`}
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={person.superAdmin}
          onCheckedChange={(checked) => toggleSuperAdmin(Boolean(checked))}
          disabled={isSuperPending || isRemovePending}
          aria-label={`Toggle super admin access for ${person.email}`}
        />
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(person.createdAt), { addSuffix: true })}
      </TableCell>
      <TableCell className="text-right">
        {person.agent || person.superAdmin ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isRemovePending}>
                Demote
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove operator access?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes all elevated permissions for {person.email}. You can re-add them at any
                  time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isRemovePending}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove} disabled={isRemovePending}>
                  {isRemovePending ? "Removing…" : "Demote operator"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <span className="text-xs text-muted-foreground">No elevated access</span>
        )}
      </TableCell>
    </TableRow>
  );
}
