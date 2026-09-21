export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Cardio";

export type TagTone = "violet" | "cyan" | "pink" | "amber" | "green";

export interface Workout {
  id: string;
  name: string;
  date: string;
  dateISO: string;
  durationMin: number;
  muscle: MuscleGroup;
  exercises: string[];
  setsDone: number;
  setsTotal: number;
  volume: string;
  topExercise: string;
}

export const user = {
  firstName: "Aarav",
  fullName: "Aarav Sharma",
  initials: "AS",
  heightCm: 178,
  weightKg: 74.5,
  goal: "Build muscle",
  lastWorkoutDate: "Yesterday, 18 February",
  streakLine: "4-week streak · 3 sessions logged this week",
  weeklyGoalDone: 3,
  weeklyGoalTotal: 4,
};

export const quickStats = [
  {
    id: "week",
    label: "This Week",
    caption: "Mon–Sun · goal 4",
    value: "3 of 4",
    unit: "sessions",
    tone: "violet" as TagTone,
    icon: "calendar" as const,
  },
  {
    id: "month",
    label: "This Month",
    caption: "February · goal 14",
    value: "11",
    unit: "sessions",
    tone: "cyan" as TagTone,
    icon: "bars" as const,
  },
  {
    id: "weight",
    label: "Body Weight",
    caption: "Last weigh-in · 17 Feb",
    value: "74.5",
    unit: "kg · 178 cm",
    tone: "pink" as TagTone,
    icon: "scale" as const,
  },
  {
    id: "since",
    label: "Days Since Last",
    caption: "Push Day · Chest & Triceps",
    value: "1",
    unit: "day ago",
    tone: "amber" as TagTone,
    icon: "clock" as const,
  },
];

export const workouts: Workout[] = [
  {
    id: "w1",
    name: "Push Day — Chest & Triceps",
    date: "Yesterday",
    dateISO: "2026-02-18",
    durationMin: 62,
    muscle: "Chest",
    exercises: ["Barbell Bench Press", "Incline DB Press", "Cable Fly", "Skull Crushers", "Rope Push-down"],
    setsDone: 18,
    setsTotal: 20,
    volume: "9,420 kg",
    topExercise: "Barbell Bench Press · 5×5 @ 82.5 kg",
  },
  {
    id: "w2",
    name: "Pull Day — Back & Biceps",
    date: "3 days ago",
    dateISO: "2026-02-16",
    durationMin: 58,
    muscle: "Back",
    exercises: ["Weighted Pull-up", "Barbell Row", "Lat Pulldown", "Face Pull", "Incline Curl"],
    setsDone: 20,
    setsTotal: 20,
    volume: "10,150 kg",
    topExercise: "Barbell Row · 4×8 @ 90 kg",
  },
  {
    id: "w3",
    name: "Leg Day — Quads & Glutes",
    date: "5 days ago",
    dateISO: "2026-02-14",
    durationMin: 71,
    muscle: "Legs",
    exercises: ["Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Leg Press", "Standing Calf Raise"],
    setsDone: 16,
    setsTotal: 22,
    volume: "14,300 kg",
    topExercise: "Back Squat · 5×5 @ 120 kg",
  },
  {
    id: "w4",
    name: "Shoulders & Core",
    date: "7 days ago",
    dateISO: "2026-02-12",
    durationMin: 45,
    muscle: "Shoulders",
    exercises: ["Standing OHP", "Lateral Raise", "Reverse Fly", "Hanging Leg Raise", "Pallof Press"],
    setsDone: 15,
    setsTotal: 15,
    volume: "5,880 kg",
    topExercise: "Standing OHP · 5×5 @ 52.5 kg",
  },
  {
    id: "w5",
    name: "Calisthenics Skills",
    date: "9 days ago",
    dateISO: "2026-02-10",
    durationMin: 40,
    muscle: "Core",
    exercises: ["Handstand Hold", "Front Lever Progression", "Ring Dips", "Hollow Body Hold"],
    setsDone: 12,
    setsTotal: 14,
    volume: "Bodyweight",
    topExercise: "Front Lever Tuck · 6×8 s",
  },
];

export type RecoveryLevel = "optimal" | "normal" | "warning" | "critical";

export interface RecoveryFactor {
  id: "sleep" | "quality" | "stress" | "gut";
  label: string;
  value: string;
  detail: string;
  score: number;
}

export interface RecoveryState {
  level: RecoveryLevel;
  score: number;
  verdict: string;
  eyebrow: string;
  headline: [string, string];
  sub: string;
  cta: string;
  factors: RecoveryFactor[];
}

export const recoveryStates: Record<RecoveryLevel, RecoveryState> = {
  optimal: {
    level: "optimal",
    score: 91,
    verdict: "Optimal — go for a PR",
    eyebrow: "Today's session",
    headline: ["Green light today.", "Push for a new personal best."],
    sub: "Recovery 91 · sleep and stress are both in the zone. Add a top set and hold 5–6 heavy sets per lift.",
    cta: "Start Workout",
    factors: [
      { id: "sleep", label: "Sleep hours", value: "8.3 h", detail: "target 8.0 h", score: 96 },
      { id: "quality", label: "Sleep quality", value: "Great", detail: "deep 1 h 48 m", score: 94 },
      { id: "stress", label: "Stress", value: "2 / 10", detail: "inverted", score: 88 },
      { id: "gut", label: "Gut status", value: "Great", detail: "no symptoms", score: 88 },
    ],
  },
  normal: {
    level: "normal",
    score: 79,
    verdict: "Normal — train as planned",
    eyebrow: "Today's session",
    headline: ["Ready to push today?", "Your recovery says go strong."],
    sub: "Recovery 79 · train as planned. Keep 2–3 minutes of rest on the big lifts and finish the last set with one rep in reserve.",
    cta: "Start Workout",
    factors: [
      { id: "sleep", label: "Sleep hours", value: "7.2 h", detail: "target 8.0 h", score: 90 },
      { id: "quality", label: "Sleep quality", value: "Good", detail: "deep 1 h 22 m", score: 80 },
      { id: "stress", label: "Stress", value: "4 / 10", detail: "inverted", score: 55 },
      { id: "gut", label: "Gut status", value: "Good", detail: "no symptoms", score: 80 },
    ],
  },
  warning: {
    level: "warning",
    score: 54,
    verdict: "Warning — cut volume 20%",
    eyebrow: "Today's session",
    headline: ["Steady session today.", "Take your foot off the gas."],
    sub: "Recovery 54 · trim the plan by 20% of the sets and cap effort at RPE 7. Keep the movement, drop the load.",
    cta: "Start Easy Session",
    factors: [
      { id: "sleep", label: "Sleep hours", value: "5.9 h", detail: "target 8.0 h", score: 62 },
      { id: "quality", label: "Sleep quality", value: "Fair", detail: "deep 54 m", score: 52 },
      { id: "stress", label: "Stress", value: "7 / 10", detail: "inverted", score: 30 },
      { id: "gut", label: "Gut status", value: "Fair", detail: "bloating", score: 55 },
    ],
  },
  critical: {
    level: "critical",
    score: 28,
    verdict: "Critical — rest and recover",
    eyebrow: "Today's session",
    headline: ["Rest is the workout", "today. Recover first."],
    sub: "Recovery 28 · sleep and stress are both off. Walk 20 minutes, stretch the hips and shoulders, and log how you feel tonight.",
    cta: "Log Recovery",
    factors: [
      { id: "sleep", label: "Sleep hours", value: "4.4 h", detail: "target 8.0 h", score: 38 },
      { id: "quality", label: "Sleep quality", value: "Poor", detail: "deep 31 m", score: 28 },
      { id: "stress", label: "Stress", value: "9 / 10", detail: "inverted", score: 10 },
      { id: "gut", label: "Gut status", value: "Poor", detail: "cramping", score: 30 },
    ],
  },
};

export const volumeByWeek = [
  { label: "12–18 Jan", value: 21.4 },
  { label: "19–25 Jan", value: 28.9 },
  { label: "26–1 Feb", value: 24.1 },
  { label: "2–8 Feb", value: 33.6 },
  { label: "9–15 Feb", value: 26.7 },
];

export const volumeByMonth = [
  { label: "Oct", value: 96.2 },
  { label: "Nov", value: 112.4 },
  { label: "Dec", value: 88.7 },
  { label: "Jan", value: 121.9 },
  { label: "Feb", value: 104.3 },
];

export const notifications = { unread: 1, note: "Recovery alert: sleep debt rising" };
