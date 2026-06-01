"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingGauge } from "@/components/dashboard/RatingGauge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RatingBreakdown } from "@/lib/rating";

interface ProfileData {
  user: { id: string; email: string; name: string; image?: string; createdAt: string };
  profile: { age?: number; battingStyle?: string; bowlingStyle?: string; teamName?: string; bio?: string } | null;
}

interface RatingData {
  current: RatingBreakdown;
  history: Array<{ date: string; rating: number }>;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", battingStyle: "", bowlingStyle: "", teamName: "", bio: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/rating").then((r) => r.json()),
    ]).then(([p, r]) => {
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
    });
  }, []);

  async function handleSave() {
    setSaving(true);
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
    } else {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  }

  if (!profileData) {
    return <div className="p-6 text-[#6B7280]">Loading profile...</div>;
  }

  const initials = profileData.user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Profile header */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6 flex items-start gap-6">
        <Avatar className="w-16 h-16">
          <AvatarImage src={profileData.user.image ?? ""} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{profileData.user.name}</h2>
          <p className="text-[#6B7280] text-sm">{profileData.user.email}</p>
          {profileData.profile?.teamName && (
            <p className="text-[#00D4AA] text-sm font-medium mt-1">{profileData.profile.teamName}</p>
          )}
          <div className="flex gap-4 mt-3 text-xs text-[#6B7280]">
            {profileData.profile?.battingStyle && <span>🏏 {profileData.profile.battingStyle}</span>}
            {profileData.profile?.bowlingStyle && <span>🎯 {profileData.profile.bowlingStyle}</span>}
            {profileData.profile?.age && <span>Age: {profileData.profile.age}</span>}
          </div>
          {profileData.profile?.bio && (
            <p className="text-sm text-[#9CA3AF] mt-2">{profileData.profile.bio}</p>
          )}
        </div>
        <Button
          variant={editing ? "outline" : "ghost"}
          size="sm"
          onClick={() => editing ? setEditing(false) : setEditing(true)}
          className="text-[#6B7280]"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-xl border border-[#00D4AA]/30 bg-[#111827] p-6 space-y-4">
          <h3 className="font-semibold text-white">Edit Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Batting Style</Label>
              <Select value={form.battingStyle} onValueChange={(v) => setForm({ ...form, battingStyle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right-hand">Right-hand bat</SelectItem>
                  <SelectItem value="Left-hand">Left-hand bat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Bowling Style</Label>
              <Select value={form.bowlingStyle} onValueChange={(v) => setForm({ ...form, bowlingStyle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Right-arm Fast", "Right-arm Medium", "Right-arm Medium Fast", "Right-arm Off-spin", "Right-arm Leg-spin", "Left-arm Fast", "Left-arm Medium", "Left-arm Spin", "None"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Team Name</Label>
              <Input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} placeholder="Your cricket team" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      {/* Rating gauge + history */}
      {ratingData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
            <p className="text-sm font-medium text-white mb-4">Current CricketIQ Rating</p>
            <RatingGauge breakdown={ratingData.current} />
          </div>
          <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
            <p className="text-sm font-medium text-white mb-4">Rating Over Time</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ratingData.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1F2937", borderRadius: "8px", color: "#F9FAFB" }} formatter={(v) => [(v as number).toFixed(1), "Rating"]} />
                <Line type="monotone" dataKey="rating" stroke="#00D4AA" strokeWidth={2.5} dot={{ fill: "#00D4AA", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
