"use client";

import { useMemo, type ComponentType, type ReactNode } from "react";
import { useQueryState, parseAsInteger, createParser } from "nuqs";
import {
  IconChevronDown,
  IconChevronUp,
  IconArrowsSort,
  IconCircleCheckFilled,
  IconLoader,
  IconClock,
  IconArrowRight,
  IconArchive,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SiteStatus } from "@prisma/client";

import type { SiteListRow } from "@/app/actions/site";
import type { SortDescriptor, SiteSortField } from "./sort";
import { parseSortParam, serializeSortParam } from "./sort";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

type ProjectsTableProps = {
  rows: SiteListRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortDescriptor[];
  workspaceId: string;
};

const sortParser = (defaultSort: SortDescriptor[]) =>
  createParser<SortDescriptor[]>({
    parse: (value) => parseSortParam(value),
    serialize: (value) =>
      value && value.length ? serializeSortParam(value) : "[]",
    eq: (a, b) => serializeSortParam(a) === serializeSortParam(b),
  })
    .withDefault(defaultSort)
    .withOptions({
      history: "replace",
      shallow: true,
    });

const pageParser = (defaultPage: number) =>
  parseAsInteger
    .withDefault(defaultPage)
    .withOptions({
      history: "replace",
      shallow: true,
    });

type StatusMeta = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
};

function getStatusMeta(status: SiteStatus): StatusMeta {
  const baseLabel = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (word) => word.toUpperCase());

  switch (status) {
    case "LIVE":
      return {
        label: baseLabel,
        icon: IconCircleCheckFilled,
        iconClassName: "h-3.5 w-3.5 fill-green-500 text-green-500",
      };
    case "READY_FOR_TRANSFER":
      return {
        label: baseLabel,
        icon: IconArrowRight,
        iconClassName: "h-3.5 w-3.5 text-blue-500",
      };
    case "REVIEW":
      return {
        label: baseLabel,
        icon: IconLoader,
        iconClassName: "h-3.5 w-3.5 animate-spin text-amber-500",
      };
    case "ARCHIVED":
      return {
        label: baseLabel,
        icon: IconArchive,
        iconClassName: "h-3.5 w-3.5 text-muted-foreground",
      };
    case "DRAFT":
    default:
      return {
        label: baseLabel,
        icon: IconClock,
        iconClassName: "h-3.5 w-3.5 text-muted-foreground",
      };
  }
}

export default function ProjectsTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  workspaceId,
}: ProjectsTableProps) {
  const sortConfig = useMemo(() => sortParser(sort), [sort]);
  const pageConfig = useMemo(() => pageParser(page), [page]);

  const [sortParam, setSortParam] = useQueryState("sort", sortConfig);
  const [pageParam, setPageParam] = useQueryState("page", pageConfig);

  const effectiveSort = sortParam?.length ? sortParam : sort;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(pageParam ?? page, 1), totalPages);

  const handleSort = (column: SiteSortField) => {
    const current = effectiveSort[0];
    let nextSort: SortDescriptor[] | null = null;

    if (!current || current.id !== column) {
      nextSort = [{ id: column }];
    } else if (!current.desc) {
      nextSort = [{ id: column, desc: true }];
    } else {
      nextSort = null;
    }

    void setPageParam(1).catch(() => {});

    void (nextSort
      ? setSortParam(nextSort).catch(() => {})
      : setSortParam(null).catch(() => {}));
  };

  const handlePrev = () => {
    const next = Math.max(1, currentPage - 1);
    void setPageParam(next).catch(() => {});
  };

  const handleNext = () => {
    const next = Math.min(totalPages, currentPage + 1);
    void setPageParam(next).catch(() => {});
  };

  const renderSortIcon = (column: SiteSortField) => {
    const current = effectiveSort[0];
    if (!current || current.id !== column) {
      return <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground" />;
    }
    if (current.desc) {
      return <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground" />;
    }
    return <IconChevronUp className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                label="Name"
                column="name"
                onClick={handleSort}
                icon={renderSortIcon("name")}
              />
              <TableHead>Client</TableHead>
              <SortableHeader
                label="Status"
                column="status"
                onClick={handleSort}
                icon={renderSortIcon("status")}
              />
              <SortableHeader
                label="Created"
                column="createdAt"
                onClick={handleSort}
                icon={renderSortIcon("createdAt")}
              />
              <SortableHeader
                label="Updated"
                column="updatedAt"
                onClick={handleSort}
                icon={renderSortIcon("updatedAt")}
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {project.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {project.client ? (
                    <span>{project.client.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    const meta = getStatusMeta(project.status);
                    const StatusIcon = meta.icon;
                    return (
                      <Badge variant="outline" className="gap-1.5 px-2 py-1 text-muted-foreground">
                        <StatusIcon className={meta.iconClassName ?? "h-3.5 w-3.5"} />
                        {meta.label}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell>{formatDate(project.updatedAt)}</TableCell>
                <TableCell className="text-right">
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
                    <DropdownMenuContent align="end" className="w-48">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrev}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

type SortableHeaderProps = {
  label: string;
  column: SiteSortField;
  onClick: (column: SiteSortField) => void;
  icon: ReactNode;
};

function SortableHeader({ label, column, onClick, icon }: SortableHeaderProps) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onClick(column)}
        className="flex items-center gap-1 text-left text-sm font-medium"
      >
        {label}
        {icon}
      </button>
    </TableHead>
  );
}

function formatDate(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
