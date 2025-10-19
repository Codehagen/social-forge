"use client";

import { useCallback, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  adminAddWorkspaceMember,
  adminListWorkspaceMembers,
  adminRemoveWorkspaceMember,
  adminRevokeWorkspaceInvite,
  adminUpdateWorkspaceMemberRole,
} from "@/app/actions/control-room";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type Member = Awaited<ReturnType<typeof adminListWorkspaceMembers>>["members"][number];
type Invite = Awaited<ReturnType<typeof adminListWorkspaceMembers>>["invites"][number];

const ROLE_OPTIONS = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
] as const;

type WorkspaceMembersManagerProps = {
  workspaceId: string;
  initialMembers: Member[];
  initialInvites: Invite[];
};

export function WorkspaceMembersManager({
  workspaceId,
  initialMembers,
  initialInvites,
}: WorkspaceMembersManagerProps) {
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("MEMBER");
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const latest = await adminListWorkspaceMembers(workspaceId);
    setMembers(latest.members);
    setInvites(latest.invites);
  }, [workspaceId]);

  const handleInvite = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email.trim()) {
        toast.error("Enter an email address.");
        return;
      }

      startTransition(async () => {
        try {
          await adminAddWorkspaceMember({
            workspaceId,
            email: email.trim(),
            role,
          });
          toast.success("Invitation sent.");
          setEmail("");
          setRole("MEMBER");
          await refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to add member.";
          toast.error(message);
        }
      });
    },
    [email, role, workspaceId, refresh]
  );

  const handleRoleChange = useCallback(
    (memberId: string, nextRole: (typeof ROLE_OPTIONS)[number]["value"]) => {
      startTransition(async () => {
        try {
          await adminUpdateWorkspaceMemberRole({
            memberId,
            role: nextRole,
          });
          toast.success("Role updated.");
          await refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to update role.";
          toast.error(message);
        }
      });
    },
    [refresh]
  );

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      startTransition(async () => {
        try {
          await adminRemoveWorkspaceMember(memberId);
          toast.success("Member removed.");
          await refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to remove member.";
          toast.error(message);
        }
      });
    },
    [refresh]
  );

  const handleRevokeInvite = useCallback(
    (inviteId: string) => {
      startTransition(async () => {
        try {
          await adminRevokeWorkspaceInvite(inviteId);
          toast.success("Invitation revoked.");
          await refresh();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to revoke invitation.";
          toast.error(message);
        }
      });
    },
    [refresh]
  );

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleInvite}
        className="grid gap-4 rounded-lg border bg-card/50 p-4 md:grid-cols-[minmax(0,320px)_160px_auto]"
      >
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="alex@agency.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <Select
            value={role}
            onValueChange={(value: (typeof ROLE_OPTIONS)[number]["value"]) => setRole(value)}
            disabled={isPending}
          >
            <SelectTrigger id="invite-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border">
        <Table className="min-w-[720px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="max-w-[260px]">
                    <div className="font-medium text-foreground">
                      {member.user.name ?? member.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{member.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value: (typeof ROLE_OPTIONS)[number]["value"]) =>
                        handleRoleChange(member.id, value)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={isPending}
                        >
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {member.user.email} from the workspace. They can be
                            re-invited at any time.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isPending}
                          >
                            Remove member
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Pending invitations
        </h3>
        <div className="overflow-hidden rounded-lg border">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No pending invitations.
                  </TableCell>
                </TableRow>
              ) : (
                invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="max-w-[240px] text-sm text-foreground">
                      {invite.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{invite.role}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={isPending}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
