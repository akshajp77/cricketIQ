"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Trophy } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwValid = password.length >= 8;
  const pwError = pwTouched && !pwValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwValid) {
      setPwTouched(true);
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create account");
        return;
      }
      // Sign in immediately then clear server cache before navigating
      await signIn("credentials", { email, password, redirect: false });
      router.refresh();
      router.push("/auth/onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-navy">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] mb-4 shadow-lg shadow-[#10B981]/30">
            <Trophy className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white">CricketIQ</h1>
          <p className="text-ink-muted mt-1">Start tracking your performance today</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Virat Kohli"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPwTouched(true)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-invalid={pwError}
                  aria-describedby="password-hint"
                  className={pwError ? "border-red-500/60 focus-visible:ring-red-500/40" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p
                id="password-hint"
                className={pwError ? "text-xs text-red-400" : "text-xs text-ink-muted"}
              >
                {pwError
                  ? "Password must be at least 8 characters"
                  : "Use at least 8 characters"}
              </p>
            </div>

            <Button type="submit" className="w-full bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-emerald-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
