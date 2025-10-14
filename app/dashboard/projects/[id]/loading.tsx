"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 rounded-lg border p-6">
          <Skeleton className="h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_item, index) => (
              <div
                key={index}
                className="rounded-md border bg-muted/40 px-3 py-4 space-y-2"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 rounded-lg border p-6 xl:col-span-2">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_item, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_item, index) => (
            <div key={index} className="rounded-md border bg-muted/40 p-4 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border px-3 py-3"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
