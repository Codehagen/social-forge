"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createTestProjectAction } from "@/app/dashboard/projects/actions";

type MakeTestProjectButtonProps = {
  workspaceId: string;
  label?: string;
} & Pick<ButtonProps, "variant" | "size" | "className">;

export function MakeTestProjectButton({
  workspaceId,
  label = "Make test project",
  variant = "default",
  size = "sm",
  className,
}: MakeTestProjectButtonProps) {
  const [pending, setPending] = useState(false);

  const handleClick = () => {
    setPending(true);

    const promise = createTestProjectAction(workspaceId)
      .then((site) => site)
      .finally(() => setPending(false));

    toast.promise(promise, {
      loading: "Creating test project…",
      success: (site) =>
        `Project “${site.name}” created successfully.`,
      error: "Failed to create test project",
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}
