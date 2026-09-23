"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Dumbbell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/controls";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MuscleGlyph, type MuscleGlyphName } from "@/components/ui/muscle-glyph";
import {
  CANONICAL_MUSCLE_GROUPS,
  getMuscleTone,
  normalizeMuscleGroup,
} from "@/lib/workout-derived";

export interface SerializedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

export interface ExercisesClientProps {
  exercises: SerializedExercise[];
  initialQuery?: string;
}

export function ExercisesClient({
  exercises,
  initialQuery = "",
}: ExercisesClientProps) {
  const [q, setQ] = useState(initialQuery);
  const [mg, setMg] = useState<string | null>(null);
  const [eq, setEq] = useState<string>("");

  // Extract distinct equipment options from dataset
  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of exercises) {
      if (e.equipment && e.equipment.trim()) {
        set.add(e.equipment.trim());
      }
    }
    return Array.from(set).sort();
  }, [exercises]);

  // Distinct muscle groups in DB or standard canonical
  const muscleGroups = useMemo(() => {
    const set = new Set<string>(CANONICAL_MUSCLE_GROUPS);
    for (const e of exercises) {
      if (e.muscleGroup && e.muscleGroup.trim()) {
        set.add(normalizeMuscleGroup(e.muscleGroup));
      }
    }
    return Array.from(set);
  }, [exercises]);

  const filteredList = useMemo(() => {
    const query = q.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchQ = !query || e.name.toLowerCase().includes(query);
      const matchMg = !mg || normalizeMuscleGroup(e.muscleGroup) === mg;
      const matchEq = !eq || (e.equipment && e.equipment.toLowerCase() === eq.toLowerCase());
      return matchQ && matchMg && matchEq;
    });
  }, [exercises, q, mg, eq]);

  const handleClearFilters = () => {
    setQ("");
    setMg(null);
    setEq("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="Exercises"
        sub={`${exercises.length} movements across ${muscleGroups.length} muscle groups.`}
      />

      {/* Filter Card */}
      <Card className="rise p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <Input
            icon={<Search size={16} />}
            placeholder="Search by name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search exercises"
          />
          <Select
            value={eq}
            onChange={(e) => setEq(e.target.value)}
            aria-label="Equipment"
          >
            <option value="">All equipment</option>
            {equipmentOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Chip selected={mg === null} onClick={() => setMg(null)}>
            All
          </Chip>
          {muscleGroups.map((m) => (
            <Chip
              key={m}
              selected={mg === m}
              tone={getMuscleTone(m)}
              onClick={() => setMg(mg === m ? null : m)}
            >
              {m}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Exercises Grid */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={36} />}
          title={q ? `No results for “${q}”` : "No exercises match your filters"}
          body="Try a broader search term or clear your selected filters."
          action={
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredList.map((e, i) => {
            const tone = getMuscleTone(e.muscleGroup);
            const glyphName = normalizeMuscleGroup(e.muscleGroup) as MuscleGlyphName;

            return (
              <Card
                key={e.id}
                as="article"
                className="rise lift flex flex-col justify-between p-4"
              >
                <div>
                  <div
                    className="relative flex h-[96px] items-center justify-center overflow-hidden rounded-[16px]"
                    style={{
                      background: `var(--tag-${tone}-bg)`,
                      color: `var(--tag-${tone}-fg)`,
                      animationDelay: `${i * 30}ms`,
                    }}
                  >
                    <span
                      className="pointer-events-none absolute inset-x-6 top-1/2 border-t border-dashed"
                      style={{ borderColor: "currentColor", opacity: 0.25 }}
                    />
                    <MuscleGlyph name={glyphName} className="relative h-14 w-14" />
                  </div>

                  <div className="mt-3 min-w-0">
                    <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
                      {e.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {e.equipment || "Bodyweight"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-hairline pt-3">
                  <Tag tone={tone}>{e.muscleGroup}</Tag>
                  <Link
                    href={`/workouts/new?from=${e.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    Log <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
