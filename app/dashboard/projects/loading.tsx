"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-full md:w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <div className="grid gap-0 border-b p-4 md:grid-cols-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24 md:col-span-1" />
            <Skeleton className="h-4 w-16 md:col-span-1" />
            <Skeleton className="h-4 w-20 md:col-span-1" />
            <Skeleton className="h-4 w-20 md:col-span-1" />
            <Skeleton className="ml-auto h-4 w-10 md:col-span-1" />
          </div>
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 border-b px-4 py-3 md:grid-cols-6"
              >
                <Skeleton className="h-4 w-full md:col-span-1" />
                <Skeleton className="h-4 w-full md:col-span-1" />
                <Skeleton className="h-4 w-full md:col-span-1" />
                <Skeleton className="h-4 w-full md:col-span-1" />
                <Skeleton className="h-4 w-full md:col-span-1" />
                <Skeleton className="ml-auto h-8 w-8 rounded-md md:col-span-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 md:flex-row">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[70px] rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
