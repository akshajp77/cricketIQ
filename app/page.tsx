"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession } from "next-auth/react";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Metrics } from "@/components/landing/Metrics";
import { Features } from "@/components/landing/Features";
import { DeepDive } from "@/components/landing/DeepDive";
import { AICoachShowcase } from "@/components/landing/AICoachShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Roadmap } from "@/components/landing/Roadmap";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

function Landing() {
  const router = useRouter();
  const { status } = useSession();

  // Signed-in users go straight to their dashboard
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060709] text-white selection:bg-emerald-500/30">
      <Navbar />
      <main>
        <Hero />
        <Metrics />
        <Features />
        <DeepDive />
        <AICoachShowcase />
        <HowItWorks />
        <Roadmap />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <SessionProvider>
      <Landing />
    </SessionProvider>
  );
}
