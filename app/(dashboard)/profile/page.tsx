"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingGauge } from "@/components/dashboard/RatingGauge";
import { Pencil, Swords, Target, CalendarDays, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RatingBreakdown } from "@/lib/rating";

interface ProfileData {
  user: { id: string; email: string; name: string; image?: string; createdAt: string };
  profile: { age?: number; battingStyle?: string; bowlingStyle?: string; teamName?: string; bio?: string } | null;
}

interface RatingData {
  current: RatingBreakdown;
  history: Array<{ date: string; rating: number }>;
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-start gap-5 rounded-xl border border-[#1B212C] bg-[#0C1015] p-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", battingStyle: "", bowlingStyle: "", teamName: "", bio: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      }),
      fetch("/api/rating").then((r) => {
        if (!r.ok) throw new Error("Failed to load rating");
        return r.json();
      }),
    ])
      .then(([p, r]) => {
        setProfileData(p);
        setRatingData(r);
        setForm({
          name: p.user?.name ?? "",
          age: p.profile?.age?.toString() ?? "",
          battingStyle: p.profile?.battingStyle ?? "",
          bowlingStyle: p.profile?.bowlingStyle ?? "",
          teamName: p.profile?.teamName ?? "",
          bio: p.profile?.bio ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile data"));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: form.age ? parseInt(form.age) : undefined,
          battingStyle: form.battingStyle,
          bowlingStyle: form.bowlingStyle,
          teamName: form.teamName,
          bio: form.bio,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData((p) => p ? { ...p, user: updated.user, profile: updated.profile } : p);
        setEditing(false);
        toast.success("Profile updated!");
        // Refresh server components so sidebar name/team updates immediately
        router.refresh();
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  if (!profileData) {
    return <ProfileSkeleton />;
  }

  const initials = profileData.user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-xl border border-[#1B212C] bg-[#0C1015]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-16 w-16 ring-2 ring-[#1B212C]">
            <AvatarImage src={profileData.user.image ?? ""} />
            <AvatarFallback className="bg-emerald-500/10 text-xl font-semibold text-emerald-400">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {profileData.user.name}
            </h1>
            <p className="text-sm text-[#6B7484]">{profileData.user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profileData.profile?.teamName && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <Users className="h-3 w-3" />
                  {profileData.profile.teamName}
                </span>
              )}
              {profileData.profile?.battingStyle && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B212C] bg-white/[0.02] px-2.5 py-1 text-xs text-[#B6BDC9]">
                  <Swords className="h-3 w-3 text-[#6B7484]" />
                  {profileData.profile.battingStyle}
                </span>
              )}
              {profileData.profile?.bowlingStyle && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B212C] bg-white/[0.02] px-2.5 py-1 text-xs text-[#B6BDC9]">
                  <Target className="h-3 w-3 text-[#6B7484]" />
                  {profileData.profile.bowlingStyle}
                </span>
              )}
              {profileData.profile?.age && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B212C] bg-white/[0.02] px-2.5 py-1 text-xs text-[#B6BDC9]">
                  <CalendarDays className="h-3 w-3 text-[#6B7484]" />
                  Age {profileData.profile.age}
                </span>
              )}
            </div>
            {profileData.profile?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-[#8A93A3]">
                {profileData.profile.bio}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="shrink-0"
          >
            {editing ? "Cancel" : (
              <>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="space-y-4 rounded-xl border border-emerald-500/25 bg-[#0C1015] p-6">
          <h3 className="text-sm font-semibold text-white">Edit Profile</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[#B6BDC9]">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[#B6BDC9]">Age</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[#B6BDC9]">Batting Style</Label>
              <Select value={form.battingStyle} onValueChange={(v) => setForm({ ...form, battingStyle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right-hand">Right-hand bat</SelectItem>
                  <SelectItem value="Left-hand">Left-hand bat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-[#B6BDC9]">Bowling Style</Label>
              <Select value={form.bowlingStyle} onValueChange={(v) => setForm({ ...form, bowlingStyle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Right-arm Fast", "Right-arm Medium", "Right-arm Medium Fast", "Right-arm Off-spin", "Right-arm Leg-spin", "Left-arm Fast", "Left-arm Medium", "Left-arm Spin", "None"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[13px] text-[#B6BDC9]">Team Name</Label>
              <Input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} placeholder="Your cricket team" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[13px] text-[#B6BDC9]">Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            {saving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}

      {/* Rating gauge + history */}
      {ratingData && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-[#1B212C] bg-[#0C1015] p-6">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7484]">
              Current CricketIQ Rating
            </p>
            <RatingGauge breakdown={ratingData.current} />
          </div>
          <div className="rounded-xl border border-[#1B212C] bg-[#0C1015] p-6">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7484]">
              Rating Over Time
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ratingData.history}>
                <defs>
                  <linearGradient id="profileRatingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#161B24" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#5A6372", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#5A6372", fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  contentStyle={{ background: "#0C1015", border: "1px solid #1B212C", borderRadius: "10px", color: "#F9FAFB", fontSize: "12px" }}
                  formatter={(v) => [(v as number).toFixed(1), "Rating"]}
                />
                <Area type="monotone" dataKey="rating" stroke="#10B981" strokeWidth={2.5} fill="url(#profileRatingGrad)" dot={{ fill: "#10B981", r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
