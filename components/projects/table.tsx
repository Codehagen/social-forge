"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  createParser,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import {
  IconArchive,
  IconArrowsSort,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheckFilled,
  IconClock,
  IconLoader,
} from "@tabler/icons-react";

import type { SiteListRow } from "@/app/actions/site";
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
import {
  DEFAULT_PAGE_SIZE,
  SITE_STATUS_VALUES,
  type SiteStatusValue,
  parseStatusesParam,
  serializeStatusesParam,
} from "./config";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTableToolbar } from "./data-table-toolbar";
import type { SortDescriptor, SiteSortField } from "./sort";
import { parseSortParam, serializeSortParam } from "./sort";

type ProjectsTableProps = {
  rows: SiteListRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortDescriptor[];
  search: string;
  statusFilter: SiteStatusValue[];
  workspaceId: string;
};

type StatusMeta = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
};

const statusMetaCache = new Map<SiteStatusValue, StatusMeta>();

function getStatusMeta(status: SiteStatusValue): StatusMeta {
  const cached = statusMetaCache.get(status);
  if (cached) {
    return cached;
  }

  const baseLabel = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (word) => word.toUpperCase());

  let meta: StatusMeta;

  switch (status) {
    case "LIVE":
      meta = {
        label: baseLabel,
        icon: IconCircleCheckFilled,
        iconClassName: "h-3.5 w-3.5 fill-green-500 text-green-500",
      };
      break;
    case "READY_FOR_TRANSFER":
      meta = {
        label: baseLabel,
        icon: IconArrowRight,
        iconClassName: "h-3.5 w-3.5 text-blue-500",
      };
      break;
    case "REVIEW":
      meta = {
        label: baseLabel,
        icon: IconLoader,
        iconClassName: "h-3.5 w-3.5 animate-spin text-amber-500",
      };
      break;
    case "ARCHIVED":
      meta = {
        label: baseLabel,
        icon: IconArchive,
        iconClassName: "h-3.5 w-3.5 text-muted-foreground",
      };
      break;
    case "DRAFT":
    default:
      meta = {
        label: baseLabel,
        icon: IconClock,
        iconClassName: "h-3.5 w-3.5 text-muted-foreground",
      };
      break;
  }

  statusMetaCache.set(status, meta);
  return meta;
}

const STATUS_FILTER_OPTIONS = SITE_STATUS_VALUES.map((value) => {
  const meta = getStatusMeta(value);
  return {
    label: meta.label,
    value,
    icon: meta.icon,
  };
});

const createSortParser = (defaultSort: SortDescriptor[]) =>
  createParser<SortDescriptor[]>({
    parse: (value) => parseSortParam(value),
    serialize: (value) =>
      value && value.length ? serializeSortParam(value) : "[]",
    eq: (a, b) => serializeSortParam(a) === serializeSortParam(b),
  })
    .withDefault(defaultSort)
    .withOptions({
      history: "replace",
      shallow: false,
    });

const createPageParser = (defaultPage: number) =>
  parseAsInteger.withDefault(defaultPage).withOptions({
    history: "replace",
    shallow: false,
  });

const createLimitParser = (defaultLimit: number) =>
  parseAsInteger.withDefault(defaultLimit).withOptions({
    history: "replace",
    shallow: false,
  });

const createSearchParser = (defaultSearch: string) =>
  parseAsString.withDefault(defaultSearch).withOptions({
    history: "replace",
    shallow: false,
    throttleMs: 200,
  });

const createStatusesParser = (defaultStatuses: SiteStatusValue[]) =>
  createParser<SiteStatusValue[]>({
    parse: (value) => parseStatusesParam(value ?? undefined),
    serialize: (value) => serializeStatusesParam(value),
    eq: (a, b) => serializeStatusesParam(a) === serializeStatusesParam(b),
  })
    .withDefault(defaultStatuses)
    .withOptions({
      history: "replace",
      shallow: false,
    });

function toSortingState(sort: SortDescriptor[]): SortingState {
  return sort.map((descriptor) => ({
    id: descriptor.id,
    desc: Boolean(descriptor.desc),
  }));
}

function normalizeStatuses(values: SiteStatusValue[]): SiteStatusValue[] {
  return parseStatusesParam(serializeStatusesParam(values));
}

export default function ProjectsTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  search,
  statusFilter,
  workspaceId,
}: ProjectsTableProps) {
  const [isPending, startTransition] = React.useTransition();

  const sortParser = React.useMemo(() => createSortParser(sort), [sort]);
  const pageParser = React.useMemo(() => createPageParser(page), [page]);
  const limitParser = React.useMemo(
    () => createLimitParser(pageSize || DEFAULT_PAGE_SIZE),
    [pageSize]
  );
  const searchParser = React.useMemo(
    () => createSearchParser(search),
    [search]
  );
  const statusesParser = React.useMemo(
    () => createStatusesParser(normalizeStatuses(statusFilter)),
    [statusFilter]
  );

  const [sortParam, setSortParam] = useQueryState("sort", sortParser);
  const [pageParam, setPageParam] = useQueryState("page", pageParser);
  const [limitParam, setLimitParam] = useQueryState("limit", limitParser);
  const [searchParam, setSearchParam] = useQueryState("search", searchParser);
  const [statusParam, setStatusParam] = useQueryState(
    "status",
    statusesParser
  );

  const effectiveSort = sortParam?.length ? sortParam : sort;
  const sortingState = React.useMemo(
    () => toSortingState(effectiveSort),
    [effectiveSort]
  );

  const effectivePageSize = Math.max(1, limitParam ?? pageSize);
  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(total / effectivePageSize)),
    [total, effectivePageSize]
  );
  const currentPage = React.useMemo(() => {
    const candidate = pageParam ?? page;
    return Math.min(Math.max(candidate, 1), totalPages);
  }, [pageParam, page, totalPages]);

  const effectiveSearch = searchParam ?? "";
  const effectiveStatuses = React.useMemo(
    () => normalizeStatuses(statusParam ?? []),
    [statusParam]
  );

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (effectiveSearch) {
      filters.push({ id: "name", value: effectiveSearch });
    }
    if (effectiveStatuses.length) {
      filters.push({ id: "status", value: effectiveStatuses });
    }
    return filters;
  }, [effectiveSearch, effectiveStatuses]);

  const paginationState = React.useMemo(
    () => ({
      pageIndex: Math.max(currentPage - 1, 0),
      pageSize: effectivePageSize,
    }),
    [currentPage, effectivePageSize]
  );

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const handleSort = React.useCallback(
    (column: SiteSortField) => {
      const current = effectiveSort[0];
      let nextSort: SortDescriptor[] | null = null;

      if (!current || current.id !== column) {
        nextSort = [{ id: column }];
      } else if (!current.desc) {
        nextSort = [{ id: column, desc: true }];
      } else {
        nextSort = null;
      }

      startTransition(() => {
        void setPageParam(1).catch(() => {});
        void (nextSort
          ? setSortParam(nextSort).catch(() => {})
          : setSortParam(null).catch(() => {}));
      });
    },
    [effectiveSort, setPageParam, setSortParam, startTransition]
  );

  const renderSortIcon = React.useCallback(
    (column: SiteSortField) => {
      const current = effectiveSort[0];
      if (!current || current.id !== column) {
        return <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground" />;
      }
      if (current.desc) {
        return <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground" />;
      }
      return <IconChevronUp className="h-3.5 w-3.5 text-muted-foreground" />;
    },
    [effectiveSort]
  );

  const handleColumnFiltersChange = React.useCallback(
    (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
      const next =
        typeof updater === "function" ? updater(columnFilters) : updater;

      const nameFilter = next.find((filter) => filter.id === "name");
      const statusFilterValue = next.find((filter) => filter.id === "status");

      const nextSearch =
        typeof nameFilter?.value === "string" ? nameFilter.value : "";
      const nextStatuses = normalizeStatuses(
        Array.isArray(statusFilterValue?.value)
          ? (statusFilterValue?.value as SiteStatusValue[])
          : []
      );

      const currentStatusesKey = serializeStatusesParam(effectiveStatuses);
      const nextStatusesKey = serializeStatusesParam(nextStatuses);

      const didSearchChange = nextSearch !== effectiveSearch;
      const didStatusesChange = nextStatusesKey !== currentStatusesKey;
      const shouldResetPage = (didSearchChange || didStatusesChange) && currentPage !== 1;

      if (!didSearchChange && !didStatusesChange && !shouldResetPage) {
        return;
      }

      startTransition(() => {
        if (didSearchChange) {
          const action = nextSearch
            ? setSearchParam(nextSearch)
            : setSearchParam(null);
          void action.catch(() => {});
        }

        if (didStatusesChange) {
          const action = nextStatuses.length
            ? setStatusParam(nextStatuses)
            : setStatusParam(null);
          void action.catch(() => {});
        }

        if (shouldResetPage) {
          void setPageParam(1).catch(() => {});
        }
      });
    },
    [
      columnFilters,
      effectiveSearch,
      effectiveStatuses,
      currentPage,
      setSearchParam,
      setStatusParam,
      setPageParam,
      startTransition,
    ]
  );

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      const target = Math.min(Math.max(nextPage, 1), totalPages);
      if (target === currentPage) {
        return;
      }

      startTransition(() => {
        void setPageParam(target).catch(() => {});
      });
    },
    [currentPage, totalPages, setPageParam, startTransition]
  );

  const handlePageSizeChange = React.useCallback(
    (nextSize: number) => {
      if (nextSize === effectivePageSize) {
        return;
      }

      startTransition(() => {
        void setLimitParam(nextSize).catch(() => {});
        void setPageParam(1).catch(() => {});
      });
    },
    [effectivePageSize, setLimitParam, setPageParam, startTransition]
  );

  const columns = React.useMemo<ColumnDef<SiteListRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <SortableColumnHeader
            label="Name"
            column="name"
            icon={renderSortIcon("name")}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) =>
          row.original.client ? (
            <span>{row.original.client.name}</span>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "status",
        header: () => (
          <SortableColumnHeader
            label="Status"
            column="status"
            icon={renderSortIcon("status")}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => {
          const meta = getStatusMeta(row.original.status as SiteStatusValue);
          const StatusIcon = meta.icon;
          return (
            <Badge variant="outline" className="gap-1.5 px-2 py-1 text-muted-foreground">
              <StatusIcon className={meta.iconClassName ?? "h-3.5 w-3.5"} />
              {meta.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <SortableColumnHeader
            label="Created"
            column="createdAt"
            icon={renderSortIcon("createdAt")}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => formatDate(row.original.createdAt),
        enableColumnFilter: false,
      },
      {
        accessorKey: "updatedAt",
        header: () => (
          <SortableColumnHeader
            label="Updated"
            column="updatedAt"
            icon={renderSortIcon("updatedAt")}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => formatDate(row.original.updatedAt),
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DataTableRowActions row={row} workspaceId={workspaceId} />
          </div>
        ),
        enableHiding: false,
        enableColumnFilter: false,
      },
    ],
    [handleSort, renderSortIcon, workspaceId]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting: sortingState,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
    enableRowSelection: true,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: handleColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        statusOptions={STATUS_FILTER_OPTIONS}
        isPending={isPending}
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        page={currentPage}
        pageSize={effectivePageSize}
        totalCount={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isPending={isPending}
      />
    </div>
  );
}

type SortableColumnHeaderProps = {
  label: string;
  column: SiteSortField;
  icon: React.ReactNode;
  onSort: (column: SiteSortField) => void;
};

function SortableColumnHeader({
  label,
  column,
  icon,
  onSort,
}: SortableColumnHeaderProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onSort(column)}
      className="flex items-center gap-1 px-0 text-sm font-medium"
    >
      {label}
      {icon}
    </Button>
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
