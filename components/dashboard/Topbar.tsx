"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/matches/new": "New Match",
  "/matches": "My Matches",
  "/analytics": "Analytics",
  "/ai-coach": "AI Coach",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const title =
    PAGE_TITLES[pathname] ??
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ?? ""] ??
    "CricketIQ";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#161B24] bg-[#07090D]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[15px] font-semibold text-white">{title}</h1>
        <p
          className="hidden text-xs text-[#5A6372] sm:block"
          suppressHydrationWarning
        >
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <Button
        asChild
        size="sm"
        className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
      >
        <Link href="/matches/new">
          <Plus className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">New Match</span>
        </Link>
      </Button>
    </header>
  );
}
