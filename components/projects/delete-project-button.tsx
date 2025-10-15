"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
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
import { deleteSiteAction } from "@/app/actions/site";
import { Spinner } from "@/components/ui/spinner";

type DeleteProjectButtonProps = {
  siteId: string;
  workspaceId: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  children?: ReactNode;
};

export function DeleteProjectButton({
  siteId,
  workspaceId,
  variant = "ghost",
  size = "icon",
  children,
}: DeleteProjectButtonProps) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    setPending(true);
    const promise = deleteSiteAction(siteId, workspaceId)
      .then(() => undefined)
      .finally(() => setPending(false));

    toast.promise(promise, {
      loading: "Deleting project…",
      success: "Project deleted successfully.",
      error: "Failed to delete project.",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="w-full justify-start px-2 py-1.5 text-sm font-normal text-destructive hover:bg-muted focus:bg-muted hover:text-destructive focus:text-destructive"
          disabled={pending}
        >
          {pending ? <Spinner className="mr-2" /> : null}
          {children ?? "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The project and all associated data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={pending}>
            {pending ? <Spinner className="mr-2" /> : null}
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
