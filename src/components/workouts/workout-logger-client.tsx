"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ShellRail } from "@/components/layout/shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { ToastProvider, useToast } from "@/components/ui/toast";
import {
  Entry,
  WorkoutExerciseItem,
  ApiWorkout,
  mapApiWorkoutToDraft,
  createDefaultSet,
  nextId,
} from "@/lib/workout-mapper";
import { EntryCard } from "./entry-card";
import { RestTimer } from "./rest-timer";
import { LiveSessionCard } from "./live-session-card";
import { LibraryModal } from "./library-modal";
import { StickyActionBar } from "./sticky-action-bar";
import { SavedSummaryModal } from "./saved-summary-modal";
import { Dumbbell, Plus, RotateCcw } from "lucide-react";

export interface WorkoutLoggerClientProps {
  initialExercises: WorkoutExerciseItem[];
  lastWorkout?: ApiWorkout | null;
  prefillWorkout?: ApiWorkout | null;
}

const DRAFT_STORAGE_KEY = "fitx_active_workout_draft";

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function WorkoutLoggerInner({
  initialExercises,
  lastWorkout,
  prefillWorkout,
}: WorkoutLoggerClientProps) {
  const toast = useToast();

  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>(getTodayString());
  const [duration, setDuration] = useState<number | "">(60);
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);

  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [restTimer, setRestTimer] = useState<{ total: number; key: number } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSummaryOpen, setSavedSummaryOpen] = useState<boolean>(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Summary stats for saved modal
  const [savedSnapshot, setSavedSnapshot] = useState<{
    name: string;
    date: string;
    duration: number | "";
    exercisesCount: number;
    completedSets: number;
    totalVolume: number;
    notes: string;
  } | null>(null);

  // 1. Initial Load: Prefill template or restore uncompleted draft from sessionStorage
  useEffect(() => {
    if (prefillWorkout) {
      const draft = mapApiWorkoutToDraft(prefillWorkout);
      setName(draft.name);
      setNotes(draft.notes);
      setDuration(draft.duration);
      setEntries(draft.entries);
      toast.show({ message: "Loaded workout template" });
      return;
    }

    try {
      const savedRaw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.entries && parsed.entries.length > 0) {
          setName(parsed.name || "");
          setDate(parsed.date || getTodayString());
          setDuration(parsed.duration ?? 60);
          setNotes(parsed.notes || "");
          setEntries(parsed.entries);
          if (parsed.startedAt) {
            setStartedAt(parsed.startedAt);
          }
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [prefillWorkout, toast]);

  // 2. Save active draft to sessionStorage (debounced)
  useEffect(() => {
    if (savedSummaryOpen) return; // Do not save if modal is open
    const timer = setTimeout(() => {
      try {
        if (entries.length > 0 || name.trim() !== "" || notes.trim() !== "") {
          sessionStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({
              name,
              date,
              duration,
              notes,
              entries,
              startedAt,
            })
          );
        } else {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch {
        // Ignore quota/sessionStorage errors
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [name, date, duration, notes, entries, startedAt, savedSummaryOpen]);

  // 3. Desktop beforeunload warning if draft has entries or completed sets
  const isDirtyRef = useRef(false);
  isDirtyRef.current =
    entries.length > 0 &&
    (entries.some((e) => e.sets.some((s) => s.done)) || name.trim() !== "");

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 4. Elapsed session timer interval
  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  // Derived calculations
  const stats = useMemo(() => {
    const allSets = entries.flatMap((e) => e.sets);
    const doneSets = allSets.filter((s) => s.done);
    const volume = doneSets.reduce((acc, s) => {
      const reps = Number(s.reps) || 0;
      const weight = Number(s.weight) || 0;
      const added = Number(s.added) || 0;
      return acc + reps * (weight + added);
    }, 0);

    return {
      total: allSets.length,
      done: doneSets.length,
      volume,
    };
  }, [entries]);

  // Handle set completion trigger
  const handleSetCompleted = useCallback((restSeconds: number) => {
    setStartedAt((current) => current ?? Date.now());
    if (restSeconds > 0) {
      setRestTimer({ total: restSeconds, key: Date.now() });
    }
  }, []);

  // Pick exercise from library modal
  const handlePickExercise = (ex: WorkoutExerciseItem) => {
    const newEntry: Entry = {
      id: nextId("e"),
      exercise: ex,
      sets: [createDefaultSet(), createDefaultSet(), createDefaultSet()],
      advanced: false,
    };
    setEntries((prev) => [...prev, newEntry]);
    setShowLibrary(false);
    toast.show({ message: `${ex.name} added` });
  };

  // "Use last workout" button
  const handleUseLastWorkout = () => {
    if (!lastWorkout) {
      toast.show({
        message: "No previous workouts found to copy.",
        tone: "danger",
      });
      return;
    }
    const draft = mapApiWorkoutToDraft(lastWorkout);
    setName(draft.name);
    setDuration(draft.duration);
    setNotes(draft.notes);
    setEntries(draft.entries);
    toast.show({ message: "Loaded last workout as a template" });
  };

  // Reset timer
  const handleResetTimer = () => {
    setStartedAt(null);
    setElapsed(0);
    toast.show({ message: "Session timer reset" });
  };

  // Discard draft
  const handleDiscard = () => {
    if (
      window.confirm(
        "Are you sure you want to discard this workout? All sets and progress will be lost."
      )
    ) {
      setName("");
      setNotes("");
      setDuration(60);
      setEntries([]);
      setStartedAt(null);
      setElapsed(0);
      setRestTimer(null);
      setErrors({});
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      toast.show({ message: "Workout draft discarded" });
    }
  };

  // Finish and submit workout
  const handleFinishWorkout = async () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Give the workout a name.";
    }
    if (duration === "" || Number(duration) <= 0) {
      newErrors.duration = "Duration must be greater than 0.";
    }
    if (entries.length === 0) {
      newErrors.entries = "Add at least one exercise.";
    } else if (stats.done === 0) {
      newErrors.entries = "Complete at least one set before finishing.";
    }

    const hasMissingReps = entries.some((e) =>
      e.sets.some((s) => s.done && (s.reps === "" || Number(s.reps) <= 0))
    );
    if (hasMissingReps) {
      newErrors.entries = "Some completed sets are missing reps.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError =
        newErrors.name || newErrors.duration || newErrors.entries;
      toast.show({
        message: firstError || "Fix the highlighted fields",
        tone: "danger",
      });

      if (newErrors.name) {
        document.getElementById("wk-name")?.focus();
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        notes: notes.trim() || null,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        duration: typeof duration === "number" ? duration : null,
        exercises: entries.map((entry) => ({
          exerciseId: entry.exercise.id,
          notes: null,
          sets: entry.sets.map((s) => ({
            reps: Number(s.reps) || 0,
            weight: Number(s.weight) || 0,
            restTime: Number(s.rest) || null,
            completed: s.done,
            variationType: s.variation || "Standard",
            tempo: s.tempo.trim() || null,
            addedWeight: s.added !== "" ? Number(s.added) : null,
            perceivedDifficulty: s.rpe !== "" ? Number(s.rpe) : null,
          })),
        })),
      };

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save workout");
      }

      // Snapshot for modal
      setSavedSnapshot({
        name: name.trim(),
        date,
        duration,
        exercisesCount: entries.length,
        completedSets: stats.done,
        totalVolume: stats.volume,
        notes: notes.trim(),
      });

      // Clear draft immediately from storage and reset form
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      setName("");
      setNotes("");
      setDuration(60);
      setEntries([]);
      setStartedAt(null);
      setElapsed(0);
      setRestTimer(null);
      setErrors({});

      setSavedSummaryOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save workout";
      toast.show({ message: msg, tone: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogAnother = () => {
    setSavedSummaryOpen(false);
    setName("");
    setNotes("");
    setDuration(60);
    setEntries([]);
    setStartedAt(null);
    setElapsed(0);
    setRestTimer(null);
    setErrors({});
  };

  return (
    <>
      <PageHeader
        eyebrow="Log a workout"
        title="New Workout"
        sub="Add exercises, tick sets as you go — volume, timer and RPE update live in the summary."
        actions={
          <Button
            type="button"
            variant="outline"
            icon={<RotateCcw size={15} />}
            onClick={handleUseLastWorkout}
          >
            Use last workout
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Workout Meta Card */}
        <Card className="rise p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
            <Input
              id="wk-name"
              label="Workout name"
              placeholder="e.g. Push Day — Chest & Triceps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              className="sm:col-span-2 lg:col-span-1"
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Duration"
              type="number"
              min={1}
              inputMode="numeric"
              suffix="min"
              value={duration}
              onChange={(e) =>
                setDuration(
                  e.target.value === "" ? "" : Math.max(1, Number(e.target.value))
                )
              }
              error={errors.duration}
            />
          </div>

          <Textarea
            label="Notes"
            placeholder="How did it feel? Anything to remember next time?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-4"
          />
        </Card>

        {/* Exercises Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
              Exercises
            </h2>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => setShowLibrary(true)}
            >
              Add exercise
            </Button>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              icon={<Dumbbell size={32} className="text-primary" />}
              title="No exercises yet"
              body="Pick from the library of movements or reuse your last session as a template. Sets, rest and RPE are all editable inline."
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => setShowLibrary(true)}
                  >
                    Add exercise
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    icon={<RotateCcw size={15} />}
                    onClick={handleUseLastWorkout}
                  >
                    Use last workout
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onChange={(updated) =>
                    setEntries((prev) =>
                      prev.map((e) => (e.id === updated.id ? updated : e))
                    )
                  }
                  onRemove={() =>
                    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
                  }
                  onComplete={handleSetCompleted}
                  onDuplicate={() => {
                    const cloned: Entry = {
                      ...entry,
                      id: nextId("e"),
                      sets: entry.sets.map((s) => ({
                        ...s,
                        id: nextId("s"),
                        done: false,
                        justDone: false,
                      })),
                    };
                    const next = [...entries];
                    next.splice(index + 1, 0, cloned);
                    setEntries(next);
                  }}
                />
              ))}

              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-card border border-dashed border-hairline text-[13.5px] font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Plus size={16} aria-hidden="true" />
                Add another exercise
              </button>
            </div>
          )}

          {errors.entries && (
            <p
              role="alert"
              className="mt-3 text-[12.5px] font-medium text-danger xl:hidden"
            >
              {errors.entries}
            </p>
          )}
        </div>
      </div>

      {/* Right Rail: LiveSessionCard mounted via ShellRail */}
      <ShellRail sticky>
        <LiveSessionCard
          entries={entries}
          durationMinutes={duration}
          startedAt={startedAt}
          elapsedSeconds={elapsed}
          onStartTimer={() => setStartedAt(Date.now())}
          onResetTimer={handleResetTimer}
          onDiscard={handleDiscard}
          onFinish={handleFinishWorkout}
          entriesError={errors.entries}
          isSaving={isSaving}
        />
      </ShellRail>

      {/* Mobile Sticky Bottom Action Bar */}
      <StickyActionBar
        doneSets={stats.done}
        totalSets={stats.total}
        elapsedSeconds={elapsed}
        totalVolume={stats.volume}
        onOpenLibrary={() => setShowLibrary(true)}
        onFinish={handleFinishWorkout}
        isSaving={isSaving}
      />

      {/* Exercise Library Modal */}
      <LibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        exercises={initialExercises}
        onPick={handlePickExercise}
      />

      {/* Floating Rest Timer */}
      {restTimer && (
        <RestTimer
          key={restTimer.key}
          total={restTimer.total}
          onDone={() => setRestTimer(null)}
        />
      )}

      {/* Workout Saved Modal */}
      {savedSnapshot && (
        <SavedSummaryModal
          open={savedSummaryOpen}
          onClose={() => setSavedSummaryOpen(false)}
          workoutName={savedSnapshot.name}
          dateString={savedSnapshot.date}
          durationMinutes={savedSnapshot.duration}
          exercisesCount={savedSnapshot.exercisesCount}
          completedSets={savedSnapshot.completedSets}
          totalVolume={savedSnapshot.totalVolume}
          notes={savedSnapshot.notes}
          onLogAnother={handleLogAnother}
        />
      )}
    </>
  );
}

export function WorkoutLoggerClient(props: WorkoutLoggerClientProps) {
  return (
    <ToastProvider>
      <WorkoutLoggerInner {...props} />
    </ToastProvider>
  );
}
