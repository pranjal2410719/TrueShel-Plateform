import React from "react";
import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-pill bg-warm-fog/60", className)}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-surface rounded-card p-6 shadow-card border-none flex flex-col justify-between h-36 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-warm-fog rounded-pill" />
        <div className="h-6 w-6 bg-warm-fog rounded-pill" />
      </div>
      <div>
        <div className="h-8 w-28 bg-warm-fog rounded-pill mb-2" />
        <div className="h-3 w-36 bg-warm-fog rounded-pill" />
      </div>
    </div>
  );
}

export function ChartCardSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className={cn("bg-surface rounded-card p-6 shadow-card border-none animate-pulse flex flex-col", height)}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-warm-fog rounded-pill" />
          <div className="h-3 w-64 bg-warm-fog rounded-pill" />
        </div>
        <div className="h-8 w-24 bg-warm-fog rounded-pill" />
      </div>
      <div className="flex-1 w-full bg-warm-fog/30 rounded-inner" />
    </div>
  );
}

export function StandardPageSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-warm-fog rounded-pill animate-pulse" />
          <div className="h-3 w-72 bg-warm-fog rounded-pill animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-warm-fog rounded-pill animate-pulse" />
      </div>

      {/* 5-Metric Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Visualizer Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCardSkeleton height="h-96" />
        </div>
        <div>
          <ChartCardSkeleton height="h-96" />
        </div>
      </div>
    </div>
  );
}
