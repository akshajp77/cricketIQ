"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  Check,
} from "lucide-react";

const matchSchema = z.object({
  opponent: z.string().min(1, "Opponent is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
  format: z.string().min(1, "Format is required"),
  result: z.string().min(1, "Result is required"),
  notes: z.string().optional(),
  runs: z.coerce.number().min(0).default(0),
  balls: z.coerce.number().min(0).default(0),
  fours: z.coerce.number().min(0).default(0),
  sixes: z.coerce.number().min(0).default(0),
  dismissalType: z.string().default("Did Not Bat"),
  // empty string → undefined so optional().min() doesn't break
  position: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().min(1).max(11).optional()
  ),
  overs: z.coerce.number().min(0).default(0),
  runsConceded: z.coerce.number().min(0).default(0),
  wickets: z.coerce.number().min(0).default(0),
  maidens: z.coerce.number().min(0).default(0),
  wides: z.coerce.number().min(0).default(0),
  noBalls: z.coerce.number().min(0).default(0),
  catches: z.coerce.number().min(0).default(0),
  runOuts: z.coerce.number().min(0).default(0),
  stumpings: z.coerce.number().min(0).default(0),
});

type MatchForm = z.infer<typeof matchSchema>;

const STEPS = [
  { id: 1, title: "Match Info", desc: "Who, where, and the result", icon: FileText },
  { id: 2, title: "Batting", desc: "Your innings with the bat", icon: Activity },
  { id: 3, title: "Bowling", desc: "Your spell with the ball", icon: Target },
  { id: 4, title: "Fielding", desc: "Catches and dismissals", icon: Shield },
  { id: 5, title: "Review", desc: "Confirm and save", icon: CheckCircle },
];

const STEP_FIELDS: Record<number, (keyof MatchForm)[]> = {
  1: ["opponent", "date", "format", "result"],
  2: ["runs", "balls", "fours", "sixes", "dismissalType"],
  3: ["overs", "runsConceded", "wickets", "maidens", "wides", "noBalls"],
  4: ["catches", "runOuts", "stumpings"],
};

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[13px] text-[#B6BDC9]">
        {label}
        {required && <span className="ml-0.5 text-emerald-400">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function LiveStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#1B212C] bg-[#07090D] px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wider text-[#6B7484]">
        {label}
      </span>
      <span className="stat-mono text-sm font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

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
    trigger,
    formState: { errors },
  } = useForm<MatchForm>({
    resolver: zodResolver(matchSchema) as never,
    defaultValues: {
      opponent: "",
      date: "",
      venue: "",
      format: "",
      result: "",
      notes: "",
      runs: 0, balls: 0, fours: 0, sixes: 0,
      dismissalType: "Did Not Bat",
      overs: 0, runsConceded: 0, wickets: 0, maidens: 0, wides: 0, noBalls: 0,
      catches: 0, runOuts: 0, stumpings: 0,
    },
  });

  const watchOvers = watch("overs");
  const watchRunsConceded = watch("runsConceded");
  const economy = watchOvers > 0 ? (watchRunsConceded / watchOvers).toFixed(2) : "—";

  async function goNext() {
    const fields = STEP_FIELDS[step];
    if (fields) {
      const ok = await trigger(fields);
      if (!ok) {
        const stepErrors = fields.filter((f) => errors[f]);
        if (stepErrors.length) {
          toast.error(`Please fill in: ${stepErrors.join(", ")}`);
          return;
        }
      }
    }
    setStep(step + 1);
  }

  // handleSubmit runs the Zod resolver (type coercion + validation) and
  // passes the fully-typed, transformed data to onSubmit — unlike getValues()
  // which returns raw strings from the inputs.
  const handleSave = handleSubmit(onSubmit);

  async function onSubmit(data: MatchForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchInfo: {
            opponent: data.opponent,
            date: data.date,
            venue: data.venue,
            format: data.format,
            result: data.result,
            notes: data.notes,
          },
          batting: {
            runs: data.runs,
            balls: data.balls,
            fours: data.fours,
            sixes: data.sixes,
            dismissalType: data.dismissalType,
            position: data.position,
          },
          bowling: {
            overs: data.overs,
            runsConceded: data.runsConceded,
            wickets: data.wickets,
            maidens: data.maidens,
            wides: data.wides,
            noBalls: data.noBalls,
          },
          fielding: {
            catches: data.catches,
            runOuts: data.runOuts,
            stumpings: data.stumpings,
          },
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Match saved! CricketIQ Rating: ${json.rating?.total?.toFixed(1) ?? "—"}`);
        router.push("/matches");
      } else {
        toast.error(json.error ?? "Failed to save match");
      }
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const values = getValues();
  const currentStep = STEPS[step - 1];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-all duration-300",
                      isActive
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                        : isDone
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-[#1B212C] bg-[#0C1015] text-[#5A6372]"
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={cn(
                      "hidden text-[11px] font-medium sm:block",
                      isActive ? "text-white" : isDone ? "text-emerald-400/80" : "text-[#5A6372]"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-2 mb-5 h-px flex-1 self-end bg-[#1B212C] sm:mb-0 sm:self-center">
                    <div
                      className="h-full bg-emerald-500/60 transition-all duration-500"
                      style={{ width: step > s.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#1B212C]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="overflow-hidden rounded-2xl border border-[#1B212C] bg-[#0C1015]">
          {/* Section header */}
          <div className="flex items-center gap-3 border-b border-[#161B24] px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
              <currentStep.icon className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">{currentStep.title}</h2>
              <p className="text-xs text-[#6B7484]">{currentStep.desc}</p>
            </div>
            <span className="ml-auto font-mono text-xs text-[#5A6372]">
              {step}/{STEPS.length}
            </span>
          </div>

          <div className="space-y-4 p-6">
            {/* Step 1: Match Info */}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Opponent" required error={errors.opponent?.message} className="sm:col-span-2">
                  <Input placeholder="e.g. Dallas Lions" {...register("opponent")} />
                </Field>
                <Field label="Date" required error={errors.date?.message}>
                  <Input type="date" {...register("date")} max={new Date().toISOString().split("T")[0]} />
                </Field>
                <Field label="Format" required error={errors.format?.message}>
                  <Select
                    value={watch("format")}
                    onValueChange={(v) => setValue("format", v, { shouldValidate: true })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T20">T20</SelectItem>
                      <SelectItem value="ODI">ODI</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Result" required error={errors.result?.message}>
                  <Select
                    value={watch("result")}
                    onValueChange={(v) => setValue("result", v, { shouldValidate: true })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                      <SelectItem value="Draw">Draw</SelectItem>
                      <SelectItem value="No Result">No Result</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Venue">
                  <Input placeholder="Stadium name" {...register("venue")} />
                </Field>
                <Field label="Notes (optional)" className="sm:col-span-2">
                  <Textarea placeholder="Any notes about the match..." rows={2} {...register("notes")} />
                </Field>
              </div>
            )}

            {/* Step 2: Batting */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Runs">
                    <Input type="number" min={0} {...register("runs")} />
                  </Field>
                  <Field label="Balls Faced">
                    <Input type="number" min={0} {...register("balls")} />
                  </Field>
                  <Field label="Fours (4s)">
                    <Input type="number" min={0} {...register("fours")} />
                  </Field>
                  <Field label="Sixes (6s)">
                    <Input type="number" min={0} {...register("sixes")} />
                  </Field>
                  <Field label="Dismissal">
                    <Select
                      value={watch("dismissalType")}
                      onValueChange={(v) => setValue("dismissalType", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Bowled", "LBW", "Caught", "Run Out", "Stumped", "Not Out", "Did Not Bat", "Hit Wicket", "Handled Ball"].map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Batting Position">
                    <Input type="number" min={1} max={11} placeholder="1–11" {...register("position")} />
                  </Field>
                </div>
                {watch("balls") > 0 && (
                  <LiveStat
                    label="Strike Rate"
                    value={((watch("runs") / watch("balls")) * 100).toFixed(1)}
                    accent="#10B981"
                  />
                )}
              </>
            )}

            {/* Step 3: Bowling */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Overs Bowled">
                    <Input type="number" min={0} step={0.1} {...register("overs")} />
                  </Field>
                  <Field label="Runs Conceded">
                    <Input type="number" min={0} {...register("runsConceded")} />
                  </Field>
                  <Field label="Wickets">
                    <Input type="number" min={0} max={10} {...register("wickets")} />
                  </Field>
                  <Field label="Maidens">
                    <Input type="number" min={0} {...register("maidens")} />
                  </Field>
                  <Field label="Wides">
                    <Input type="number" min={0} {...register("wides")} />
                  </Field>
                  <Field label="No Balls">
                    <Input type="number" min={0} {...register("noBalls")} />
                  </Field>
                </div>
                <LiveStat label="Economy Rate" value={economy} accent="#F59E0B" />
              </>
            )}

            {/* Step 4: Fielding */}
            {step === 4 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Catches">
                  <Input type="number" min={0} {...register("catches")} />
                </Field>
                <Field label="Run Outs">
                  <Input type="number" min={0} {...register("runOuts")} />
                </Field>
                <Field label="Stumpings">
                  <Input type="number" min={0} {...register("stumpings")} />
                </Field>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1B212C] bg-[#07090D] p-4">
                  <ReviewRow label="Match" value={`vs ${values.opponent} · ${values.format} · ${values.result}`} />
                  <ReviewRow label="Date" value={values.date} />
                  {values.venue && <ReviewRow label="Venue" value={values.venue} />}
                </div>
                <ReviewSection title="Batting" accent="#10B981">
                  <ReviewRow label="Runs / Balls" value={`${values.runs} (${values.balls})`} />
                  <ReviewRow label="4s / 6s" value={`${values.fours} / ${values.sixes}`} />
                  <ReviewRow label="Dismissal" value={values.dismissalType} />
                </ReviewSection>
                <ReviewSection title="Bowling" accent="#F59E0B">
                  <ReviewRow label="Figures" value={`${values.wickets}/${values.runsConceded} (${values.overs} ov)`} />
                  <ReviewRow label="Economy" value={economy} />
                </ReviewSection>
                <ReviewSection title="Fielding" accent="#38BDF8">
                  <ReviewRow label="Ct / RO / St" value={`${values.catches} / ${values.runOuts} / ${values.stumpings}`} />
                </ReviewSection>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="text-[#8A93A3] hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          {step < 5 ? (
            <Button
              type="button"
              onClick={goNext}
              className="bg-emerald-500 px-6 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-emerald-500 px-6 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Saving...
                </>
              ) : (
                <>
                  Save Match
                  <Trophy className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#1B212C] bg-[#07090D] p-4">
      <p
        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: accent }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-[#8A93A3]">{label}</span>
      <span className="stat-mono text-sm font-medium tabular-nums text-white">{value}</span>
    </div>
  );
}
