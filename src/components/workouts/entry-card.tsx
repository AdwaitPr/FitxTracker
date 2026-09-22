"use client";

import { Card } from "@/components/ui/card";
import { Tag, TagTone } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { MuscleGlyph } from "@/components/ui/muscle-glyph";
import { normalizeMuscleGroup } from "@/components/dashboard/workout-cover";
import { CompleteButton } from "./complete-button";
import {
  Entry,
  SetRow,
  createDefaultSet,
  VariationType,
} from "@/lib/workout-mapper";
import { Copy, Trash2, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EntryCardProps {
  entry: Entry;
  index: number;
  onChange: (updated: Entry) => void;
  onRemove: () => void;
  onComplete: (restSeconds: number) => void;
  onDuplicate?: () => void;
}

const MUSCLE_TONES: Record<string, TagTone> = {
  Chest: "violet",
  Back: "cyan",
  Legs: "pink",
  Shoulders: "amber",
  Arms: "green",
  Core: "amber",
  Cardio: "cyan",
};

export function getMuscleTone(muscle: string): TagTone {
  const norm = Object.keys(MUSCLE_TONES).find(
    (k) => k.toLowerCase() === muscle.toLowerCase()
  );
  return norm ? MUSCLE_TONES[norm] : "violet";
}

const cell =
  "tnum h-11 w-full min-w-0 rounded-[12px] border border-hairline bg-canvas px-3 text-center text-[14px] font-semibold text-ink placeholder:text-ink-muted transition-colors duration-200 focus:border-primary/60 focus:bg-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

function parseNumber(val: string): number | "" {
  if (val === "") return "";
  const n = Number(val);
  return isNaN(n) ? "" : Math.max(0, n);
}

export function EntryCard({
  entry,
  index,
  onChange,
  onRemove,
  onComplete,
  onDuplicate,
}: EntryCardProps) {
  const sets = entry.sets;
  const doneCount = sets.filter((s) => s.done).length;
  const tone = getMuscleTone(entry.exercise.muscleGroup);
  const isBodyweight =
    entry.exercise.equipment === "Bodyweight" ||
    entry.exercise.equipment === "Rings";

  const isSetInvalid = (s: SetRow) =>
    s.done && (s.reps === "" || Number(s.reps) <= 0);

  const updateSet = (setIndex: number, patch: Partial<SetRow>) => {
    const updatedSets = sets.map((s, idx) =>
      idx === setIndex ? { ...s, ...patch } : s
    );
    onChange({ ...entry, sets: updatedSets });
  };

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    onChange({
      ...entry,
      sets: [...sets, createDefaultSet(lastSet)],
    });
  };

  const handleCopySet = (setIndex: number) => {
    const source = sets[setIndex];
    const newRow = createDefaultSet(source);
    const updatedSets = [...sets];
    updatedSets.splice(setIndex + 1, 0, newRow);
    onChange({ ...entry, sets: updatedSets });
  };

  const handleRemoveSet = (setIndex: number) => {
    if (sets.length <= 1) return;
    onChange({
      ...entry,
      sets: sets.filter((_, idx) => idx !== setIndex),
    });
  };

  return (
    <Card as="article" className="rise p-4 sm:p-5">
      {/* Exercise Card Header */}
      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
          style={{
            background: `var(--tag-${tone}-bg)`,
            color: `var(--tag-${tone}-fg)`,
          }}
          aria-hidden="true"
        >
          <MuscleGlyph
            name={normalizeMuscleGroup(entry.exercise.muscleGroup)}
            className="h-7 w-7"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="micro text-ink-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
              {entry.exercise.name}
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Tag tone={tone}>{entry.exercise.muscleGroup}</Tag>
            <span className="text-[12px] text-ink-muted">
              {entry.exercise.equipment || "Standard"} · {doneCount}/
              {sets.length} sets done
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button
              type="button"
              aria-label={`Duplicate ${entry.exercise.name}`}
              onClick={onDuplicate}
              className="grid h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            aria-label={`Remove ${entry.exercise.name}`}
            onClick={onRemove}
            className="grid h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full text-ink-muted hover:bg-tag-danger-bg hover:text-danger cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Grid Headers (Desktop) */}
      <div
        className={cn(
          "micro mt-5 hidden gap-2 px-1 text-ink-muted sm:grid",
          entry.advanced
            ? "grid-cols-[32px_1fr_1fr_1fr_1.2fr_1fr_1fr_0.8fr_44px_36px]"
            : "grid-cols-[32px_1fr_1fr_1fr_44px_36px_36px]"
        )}
      >
        <span>Set</span>
        <span>Reps</span>
        <span>{isBodyweight ? "+kg" : "Kg"}</span>
        <span>Rest s</span>
        {entry.advanced && (
          <>
            <span>Variation</span>
            <span>Tempo</span>
            <span>Added kg</span>
            <span>RPE</span>
          </>
        )}
        <span className="text-center">Done</span>
        {!entry.advanced && <span />}
        <span />
      </div>

      {/* Set Rows */}
      <ul className="mt-2 space-y-2">
        {sets.map((s, i) => {
          const invalid = isSetInvalid(s);
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-[16px] p-1.5 transition-colors duration-300",
                s.done && "bg-primary-soft/40",
                invalid && "ring-1 ring-danger"
              )}
            >
              <div
                className={cn(
                  "grid items-center gap-2",
                  entry.advanced
                    ? "grid-cols-[32px_1fr_1fr_1fr_44px] sm:grid-cols-[32px_1fr_1fr_1fr_1.2fr_1fr_1fr_0.8fr_44px_36px]"
                    : "grid-cols-[32px_1fr_1fr_1fr_44px] sm:grid-cols-[32px_1fr_1fr_1fr_44px_36px_36px]"
                )}
              >
                {/* Set Number */}
                <span className="tnum text-center text-[13px] font-bold text-ink-muted">
                  {i + 1}
                </span>

                {/* Reps Input */}
                <div>
                  <label className="sr-only" htmlFor={`${s.id}-reps`}>
                    Reps set {i + 1}
                  </label>
                  <input
                    id={`${s.id}-reps`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="reps"
                    value={s.reps}
                    onChange={(e) =>
                      updateSet(i, { reps: parseNumber(e.target.value) })
                    }
                    className={cell}
                    aria-invalid={invalid || undefined}
                  />
                </div>

                {/* Weight Input */}
                <div>
                  <label className="sr-only" htmlFor={`${s.id}-weight`}>
                    Weight kg set {i + 1}
                  </label>
                  <input
                    id={`${s.id}-weight`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    placeholder={isBodyweight ? "BW" : "kg"}
                    value={s.weight}
                    onChange={(e) =>
                      updateSet(i, { weight: parseNumber(e.target.value) })
                    }
                    className={cell}
                  />
                </div>

                {/* Rest Time Input */}
                <div>
                  <label className="sr-only" htmlFor={`${s.id}-rest`}>
                    Rest seconds set {i + 1}
                  </label>
                  <input
                    id={`${s.id}-rest`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={15}
                    value={s.rest}
                    onChange={(e) =>
                      updateSet(i, { rest: Number(e.target.value) || 0 })
                    }
                    className={cell}
                  />
                </div>

                {/* Advanced Columns */}
                {entry.advanced && (
                  <>
                    {/* Variation */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="sr-only" htmlFor={`${s.id}-variation`}>
                        Variation set {i + 1}
                      </label>
                      <select
                        id={`${s.id}-variation`}
                        value={s.variation}
                        onChange={(e) =>
                          updateSet(i, {
                            variation: e.target.value as VariationType,
                          })
                        }
                        className={cn(cell, "appearance-none text-left cursor-pointer")}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Weighted">Weighted</option>
                        <option value="Slow-Tempo">Slow-Tempo</option>
                      </select>
                    </div>

                    {/* Tempo */}
                    <div>
                      <label className="sr-only" htmlFor={`${s.id}-tempo`}>
                        Tempo set {i + 1}
                      </label>
                      <input
                        id={`${s.id}-tempo`}
                        type="text"
                        placeholder="3-1-3"
                        value={s.tempo}
                        onChange={(e) => updateSet(i, { tempo: e.target.value })}
                        className={cell}
                      />
                    </div>

                    {/* Added Weight */}
                    <div>
                      <label className="sr-only" htmlFor={`${s.id}-added`}>
                        Added weight kg set {i + 1}
                      </label>
                      <input
                        id={`${s.id}-added`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.5}
                        placeholder="+kg"
                        value={s.added}
                        onChange={(e) =>
                          updateSet(i, { added: parseNumber(e.target.value) })
                        }
                        className={cell}
                      />
                    </div>

                    {/* RPE */}
                    <div>
                      <label className="sr-only" htmlFor={`${s.id}-rpe`}>
                        RPE set {i + 1}
                      </label>
                      <select
                        id={`${s.id}-rpe`}
                        value={s.rpe}
                        onChange={(e) =>
                          updateSet(i, { rpe: parseNumber(e.target.value) })
                        }
                        className={cn(cell, "appearance-none cursor-pointer")}
                      >
                        <option value="">RPE</option>
                        {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Complete Button */}
                <div
                  className={cn(
                    entry.advanced &&
                      "col-start-5 row-start-1 sm:col-start-auto sm:row-start-auto"
                  )}
                >
                  <CompleteButton
                    done={s.done}
                    pop={s.justDone}
                    label={`Mark set ${i + 1} ${s.done ? "incomplete" : "complete"}`}
                    onToggle={() => {
                      const nextDone = !s.done;
                      updateSet(i, { done: nextDone, justDone: nextDone });
                      if (nextDone) {
                        onComplete(s.rest);
                      }
                    }}
                  />
                </div>

                {/* Copy Button (Standard mode only) */}
                {!entry.advanced && (
                  <button
                    type="button"
                    aria-label={`Copy set ${i + 1}`}
                    onClick={() => handleCopySet(i)}
                    className="hidden h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-primary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors sm:grid"
                  >
                    <Copy size={16} aria-hidden="true" />
                  </button>
                )}

                {/* Remove Set Button */}
                <button
                  type="button"
                  aria-label={`Remove set ${i + 1}`}
                  disabled={sets.length === 1}
                  onClick={() => handleRemoveSet(i)}
                  className="hidden h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors sm:grid"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Set Validation Alert */}
              {invalid && (
                <p
                  role="alert"
                  className="mt-1 px-2 text-[11.5px] font-medium text-danger"
                >
                  Completed sets need at least 1 rep.
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Card Footer Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-hairline pt-3">
        <Button
          type="button"
          variant="soft"
          size="sm"
          icon={<Plus size={15} />}
          onClick={handleAddSet}
        >
          Add set
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Copy size={15} />}
          onClick={() => handleCopySet(sets.length - 1)}
        >
          Copy previous set
        </Button>
        <button
          type="button"
          aria-expanded={entry.advanced}
          onClick={() => onChange({ ...entry, advanced: !entry.advanced })}
          className="ml-auto inline-flex h-9 max-md:h-11 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-ink-muted hover:text-primary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
        >
          Advanced
          <ChevronDown
            size={15}
            className={cn(
              "transition-transform duration-200",
              entry.advanced && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label={`Remove exercise ${entry.exercise.name}`}
          onClick={onRemove}
          className="inline-flex h-9 max-md:h-11 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-danger hover:bg-tag-danger-bg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
        >
          <Trash2 size={15} aria-hidden="true" />
          Remove
        </button>
      </div>
    </Card>
  );
}
