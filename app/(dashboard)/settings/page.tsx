"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogOut, Trash2, Bell, Shield, Moon } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Appearance */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Moon className="w-4 h-4 text-[#00D4AA]" />
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Dark Mode</Label>
            <p className="text-xs text-[#6B7280] mt-0.5">CricketIQ uses dark mode by default for optimal stats viewing</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-[#00D4AA] flex items-center px-1 cursor-not-allowed opacity-60">
            <div className="w-4 h-4 rounded-full bg-white ml-auto" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#F59E0B]" />
          Notifications
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Match reminders</Label>
            <p className="text-xs text-[#6B7280] mt-0.5">Get reminded to log your match performance</p>
          </div>
          <button
            onClick={() => { setNotifications(!notifications); toast.success(notifications ? "Notifications disabled" : "Notifications enabled"); }}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${notifications ? "bg-[#00D4AA]" : "bg-[#1F2937]"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications ? "ml-auto" : ""}`} />
          </button>
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#8B5CF6]" />
          Privacy & Data
        </h3>
        <div className="space-y-3 text-sm text-[#9CA3AF]">
          <p>Your cricket performance data is private and only visible to you.</p>
          <p>AI analysis is powered by OpenAI GPT-4o. Match data is sent to generate insights but is not stored by OpenAI beyond the API call.</p>
        </div>
        <Separator className="my-4" />
        <Button
          variant="ghost"
          size="sm"
          className="text-[#6B7280] hover:text-white"
          onClick={() => toast.info("Data export feature coming soon")}
        >
          Export my data
        </Button>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
        <h3 className="font-semibold text-white mb-4">Account</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start text-[#6B7280]"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={() => toast.error("Account deletion requires email confirmation. Feature coming soon.")}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="text-center text-xs text-[#6B7280] space-y-1">
        <p>CricketIQ v1.0.0 — AI Cricket Analytics Platform</p>
        <p>Built with Next.js 14, Prisma, and Google Gemini</p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <a href="/privacy" className="hover:text-[#00D4AA] transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-[#00D4AA] transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
