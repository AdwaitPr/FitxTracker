"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { RingProgress } from "@/components/ui/ring-progress";
import { Segmented } from "@/components/ui/segmented";
import { BarChart } from "@/components/charts/bar-chart";
import type { VolumeBarItem } from "@/lib/progress-derived";

export interface StatisticCardProps {
  userInitials: string;
  userName: string;
  workoutsThisWeek: number;
  weeklyGoal?: number;
  streakText: string;
  volumeByWeek: VolumeBarItem[];
  volumeByMonth: VolumeBarItem[];
}

export function StatisticCard({
  userInitials,
  userName,
  workoutsThisWeek,
  weeklyGoal = 4,
  streakText,
  volumeByWeek,
  volumeByMonth,
}: StatisticCardProps) {
  const [range, setRange] = useState("week");

  const activeBars = range === "week" ? volumeByWeek : volumeByMonth;
  const labels = activeBars.map((b) => b.label);
  const values = activeBars.map((b) => b.value);
  const total = activeBars.reduce((s, b) => s + b.value, 0).toFixed(1);

  const goalRatio = Math.min(workoutsThisWeek / weeklyGoal, 1);
  const goalPct = Math.round(goalRatio * 100);

  const firstName = userName.split(" ")[0] || "Athlete";
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const summary = `Training volume, last five ${
    range === "week" ? "weeks" : "months"
  }: ${activeBars.map((b) => `${b.label}: ${b.value}k kg`).join(", ")}.`;

  return (
    <Card className="rise p-5" as="article">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Statistic
        </h2>
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <RingProgress
          value={goalPct}
          size={152}
          stroke={6}
          color="var(--primary)"
          label={`Weekly goal: ${workoutsThisWeek} of ${weeklyGoal} sessions`}
          badge={`${goalPct}%`}
        >
          <span className="grid h-[104px] w-[104px] place-items-center rounded-full bg-primary-soft text-[30px] font-bold tracking-[-0.02em] text-primary select-none">
            {userInitials}
          </span>
        </RingProgress>
        <p className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {timeGreeting}, {firstName} 🔥
        </p>
        <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">
          {streakText} · {workoutsThisWeek}{" "}
          {workoutsThisWeek === 1 ? "session" : "sessions"} logged this week
        </p>
      </div>

      <div className="mt-5 rounded-panel bg-inset p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="micro min-w-0 truncate text-ink-muted">
            Volume · &rsquo;000 kg
          </p>
          <Segmented
            label="Chart range"
            value={range}
            onChange={setRange}
            options={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
        </div>
        <BarChart
          labels={labels}
          values={values}
          unit="k kg"
          height={160}
          summary={summary}
        />
        <p className="micro mt-2 text-right text-ink-muted">
          {range === "week" ? "5-week" : "5-month"} total {total}k kg
        </p>
      </div>
    </Card>
  );
}
