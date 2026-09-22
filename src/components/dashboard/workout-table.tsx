import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Tag } from "@/components/ui/tag";
import type { TagTone } from "@/components/ui/tag";
import type { DashboardWorkout } from "./recent-workouts";
import { normalizeMuscleGroup } from "./workout-cover";

export interface WorkoutTableProps {
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

export function WorkoutTable({ workouts }: WorkoutTableProps) {
  if (!workouts.length) {
    return null;
  }

  return (
    <section id="workout-log" aria-labelledby="log-title" className="mt-9">
      <SectionHeader
        id="log-title"
        title="Workout Log"
        actions={
          <Link
            href="/workouts/history"
            className="text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
          >
            See all
          </Link>
        }
      />

      <Card className="px-5 py-4 sm:px-6">
        {/* Table header (desktop) */}
        <div className="micro hidden grid-cols-[1.7fr_0.9fr_0.8fr_0.6fr_auto] gap-4 px-1 pb-3 text-ink-muted md:grid">
          <span>Workout</span>
          <span>Muscle group</span>
          <span>Date</span>
          <span>Duration</span>
          <span className="w-11 text-right">Action</span>
        </div>

        <ul>
          {workouts.map((w) => {
            const muscle = normalizeMuscleGroup(w.muscle);
            const tone = MUSCLE_TONE[muscle] || "violet";
            const dateStr =
              typeof w.date === "string"
                ? w.date
                : new Date(w.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

            const formattedVol =
              w.totalVolume >= 1000
                ? `${(w.totalVolume / 1000).toFixed(1)}k kg`
                : `${Math.round(w.totalVolume)} kg`;

            return (
              <li key={w.id}>
                {/* Desktop row */}
                <div className="hidden grid-cols-[1.7fr_0.9fr_0.8fr_0.6fr_auto] items-center gap-4 border-t border-dashed border-hairline py-3.5 md:grid">
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold text-ink">
                      {w.name}
                    </p>
                    <p className="truncate text-[12px] text-ink-muted">
                      {w.topExercise || "Strength session"}
                    </p>
                  </div>
                  <div>
                    <Tag tone={tone}>{muscle}</Tag>
                  </div>
                  <p className="tnum text-[13.5px] text-ink-soft">{dateStr}</p>
                  <p className="tnum text-[13.5px] text-ink-soft">
                    {w.duration ?? 45} min
                  </p>
                  <Link
                    href={`/workouts/${w.id}`}
                    aria-label={`Open ${w.name}`}
                    className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-ink-soft transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>

                {/* Mobile stacked card */}
                <div className="border-t border-dashed border-hairline py-4 md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-semibold leading-snug text-ink">
                        {w.name}
                      </p>
                      <p className="tnum mt-1 text-[12.5px] text-ink-muted">
                        {dateStr} · {w.duration ?? 45} min
                      </p>
                    </div>
                    <Link
                      href={`/workouts/${w.id}`}
                      aria-label={`Open ${w.name}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairline text-ink-soft transition-colors hover:border-primary hover:text-primary"
                    >
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Tag tone={tone}>{muscle}</Tag>
                    <span className="tnum text-[12px] text-ink-muted">
                      {w.setsDone}/{w.setsTotal} sets · {formattedVol}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
