"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CloudSun,
  Home,
  PlayCircle,
  GitCompare,
  Sliders,
  Sparkles,
  ShieldAlert,
  Box,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Climate Explorer", href: "/climate", icon: CloudSun },
  { name: "Shelter Designer", href: "/shelter", icon: Home },
  { name: "Simulation", href: "/simulation/results", icon: PlayCircle },
  { name: "Comparison", href: "/compare", icon: GitCompare },
  { name: "Optimization", href: "/optimization", icon: Sliders },
  { name: "Recommendation", href: "/recommendation", icon: Sparkles },
  { name: "Resilience", href: "/resilience", icon: ShieldAlert },
  { name: "Thermal Twin", href: "/thermal-twin", icon: Box },
  { name: "Reports", href: "/reports", icon: FileText },
];

interface SidebarRailProps {
  expanded: boolean;
  onToggle: () => void;
}

export function SidebarRail({ expanded, onToggle }: SidebarRailProps) {
  const pathname = usePathname();

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed top-16 bottom-0 left-0 z-30 bg-surface border-r border-border-subtle transition-[width] duration-200 ease-in-out select-none",
        expanded ? "w-60" : "w-16"
      )}
      aria-label="Application Navigation Rail"
    >
      {/* Navigation Destination List */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isItemActive(item.href, item.exact);
          const Icon = item.icon;

          const buttonContent = (
            <Link
              href={item.href}
              className={cn(
                "relative flex items-center h-10 rounded-pill transition-colors group",
                expanded ? "px-3 gap-3 w-full" : "justify-center w-12 mx-auto",
                active
                  ? "text-shop-violet font-medium"
                  : "text-slate-muted hover:text-slate-ink hover:bg-warm-fog/30"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeRailPill"
                  className="absolute inset-0 bg-shop-violet-subtle rounded-pill z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 z-10 transition-colors",
                  active
                    ? "text-shop-violet"
                    : "text-slate-muted group-hover:text-slate-ink"
                )}
              />
              {expanded && (
                <span className="text-sm truncate z-10 tracking-tight">
                  {item.name}
                </span>
              )}
            </Link>
          );

          if (!expanded) {
            return (
              <Tooltip key={item.href} delayDuration={150}>
                <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-pill bg-slate-ink text-surface px-3 py-1 text-xs shadow-dropdown font-medium"
                >
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{buttonContent}</div>;
        })}
      </nav>

      {/* Bottom Pinned Controls (Settings & Collapse Toggle) */}
      <div className="p-2 border-t border-border-subtle flex flex-col gap-1 bg-surface">
        {/* Settings */}
        {(() => {
          const active = isItemActive("/settings");
          const settingsBtn = (
            <Link
              href="/settings"
              className={cn(
                "relative flex items-center h-10 rounded-pill transition-colors group",
                expanded ? "px-3 gap-3 w-full" : "justify-center w-12 mx-auto",
                active
                  ? "text-shop-violet font-medium"
                  : "text-slate-muted hover:text-slate-ink hover:bg-warm-fog/30"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeRailPill"
                  className="absolute inset-0 bg-shop-violet-subtle rounded-pill z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Settings
                className={cn(
                  "w-5 h-5 shrink-0 z-10",
                  active
                    ? "text-shop-violet"
                    : "text-slate-muted group-hover:text-slate-ink"
                )}
              />
              {expanded && (
                <span className="text-sm truncate z-10 tracking-tight">
                  Settings
                </span>
              )}
            </Link>
          );

          if (!expanded) {
            return (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>{settingsBtn}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-pill bg-slate-ink text-surface px-3 py-1 text-xs shadow-dropdown font-medium"
                >
                  Settings
                </TooltipContent>
              </Tooltip>
            );
          }
          return settingsBtn;
        })()}

        {/* Expand / Collapse Action */}
        <button
          onClick={onToggle}
          type="button"
          aria-label={expanded ? "Collapse Sidebar Rail" : "Expand Sidebar Rail"}
          className={cn(
            "flex items-center h-10 rounded-pill text-slate-muted hover:text-slate-ink hover:bg-warm-fog/30 transition-colors cursor-pointer",
            expanded ? "px-3 gap-3 w-full" : "justify-center w-12 mx-auto"
          )}
        >
          {expanded ? (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span className="text-xs text-slate-muted uppercase tracking-wider font-medium">
                Collapse Rail
              </span>
            </>
          ) : (
            <ChevronRight className="w-5 h-5 shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
