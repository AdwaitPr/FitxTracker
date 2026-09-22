"use client";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Plus } from "lucide-react";

export interface StickyActionBarProps {
  doneSets: number;
  totalSets: number;
  elapsedSeconds: number;
  totalVolume: number;
  onOpenLibrary: () => void;
  onFinish: () => void;
  isSaving?: boolean;
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function StickyActionBar({
  doneSets,
  totalSets,
  elapsedSeconds,
  totalVolume,
  onOpenLibrary,
  onFinish,
  isSaving = false,
}: StickyActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 border-t border-hairline bg-surface/95 px-4 py-3 md:bottom-0 md:left-[76px] xl:hidden backdrop-blur-sm shadow-lift">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="micro text-ink-muted">
            {doneSets}/{totalSets} sets · {mmss(elapsedSeconds)}
          </p>
          <p className="tnum truncate text-[14px] font-bold text-ink">
            {totalVolume.toLocaleString()} kg volume
          </p>
        </div>

        <IconButton
          icon={<Plus size={20} />}
          label="Add exercise"
          variant="soft"
          size={44}
          onClick={onOpenLibrary}
        />

        <Button
          type="button"
          arrow
          disabled={isSaving}
          onClick={onFinish}
          className="pl-5"
        >
          {isSaving ? "Saving..." : "Finish"}
        </Button>
      </div>
    </div>
  );
}
