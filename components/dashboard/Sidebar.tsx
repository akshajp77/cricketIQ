"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Bot,
  User,
  Settings,
  LogOut,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

const NAV_SECTIONS: Array<{
  label: string;
  items: Array<{
    href: string;
    icon: React.ElementType;
    label: string;
    disabled?: boolean;
  }>;
}> = [
  {
    label: "Analyze",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/matches", icon: ClipboardList, label: "My Matches" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/ai-coach", icon: Bot, label: "AI Coach" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", icon: User, label: "Profile" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
  {
    label: "Coming Soon",
    items: [
      { href: "/ball-by-ball", icon: Layers, label: "Ball-by-Ball", disabled: true },
    ],
  },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  rating?: number;
}

export function Sidebar({ user, rating = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 hidden h-screen flex-col border-r border-[#161B24] bg-[#0A0D12] transition-[width] duration-300 md:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-[#161B24] px-4",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/20">
          <Trophy className="h-4 w-4 text-black" />
        </div>
        {!collapsed && (
          <span className="text-[17px] font-bold tracking-tight text-white">
            Cricket<span className="text-emerald-400">IQ</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5A6372]">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.href}
                      title={`${item.label} — coming soon`}
                      className={cn(
                        "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4A5160]",
                        collapsed && "justify-center"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                      {!collapsed && (
                        <span className="flex min-w-0 flex-1 items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          <span className="ml-1 flex-shrink-0 rounded-full border border-[#1B212C] px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-[#5A6372]">
                            Soon
                          </span>
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-[#8A93A3] hover:bg-white/[0.04] hover:text-white"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400" />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                        isActive
                          ? "text-emerald-400"
                          : "text-[#6B7484] group-hover:text-white"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-2 flex h-8 items-center justify-center rounded-lg text-[#5A6372] transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User footer */}
      <div
        className={cn(
          "flex items-center gap-3 border-t border-[#161B24] p-3",
          collapsed && "justify-center"
        )}
      >
        <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-[#1B212C]">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          <AvatarFallback className="bg-emerald-500/10 text-xs font-semibold text-emerald-400">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="text-[11px] text-[#5A6372]">
                <span className="font-mono font-semibold text-emerald-400">
                  {rating.toFixed(1)}
                </span>{" "}
                IQ Rating
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex-shrink-0 rounded-md p-1.5 text-[#5A6372] transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
