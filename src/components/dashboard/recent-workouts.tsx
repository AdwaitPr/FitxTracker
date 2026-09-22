"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";
import type { TagTone } from "@/components/ui/tag";
import { WorkoutCover, normalizeMuscleGroup } from "./workout-cover";

export interface DashboardWorkout {
  id: string;
  name: string;
  date: Date | string;
  duration?: number | null;
  muscle?: string | null;
  exercisesCount: number;
  setsDone: number;
  setsTotal: number;
  topExercise: string;
  totalVolume: number;
}

export interface RecentWorkoutsProps {
  workouts: DashboardWorkout[];
}

const MUSCLE_TONE: Record<string, TagTone> = {
  Chest: "pink",
  Back: "cyan",
  Legs: "amber",
  Shoulders: "violet",
  Arms: "violet",
  Core: "green",
  Cardio: "pink",
};

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const rail = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    rail.current?.scrollBy({ left: dir * 348, behavior: "smooth" });
  };

  if (!workouts.length) {
    return null;
  }

  return (
    <section
      id="recent-workouts"
      aria-labelledby="recent-title"
      className="mt-9"
    >
      <SectionHeader
        id="recent-title"
        title="Recent Workouts"
        actions={
          <div className="flex items-center gap-2">
            <IconButton
              icon={<ChevronLeft size={18} />}
              label="Scroll to previous workouts"
              variant="outline"
              onClick={() => scroll(-1)}
            />
            <IconButton
              icon={<ChevronRight size={18} />}
              label="Scroll to next workouts"
              variant="solid"
              onClick={() => scroll(1)}
            />
          </div>
        }
      />

      <div
        ref={rail}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 pt-1"
      >
        {workouts.map((w, index) => {
          const muscle = normalizeMuscleGroup(w.muscle);
          const tone = MUSCLE_TONE[muscle] || "violet";
          const pct =
            w.setsTotal > 0
              ? Math.min(100, Math.round((w.setsDone / w.setsTotal) * 100))
              : 0;

          const dateStr =
            typeof w.date === "string"
              ? w.date
              : new Date(w.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

          const formattedVol =
            w.totalVolume >= 1000
              ? `${(w.totalVolume / 1000).toFixed(1)}k kg`
              : `${Math.round(w.totalVolume)} kg`;

          return (
            <article
              key={w.id}
              className="rise lift flex w-[288px] shrink-0 snap-start flex-col rounded-card bg-surface p-3.5 shadow-soft border border-hairline sm:w-[326px]"
              style={{ animationDelay: `${160 + index * 60}ms` }}
            >
              <div className="relative h-[150px] overflow-hidden rounded-[20px]">
                <WorkoutCover muscle={muscle} />
                <span className="absolute bottom-3 left-3">
                  <Tag tone={tone}>{muscle}</Tag>
                </span>
              </div>

              <Link
                href={`/workouts/${w.id}`}
                className="mt-4 min-h-[2.6rem] text-[16.5px] font-semibold leading-snug tracking-[-0.01em] text-ink hover:text-primary transition-colors duration-200 line-clamp-2"
              >
                {w.name}
              </Link>

              <p className="tnum mt-1.5 text-[12.5px] text-ink-muted">
                {dateStr} · {w.duration ?? 45} min · {w.exercisesCount} exercises
              </p>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="micro text-ink-muted">Sets completed</span>
                  <span className="tnum text-[12px] font-semibold text-ink-soft">
                    {w.setsDone}/{w.setsTotal}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${w.name}: ${pct}% of sets completed`}
                  className="mt-2 h-[6px] overflow-hidden rounded-full bg-hairline"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${pct}%`,
                      transition: "width 700ms cubic-bezier(.2,.8,.2,1)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-dashed border-hairline pt-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-canvas text-ink-muted">
                  <Dumbbell size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink">
                    {w.topExercise || "Workout"}
                  </span>
                  <span className="micro block text-ink-muted">Top lift</span>
                </span>
                <span className="tnum shrink-0 text-right text-[12.5px] font-bold text-ink">
                  {formattedVol}
                  <span className="micro block font-semibold text-ink-muted">
                    Volume
                  </span>
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
