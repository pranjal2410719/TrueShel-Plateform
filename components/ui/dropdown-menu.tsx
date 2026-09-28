"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild = false,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  const handleClick = () => {
    context.setOpen(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>;
    return React.cloneElement(child, {
      onClick: handleClick,
    });
  }

  return (
    <div onClick={handleClick} className="cursor-pointer" {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuContent({
  align = "center",
  className,
  children,
  ...props
}: {
  align?: "left" | "center" | "right";
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

  if (!context.open) return null;

  const alignClasses = {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  };

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] rounded-xl bg-surface p-1 shadow-dropdown border border-border-subtle focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150",
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: {
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const context = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent<HTMLElement>) => void }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        context?.setOpen(false);
      },
    });
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-xs outline-none transition-colors hover:bg-warm-fog/40 focus:bg-warm-fog/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1 text-xs font-medium text-slate-muted", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-border-subtle", className)}
      {...props}
    />
  );
}
