import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RecoveryGauge } from "./recovery-gauge";
import type { Alert } from "@/lib/alerts";

export interface RecoveryFactor {
  id: string;
  label: string;
  value: string;
  score: number;
}

export interface RecoveryCardProps {
  score?: number | null;
  alert?: Alert | null;
  factors?: RecoveryFactor[] | null;
}

const scoreColor = (s: number) =>
  s >= 75
    ? "var(--tag-green-fg)"
    : s >= 55
      ? "var(--primary)"
      : s >= 40
        ? "var(--tag-amber-fg)"
        : "var(--danger)";

export function RecoveryCard({
  score = null,
  alert = null,
  factors = null,
}: RecoveryCardProps) {
  const displayScore = score ?? 0;
  const isLogged = score !== null;

  const color =
    displayScore >= 80
      ? "var(--tag-green-fg)"
      : displayScore >= 60
        ? "var(--primary)"
        : displayScore >= 40
          ? "var(--tag-amber-fg)"
          : "var(--danger)";

  const caption = isLogged
    ? alert?.message || `${displayScore}% recovery today`
    : "Not logged yet today";

  const defaultFactors: RecoveryFactor[] = [
    { id: "sleep", label: "Sleep Duration", value: "—", score: 0 },
    { id: "quality", label: "Sleep Quality", value: "—", score: 0 },
    { id: "stress", label: "Stress Level", value: "—", score: 0 },
    { id: "gut", label: "Gut Health", value: "—", score: 0 },
  ];

  const activeFactors = factors || defaultFactors;

  return (
    <Card className="rise p-5" as="article">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Today&rsquo;s Recovery
        </h2>
        <Link
          href="/recovery"
          className="rounded-full border border-hairline px-3.5 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
        >
          {isLogged ? "Edit" : "Log"}
        </Link>
      </div>

      <div className="mt-5">
        <RecoveryGauge
          score={displayScore}
          color={isLogged ? color : "var(--hairline)"}
          caption={caption}
        />
      </div>

      <ul className="mt-5 space-y-3.5">
        {activeFactors.map((f) => (
          <li key={f.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-medium text-ink-soft">
                {f.label}
              </span>
              <span className="tnum text-[12.5px] font-semibold text-ink">
                {f.value}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={f.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${f.label}: ${f.value}, ${f.score} of 100`}
              className="mt-2 h-[6px] overflow-hidden rounded-full bg-hairline"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${f.score}%`,
                  background: scoreColor(f.score),
                  transition: "width 700ms cubic-bezier(.2,.8,.2,1)",
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/recovery"
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-soft text-[13.5px] font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft-2 hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Open Recovery
        <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
      </Link>
    </Card>
  );
}
