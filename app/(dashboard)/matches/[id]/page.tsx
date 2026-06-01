import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const match = await prisma.match.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
  });

  if (!match) notFound();

  const economy = match.bowling && match.bowling.overs > 0
    ? (match.bowling.runsConceded / match.bowling.overs).toFixed(2)
    : "—";
  const sr = match.batting && match.batting.balls > 0
    ? ((match.batting.runs / match.batting.balls) * 100).toFixed(1)
    : "—";

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="text-[#6B7280]">
          <Link href="/matches">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white">vs {match.opponent}</h2>
          <p className="text-sm text-[#6B7280]">{formatDate(match.date)} · {match.venue}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge>{match.format}</Badge>
          <Badge variant={match.result === "Won" ? "success" : match.result === "Lost" ? "danger" : "warning"}>
            {match.result}
          </Badge>
        </div>
      </div>

      {match.notes && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937]">
          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Notes</p>
          <p className="text-sm text-white">{match.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Batting */}
        <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-4">
          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-3">Batting</p>
          <p className="text-3xl font-bold text-white stat-mono">{match.batting?.runs ?? 0}</p>
          <p className="text-sm text-[#6B7280]">({match.batting?.balls ?? 0} balls)</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[#6B7280]">4s</span><span className="font-mono text-white">{match.batting?.fours ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">6s</span><span className="font-mono text-white">{match.batting?.sixes ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">SR</span><span className="font-mono text-[#00D4AA]">{sr}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Out</span><span className="text-white">{match.batting?.dismissalType ?? "—"}</span></div>
          </div>
        </div>

        {/* Bowling */}
        <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-4">
          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-3">Bowling</p>
          <p className="text-3xl font-bold text-white stat-mono">{match.bowling?.wickets ?? 0}/{match.bowling?.runsConceded ?? 0}</p>
          <p className="text-sm text-[#6B7280]">({match.bowling?.overs ?? 0} overs)</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[#6B7280]">Economy</span><span className="font-mono text-[#F59E0B]">{economy}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Maidens</span><span className="font-mono text-white">{match.bowling?.maidens ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Wides</span><span className="font-mono text-white">{match.bowling?.wides ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">No Balls</span><span className="font-mono text-white">{match.bowling?.noBalls ?? 0}</span></div>
          </div>
        </div>

        {/* Fielding */}
        <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-4">
          <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-3">Fielding</p>
          <p className="text-3xl font-bold text-white stat-mono">
            {(match.fielding?.catches ?? 0) + (match.fielding?.runOuts ?? 0) + (match.fielding?.stumpings ?? 0)}
          </p>
          <p className="text-sm text-[#6B7280]">dismissals</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[#6B7280]">Catches</span><span className="font-mono text-white">{match.fielding?.catches ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Run Outs</span><span className="font-mono text-white">{match.fielding?.runOuts ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-[#6B7280]">Stumpings</span><span className="font-mono text-white">{match.fielding?.stumpings ?? 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
