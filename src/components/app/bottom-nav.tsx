"use client";

import { Clock, House, List, Settings, Target } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";
import { nav } from "./motion";

const TABS = [
  { segment: null, href: "/", label: "Home", icon: House },
  { segment: "items", href: "/items", label: "Items", icon: List },
  { segment: "goals", href: "/goals", label: "Goals", icon: Target },
  { segment: "history", href: "/history", label: "History", icon: Clock },
  { segment: "settings", href: "/settings", label: "Settings", icon: Settings },
] as const;

/** Floating bottom nav for the five main screens. Sub-screens show a back pill instead. */
export function BottomNav() {
  const segment = useSelectedLayoutSegment();

  return (
    <nav
      aria-label="Main"
      // Named so it stays put while screens slide/crossfade underneath (globals.css)
      style={{ viewTransitionName: "bottom-nav" }}
      className="fixed inset-x-4 bottom-[calc(20px+var(--spacing-safe-bottom))] z-30 mx-auto flex h-[62px] max-w-[358px] items-center justify-between rounded-full bg-nav px-2.5 shadow-nav"
    >
      {TABS.map(({ segment: tab, href, label, icon: Icon }) => {
        const active = segment === tab;
        return (
          <Link
            key={href}
            href={href}
            transitionTypes={nav.tab}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full p-2.5 transition active:scale-[0.94]",
              active ? "bg-white px-[15px] text-ink" : "text-white/55 hover:text-white/80",
            )}
          >
            <Icon className="size-[21px]" strokeWidth={active ? 2.1 : 1.9} />
            {active && <span className="text-tab font-bold">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
