"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "./data-table-view-options";
import {
  DataTableFacetedFilter,
  type FacetedFilterOption,
} from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  statusOptions: FacetedFilterOption[];
  isPending?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  statusOptions,
  isPending,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const nameColumn = table.getColumn("name");
  const activeFilterValue =
    (nameColumn?.getFilterValue() as string | undefined) ?? "";
  const [pendingValue, setPendingValue] = React.useState(activeFilterValue);

  React.useEffect(() => {
    setPendingValue(activeFilterValue);
  }, [activeFilterValue]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!nameColumn) {
        return;
      }

      const value = pendingValue.trim();
      nameColumn.setFilterValue(value.length ? value : undefined);
    },
    [nameColumn, pendingValue]
  );

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-full sm:max-w-xs"
        >
          <Input
            placeholder="Search projects..."
            value={pendingValue}
            onChange={(event) => setPendingValue(event.target.value)}
            className="h-8 w-full"
            disabled={isPending}
          />
        </form>
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statusOptions}
            disabled={isPending}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
            disabled={isPending}
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
