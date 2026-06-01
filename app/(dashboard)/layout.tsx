import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCricketIQRating } from "@/lib/rating";
import type { FullMatch } from "@/lib/stats";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [matches, profile] = await Promise.all([
    prisma.match.findMany({
      where: { userId: session.user.id },
      include: { batting: true, bowling: true, fielding: true },
    }),
    prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  // Redirect to onboarding if not done
  if (!profile?.onboardingDone) {
    redirect("/auth/onboarding");
  }

  const rating = calculateCricketIQRating(matches as FullMatch[]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        rating={rating.total}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 scrollbar-thin">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
