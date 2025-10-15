import { Skeleton } from "@/components/ui/skeleton";
import {
  StatsCardsSkeleton,
  QuickActionsSkeleton,
  DashboardContentSkeleton,
} from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Welcome Header Skeleton */}
      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <StatsCardsSkeleton />

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />

      {/* Main Content Grid Skeleton */}
      <DashboardContentSkeleton />
    </div>
  );
}
