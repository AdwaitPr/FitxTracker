"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Menu } from "@/components/ui/menu";
import { Tag, type TagTone } from "@/components/ui/tag";
import { SectionHeading } from "@/components/ui/section-header";
import { Disclosure } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { MuscleGlyph, type MuscleGlyphName } from "@/components/ui/muscle-glyph";
import {
  formatVolume,
  formatRelativeDate,
  formatDisplayDate,
  getMuscleTone,
} from "@/lib/workout-derived";

export interface DetailWorkoutSet {
  id: string;
  order: number;
  reps: number;
  weight: number;
  restTime?: number | null;
  completed: boolean;
  variationType?: string | null;
  tempo?: string | null;
  addedWeight?: number | null;
  perceivedDifficulty?: number | null;
}

export interface DetailWorkoutExercise {
  id: string;
  order: number;
  notes?: string | null;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment?: string | null;
  };
  sets: DetailWorkoutSet[];
}

export interface DetailWorkoutData {
  id: string;
  name: string;
  dateISO: string;
  duration?: number | null;
  notes?: string | null;
  createdAtISO: string;
  muscle: MuscleGlyphName;
  muscleTone: TagTone;
  volume: number;
  topSet: string;
  avgRpe?: number | null;
  exercises: DetailWorkoutExercise[];
}

export interface WorkoutDetailClientProps {
  workout: DetailWorkoutData;
  prevWorkoutId?: string | null;
  nextWorkoutId?: string | null;
  recoveryThatDay?: { score: number; label: string } | null;
  bodyWeight?: number | null;
}

function WorkoutDetailInner({
  workout,
  prevWorkoutId,
  nextWorkoutId,
  recoveryThatDay,
  bodyWeight,
}: WorkoutDetailClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [delModalOpen, setDelModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const totalCompletedSets = useMemo(() => {
    return workout.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
  }, [workout.exercises]);

  const totalAllSets = useMemo(() => {
    return workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  }, [workout.exercises]);

  const totalReps = useMemo(() => {
    return workout.exercises.reduce(
      (acc, ex) =>
        acc +
        ex.sets.reduce((sAcc, s) => sAcc + (typeof s.reps === "number" ? s.reps : 0), 0),
      0
    );
  }, [workout.exercises]);

  const kpis = useMemo(() => {
    const list = [
      {
        label: "Volume",
        val: workout.volume ? `${(workout.volume / 1000).toFixed(1)}k` : "BW",
        unit: workout.volume ? "kg" : "",
      },
      {
        label: "Sets",
        val: `${totalCompletedSets}`,
        unit: `/${totalAllSets}`,
      },
    ];

    if (workout.avgRpe !== null && workout.avgRpe !== undefined) {
      list.push({
        label: "Avg RPE",
        val: workout.avgRpe.toFixed(1),
        unit: "/10",
      });
    } else {
      list.push({
        label: "Total Reps",
        val: `${totalReps}`,
        unit: "reps",
      });
    }

    return list;
  }, [workout.volume, workout.avgRpe, totalCompletedSets, totalAllSets, totalReps]);

  const sessionFacts = useMemo(() => {
    const facts: Array<[string, string]> = [];

    if (workout.duration && workout.duration > 0) {
      const start = new Date(workout.dateISO);
      const fin = new Date(start.getTime() + workout.duration * 60 * 1000);

      facts.push([
        "Started",
        start.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      ]);
      facts.push([
        "Finished",
        fin.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      ]);
    }

    if (recoveryThatDay) {
      facts.push([
        "Recovery that day",
        `${recoveryThatDay.score} · ${recoveryThatDay.label}`,
      ]);
    }

    if (bodyWeight) {
      facts.push(["Body weight", `${bodyWeight} kg`]);
    }

    return facts;
  }, [workout, recoveryThatDay, bodyWeight]);

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== "delete" || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete workout");
      }

      setDelModalOpen(false);
      toast.show({ message: "Workout deleted", tone: "danger" });
      setTimeout(() => {
        router.push("/workouts/history");
        router.refresh();
      }, 700);
    } catch {
      toast.show({
        message: "Failed to delete workout. Please try again.",
        tone: "danger",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation and Actions */}
      <div className="rise flex items-center justify-between gap-3">
        <Link
          href="/workouts/history"
          className="inline-flex h-10 items-center gap-2 rounded-full pl-2 pr-4 text-[13.5px] font-semibold text-ink-soft hover:bg-surface hover:text-primary transition-colors duration-150"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-hairline">
            <ArrowLeft size={16} />
          </span>{" "}
          History
        </Link>
        <div className="flex items-center gap-2">
          {prevWorkoutId && (
            <IconButton
              icon={<ChevronLeft size={16} />}
              label="Older workout"
              onClick={() => router.push(`/workouts/${prevWorkoutId}`)}
            />
          )}
          {nextWorkoutId && (
            <IconButton
              icon={<ChevronRight size={16} />}
              label="Newer workout"
              onClick={() => router.push(`/workouts/${nextWorkoutId}`)}
            />
          )}
          <Menu
            label="Workout options"
            items={[
              {
                label: "Repeat workout",
                icon: <Copy size={16} />,
                onClick: () => router.push(`/workouts/new?from=${workout.id}`),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                tone: "danger",
                onClick: () => {
                  setConfirmText("");
                  setDelModalOpen(true);
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="rise relative overflow-hidden p-6 sm:p-8">
        <span
          className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-[48px] opacity-60"
          style={{ background: `var(--tag-${workout.muscleTone}-bg)` }}
        />
        <span
          className="pointer-events-none absolute right-8 top-8 hidden h-32 w-32 sm:block"
          style={{
            color: `var(--tag-${workout.muscleTone}-fg)`,
            opacity: 0.35,
          }}
        >
          <MuscleGlyph name={workout.muscle} size={128} />
        </span>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone={workout.muscleTone}>{workout.muscle}</Tag>
            <span className="micro text-ink-muted">
              {formatDisplayDate(workout.dateISO, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="mt-3 max-w-[22ch] text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[36px]">
            {workout.name}
          </h1>

          <p className="tnum mt-2 text-[14px] text-ink-muted">
            {formatRelativeDate(workout.dateISO)} · {workout.duration || 0} min ·{" "}
            {workout.exercises.length} exercise
            {workout.exercises.length === 1 ? "" : "s"}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-panel bg-inset px-3 py-3">
                <p className="micro text-ink-muted">{k.label}</p>
                <p className="tnum mt-1 text-[20px] font-bold leading-none text-ink">
                  {k.val}
                  <span className="text-[11px] font-semibold text-ink-muted">
                    {" "}
                    {k.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              icon={<Copy size={16} />}
              onClick={() => router.push(`/workouts/new?from=${workout.id}`)}
            >
              Repeat workout
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content: Left Column Exercises, Right Column Details */}
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
        {/* Left Column: Exercises */}
        <section aria-labelledby="ex-title">
          <SectionHeading id="ex-title" title="Exercises">
            <span className="tnum text-[12.5px] font-semibold text-ink-muted">
              {workout.topSet}
            </span>
          </SectionHeading>

          <Card className="px-4 py-2 sm:px-5">
            {workout.exercises.map(({ exercise, sets, notes }, i) => {
              const tone = getMuscleTone(exercise.muscleGroup);
              const doneCount = sets.filter((s) => s.completed).length;
              const exVol = sets
                .filter((s) => s.completed)
                .reduce((acc, s) => acc + s.reps * s.weight, 0);

              let bestWeight = 0;
              let bestReps = 0;
              for (const s of sets) {
                if (
                  s.weight > bestWeight ||
                  (s.weight === bestWeight && s.reps > bestReps)
                ) {
                  bestWeight = s.weight;
                  bestReps = s.reps;
                }
              }

              return (
                <Disclosure
                  key={exercise.id}
                  defaultOpen={i === 0}
                  className="border-t border-dashed border-hairline py-1.5 first:border-0"
                  title={
                    <span className="flex items-center gap-3">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-tag"
                        style={{
                          background: `var(--tag-${tone}-bg)`,
                          color: `var(--tag-${tone}-fg)`,
                        }}
                      >
                        <MuscleGlyph name={exercise.muscleGroup as MuscleGlyphName} size={24} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14.5px] font-semibold text-ink">
                          {exercise.name}
                        </span>
                        <span className="tnum block text-[12px] text-ink-muted">
                          {doneCount}/{sets.length} sets ·{" "}
                          {formatVolume(exVol)} · best {bestWeight} kg × {bestReps}
                        </span>
                      </span>
                    </span>
                  }
                  meta={
                    <Tag tone={tone} className="hidden sm:inline-flex">
                      {exercise.muscleGroup}
                    </Tag>
                  }
                >
                  <div className="mb-3 overflow-hidden rounded-panel bg-inset">
                    <table className="w-full text-left text-[13.5px]">
                      <thead>
                        <tr className="micro text-ink-muted">
                          <th className="px-4 py-2.5 font-semibold">Set</th>
                          <th className="px-2 py-2.5 font-semibold">Reps × kg</th>
                          <th className="px-2 py-2.5 font-semibold">RPE</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Done</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sets.map((s, si) => (
                          <tr
                            key={s.id || si}
                            className={`border-t border-dashed border-hairline ${
                              !s.completed ? "opacity-60" : ""
                            }`}
                          >
                            <td className="tnum px-4 py-2.5 font-bold text-ink-muted">
                              {si + 1}
                            </td>
                            <td className="tnum px-2 py-2.5 font-semibold text-ink">
                              {s.reps} × {s.weight ? `${s.weight} kg` : "BW"}
                              {s.addedWeight ? ` (+${s.addedWeight} kg)` : ""}
                              {s.variationType && s.variationType !== "Standard" && (
                                <span className="ml-1.5 rounded bg-canvas px-1.5 py-0.5 text-[11px] font-normal text-ink-muted">
                                  {s.variationType}
                                </span>
                              )}
                              {s.tempo && (
                                <span className="ml-1.5 font-mono text-[11px] text-ink-muted">
                                  {s.tempo}
                                </span>
                              )}
                            </td>
                            <td className="tnum px-2 py-2.5 text-ink-soft">
                              {s.perceivedDifficulty ?? "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <span
                                className={`inline-grid h-6 w-6 place-items-center rounded-full ${
                                  s.completed
                                    ? "text-white"
                                    : "border border-hairline text-transparent"
                                }`}
                                style={
                                  s.completed
                                    ? { background: "var(--tag-green-fg)" }
                                    : undefined
                                }
                              >
                                <Check size={13} strokeWidth={2.4} />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {notes && (
                    <p className="mb-2 text-[13px] italic text-ink-muted">
                      {notes}
                    </p>
                  )}
                </Disclosure>
              );
            })}
          </Card>
        </section>

        {/* Right Column: Notes & Session Facts & Danger Zone */}
        <aside aria-label="Notes and actions" className="space-y-5">
          {workout.notes && (
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                Notes
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                {workout.notes}
              </p>
            </Card>
          )}

          {sessionFacts.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                Session facts
              </h2>
              <dl className="mt-3 space-y-2.5 text-[13px]">
                {sessionFacts.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-dashed border-hairline pb-2.5 last:border-0"
                  >
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="tnum font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          <Card className="border border-dashed border-hairline p-5">
            <h2
              className="text-[15px] font-semibold tracking-[-0.01em]"
              style={{ color: "var(--danger)" }}
            >
              Danger zone
            </h2>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">
              Deleting removes the session and its sets from every chart and
              record. This cannot be undone.
            </p>
            <Button
              variant="dangerSoft"
              icon={<Trash2 size={16} />}
              className="mt-4 w-full"
              onClick={() => {
                setConfirmText("");
                setDelModalOpen(true);
              }}
            >
              Delete workout
            </Button>
          </Card>
        </aside>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={delModalOpen}
        onClose={() => setDelModalOpen(false)}
        title="Delete this workout?"
        danger
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDelModalOpen(false)}
              disabled={isDeleting}
            >
              Keep it
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              disabled={confirmText.trim().toLowerCase() !== "delete" || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </Button>
          </>
        }
      >
        <div
          className="flex gap-3 rounded-panel p-4"
          style={{ background: "var(--tag-danger-bg, #FDE9E1)" }}
        >
          <span className="shrink-0 text-danger">
            <AlertTriangle size={20} />
          </span>
          <p className="text-[13.5px] text-danger">
            <strong>{workout.name}</strong> from{" "}
            {formatDisplayDate(workout.dateISO)} — {totalAllSets} sets and{" "}
            {formatVolume(workout.volume)} will be removed from your progress,
            records, and streaks.
          </p>
        </div>
        <Input
          className="mt-4"
          label="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
      </Modal>
    </div>
  );
}

export function WorkoutDetailClient(props: WorkoutDetailClientProps) {
  return (
    <ToastProvider>
      <WorkoutDetailInner {...props} />
    </ToastProvider>
  );
}
