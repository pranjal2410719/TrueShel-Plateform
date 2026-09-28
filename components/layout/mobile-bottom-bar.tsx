"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  PlayCircle,
  Box,
  Menu,
  CloudSun,
  GitCompare,
  Sliders,
  Sparkles,
  ShieldAlert,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MOBILE_PRIMARY = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Shelter", href: "/shelter", icon: Home },
  { name: "Simulation", href: "/simulation/results", icon: PlayCircle },
  { name: "Twin", href: "/thermal-twin", icon: Box },
];

const MOBILE_SECONDARY = [
  { name: "Climate Explorer", href: "/climate", icon: CloudSun, desc: "Ladakh ambient data, diurnal curves, irradiance" },
  { name: "Design Comparison", href: "/compare", icon: GitCompare, desc: "Side-by-side Design A vs B performance diffs" },
  { name: "Optimization", href: "/optimization", icon: Sliders, desc: "Pareto multi-objective candidate exploration" },
  { name: "Recommendation", href: "/recommendation", icon: Sparkles, desc: "Physics-driven parameter justification" },
  { name: "Resilience & Autonomy", href: "/resilience", icon: ShieldAlert, desc: "Thermal decay to 16°C & multi-hazard risks" },
  { name: "Reports & Export", href: "/reports", icon: FileText, desc: "Client-side PDF and structured JSON export" },
  { name: "Settings", href: "/settings", icon: Settings, desc: "Engineering units and solver tolerances" },
];

export function MobileBottomBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-border-subtle h-16 px-2 flex items-center justify-around select-none pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation Bar"
    >
      {MOBILE_PRIMARY.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative",
              active ? "text-shop-violet font-medium" : "text-slate-muted hover:text-slate-ink"
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 rounded-pill bg-shop-violet" />
            )}
          </Link>
        );
      })}

      {/* 5th Destination: Secondary Modules Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-muted hover:text-slate-ink transition-colors cursor-pointer",
              sheetOpen && "text-shop-violet"
            )}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-card bg-surface p-6 max-h-[85vh] overflow-y-auto border-t border-border-subtle shadow-card">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-semibold text-slate-ink text-left">
              Engineering Modules
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-2">
            {MOBILE_SECONDARY.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border border-border-subtle transition-colors",
                    active
                      ? "bg-shop-violet-subtle border-shop-violet text-shop-violet"
                      : "bg-surface hover:bg-canvas text-slate-ink"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-pill flex items-center justify-center shrink-0", active ? "bg-shop-violet text-surface" : "bg-warm-fog/40 text-slate-secondary")}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-muted truncate">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
