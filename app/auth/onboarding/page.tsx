"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, User, Zap, Users, CheckCircle } from "lucide-react";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User, desc: "Tell us about yourself" },
  { id: 2, title: "Playing Style", icon: Zap, desc: "Your batting & bowling" },
  { id: 3, title: "Team Details", icon: Users, desc: "Your cricket team" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    battingStyle: "",
    bowlingStyle: "",
    teamName: "",
    bio: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFinish() {
    setLoading(true);
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
          onboardingDone: true,
        }),
      });
      if (res.ok) {
        toast.success("Profile created! Welcome to CricketIQ 🏏");
        router.refresh();
        router.push("/dashboard");
      } else {
        toast.error("Failed to save profile");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 70%, rgba(16,185,129,0.07) 0%, transparent 60%)" }} />

      <div className="relative z-10 w-full max-w-2xl px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] mb-4">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your profile</h1>
          <p className="text-ink-muted mt-1">Complete your cricket profile to get started</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all ${step > s.id ? "bg-emerald-500 text-black" : step === s.id ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400" : "bg-hairline text-ink-muted"}`}>
                {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
              </div>
              <div className="hidden sm:block ml-2 mr-6">
                <p className={`text-xs font-medium ${step >= s.id ? "text-white" : "text-ink-muted"}`}>{s.title}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-[2px] mr-2 ${step > s.id ? "bg-emerald-500" : "bg-hairline"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step context — gives progress clarity on mobile where step titles are hidden */}
        <p className="mb-6 text-center text-xs text-ink-muted sm:hidden">
          Step <span className="font-semibold text-white">{step}</span> of{" "}
          {STEPS.length} · {STEPS[step - 1].desc}
        </p>

        <div className="glass rounded-2xl p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Personal Information</h2>
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Age</Label>
                <Input type="number" placeholder="24" min={10} max={60} value={form.age} onChange={(e) => update("age", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Bio (optional)</Label>
                <Textarea placeholder="Tell us about your cricket journey..." value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Playing Style</h2>
              <div className="space-y-1.5">
                <Label>Batting Style</Label>
                <Select value={form.battingStyle} onValueChange={(v) => update("battingStyle", v)}>
                  <SelectTrigger><SelectValue placeholder="Select batting style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Right-hand">Right-hand bat</SelectItem>
                    <SelectItem value="Left-hand">Left-hand bat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Bowling Style</Label>
                <Select value={form.bowlingStyle} onValueChange={(v) => update("bowlingStyle", v)}>
                  <SelectTrigger><SelectValue placeholder="Select bowling style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Right-arm Fast">Right-arm Fast</SelectItem>
                    <SelectItem value="Right-arm Medium">Right-arm Medium</SelectItem>
                    <SelectItem value="Right-arm Medium Fast">Right-arm Medium Fast</SelectItem>
                    <SelectItem value="Right-arm Off-spin">Right-arm Off-spin</SelectItem>
                    <SelectItem value="Right-arm Leg-spin">Right-arm Leg-spin</SelectItem>
                    <SelectItem value="Left-arm Fast">Left-arm Fast</SelectItem>
                    <SelectItem value="Left-arm Medium">Left-arm Medium</SelectItem>
                    <SelectItem value="Left-arm Spin">Left-arm Spin</SelectItem>
                    <SelectItem value="None">Don&apos;t bowl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Team Details</h2>
              <div className="space-y-1.5">
                <Label>Team Name</Label>
                <Input placeholder="Mumbai Hawks, Local XI, etc." value={form.teamName} onChange={(e) => update("teamName", e.target.value)} />
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400 font-medium mb-1">You&apos;re almost there!</p>
                <p className="text-xs text-ink-muted">CricketIQ will use this info to personalize your analytics and AI coaching recommendations.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="text-ink-muted"
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Saving…
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
