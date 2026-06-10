"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LogOut, Trash2, Bell, Shield, Moon, Download } from "lucide-react";
import { cn } from "@/lib/utils";

function SettingsCard({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: React.ElementType;
  accent: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#1B212C] bg-[#0C1015] p-6">
      <h3 className="mb-5 flex items-center gap-2.5 text-sm font-semibold text-white">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}14`, border: `1px solid ${accent}26` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  on,
  disabled,
  onClick,
}: {
  on: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
        on ? "bg-emerald-500" : "bg-[#1B212C]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow transition-transform",
          on && "translate-x-5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      <PageHeader
        kicker="Preferences"
        title="Settings"
        description="Manage your account and app preferences."
      />

      {/* Appearance */}
      <SettingsCard icon={Moon} accent="#A78BFA" title="Appearance">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-white">Dark Mode</Label>
            <p className="mt-0.5 text-xs text-[#6B7484]">
              CricketIQ uses dark mode by default for optimal stats viewing
            </p>
          </div>
          <Toggle on disabled />
        </div>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard icon={Bell} accent="#F59E0B" title="Notifications">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-white">Match reminders</Label>
            <p className="mt-0.5 text-xs text-[#6B7484]">
              Get reminded to log your match performance
            </p>
          </div>
          <Toggle
            on={notifications}
            onClick={() => {
              setNotifications(!notifications);
              toast.success(notifications ? "Notifications disabled" : "Notifications enabled");
            }}
          />
        </div>
      </SettingsCard>

      {/* Privacy */}
      <SettingsCard icon={Shield} accent="#38BDF8" title="Privacy & Data">
        <div className="space-y-2.5 text-sm leading-relaxed text-[#8A93A3]">
          <p>Your cricket performance data is private and only visible to you.</p>
          <p>
            AI analysis is powered by OpenAI GPT-4o. Match data is sent to generate
            insights but is not stored by OpenAI beyond the API call.
          </p>
        </div>
        <Separator className="my-4" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Data export feature coming soon")}
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Export my data
        </Button>
      </SettingsCard>

      {/* Account */}
      <SettingsCard icon={LogOut} accent="#10B981" title="Account">
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-[#B6BDC9]"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => toast.error("Account deletion requires email confirmation. Feature coming soon.")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </SettingsCard>

      {/* About */}
      <div className="space-y-1 pt-2 text-center text-xs text-[#5A6372]">
        <p>CricketIQ v1.0.0 — AI Cricket Analytics Platform</p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <a href="/privacy" className="transition-colors hover:text-emerald-400">Privacy Policy</a>
          <a href="/terms" className="transition-colors hover:text-emerald-400">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
