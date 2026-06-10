"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, BarChart3, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/matches", icon: ClipboardList, label: "Matches" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/ai-coach", icon: Bot, label: "AI Coach" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-area-pb fixed inset-x-0 bottom-0 z-50 border-t border-[#161B24] bg-[#0A0D12]/95 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors",
                isActive ? "text-emerald-400" : "text-[#6B7484]"
              )}
            >
              {isActive && (
                <span className="absolute -top-[13px] h-[2px] w-8 rounded-full bg-emerald-400" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
