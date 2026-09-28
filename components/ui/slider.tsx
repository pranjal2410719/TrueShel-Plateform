"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, defaultValue = 0, onValueChange, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<number>(value ?? defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const percentage = Math.min(100, Math.max(0, ((internalValue - min) / (max - min)) * 100));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setInternalValue(val);
      onValueChange?.(val);
      onChange?.(e);
    };

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center py-2", className)}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-pill bg-warm-fog">
          <div
            className="h-full bg-shop-violet transition-all rounded-pill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internalValue}
          onChange={handleChange}
          ref={ref}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          {...props}
        />
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 rounded-pill border-2 border-shop-violet bg-surface shadow-card transition-all"
          style={{ left: `${percentage}%` }}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
