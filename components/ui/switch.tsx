"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, defaultChecked = false, onCheckedChange, disabled, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);
    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;
      const next = !isChecked;
      if (checked === undefined) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={handleClick}
        ref={ref}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop-violet disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-shop-violet" : "bg-warm-fog",
          className
        )}
        {...props}
      >
        <span
          data-state={isChecked ? "checked" : "unchecked"}
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-pill bg-surface shadow-card ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
