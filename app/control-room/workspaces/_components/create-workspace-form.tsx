"use client";

import { useCallback, useRef, useTransition } from "react";
import { toast } from "sonner";

import { adminCreateWorkspace } from "@/app/actions/control-room";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CreateWorkspaceForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const businessName = (formData.get("businessName") as string)?.trim();
    const businessEmail = (formData.get("businessEmail") as string)?.trim();
    const businessPhone = (formData.get("businessPhone") as string)?.trim();

    if (!name) {
      toast.error("Workspace name is required.");
      return;
    }

    startTransition(async () => {
      try {
        await adminCreateWorkspace({
          name,
          slug: slug || undefined,
          businessName: businessName || null,
          businessEmail: businessEmail || null,
          businessPhone: businessPhone || null,
        });
        toast.success("Workspace created.");
        formRef.current?.reset();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create workspace.";
        toast.error(message);
      }
    });
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-describedby="create-workspace-hint"
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Acme Robotics"
          autoComplete="organization"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional)</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="acme-robotics"
          autoComplete="off"
          inputMode="lowercase"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to auto-generate from the workspace name.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business name (optional)</Label>
        <Input
          id="businessName"
          name="businessName"
          placeholder="Acme Robotics LLC"
          autoComplete="organization"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessEmail">Business email (optional)</Label>
        <Input
          id="businessEmail"
          name="businessEmail"
          type="email"
          autoComplete="email"
          placeholder="finance@acme.com"
          spellCheck={false}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2 md:col-span-2 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business phone (optional)</Label>
          <Input
            id="businessPhone"
            name="businessPhone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+1 (415) 555-1234"
            disabled={isPending}
          />
          <p id="create-workspace-hint" className="text-xs text-muted-foreground">
            New workspaces inherit your operator account as the initial owner. You can add teammates
            after creation.
          </p>
        </div>
        <Button
          type="submit"
          size="sm"
          className={cn("self-end md:justify-self-end")}
          disabled={isPending}
        >
          {isPending ? "Creating…" : "Create workspace"}
        </Button>
      </div>
    </form>
  );
}
