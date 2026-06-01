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
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/matches", icon: ClipboardList, label: "My Matches" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/ai-coach", icon: Bot, label: "AI Coach" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
  {
    href: "/ball-by-ball",
    icon: Layers,
    label: "Ball-by-Ball",
    comingSoon: true,
    disabled: true,
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
        "hidden md:flex flex-col h-screen sticky top-0 bg-[#0D1526] border-r border-[#1F2937] transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-[#1F2937]", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#0093A8] flex items-center justify-center flex-shrink-0">
          <Trophy className="w-4 h-4 text-[#0A0F1E]" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight">CricketIQ</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-not-allowed opacity-50",
                  collapsed ? "justify-center" : ""
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-[#6B7280]" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-[#6B7280] truncate">{item.label}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 flex-shrink-0">Soon</Badge>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-[#00D4AA]/15 text-[#00D4AA] border-r-2 border-[#00D4AA]"
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]/60"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#00D4AA]" : "")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-8 mx-2 mb-1 rounded-lg text-[#6B7280] hover:text-white hover:bg-[#1F2937] transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User footer */}
      <div className={cn("flex items-center border-t border-[#1F2937] p-3 gap-3", collapsed ? "justify-center" : "")}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#00D4AA] font-mono font-semibold">{rating.toFixed(1)}</span>
              <span className="text-xs text-[#6B7280]">IQ Score</span>
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="text-[#6B7280] hover:text-red-400 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
