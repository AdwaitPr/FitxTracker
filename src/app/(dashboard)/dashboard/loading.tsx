import { Skeleton } from "@/components/ui/skeleton";
import { ShellRail } from "@/components/layout/shell";

export default function DashboardLoading() {
  return (
    <>
      <div className="space-y-8">
        {/* Hero banner skeleton */}
        <Skeleton className="h-64 w-full rounded-hero" />

        {/* 4 Stat chips skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
        </div>

        {/* Recent workouts carousel skeleton */}
        <div className="mt-9 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            <Skeleton className="h-72 w-[288px] shrink-0 rounded-card sm:w-[326px]" />
            <Skeleton className="h-72 w-[288px] shrink-0 rounded-card sm:w-[326px]" />
            <Skeleton className="h-72 w-[288px] shrink-0 rounded-card sm:w-[326px]" />
          </div>
        </div>

        {/* Workout table skeleton */}
        <div className="mt-9 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </div>

      <ShellRail sticky>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <Skeleton className="h-96 w-full rounded-card" />
          <Skeleton className="h-80 w-full rounded-card" />
        </div>
      </ShellRail>
    </>
  );
}
