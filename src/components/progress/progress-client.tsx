"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Calendar,
  Trophy,
  Flame,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { SectionHeading } from "@/components/ui/section-header";
import { PageHeader } from "@/components/layout/page-header";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { LineChart } from "@/components/charts/line-chart";
import { Bars } from "@/components/charts/bar-chart";
import { Donut } from "@/components/charts/donut";
import { CalendarHeatmap } from "@/components/charts/calendar-heatmap";
import {
  type ProgressRange,
  getRangeCutoffDate,
  buildHeatmapDays,
  deriveMuscleDistribution,
  deriveExerciseProgression,
  type RawWorkoutData,
  type PRDisplayItem,
} from "@/lib/progress-derived";
import { getMuscleTone, formatDisplayDate } from "@/lib/workout-derived";

export interface SerializedWeightLog {
  id: string;
  dateISO: string;
  weight: number;
}

export interface SerializedExerciseOption {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface ProgressClientProps {
  initialWeight: number | null;
  initialWeightLogs: SerializedWeightLog[];
  workouts: RawWorkoutData[];
  exercises: SerializedExerciseOption[];
  prs: PRDisplayItem[];
  stats: {
    totalWorkouts: number;
    recentWorkouts: number;
    totalVolume: number;
    totalSets: number;
  };
}

function ChartSkeleton({ h = 200 }: { h?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading chart">
      <div className="flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className={h > 190 ? "h-[210px] w-full" : "h-[170px] w-full"} />
    </div>
  );
}

function ProgressInner({
  initialWeight,
  initialWeightLogs,
  workouts,
  exercises,
  prs,
}: ProgressClientProps) {
  const toast = useToast();
  const selectId = useId();

  const [range, setRange] = useState<ProgressRange>("3M");
  const [isChangingRange, setIsChangingRange] = useState(false);
  const [goal, setGoal] = useState<number>(76);
  const [logOpen, setLogOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<string>(
    initialWeight ? String(initialWeight) : "74.5"
  );
  const [wDate, setWDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [wErr, setWErr] = useState<string>("");
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);

  const [weightLogs, setWeightLogs] = useState<SerializedWeightLog[]>(initialWeightLogs);
  const [selectedExId, setSelectedExId] = useState<string>(
    exercises[0]?.id || ""
  );

  // Time cutoff for range
  const cutoff = useMemo(() => getRangeCutoffDate(range), [range]);

  // Filtered weight series
  const filteredWeight = useMemo(() => {
    const list = weightLogs.filter((w) => new Date(w.dateISO) >= cutoff);
    if (list.length === 0 && initialWeight) {
      return [
        {
          label: formatDisplayDate(new Date(), { month: "short", day: "numeric" }),
          value: initialWeight,
        },
      ];
    }
    return list.map((l) => ({
      label: formatDisplayDate(l.dateISO, { month: "short", day: "numeric" }),
      value: l.weight,
    }));
  }, [weightLogs, cutoff, initialWeight]);

  const currentWeight = filteredWeight.length > 0 ? filteredWeight[filteredWeight.length - 1].value : initialWeight ?? 0;
  const firstWeight = filteredWeight.length > 0 ? filteredWeight[0].value : currentWeight;
  const weightDelta = currentWeight - firstWeight;

  // Filtered workouts in range
  const workoutsInRange = useMemo(() => {
    return workouts.filter((w) => new Date(w.date) >= cutoff);
  }, [workouts, cutoff]);

  const sessionCount = workoutsInRange.length;

  // Strength progression for selected exercise
  const currentExMeta = useMemo(() => {
    return exercises.find((e) => e.id === selectedExId) || exercises[0] || null;
  }, [exercises, selectedExId]);

  const strengthData = useMemo(() => {
    if (!selectedExId) return { labels: [], vol: [], e1rm: [] };
    return deriveExerciseProgression(workouts, selectedExId, range);
  }, [workouts, selectedExId, range]);

  const bestE1rm = useMemo(() => {
    if (strengthData.e1rm.length === 0) return 0;
    return Math.max(...strengthData.e1rm);
  }, [strengthData.e1rm]);

  // PRs in last 30 days
  const prsLast30Days = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prs.filter((p) => new Date(p.dateISO) >= thirtyDaysAgo).length;
  }, [prs]);

  // Muscle distribution slices for Donut
  const muscleSlices = useMemo(() => {
    return deriveMuscleDistribution(workouts, range);
  }, [workouts, range]);

  // Calendar Heatmap days
  const heatmapDays = useMemo(() => {
    const weeks = range === "4W" ? 8 : range === "3M" ? 14 : range === "6M" ? 26 : 52;
    return buildHeatmapDays(
      workouts.map((w) => w.date),
      weeks
    );
  }, [workouts, range]);

  const heatmapActiveCount = useMemo(() => {
    return heatmapDays.filter((d) => d > 0).length;
  }, [heatmapDays]);

  const handleLogWeight = async () => {
    const val = Number(weightInput);
    if (!val || isNaN(val) || val < 30 || val > 250) {
      setWErr("Enter a weight between 30 and 250 kg.");
      return;
    }

    setWErr("");
    setIsSubmittingWeight(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: val }),
      });

      if (!res.ok) {
        throw new Error("Failed to save body weight");
      }

      const newLog: SerializedWeightLog = {
        id: `bw-${Date.now()}`,
        dateISO: new Date(wDate).toISOString(),
        weight: val,
      };

      setWeightLogs((prev) => [...prev, newLog]);
      setLogOpen(false);
      toast.show({ message: `Logged ${val} kg`, tone: "ok" });
    } catch {
      toast.show({ message: "Failed to save body weight", tone: "danger" });
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  const handleRangeChange = (v: string) => {
    setIsChangingRange(true);
    setRange(v as ProgressRange);
    window.setTimeout(() => {
      setIsChangingRange(false);
    }, 200);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trends & records"
        title="Progress"
        sub="Body weight, strength, consistency and where your sets go."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Time range"
              value={range}
              onChange={handleRangeChange}
              options={(["4W", "3M", "6M", "1Y"] as ProgressRange[]).map((r) => ({
                value: r,
                label: r,
              }))}
            />
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setLogOpen(true)}
            >
              Log weight
            </Button>
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Body weight",
            value: `${currentWeight} kg`,
            sub: `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)} kg in range`,
            tone: "pink" as const,
            icon: <Scale size={20} />,
          },
          {
            label: "Sessions",
            value: String(sessionCount),
            sub: `${range} window`,
            tone: "violet" as const,
            icon: <Calendar size={20} />,
          },
          {
            label: "Best e1RM",
            value: bestE1rm > 0 ? `${bestE1rm} kg` : "—",
            sub: currentExMeta?.name || "Exercise",
            tone: "cyan" as const,
            icon: <Trophy size={20} />,
          },
          {
            label: "New PRs",
            value: String(prsLast30Days),
            sub: "last 30 days",
            tone: "amber" as const,
            icon: <Flame size={20} />,
          },
        ].map((k) => (
          <Card key={k.label} className="rise lift flex items-center gap-3.5 p-4">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
              style={{
                background: `var(--tag-${k.tone}-bg)`,
                color: `var(--tag-${k.tone}-fg)`,
              }}
            >
              {k.icon}
            </span>
            <div className="min-w-0">
              <p className="micro truncate text-ink-muted">{k.label}</p>
              {isChangingRange ? (
                <Skeleton className="mt-1.5 h-6 w-20" />
              ) : (
                <p className="tnum mt-1 text-[20px] font-bold leading-none tracking-[-0.02em] text-ink">
                  {k.value}
                </p>
              )}
              <p className="mt-1 truncate text-[11.5px] text-ink-muted">
                {k.sub}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Body-Weight Trend */}
      <section aria-labelledby="bw-title">
        <SectionHeading
          id="bw-title"
          title="Body-weight trend"
          actions={
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-muted">
                Goal
                <input
                  type="number"
                  step={0.5}
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="tnum h-9 w-20 rounded-full border border-hairline bg-surface px-3 text-center text-[13px] font-bold text-ink focus:border-primary/50 focus:outline-none"
                  aria-label="Goal weight kg"
                />{" "}
                kg
              </label>
            </div>
          }
        />
        <Card className="p-5">
          {isChangingRange ? (
            <ChartSkeleton />
          ) : filteredWeight.length > 0 ? (
            <LineChart
              labels={filteredWeight.map((b) => b.label)}
              series={[
                {
                  name: "Weight",
                  values: filteredWeight.map((b) => b.value),
                  area: true,
                },
              ]}
              goal={goal}
              goalLabel={`Goal ${goal} kg`}
              unit=" kg"
              summary={`Body weight over ${range}: from ${firstWeight} kg to ${currentWeight} kg, goal ${goal} kg.`}
            />
          ) : (
            <div className="py-12 text-center text-[13.5px] text-ink-muted">
              No body weight logs in this period. Click &quot;Log weight&quot; to begin tracking.
            </div>
          )}
          <p className="mt-3 text-[12.5px] text-ink-muted">
            Weekly average, kg. Goal line dashed green.{" "}
            {currentWeight < goal
              ? `${(goal - currentWeight).toFixed(1)} kg to go — on track at ~0.3 kg/week.`
              : "Goal reached — consider a maintenance phase."}
          </p>
        </Card>
      </section>

      {/* Strength Progression */}
      <section aria-labelledby="st-title">
        <SectionHeading
          id="st-title"
          title="Strength progression"
          actions={
            exercises.length > 0 ? (
              <div className="relative">
                <select
                  id={selectId}
                  value={selectedExId}
                  onChange={(e) => setSelectedExId(e.target.value)}
                  aria-label="Select exercise"
                  className="h-10 appearance-none rounded-full border border-hairline bg-surface pl-4 pr-10 text-[13px] font-semibold text-ink focus:border-primary/50 focus:outline-none cursor-pointer"
                >
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                />
              </div>
            ) : null
          }
        />
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold text-ink-muted">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-full bg-primary" /> Session
              volume (kg)
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full bg-ink" /> Estimated 1RM
              (kg, right axis)
            </span>
          </div>

          {isChangingRange ? (
            <ChartSkeleton />
          ) : strengthData.labels.length > 0 ? (
            <Bars
              labels={strengthData.labels}
              values={strengthData.vol}
              unit=" kg"
              line={strengthData.e1rm}
              lineName="e1RM"
              lineUnit=" kg"
              height={210}
              summary={`${currentExMeta?.name || "Exercise"}: estimated one-rep max reached ${bestE1rm} kg over ${range}.`}
            />
          ) : (
            <div className="py-12 text-center text-[13.5px] text-ink-muted">
              No sessions found for this exercise in the selected range.
            </div>
          )}
          <p className="mt-3 text-[12.5px] text-ink-muted">
            e1RM uses Epley formula: weight × (1 + reps/30) on the heaviest set of each session.
          </p>
        </Card>
      </section>

      {/* 2-Column Grid: PRs & Muscle-Group Distribution */}
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* Personal Records */}
        <section aria-labelledby="pr-title">
          <SectionHeading
            id="pr-title"
            title="Personal records"
            actions={
              <Link
                href="/workouts/history"
                className="text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                See all
              </Link>
            }
          />
          <Card className="px-5 py-2">
            {prs.length === 0 ? (
              <div className="py-8 text-center text-[13.5px] text-ink-muted">
                No personal records logged yet.
              </div>
            ) : (
              <ul>
                {prs.slice(0, 6).map((p, i) => (
                  <li
                    key={p.id || p.exercise}
                    className="flex items-center gap-3 border-t border-dashed border-hairline py-3.5 first:border-0"
                  >
                    {isChangingRange ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <>
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-tag"
                          style={{
                            background:
                              i === 0
                                ? "var(--tag-amber-bg)"
                                : "var(--primary-soft)",
                            color:
                              i === 0
                                ? "var(--tag-amber-fg)"
                                : "var(--primary)",
                          }}
                        >
                          <Trophy size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-ink">
                            {p.exercise}
                          </p>
                          <p className="text-[12px] text-ink-muted">
                            {formatDisplayDate(p.dateISO, {
                              month: "short",
                              day: "numeric",
                            })}
                            {p.e1rm ? ` · e1RM ${p.e1rm} kg` : ""}
                          </p>
                        </div>
                        <Tag tone={getMuscleTone(p.muscle)} className="hidden sm:inline-flex">
                          {p.muscle}
                        </Tag>
                        <div className="text-right">
                          <p className="tnum text-[14px] font-bold text-ink">
                            {p.value}
                          </p>
                          <p
                            className="tnum text-[11.5px] font-semibold"
                            style={{ color: "var(--tag-green-fg)" }}
                          >
                            {p.delta}
                          </p>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Muscle-Group Distribution */}
        <section aria-labelledby="mg-title">
          <SectionHeading id="mg-title" title="Muscle-group distribution" />
          <Card className="p-5">
            {isChangingRange ? (
              <div className="flex items-center gap-5">
                <Skeleton className="h-[180px] w-[180px] rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                </div>
              </div>
            ) : muscleSlices.length > 0 ? (
              <Donut
                slices={muscleSlices}
                summary={`Sets by muscle group in ${range}: ${muscleSlices
                  .map((m) => `${m.label} ${m.value}`)
                  .join(", ")}.`}
              />
            ) : (
              <div className="py-12 text-center text-[13.5px] text-ink-muted">
                No exercise sets logged in this period.
              </div>
            )}
            <p className="mt-4 text-[12.5px] text-ink-muted">
              Balanced volume across major muscle groups promotes hypertrophy and prevents postural imbalances.
            </p>
          </Card>
        </section>
      </div>

      {/* Workout Frequency Heatmap */}
      <section aria-labelledby="hm-title">
        <SectionHeading
          id="hm-title"
          title="Workout frequency"
          actions={
            <span className="tnum text-[12.5px] font-semibold text-ink-muted">
              {heatmapActiveCount} active days · {range === "4W" ? 8 : range === "3M" ? 14 : range === "6M" ? 26 : 52} weeks
            </span>
          }
        />
        <Card className="p-5">
          {isChangingRange ? (
            <Skeleton className="h-[130px] w-full" />
          ) : (
            <CalendarHeatmap
              days={heatmapDays}
              weeks={range === "4W" ? 8 : range === "3M" ? 14 : range === "6M" ? 26 : 52}
              summary={`Training days over the last ${range}. Typical pattern: 3–4 sessions per week.`}
            />
          )}
        </Card>
      </section>

      {/* Log Body Weight Modal */}
      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Log body weight"
        footer={
          <>
            <Button variant="outline" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isSubmittingWeight}
              onClick={handleLogWeight}
            >
              {isSubmittingWeight ? "Saving..." : "Save entry"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Weight"
            type="number"
            step={0.1}
            inputMode="decimal"
            suffix="kg"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            error={wErr}
            hint="Weigh in the morning, after the bathroom, before food."
          />
          <Input
            label="Date"
            type="date"
            value={wDate}
            onChange={(e) => setWDate(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export function ProgressClient(props: ProgressClientProps) {
  return (
    <ToastProvider>
      <ProgressInner {...props} />
    </ToastProvider>
  );
}
