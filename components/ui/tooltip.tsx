"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipContextValue {
  visible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({
  children,
  delayDuration = 150,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delayDuration);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ visible, showTooltip, hideTooltip }}>
      <div className="relative inline-flex" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipTrigger must be used within Tooltip");

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onFocus?: React.FocusEventHandler<HTMLElement>; onBlur?: React.FocusEventHandler<HTMLElement> }>;
    return React.cloneElement(child, {
      onFocus: context.showTooltip,
      onBlur: context.hideTooltip,
    });
  }

  return (
    <div onFocus={context.showTooltip} onBlur={context.hideTooltip} tabIndex={0} {...props}>
      {children}
    </div>
  );
}

export function TooltipContent({
  side = "top",
  className,
  children,
  ...props
}: {
  side?: "top" | "bottom" | "left" | "right";
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipContent must be used within Tooltip");

  if (!context.visible) return null;

  const sidePositions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 pointer-events-none whitespace-nowrap rounded-pill bg-slate-ink text-surface px-3 py-1 text-xs shadow-dropdown font-medium tracking-normal animate-in fade-in-0 duration-150",
        sidePositions[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
