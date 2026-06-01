"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  CheckCircle,
  Trophy,
  Activity,
  Target,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const matchSchema = z.object({
  opponent: z.string().min(1, "Opponent is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
  format: z.string().min(1, "Format is required"),
  result: z.string().min(1, "Result is required"),
  notes: z.string().optional(),
  runs: z.coerce.number().min(0),
  balls: z.coerce.number().min(0),
  fours: z.coerce.number().min(0),
  sixes: z.coerce.number().min(0),
  dismissalType: z.string(),
  position: z.coerce.number().min(1).max(11).optional(),
  overs: z.coerce.number().min(0),
  runsConceded: z.coerce.number().min(0),
  wickets: z.coerce.number().min(0),
  maidens: z.coerce.number().min(0),
  wides: z.coerce.number().min(0),
  noBalls: z.coerce.number().min(0),
  catches: z.coerce.number().min(0),
  runOuts: z.coerce.number().min(0),
  stumpings: z.coerce.number().min(0),
});

type MatchForm = z.infer<typeof matchSchema>;

const STEPS = [
  { id: 1, title: "Match Info", icon: FileText },
  { id: 2, title: "Batting", icon: Activity },
  { id: 3, title: "Bowling", icon: Target },
  { id: 4, title: "Fielding", icon: Shield },
  { id: 5, title: "Review", icon: CheckCircle },
];

export default function NewMatchPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<MatchForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(matchSchema) as unknown as import("react-hook-form").Resolver<MatchForm>,
    defaultValues: {
      runs: 0, balls: 0, fours: 0, sixes: 0,
      dismissalType: "Did Not Bat",
      overs: 0, runsConceded: 0, wickets: 0, maidens: 0, wides: 0, noBalls: 0,
      catches: 0, runOuts: 0, stumpings: 0,
    },
  });

  const watchOvers = watch("overs");
  const watchRunsConceded = watch("runsConceded");
  const economy = watchOvers > 0 ? (watchRunsConceded / watchOvers).toFixed(2) : "—";

  async function onSubmit(data: MatchForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchInfo: {
            opponent: data.opponent, date: data.date, venue: data.venue,
            format: data.format, result: data.result, notes: data.notes,
          },
          batting: {
            runs: data.runs, balls: data.balls, fours: data.fours, sixes: data.sixes,
            dismissalType: data.dismissalType, position: data.position,
          },
          bowling: {
            overs: data.overs, runsConceded: data.runsConceded, wickets: data.wickets,
            maidens: data.maidens, wides: data.wides, noBalls: data.noBalls,
          },
          fielding: { catches: data.catches, runOuts: data.runOuts, stumpings: data.stumpings },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Match saved! CricketIQ Rating: ${json.rating?.total?.toFixed(1) ?? "—"}`);
        router.push("/matches");
      } else {
        toast.error(json.error ?? "Failed to save match");
      }
    } finally {
      setLoading(false);
    }
  }

  const values = getValues();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <div className={`flex items-center gap-2 ${isActive ? "text-[#00D4AA]" : isDone ? "text-emerald-400" : "text-[#6B7280]"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border ${isActive ? "border-[#00D4AA] bg-[#00D4AA]/15" : isDone ? "border-emerald-400 bg-emerald-400/15" : "border-[#1F2937] bg-[#111827]"}`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-2 ${step > s.id ? "bg-emerald-400" : "bg-[#1F2937]"}`} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}>
        <div className="glass rounded-2xl p-6 space-y-4">
          {/* Step 1: Match Info */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-white">Match Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Opponent *</Label>
                  <Input placeholder="Mumbai Indians" {...register("opponent")} />
                  {errors.opponent && <p className="text-xs text-red-400">{errors.opponent.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Date *</Label>
                  <Input type="date" {...register("date")} max={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-1.5">
                  <Label>Format *</Label>
                  <Select onValueChange={(v) => setValue("format", v)} defaultValue="">
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T20">T20</SelectItem>
                      <SelectItem value="ODI">ODI</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Result *</Label>
                  <Select onValueChange={(v) => setValue("result", v)} defaultValue="">
                    <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                      <SelectItem value="Draw">Draw</SelectItem>
                      <SelectItem value="No Result">No Result</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Venue</Label>
                  <Input placeholder="Stadium name" {...register("venue")} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Textarea placeholder="Any notes about the match..." rows={2} {...register("notes")} />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Batting */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-white">Batting Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Runs</Label>
                  <Input type="number" min={0} {...register("runs")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Balls Faced</Label>
                  <Input type="number" min={0} {...register("balls")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fours (4s)</Label>
                  <Input type="number" min={0} {...register("fours")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sixes (6s)</Label>
                  <Input type="number" min={0} {...register("sixes")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Dismissal</Label>
                  <Select onValueChange={(v) => setValue("dismissalType", v)} defaultValue="Did Not Bat">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Bowled", "LBW", "Caught", "Run Out", "Stumped", "Not Out", "Did Not Bat", "Hit Wicket", "Handled Ball"].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Batting Position</Label>
                  <Input type="number" min={1} max={11} placeholder="1-11" {...register("position")} />
                </div>
              </div>
              {watch("balls") > 0 && (
                <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1F2937] text-sm">
                  <span className="text-[#6B7280]">Strike Rate: </span>
                  <span className="text-[#00D4AA] font-mono font-semibold">
                    {((watch("runs") / watch("balls")) * 100).toFixed(1)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Step 3: Bowling */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-white">Bowling Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Overs Bowled</Label>
                  <Input type="number" min={0} step={0.1} {...register("overs")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Runs Conceded</Label>
                  <Input type="number" min={0} {...register("runsConceded")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Wickets</Label>
                  <Input type="number" min={0} max={10} {...register("wickets")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Maidens</Label>
                  <Input type="number" min={0} {...register("maidens")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Wides</Label>
                  <Input type="number" min={0} {...register("wides")} />
                </div>
                <div className="space-y-1.5">
                  <Label>No Balls</Label>
                  <Input type="number" min={0} {...register("noBalls")} />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0F1E] border border-[#1F2937] text-sm">
                <span className="text-[#6B7280]">Economy Rate: </span>
                <span className="text-[#F59E0B] font-mono font-semibold">{economy}</span>
              </div>
            </>
          )}

          {/* Step 4: Fielding */}
          {step === 4 && (
            <>
              <h2 className="text-lg font-semibold text-white">Fielding Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Catches</Label>
                  <Input type="number" min={0} {...register("catches")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Run Outs</Label>
                  <Input type="number" min={0} {...register("runOuts")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Stumpings</Label>
                  <Input type="number" min={0} {...register("stumpings")} />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <h2 className="text-lg font-semibold text-white">Review & Save</h2>
              <div className="space-y-3">
                <ReviewRow label="Match" value={`vs ${values.opponent} · ${values.format} · ${values.result}`} />
                <ReviewRow label="Date" value={values.date} />
                {values.venue && <ReviewRow label="Venue" value={values.venue} />}
                <div className="border-t border-[#1F2937] pt-3">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Batting</p>
                  <ReviewRow label="Runs/Balls" value={`${values.runs}(${values.balls})`} />
                  <ReviewRow label="4s/6s" value={`${values.fours}/${values.sixes}`} />
                  <ReviewRow label="Dismissal" value={values.dismissalType} />
                </div>
                <div className="border-t border-[#1F2937] pt-3">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Bowling</p>
                  <ReviewRow label="Figures" value={`${values.wickets}/${values.runsConceded} (${values.overs} ov)`} />
                  <ReviewRow label="Economy" value={economy} />
                </div>
                <div className="border-t border-[#1F2937] pt-3">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Fielding</p>
                  <ReviewRow label="C/RO/St" value={`${values.catches}/${values.runOuts}/${values.stumpings}`} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button type="button" variant="ghost" onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1} className="text-[#6B7280]">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={() => setStep(step + 1)} className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold">
              {loading ? "Saving..." : "Save Match"}
              <Trophy className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-sm font-medium text-white stat-mono">{value}</span>
    </div>
  );
}
