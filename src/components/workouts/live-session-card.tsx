"use client";

import { Card } from "@/components/ui/card";
import { RingProgress } from "@/components/ui/ring-progress";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { Entry } from "@/lib/workout-mapper";
import { Play, RotateCcw, Trash2 } from "lucide-react";

export interface LiveSessionCardProps {
  entries: Entry[];
  durationMinutes: number | "";
  startedAt: number | null;
  elapsedSeconds: number;
  onStartTimer: () => void;
  onResetTimer: () => void;
  onDiscard: () => void;
  onFinish: () => void;
  entriesError?: string;
  isSaving?: boolean;
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function LiveSessionCard({
  entries,
  durationMinutes,
  startedAt,
  elapsedSeconds,
  onStartTimer,
  onResetTimer,
  onDiscard,
  onFinish,
  entriesError,
  isSaving = false,
}: LiveSessionCardProps) {
  const plannedDuration = typeof durationMinutes === "number" && durationMinutes > 0 ? durationMinutes : 60;
  const plannedSec = plannedDuration * 60;
  const timerPct = Math.min(100, Math.round((elapsedSeconds / plannedSec) * 100));

  const allSets = entries.flatMap((e) => e.sets);
  const doneSets = allSets.filter((s) => s.done);
  const totalVolume = doneSets.reduce((acc, s) => {
    const reps = Number(s.reps) || 0;
    const weight = Number(s.weight) || 0;
    const added = Number(s.added) || 0;
    return acc + reps * (weight + added);
  }, 0);

  const rpeValues = doneSets
    .map((s) => Number(s.rpe))
    .filter((r) => r > 0 && !isNaN(r));
  const avgRpe =
    rpeValues.length > 0
      ? (rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length).toFixed(1)
      : "—";

  const setsPct = allSets.length > 0 ? Math.round((doneSets.length / allSets.length) * 100) : 0;
  const minutesLeft = Math.max(0, Math.round((plannedSec - elapsedSeconds) / 60));

  return (
    <Card as="article" className="rise p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Live session
        </h2>
        <Menu
          label="Session options"
          items={[
            {
              label: "Reset timer",
              icon: <RotateCcw size={15} />,
              onClick: onResetTimer,
            },
            {
              label: "Discard",
              icon: <Trash2 size={15} />,
              tone: "danger",
              onClick: onDiscard,
            },
          ]}
        />
      </div>

      {/* Ring Progress Timer */}
      <div className="mt-5 flex flex-col items-center">
        <RingProgress
          value={timerPct}
          size={152}
          stroke={6}
          label={`Elapsed ${mmss(elapsedSeconds)} of planned ${plannedDuration} minutes`}
        >
          <div className="text-center">
            <div className="tnum text-[28px] font-bold leading-none tracking-[-0.02em] text-ink">
              {mmss(elapsedSeconds)}
            </div>
            <div className="micro mt-1.5 text-ink-muted">
              {startedAt ? "elapsed" : "not started"}
            </div>
          </div>
        </RingProgress>

        {!startedAt ? (
          <Button
            type="button"
            variant="soft"
            size="sm"
            icon={<Play size={14} />}
            className="mt-4"
            onClick={onStartTimer}
          >
            Start timer
          </Button>
        ) : (
          <p className="mt-4 text-[12.5px] text-ink-muted">
            Planned {plannedDuration} min · {minutesLeft} min left
          </p>
        )}
      </div>

      {/* Live KPIs */}
      <dl className="mt-5 grid grid-cols-3 gap-2 rounded-panel bg-inset p-3 text-center">
        <div>
          <dt className="micro text-ink-muted">Volume</dt>
          <dd className="tnum mt-1 text-[16px] font-bold text-ink">
            {totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}k`
              : totalVolume}
            <span className="text-[10px] font-semibold text-ink-muted"> kg</span>
          </dd>
        </div>

        <div className="border-x border-dashed border-hairline">
          <dt className="micro text-ink-muted">Sets</dt>
          <dd className="tnum mt-1 text-[16px] font-bold text-ink">
            {doneSets.length}
            <span className="text-[11px] font-semibold text-ink-muted">
              /{allSets.length}
            </span>
          </dd>
        </div>

        <div>
          <dt className="micro text-ink-muted">Avg RPE</dt>
          <dd className="tnum mt-1 text-[16px] font-bold text-ink">{avgRpe}</dd>
        </div>
      </dl>

      {/* Progress Bar */}
      <div
        className="mt-4 h-[6px] overflow-hidden rounded-full bg-hairline"
        role="progressbar"
        aria-valuenow={setsPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Sets completed"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${setsPct}%` }}
        />
      </div>

      {/* Exercises List Breakdown */}
      <ul className="mt-4 space-y-2">
        {entries.length === 0 ? (
          <li className="text-[12.5px] text-ink-muted">
            Exercises you add will appear here.
          </li>
        ) : (
          entries.map((e, i) => (
            <li
              key={e.id}
              className="flex items-center gap-2.5 text-[13px]"
            >
              <span className="tnum w-5 text-ink-muted">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                {e.exercise.name}
              </span>
              <span className="tnum text-[12px] font-semibold text-ink-muted">
                {e.sets.filter((s) => s.done).length}/{e.sets.length}
              </span>
            </li>
          ))
        )}
      </ul>

      {/* Finish Workout CTA (Desktop) */}
      <div className="mt-5 hidden xl:block">
        <Button
          type="button"
          arrow
          disabled={isSaving}
          onClick={onFinish}
          className="w-full justify-between pl-6"
        >
          {isSaving ? "Saving..." : "Finish workout"}
        </Button>
        {entriesError && (
          <p
            role="alert"
            className="mt-2 text-[12px] font-medium text-danger"
          >
            {entriesError}
          </p>
        )}
      </div>
    </Card>
  );
}
