import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0–100
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative w-full h-2 overflow-hidden rounded-pill bg-warm-fog",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-shop-violet rounded-pill transition-all duration-300 ease-in-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
