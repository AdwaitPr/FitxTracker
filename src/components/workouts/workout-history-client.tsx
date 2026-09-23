"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, History, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/controls";
import { Tag, type TagTone } from "@/components/ui/tag";
import { SectionHeading } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MuscleGlyph, type MuscleGlyphName } from "@/components/ui/muscle-glyph";
import {
  CANONICAL_MUSCLE_GROUPS,
  MUSCLE_TONES,
  formatWeekLabel,
  formatVolume,
} from "@/lib/workout-derived";

export interface HistoryWorkoutItem {
  id: string;
  name: string;
  dateISO: string;
  duration: number;
  volume: number;
  topSet: string;
  muscle: MuscleGlyphName;
  muscleTone: TagTone;
  relativeDate: string;
  displayDate: string;
  exerciseNames: string[];
}

export interface WorkoutHistoryClientProps {
  initialWorkouts: HistoryWorkoutItem[];
  initialQuery?: string;
  initialRange?: string;
  initialMuscle?: MuscleGlyphName | null;
}

export function WorkoutHistoryClient({
  initialWorkouts,
  initialQuery = "",
  initialRange = "all",
  initialMuscle = null,
}: WorkoutHistoryClientProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [mg, setMg] = useState<MuscleGlyphName | null>(initialMuscle);
  const [range, setRange] = useState(initialRange);

  const filteredWorkouts = useMemo(() => {
    const maxDays = range === "all" ? 999999 : Number(range);
    const now = new Date();

    return initialWorkouts.filter((w) => {
      const workoutDate = new Date(w.dateISO);
      const diffDays = Math.floor(
        (now.getTime() - workoutDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (diffDays > maxDays) return false;
      if (mg && w.muscle !== mg) return false;

      if (q.trim()) {
        const query = q.trim().toLowerCase();
        const matchesName = w.name.toLowerCase().includes(query);
        const matchesTopSet = w.topSet.toLowerCase().includes(query);
        const matchesExercise = w.exerciseNames.some((ex) =>
          ex.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesTopSet && !matchesExercise) {
          return false;
        }
      }

      return true;
    });
  }, [initialWorkouts, q, mg, range]);

  const groups = useMemo(() => {
    const m = new Map<string, HistoryWorkoutItem[]>();
    for (const w of filteredWorkouts) {
      const k = formatWeekLabel(w.dateISO);
      const existing = m.get(k) ?? [];
      m.set(k, [...existing, w]);
    }
    return Array.from(m.entries());
  }, [filteredWorkouts]);

  const totals = useMemo(() => {
    const n = filteredWorkouts.length;
    const vol = filteredWorkouts.reduce((acc, w) => acc + w.volume, 0);
    const min = filteredWorkouts.reduce((acc, w) => acc + w.duration, 0);
    return { n, vol, min };
  }, [filteredWorkouts]);

  const hours = Math.floor(totals.min / 60);
  const mins = totals.min % 60;
  const subText = `${totals.n} workout${totals.n === 1 ? "" : "s"} · ${(
    totals.vol / 1000
  ).toFixed(1)}k kg lifted · ${hours} h ${mins} min under the bar`;

  const handleClearFilters = () => {
    setQ("");
    setMg(null);
    setRange("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Archive"
        title="History"
        sub={subText}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => router.push("/workouts/new")}
          >
            Log workout
          </Button>
        }
      />

      <Card className="rise p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <Input
            icon={<Search size={18} />}
            placeholder="Search workouts or top sets…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search workouts"
          />
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Date range"
          >
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Chip selected={mg === null} onClick={() => setMg(null)}>
            All groups
          </Chip>
          {CANONICAL_MUSCLE_GROUPS.map((m) => (
            <Chip
              key={m}
              selected={mg === m}
              tone={MUSCLE_TONES[m]}
              onClick={() => setMg(mg === m ? null : m)}
            >
              {m}
            </Chip>
          ))}
        </div>
      </Card>

      {groups.length === 0 ? (
        <div className="mt-6">
          {initialWorkouts.length === 0 ? (
            <EmptyState
              icon={<History className="h-8 w-8 text-ink-muted" />}
              title="No workouts yet"
              body="Start logging your training to track your volume, personal records, and consistency over time."
              action={
                <Button onClick={() => router.push("/workouts/new")}>
                  Log first workout
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<History className="h-8 w-8 text-ink-muted" />}
              title="Nothing matches"
              body="Try another search term, clear the muscle-group filter or widen the date range."
              action={
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      ) : (
        groups.map(([label, items], gi) => {
          const groupVol = items.reduce((acc, w) => acc + w.volume, 0);

          return (
            <section key={label} className="mt-8" aria-labelledby={`g-${gi}`}>
              <SectionHeading id={`g-${gi}`} title={label}>
                <span className="tnum text-[12.5px] font-semibold text-ink-muted">
                  {items.length} session{items.length > 1 ? "s" : ""} ·{" "}
                  {(groupVol / 1000).toFixed(1)}k kg
                </span>
              </SectionHeading>
              <Card className="px-4 py-1 sm:px-6">
                <div className="micro hidden grid-cols-[1.8fr_1fr_0.7fr_0.8fr_1.1fr_44px] gap-4 px-1 pb-2 pt-3 text-ink-muted lg:grid">
                  <span>Workout</span>
                  <span>Muscle group</span>
                  <span>Duration</span>
                  <span>Volume</span>
                  <span>Top set</span>
                  <span className="text-right">Open</span>
                </div>
                <ul>
                  {items.map((w) => (
                    <li
                      key={w.id}
                      className="border-t border-dashed border-hairline first:border-0 lg:first:border-t"
                    >
                      <Link
                        href={`/workouts/${w.id}`}
                        className="group grid grid-cols-[44px_1fr_44px] items-center gap-x-3 gap-y-1.5 rounded-[14px] px-1 py-3.5 transition-colors hover:bg-canvas lg:grid-cols-[1.8fr_1fr_0.7fr_0.8fr_1.1fr_44px] lg:gap-4"
                      >
                        <span
                          className="grid h-11 w-11 place-items-center rounded-tag lg:hidden"
                          style={{
                            background: `var(--tag-${w.muscleTone}-bg)`,
                            color: `var(--tag-${w.muscleTone}-fg)`,
                          }}
                        >
                          <MuscleGlyph name={w.muscle} size={28} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[14.5px] font-semibold text-ink">
                            {w.name}
                          </span>
                          <span className="tnum block text-[12px] text-ink-muted">
                            {w.relativeDate} · {w.displayDate}
                            <span className="lg:hidden">
                              {" "}
                              · {w.duration} min · {formatVolume(w.volume)}
                            </span>
                          </span>
                        </span>
                        <span className="hidden lg:block">
                          <Tag tone={w.muscleTone}>{w.muscle}</Tag>
                        </span>
                        <span className="tnum hidden text-[13.5px] text-ink-soft lg:block">
                          {w.duration} min
                        </span>
                        <span className="tnum hidden text-[13.5px] font-semibold text-ink lg:block">
                          {formatVolume(w.volume)}
                        </span>
                        <span className="hidden truncate text-[13px] text-ink-soft lg:block">
                          {w.topSet}
                        </span>
                        <span className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-ink-soft transition-colors group-hover:border-primary">
                          <ArrowRight size={17} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          );
        })
      )}
    </div>
  );
}
