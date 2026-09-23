"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, type TagTone } from "@/components/ui/tag";
import { Popover } from "@/components/ui/popover";
import { RingProgress } from "@/components/ui/ring-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Segmented } from "@/components/ui/segmented";
import { Slider, Stepper, Chip } from "@/components/ui/controls";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-header";
import { PageHeader } from "@/components/layout/page-header";
import { LineChart } from "@/components/charts/line-chart";
import { ToastProvider, useToast } from "@/components/ui/toast";
import {
  calculateRecoveryScore,
  getWorkoutRecommendation,
  type Alert,
} from "@/lib/alerts";
import { formatRelativeDate, formatDisplayDate } from "@/lib/workout-derived";

export const SLEEP_QUALITIES = ["Poor", "Fair", "Good", "Excellent"] as const;
export type SleepQuality = (typeof SLEEP_QUALITIES)[number];

export const GUT_STATUSES = ["Good", "Bloated", "Uncomfortable"] as const;
export type GutStatus = (typeof GUT_STATUSES)[number];

export interface SerializedRecoveryLog {
  id: string;
  dateISO: string;
  sleepHours: number | null;
  sleepQuality: string | null;
  gutStatus: string | null;
  stressLevel: number | null;
  notes: string | null;
}

export interface RecoveryClientProps {
  initialLogs: SerializedRecoveryLog[];
  todayLog: SerializedRecoveryLog | null;
}

export function getAlertMetadata(level: Alert["level"]): {
  tone: TagTone;
  color: string;
  label: string;
} {
  switch (level) {
    case "optimal":
      return { tone: "green", color: "var(--tag-green-fg)", label: "Optimal" };
    case "normal":
      return { tone: "violet", color: "var(--primary)", label: "Normal" };
    case "warning":
      return { tone: "amber", color: "var(--tag-amber-fg)", label: "Warning" };
    case "critical":
      return { tone: "danger", color: "var(--danger)", label: "Critical" };
  }
}

function RecoveryInner({ initialLogs, todayLog }: RecoveryClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [logs, setLogs] = useState<SerializedRecoveryLog[]>(initialLogs);
  const [sleepHours, setSleepHours] = useState<number>(todayLog?.sleepHours ?? 7.5);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(
    (todayLog?.sleepQuality as SleepQuality) ?? "Good"
  );
  const [stressLevel, setStressLevel] = useState<number>(todayLog?.stressLevel ?? 4);
  const [gutStatus, setGutStatus] = useState<GutStatus>(
    (todayLog?.gutStatus as GutStatus) ?? "Good"
  );
  const [notes, setNotes] = useState<string>(todayLog?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Compute live recovery score and alert from alerts.ts
  const currentRecoveryData = useMemo(
    () => ({
      sleepHours,
      sleepQuality,
      stressLevel,
      gutStatus,
    }),
    [sleepHours, sleepQuality, stressLevel, gutStatus]
  );

  const score = useMemo(
    () => calculateRecoveryScore(currentRecoveryData),
    [currentRecoveryData]
  );

  const alert = useMemo(
    () => getWorkoutRecommendation(currentRecoveryData),
    [currentRecoveryData]
  );

  const meta = useMemo(() => getAlertMetadata(alert.level), [alert.level]);

  // Factor breakdown for the gauge card
  const factors = useMemo(() => {
    const qualityScoreMap: Record<SleepQuality, number> = {
      Poor: 25,
      Fair: 50,
      Good: 75,
      Excellent: 100,
    };
    const gutScoreMap: Record<GutStatus, number> = {
      Good: 100,
      Bloated: 50,
      Uncomfortable: 20,
    };

    return [
      {
        label: "Sleep hours",
        value: `${sleepHours.toFixed(1)} h`,
        score: Math.round(Math.min(1, sleepHours / 8) * 100),
        weight: "40%",
      },
      {
        label: "Sleep quality",
        value: sleepQuality,
        score: qualityScoreMap[sleepQuality] ?? 50,
        weight: "30%",
      },
      {
        label: "Stress (inverted)",
        value: `${stressLevel}/10`,
        score: Math.max(0, (10 - stressLevel) * 10),
        weight: "20%",
      },
      {
        label: "Gut status",
        value: gutStatus,
        score: gutScoreMap[gutStatus] ?? 50,
        weight: "10%",
      },
    ];
  }, [sleepHours, sleepQuality, stressLevel, gutStatus]);

  // Chart data: chronological order (oldest to newest)
  const chartLogs = useMemo(() => {
    return [...logs].reverse();
  }, [logs]);

  const chartSummary = useMemo(() => {
    if (chartLogs.length === 0) return "No recovery data logged yet.";
    const totalSleep = chartLogs.reduce((acc, r) => acc + (r.sleepHours ?? 0), 0);
    const totalStress = chartLogs.reduce((acc, r) => acc + (r.stressLevel ?? 0), 0);
    const avgSleep = (totalSleep / chartLogs.length).toFixed(1);
    const avgStress = (totalStress / chartLogs.length).toFixed(1);
    return `Fourteen-day trend: sleep averaged ${avgSleep} hours and stress averaged ${avgStress} out of 10 across ${chartLogs.length} logs.`;
  }, [chartLogs]);

  const handleSubmit = async () => {
    // 1. Client-side input validation
    if (
      typeof sleepHours !== "number" ||
      isNaN(sleepHours) ||
      sleepHours < 0 ||
      sleepHours > 24
    ) {
      toast.show({
        message: "Sleep hours must be between 0 and 24",
        tone: "danger",
      });
      return;
    }

    if (
      !Number.isInteger(stressLevel) ||
      stressLevel < 1 ||
      stressLevel > 10
    ) {
      toast.show({
        message: "Stress level must be an integer between 1 and 10",
        tone: "danger",
      });
      return;
    }

    if (!SLEEP_QUALITIES.includes(sleepQuality)) {
      toast.show({
        message: "Please select a valid sleep quality option",
        tone: "danger",
      });
      return;
    }

    if (!GUT_STATUSES.includes(gutStatus)) {
      toast.show({
        message: "Please select a valid gut status option",
        tone: "danger",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours,
          sleepQuality,
          gutStatus,
          stressLevel,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save recovery log");
      }

      const savedData = await res.json();

      // Update logs in place
      const updatedLog: SerializedRecoveryLog = {
        id: savedData.id,
        dateISO: savedData.date,
        sleepHours: savedData.sleepHours,
        sleepQuality: savedData.sleepQuality,
        gutStatus: savedData.gutStatus,
        stressLevel: savedData.stressLevel,
        notes: savedData.notes,
      };

      setLogs((prev) => {
        const todayKey = new Date(savedData.date).toISOString().split("T")[0];
        const existingIdx = prev.findIndex(
          (l) => new Date(l.dateISO).toISOString().split("T")[0] === todayKey
        );
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = updatedLog;
          return next;
        }
        return [updatedLog, ...prev].slice(0, 14);
      });

      toast.show({
        message: `Recovery logged for today · Score ${score}`,
        tone: "ok",
      });

      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save recovery log";
      toast.show({ message: msg, tone: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daily readiness"
        title="Recovery"
        sub="Log how you slept and feel — the score decides today's intensity."
        actions={
          <Popover
            align="right"
            trigger={({ onClick, "aria-expanded": expanded, "aria-haspopup": popup }) => (
              <Button
                variant="outline"
                icon={<Info size={15} />}
                onClick={onClick}
                aria-expanded={expanded}
                aria-haspopup={popup}
              >
                How this is calculated
              </Button>
            )}
          >
            <div className="w-72 p-4">
              <p className="text-[14px] font-semibold text-ink">
                Recovery score weights
              </p>
              <ul className="mt-3 space-y-3">
                {[
                  {
                    label: "Sleep hours",
                    weight: 40,
                    detail: "hours ÷ 8, capped at 100%",
                  },
                  {
                    label: "Sleep quality",
                    weight: 30,
                    detail: "Poor 25 · Fair 50 · Good 75 · Excellent 100",
                  },
                  {
                    label: "Stress",
                    weight: 20,
                    detail: "inverted: (10 − stress) × 10",
                  },
                  {
                    label: "Gut status",
                    weight: 10,
                    detail: "Good 100 · Bloated 50 · Uncomfortable 20",
                  },
                ].map((item) => (
                  <li key={item.label}>
                    <div className="flex justify-between text-[12.5px]">
                      <span className="font-semibold text-ink-soft">
                        {item.label}
                      </span>
                      <span className="tnum font-bold text-ink">
                        {item.weight}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-hairline">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${item.weight}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-hairline pt-2.5 text-[11.5px] text-ink-muted">
                ≥80 optimal · 60–79 normal · 40–59 warning · &lt;40 critical
              </p>
            </div>
          </Popover>
        }
      />

      {/* Main 2-Column Grid: Live Gauge & Today's Log Form */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* Left Column: Gauge Card */}
        <Card className="rise flex flex-col items-center p-6 text-center xl:sticky xl:top-6 xl:self-start">
          <RingProgress
            value={score}
            size={228}
            stroke={12}
            color={meta.color}
            label={`Recovery score ${score} of 100, ${meta.label}`}
          >
            <div>
              <div
                className="tnum text-[56px] font-bold leading-none tracking-[-0.03em]"
                style={{ color: meta.color }}
              >
                {score}
              </div>
              <div className="micro mt-2 text-ink-muted">out of 100</div>
            </div>
          </RingProgress>

          <Tag tone={meta.tone} icon={<Zap size={13} strokeWidth={2.5} />} className="mt-5">
            {meta.label} — {alert.suggestedIntensity}
          </Tag>

          <p className="mt-3 max-w-[24rem] text-[14px] leading-relaxed text-ink-soft">
            {alert.message}
          </p>

          <div className="mt-5 w-full rounded-panel bg-inset p-4 text-left">
            <p className="micro text-ink-muted">Suggested intensity</p>
            <p className="mt-1 text-[14.5px] font-semibold text-ink capitalize">
              {alert.suggestedIntensity} intensity
            </p>
          </div>

          {/* Factor Breakdown Bars */}
          <ul className="mt-4 w-full space-y-3 text-left">
            {factors.map((f) => (
              <li key={f.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-ink-soft">
                    {f.label}{" "}
                    <span className="micro ml-1 text-ink-muted">{f.weight}</span>
                  </span>
                  <span className="tnum text-[12.5px] font-semibold text-ink">
                    {f.value}
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar
                    value={f.score}
                    label={`${f.label} score ${f.score} of 100`}
                    color={
                      f.score >= 80
                        ? "var(--tag-green-fg)"
                        : f.score >= 60
                        ? "var(--primary)"
                        : f.score >= 40
                        ? "var(--tag-amber-fg)"
                        : "var(--danger)"
                    }
                  />
                </div>
              </li>
            ))}
          </ul>

          <Button
            className="mt-6 w-full"
            variant="primary"
            disabled={isSaving}
            icon={<ArrowRight size={16} />}
            onClick={handleSubmit}
          >
            {isSaving ? "Saving..." : "Save today's log"}
          </Button>
        </Card>

        {/* Right Column: Form & Sleep-vs-Stress Trend */}
        <div className="space-y-6">
          <Card className="rise p-5 sm:p-6">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
              Today&apos;s log
            </h2>

            <div className="mt-5 space-y-6">
              {/* Sleep Hours Slider + Stepper */}
              <div>
                <Slider
                  label="Sleep hours"
                  min={3}
                  max={11}
                  step={0.1}
                  value={sleepHours}
                  onChange={setSleepHours}
                  format={(v) => `${v.toFixed(1)} h`}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[12px] text-ink-muted">Target 8.0 h</span>
                  <Stepper
                    label="Sleep hours"
                    min={3}
                    max={11}
                    step={0.25}
                    value={sleepHours}
                    onChange={setSleepHours}
                    format={(v) => `${v.toFixed(2).replace(/\.?0+$/, "")} h`}
                  />
                </div>
              </div>

              {/* Sleep Quality */}
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-soft">
                  Sleep quality
                </p>
                <Segmented
                  label="Sleep quality"
                  value={sleepQuality}
                  onChange={(v) => setSleepQuality(v as SleepQuality)}
                  options={SLEEP_QUALITIES.map((q) => ({
                    value: q,
                    label: q,
                  }))}
                />
              </div>

              {/* Stress Level */}
              <div>
                <Slider
                  label="Stress level"
                  min={1}
                  max={10}
                  step={1}
                  value={stressLevel}
                  onChange={setStressLevel}
                  format={(v) => `${v} / 10`}
                />

                {/* Touch-Friendly Visual Stress Indicator */}
                <div
                  role="radiogroup"
                  aria-label="Stress level 1 to 10"
                  className="mt-2 flex items-end justify-between gap-1"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                    const on = n <= stressLevel;
                    const t = (n - 1) / 9;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={stressLevel === n}
                        aria-label={`Stress ${n} out of 10`}
                        onClick={() => setStressLevel(n)}
                        className="grid h-11 flex-1 cursor-pointer place-items-end rounded-lg pb-1 hover:bg-canvas transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                      >
                        <span
                          className="block rounded-full transition-all duration-200"
                          style={{
                            width: 10 + t * 8,
                            height: 10 + t * 8,
                            background: on
                              ? `color-mix(in oklab, var(--tag-green-fg) ${Math.round(
                                  (1 - t) * 100
                                )}%, var(--danger))`
                              : "var(--hairline)",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1 flex justify-between text-[11px] font-semibold text-ink-muted">
                  <span>Calm (1)</span>
                  <span>Overloaded (10)</span>
                </div>
              </div>

              {/* Gut Status Chips */}
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-soft">
                  Gut status
                </p>
                <div className="flex flex-wrap gap-2">
                  {GUT_STATUSES.map((g) => (
                    <Chip
                      key={g}
                      selected={gutStatus === g}
                      tone={
                        g === "Good"
                          ? "green"
                          : g === "Bloated"
                          ? "amber"
                          : "pink"
                      }
                      onClick={() => setGutStatus(g)}
                    >
                      {g}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Notes Textarea */}
              <Textarea
                label="Notes"
                placeholder="Late dinner, woke twice, felt groggy until coffee…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* Sleep vs. Stress Trend Chart */}
          <section aria-labelledby="trend-title">
            <SectionHeading
              id="trend-title"
              title="Sleep vs. stress · 14 days"
            />
            <Card className="p-5">
              <div className="mb-3 flex flex-wrap gap-5 text-[12.5px] font-semibold text-ink-muted">
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-5 bg-primary" /> Sleep (h)
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-5 border-t-2 border-dashed"
                    style={{ borderColor: "var(--danger)" }}
                  />{" "}
                  Stress (/10)
                </span>
              </div>

              {chartLogs.length > 0 ? (
                <LineChart
                  height={190}
                  labels={chartLogs.map((r) =>
                    formatDisplayDate(r.dateISO, {
                      day: "numeric",
                      month: "short",
                    })
                  )}
                  series={[
                    {
                      name: "Sleep",
                      values: chartLogs.map((r) => r.sleepHours ?? 0),
                      color: "var(--primary)",
                      area: true,
                    },
                    {
                      name: "Stress",
                      values: chartLogs.map((r) => r.stressLevel ?? 0),
                      color: "var(--danger)",
                      dashed: true,
                    },
                  ]}
                  yMin={0}
                  summary={chartSummary}
                />
              ) : (
                <div className="py-8 text-center text-[13.5px] text-ink-muted">
                  Log your daily sleep and stress to visualize trends here.
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>

      {/* 14-Day History Section */}
      <section className="mt-8" aria-labelledby="hist-title">
        <SectionHeading id="hist-title" title="14-day history" />

        {logs.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={24} />}
            title="No recovery logs yet"
            body="Log how you sleep and feel each day to receive recovery insights, readiness scores, and training intensity recommendations."
          />
        ) : (
          <Card className="px-5 py-2">
            <div className="micro hidden grid-cols-[120px_1fr_90px_90px_120px_90px] gap-4 px-1 py-3 text-ink-muted md:grid">
              <span>Date</span>
              <span>Score</span>
              <span>Sleep</span>
              <span>Stress</span>
              <span>Gut</span>
              <span className="text-right">Level</span>
            </div>

            <ul>
              {logs.map((r) => {
                const logScore = calculateRecoveryScore(r);
                const logRec = getWorkoutRecommendation(r);
                const logMeta = getAlertMetadata(logRec.level);

                return (
                  <li
                    key={r.id || r.dateISO}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-dashed border-hairline py-3.5 first:border-0 md:grid-cols-[120px_1fr_90px_90px_120px_90px]"
                  >
                    {/* Date */}
                    <span className="text-[13.5px] font-semibold text-ink">
                      {formatRelativeDate(r.dateISO)}
                    </span>

                    {/* Progress Bar + Score */}
                    <span className="col-span-2 flex items-center gap-3 md:col-span-1">
                      <span className="flex-1">
                        <ProgressBar
                          value={logScore}
                          color={logMeta.color}
                          label={`Score ${logScore} of 100`}
                        />
                      </span>
                      <span
                        className="tnum w-7 text-right text-[13px] font-bold"
                        style={{ color: logMeta.color }}
                      >
                        {logScore}
                      </span>
                    </span>

                    {/* Sleep Hours */}
                    <span className="tnum text-[13px] text-ink-soft md:block">
                      <span className="text-ink-muted md:hidden">Sleep: </span>
                      {typeof r.sleepHours === "number" ? `${r.sleepHours} h` : "—"}
                    </span>

                    {/* Stress Level */}
                    <span className="tnum text-[13px] text-ink-soft">
                      <span className="text-ink-muted md:hidden">Stress: </span>
                      {typeof r.stressLevel === "number" ? `${r.stressLevel}/10` : "—"}
                    </span>

                    {/* Gut Status */}
                    <span
                      className="text-[13px] text-ink-soft"
                      style={
                        r.gutStatus && r.gutStatus !== "Good"
                          ? { color: "var(--tag-amber-fg)" }
                          : undefined
                      }
                    >
                      {r.gutStatus || "—"}
                    </span>

                    {/* Band Level Tag */}
                    <span className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto">
                      <Tag tone={logMeta.tone}>{logMeta.label}</Tag>
                    </span>
                  </li>
                );
              })}
            </ul>

            {logs.length < 14 && (
              <p className="border-t border-hairline py-3 text-center text-[12px] text-ink-muted">
                Showing {logs.length} of 14 days logged. Keep logging daily to fill your 14-day history.
              </p>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}

export function RecoveryClient(props: RecoveryClientProps) {
  return (
    <ToastProvider>
      <RecoveryInner {...props} />
    </ToastProvider>
  );
}
