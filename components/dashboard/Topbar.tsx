"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/matches": "My Matches",
  "/matches/new": "New Match",
  "/analytics": "Analytics",
  "/ai-coach": "AI Coach",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ?? ""] ?? "CricketIQ";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-[#0A0F1E]/95 backdrop-blur-md border-b border-[#1F2937]">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-[#6B7280] hidden sm:block" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild size="sm" className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold hidden sm:flex">
          <Link href="/matches/new">
            <Plus className="w-4 h-4 mr-1" />
            New Match
          </Link>
        </Button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111827] border border-[#1F2937] text-[#6B7280] hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
        </button>
      </div>
    </header>
  );
}
