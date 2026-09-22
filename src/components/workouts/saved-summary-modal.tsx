"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export interface SavedSummaryModalProps {
  open: boolean;
  onClose: () => void;
  workoutName: string;
  dateString: string;
  durationMinutes: number | "";
  exercisesCount: number;
  completedSets: number;
  totalVolume: number;
  notes?: string;
  onLogAnother: () => void;
}

export function SavedSummaryModal({
  open,
  onClose,
  workoutName,
  dateString,
  durationMinutes,
  exercisesCount,
  completedSets,
  totalVolume,
  notes,
  onLogAnother,
}: SavedSummaryModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Workout saved"
      footer={
        <>
          <Button variant="outline" onClick={onLogAnother}>
            Log another
          </Button>
          <Link href="/workouts/history">
            <Button arrow>View history</Button>
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-4 rounded-panel bg-inset p-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white"
            style={{ background: "var(--tag-green-fg)" }}
            aria-hidden="true"
          >
            <Check size={22} strokeWidth={2.4} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink">
              {workoutName}
            </p>
            <p className="tnum mt-0.5 text-[12.5px] text-ink-muted">
              {dateString} · {durationMinutes || 60} min · {exercisesCount} exercises ·{" "}
              {completedSets} sets · {totalVolume.toLocaleString()} kg
            </p>
          </div>
        </div>

        {notes && (
          <p className="rounded-card bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft italic border border-hairline">
            “{notes}”
          </p>
        )}
      </div>
    </Modal>
  );
}
