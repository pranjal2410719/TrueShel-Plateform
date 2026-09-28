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
  (
    { className, min = 0, max = 100, step = 1, value, defaultValue = 0, onValueChange, onChange, disabled, ...props },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState<number>(value ?? defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Clamp so the fill/thumb never render outside the track when the
    // controlled value drifts beyond min/max (e.g. persisted state).
    const clamped = Math.min(max, Math.max(min, internalValue));
    const range = max - min;
    const percentage = range > 0 ? ((clamped - min) / range) * 100 : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (Number.isNaN(val)) return;
      setInternalValue(val);
      onValueChange?.(val);
      onChange?.(e);
    };

    return (
      <div
        className={cn(
          "relative flex w-full touch-none select-none items-center py-2 group",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-pill bg-warm-fog">
          <div
            className="h-full bg-shop-violet rounded-pill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          disabled={disabled}
          onChange={handleChange}
          ref={ref}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clamped}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          {...props}
        />
        {/* Visible thumb — no transition so it tracks the pointer 1:1 while dragging.
            Inset by half the thumb width so it is never clipped at 0%/100%;
            gains a focus ring whenever the hidden input has keyboard focus. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute h-5 w-5 -translate-x-1/2 rounded-pill border-2 border-shop-violet bg-surface shadow-card",
            "group-focus-within:ring-2 group-focus-within:ring-shop-violet-subtle",
          )}
          style={{ left: `calc(${percentage}% + ${10 - percentage * 0.2}px)` }}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
