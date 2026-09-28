"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DrawerContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({
  asChild = false,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error("DrawerTrigger must be used within Drawer");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    context.onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLButtonElement> }>;
    return React.cloneElement(child, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export function DrawerContent({
  side = "right",
  className,
  children,
  ...props
}: {
  side?: "right" | "left" | "bottom" | "top";
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error("DrawerContent must be used within Drawer");

  if (!context.open) return null;

  const sideClasses = {
    right: "inset-y-0 right-0 h-full w-full sm:max-w-md rounded-l-card",
    left: "inset-y-0 left-0 h-full w-full sm:max-w-md rounded-r-card",
    bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-card",
    top: "inset-x-0 top-0 max-h-[85vh] rounded-b-card",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-ink/40 transition-opacity"
        onClick={() => context.onOpenChange(false)}
      />
      {/* Drawer Surface */}
      <div
        className={cn(
          "fixed z-50 bg-surface p-6 shadow-card border-none text-slate-ink transition-transform duration-300 ease-in-out overflow-y-auto",
          sideClasses[side],
          className
        )}
        {...props}
      >
        <button
          type="button"
          onClick={() => context.onOpenChange(false)}
          className="absolute right-5 top-5 rounded-pill p-1 text-slate-muted hover:text-slate-ink hover:bg-warm-fog/50 transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-4", className)}
      {...props}
    />
  );
}

export function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-slate-ink",
        className
      )}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-slate-muted tracking-normal", className)}
      {...props}
    />
  );
}
