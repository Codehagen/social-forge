"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { adminPromoteUser } from "@/app/actions/control-room";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PromoteOperatorForm() {
  const [email, setEmail] = useState("");
  const [agent, setAgent] = useState(true);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email.trim()) {
        toast.error("Enter the teammate’s email address.");
        return;
      }

      startTransition(async () => {
        try {
          await adminPromoteUser({
            email: email.trim(),
            agent: agent || superAdmin,
            superAdmin,
          });
          toast.success("Operator permissions updated.");
          setEmail("");
          setAgent(true);
          setSuperAdmin(false);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not promote operator.";
          toast.error(message);
        }
      });
    },
    [email, agent, superAdmin]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-end sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="promote-email">Email</Label>
          <Input
            id="promote-email"
            type="email"
            placeholder="casey@agency.com"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={agent || superAdmin}
              onCheckedChange={(checked) => {
                const next = Boolean(checked);
                setAgent(next);
                if (!next) {
                  setSuperAdmin(false);
                }
              }}
              disabled={isPending}
            />
            Agent access
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={superAdmin}
              onCheckedChange={(checked) => {
                const next = Boolean(checked);
                setSuperAdmin(next);
                if (next) {
                  setAgent(true);
                }
              }}
              disabled={isPending}
            />
            Super admin
          </label>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving…" : "Promote"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Operators gain access to the entire control room. Super admins inherit every operator
        permission plus billing overrides.
      </p>
    </form>
  );
}
