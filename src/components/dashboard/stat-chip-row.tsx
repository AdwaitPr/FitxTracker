import { StatChip } from "@/components/ui/stat-chip";
import { Calendar, TrendingUp, Scale, Clock } from "lucide-react";

export interface StatChipRowProps {
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  bodyWeight?: number | null;
  height?: number | null;
  lastWorkoutDate?: Date | null;
  daysSinceLastWorkout?: number | null;
}

export function StatChipRow({
  workoutsThisWeek,
  workoutsThisMonth,
  bodyWeight,
  height,
  lastWorkoutDate,
  daysSinceLastWorkout,
}: StatChipRowProps) {
  const chips = [
    {
      id: "week",
      label: "This Week",
      value: workoutsThisWeek,
      unit: "of 4",
      caption: "Mon–Sun · goal 4",
      tone: "violet" as const,
      icon: <Calendar size={20} aria-hidden="true" />,
    },
    {
      id: "month",
      label: "This Month",
      value: workoutsThisMonth,
      unit: "sessions",
      caption:
        workoutsThisMonth >= 14
          ? "Target reached"
          : "Pacing toward monthly goal",
      tone: "cyan" as const,
      icon: <TrendingUp size={20} aria-hidden="true" />,
    },
    {
      id: "weight",
      label: "Body Weight",
      value: bodyWeight ? `${bodyWeight}` : "—",
      unit: bodyWeight ? "kg" : "",
      caption: height ? `${height} cm · tracked mass` : "Tracked mass",
      tone: "amber" as const,
      icon: <Scale size={20} aria-hidden="true" />,
    },
    {
      id: "days",
      label: "Days Since Last",
      value: daysSinceLastWorkout !== null ? daysSinceLastWorkout : "—",
      unit: daysSinceLastWorkout === 1 ? "day" : "days",
      caption:
        daysSinceLastWorkout === 0
          ? "Trained today"
          : lastWorkoutDate
            ? `Last: ${new Date(lastWorkoutDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`
            : "No workouts yet",
      tone: "green" as const,
      icon: <Clock size={20} aria-hidden="true" />,
    },
  ];

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {chips.map((c, i) => (
        <StatChip
          key={c.id}
          label={c.label}
          value={c.value ?? "—"}
          unit={c.unit}
          caption={c.caption}
          tone={c.tone}
          icon={c.icon}
          index={i}
        />
      ))}
    </div>
  );
}
