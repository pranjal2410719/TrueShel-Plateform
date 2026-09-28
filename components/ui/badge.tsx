import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-shop-violet",
  {
    variants: {
      variant: {
        default:
          "bg-warm-fog text-slate-ink",
        secondary:
          "bg-thermal-cold-subtle text-thermal-cold border border-thermal-cold-border",
        violet:
          "bg-shop-violet-subtle text-shop-violet border border-shop-violet-border",
        cold:
          "bg-thermal-cold-subtle text-thermal-cold border border-thermal-cold-border",
        comfort:
          "bg-thermal-comfort-subtle text-thermal-comfort border border-thermal-comfort-border",
        hot:
          "bg-thermal-hot-subtle text-thermal-hot border border-thermal-hot-border",
        error:
          "bg-thermal-hot-subtle text-thermal-hot border border-thermal-hot-border",
        warn:
          "bg-thermal-warn-subtle text-thermal-warn border border-thermal-warn-border",
        outline:
          "border border-border-subtle text-slate-secondary bg-transparent",
        success:
          "bg-thermal-comfort-subtle text-thermal-comfort border border-thermal-comfort-border",
        warning:
          "bg-thermal-warn-subtle text-thermal-warn border border-thermal-warn-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
