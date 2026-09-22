"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RingProgress } from "@/components/ui/ring-progress";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RestTimerProps {
  total: number;
  onDone: () => void;
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function RestTimer({ total, onDone }: RestTimerProps) {
  const [max, setMax] = useState(total);
  const [left, setLeft] = useState(total);
  const [paused, setPaused] = useState(false);

  // Store target end timestamp in milliseconds
  const targetEndTimeRef = useRef<number>(0);
  const remainingWhenPausedRef = useRef<number>(total);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const updateFromTarget = useCallback(() => {
    if (paused) return;
    const now = Date.now();
    const remainingMs = targetEndTimeRef.current - now;
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    setLeft(remainingSec);
    if (remainingSec <= 0) {
      onDoneRef.current();
    }
  }, [paused]);

  // Initialize target end time on mount
  useEffect(() => {
    targetEndTimeRef.current = Date.now() + total * 1000;
  }, [total]);

  // Tick timer
  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(updateFromTarget, 500);
    return () => window.clearInterval(interval);
  }, [paused, updateFromTarget]);

  // Resync on visibilitychange (e.g. phone lock/unlock or tab backgrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !paused) {
        updateFromTarget();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [paused, updateFromTarget]);

  const handleTogglePause = () => {
    if (paused) {
      // Resuming
      targetEndTimeRef.current =
        Date.now() + remainingWhenPausedRef.current * 1000;
      setPaused(false);
    } else {
      // Pausing
      const remainingSec = Math.max(
        0,
        Math.ceil((targetEndTimeRef.current - Date.now()) / 1000)
      );
      remainingWhenPausedRef.current = remainingSec;
      setPaused(true);
    }
  };

  const handleAdd30s = () => {
    if (paused) {
      remainingWhenPausedRef.current += 30;
      setLeft((l) => l + 30);
      setMax((m) => m + 30);
    } else {
      targetEndTimeRef.current += 30_000;
      setMax((m) => m + 30);
      updateFromTarget();
    }
  };

  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((left / max) * 100))) : 0;

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Rest timer, ${mmss(Math.max(0, left))} remaining`}
      className={cn(
        "rise fixed bottom-[calc(160px+env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-3 text-canvas shadow-lift sm:gap-3 md:bottom-24 xl:bottom-8"
      )}
    >
      <RingProgress
        value={pct}
        size={40}
        stroke={3.5}
        color="var(--primary)"
        label="Rest remaining"
      >
        <span className="text-[9px] font-bold">{pct}%</span>
      </RingProgress>

      <span>
        <span className="micro block opacity-60">Rest</span>
        <span className="tnum block text-[18px] font-bold leading-none">
          {mmss(Math.max(0, left))}
        </span>
      </span>

      <span className="mx-1 h-6 w-px bg-canvas/20" />

      <button
        type="button"
        aria-label="Add 30 seconds to rest"
        onClick={handleAdd30s}
        className="h-9 max-md:h-11 rounded-full px-3 text-[12px] font-semibold hover:bg-canvas/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
      >
        +30s
      </button>

      <button
        type="button"
        aria-label={paused ? "Resume rest timer" : "Pause rest timer"}
        onClick={handleTogglePause}
        className="grid h-9 w-9 max-md:h-11 max-md:w-11 place-items-center rounded-full hover:bg-canvas/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
      >
        {paused ? (
          <Play size={16} aria-hidden="true" />
        ) : (
          <Pause size={16} aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        aria-label="Skip rest timer"
        onClick={onDone}
        className="h-9 max-md:h-11 rounded-full bg-canvas px-3.5 text-[12px] font-semibold text-ink hover:bg-canvas/90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
      >
        Skip
      </button>
    </div>
  );
}
