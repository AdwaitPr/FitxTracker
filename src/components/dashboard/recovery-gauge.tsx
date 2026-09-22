import { RingProgress } from "@/components/ui/ring-progress";

export interface RecoveryGaugeProps {
  score: number;
  color: string;
  caption: string;
}

export function RecoveryGauge({ score, color, caption }: RecoveryGaugeProps) {
  return (
    <div className="flex items-center gap-4">
      <RingProgress
        value={score}
        size={104}
        stroke={7}
        color={color}
        label={`Recovery score ${score} of 100`}
      >
        <div className="text-center">
          <div
            className="tnum text-[26px] font-bold leading-none tracking-[-0.02em]"
            style={{ color }}
          >
            {score}
          </div>
          <div className="micro mt-1 text-ink-muted">Score</div>
        </div>
      </RingProgress>
      <div className="min-w-0 flex-1">
        <p className="micro text-ink-muted">Recovery · today</p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {caption}
        </p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
          Sleep 40% · quality 30% · stress 20% · gut 10%
        </p>
      </div>
    </div>
  );
}
