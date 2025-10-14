"use client";
import type { Row } from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";

import type { SiteListRow } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProjectButton } from "./delete-project-button";

interface DataTableRowActionsProps {
  row: Row<SiteListRow>;
  workspaceId: string;
}

export function DataTableRowActions({
  row,
  workspaceId,
}: DataTableRowActionsProps) {
  const project = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <IconDotsVertical className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Edit project</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DeleteProjectButton
          siteId={project.id}
          workspaceId={workspaceId}
          variant="ghost"
          size="sm"
        >
          Delete project
        </DeleteProjectButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
