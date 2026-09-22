"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/controls";
import { Tag } from "@/components/ui/tag";
import { MuscleGlyph } from "@/components/ui/muscle-glyph";
import { normalizeMuscleGroup } from "@/components/dashboard/workout-cover";
import { WorkoutExerciseItem } from "@/lib/workout-mapper";
import { getMuscleTone } from "./entry-card";
import { Plus } from "lucide-react";

export interface LibraryModalProps {
  open: boolean;
  onClose: () => void;
  exercises: WorkoutExerciseItem[];
  onPick: (exercise: WorkoutExerciseItem) => void;
}

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
];

const EQUIPMENT_OPTIONS = [
  "All equipment",
  "Barbell",
  "Dumbbell",
  "Bodyweight",
  "Machine",
  "Cable",
  "Kettlebell",
  "Rings",
];

export function LibraryModal({
  open,
  onClose,
  exercises,
  onPick,
}: LibraryModalProps) {
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All equipment");

  const filtered = exercises.filter((ex) => {
    const matchesQuery =
      query.trim() === "" ||
      ex.name.toLowerCase().includes(query.toLowerCase());

    const matchesMuscle =
      selectedMuscle === "All" ||
      ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase();

    const matchesEquipment =
      selectedEquipment === "All equipment" ||
      (ex.equipment &&
        ex.equipment.toLowerCase() === selectedEquipment.toLowerCase());

    return matchesQuery && matchesMuscle && matchesEquipment;
  });

  return (
    <Modal open={open} onClose={onClose} title="Add exercise" size="lg">
      <div className="space-y-4">
        {/* Search & Equipment Dropdown */}
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <Input
            icon="search"
            placeholder="Search the library…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search exercises"
          />
          <Select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            aria-label="Equipment filter"
          >
            {EQUIPMENT_OPTIONS.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </Select>
        </div>

        {/* Muscle Group Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = selectedMuscle === mg;
            return (
              <Chip
                key={mg}
                selected={isSelected}
                onClick={() => setSelectedMuscle(mg)}
              >
                {mg}
              </Chip>
            );
          })}
        </div>

        {/* Filtered Exercise List */}
        <ul className="max-h-[46vh] overflow-y-auto no-scrollbar space-y-1 divide-y divide-dashed divide-hairline">
          {filtered.length === 0 ? (
            <li className="py-8 text-center text-[13.5px] text-ink-muted">
              No exercises match “{query}”.
            </li>
          ) : (
            filtered.map((e) => {
              const tone = getMuscleTone(e.muscleGroup);
              return (
                <li key={e.id} className="pt-1">
                  <button
                    type="button"
                    onClick={() => onPick(e)}
                    className="flex min-h-[56px] w-full items-center gap-3 rounded-[12px] px-2 py-2 text-left hover:bg-canvas transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-tag"
                      style={{
                        background: `var(--tag-${tone}-bg)`,
                        color: `var(--tag-${tone}-fg)`,
                      }}
                      aria-hidden="true"
                    >
                      <MuscleGlyph
                        name={normalizeMuscleGroup(e.muscleGroup)}
                        className="h-6 w-6"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {e.name}
                      </span>
                      <span className="block text-[12px] text-ink-muted">
                        {e.equipment || "Standard"}
                      </span>
                    </span>

                    <Tag tone={tone}>{e.muscleGroup}</Tag>

                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline text-ink-muted hover:text-ink hover:border-primary transition-colors">
                      <Plus size={16} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Modal>
  );
}
