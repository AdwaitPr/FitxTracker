import type { MuscleGroup } from "./data";

/* deterministic pseudo-random so the prototype is stable between reloads */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ------------------------------------------------------- exercise library */
export type Equipment = "Barbell" | "Dumbbell" | "Cable" | "Machine" | "Bodyweight" | "Kettlebell" | "Rings";
export interface Exercise { id: string; name: string; muscle: MuscleGroup; equipment: Equipment; secondary?: string; }

export const exerciseLibrary: Exercise[] = [
  { id: "bench", name: "Barbell Bench Press", muscle: "Chest", equipment: "Barbell", secondary: "Triceps" },
  { id: "incdb", name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbell", secondary: "Front delts" },
  { id: "fly", name: "Cable Fly", muscle: "Chest", equipment: "Cable" },
  { id: "dip", name: "Ring Dip", muscle: "Chest", equipment: "Rings", secondary: "Triceps" },
  { id: "pushup", name: "Push-up", muscle: "Chest", equipment: "Bodyweight" },
  { id: "pullup", name: "Weighted Pull-up", muscle: "Back", equipment: "Bodyweight", secondary: "Biceps" },
  { id: "row", name: "Barbell Row", muscle: "Back", equipment: "Barbell" },
  { id: "latpd", name: "Lat Pulldown", muscle: "Back", equipment: "Cable" },
  { id: "facepull", name: "Face Pull", muscle: "Back", equipment: "Cable", secondary: "Rear delts" },
  { id: "dbrow", name: "One-arm Dumbbell Row", muscle: "Back", equipment: "Dumbbell" },
  { id: "squat", name: "Back Squat", muscle: "Legs", equipment: "Barbell" },
  { id: "rdl", name: "Romanian Deadlift", muscle: "Legs", equipment: "Barbell", secondary: "Hamstrings" },
  { id: "bss", name: "Bulgarian Split Squat", muscle: "Legs", equipment: "Dumbbell" },
  { id: "legpress", name: "Leg Press", muscle: "Legs", equipment: "Machine" },
  { id: "calf", name: "Standing Calf Raise", muscle: "Legs", equipment: "Machine" },
  { id: "kbswing", name: "Kettlebell Swing", muscle: "Legs", equipment: "Kettlebell", secondary: "Glutes" },
  { id: "ohp", name: "Standing Overhead Press", muscle: "Shoulders", equipment: "Barbell" },
  { id: "latraise", name: "Lateral Raise", muscle: "Shoulders", equipment: "Dumbbell" },
  { id: "revfly", name: "Reverse Fly", muscle: "Shoulders", equipment: "Cable" },
  { id: "curl", name: "Incline Dumbbell Curl", muscle: "Arms", equipment: "Dumbbell" },
  { id: "skull", name: "Skull Crusher", muscle: "Arms", equipment: "Barbell" },
  { id: "pushdown", name: "Rope Push-down", muscle: "Arms", equipment: "Cable" },
  { id: "hlr", name: "Hanging Leg Raise", muscle: "Core", equipment: "Bodyweight" },
  { id: "pallof", name: "Pallof Press", muscle: "Core", equipment: "Cable" },
  { id: "hollow", name: "Hollow Body Hold", muscle: "Core", equipment: "Bodyweight" },
  { id: "flever", name: "Front Lever Progression", muscle: "Core", equipment: "Rings" },
  { id: "hs", name: "Handstand Hold", muscle: "Shoulders", equipment: "Bodyweight", secondary: "Core" },
  { id: "run", name: "Zone 2 Run", muscle: "Cardio", equipment: "Bodyweight" },
  { id: "rower", name: "Rowing Erg Intervals", muscle: "Cardio", equipment: "Machine" },
  { id: "bike", name: "Assault Bike Sprints", muscle: "Cardio", equipment: "Machine" },
];

export const muscleGroups: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];
export const equipmentList: Equipment[] = ["Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Kettlebell", "Rings"];
export const muscleTone: Record<MuscleGroup, "violet" | "cyan" | "pink" | "amber" | "green"> = {
  Chest: "pink", Back: "cyan", Legs: "amber", Shoulders: "violet", Arms: "violet", Core: "green", Cardio: "pink",
};

/* -------------------------------------------------------- history archive */
export interface HistoryWorkout {
  id: string; name: string; dateISO: string; durationMin: number; muscle: MuscleGroup;
  exerciseIds: string[]; volume: number; topSet: string; avgRpe: number; notes?: string;
}

const templates: Omit<HistoryWorkout, "id" | "dateISO">[] = [
  { name: "Push Day — Chest & Triceps", durationMin: 62, muscle: "Chest", exerciseIds: ["bench", "incdb", "fly", "skull", "pushdown"], volume: 9420, topSet: "Bench 82.5 kg × 5", avgRpe: 7.8, notes: "Bench felt fast. Kept 1 RIR on top set. Elbow niggle gone." },
  { name: "Pull Day — Back & Biceps", durationMin: 58, muscle: "Back", exerciseIds: ["pullup", "row", "latpd", "facepull", "curl"], volume: 10150, topSet: "Row 90 kg × 8", avgRpe: 8.1, notes: "Added 2.5 kg to weighted pull-ups." },
  { name: "Leg Day — Quads & Glutes", durationMin: 71, muscle: "Legs", exerciseIds: ["squat", "rdl", "bss", "legpress", "calf"], volume: 14300, topSet: "Squat 120 kg × 5", avgRpe: 8.6, notes: "Cut the last leg press sets — quads cooked." },
  { name: "Shoulders & Core", durationMin: 45, muscle: "Shoulders", exerciseIds: ["ohp", "latraise", "revfly", "hlr", "pallof"], volume: 5880, topSet: "OHP 52.5 kg × 5", avgRpe: 7.2 },
  { name: "Calisthenics Skills", durationMin: 40, muscle: "Core", exerciseIds: ["hs", "flever", "dip", "hollow"], volume: 0, topSet: "Front lever tuck 8 s", avgRpe: 6.9 },
  { name: "Zone 2 + Mobility", durationMin: 50, muscle: "Cardio", exerciseIds: ["run"], volume: 0, topSet: "40 min @ 142 bpm", avgRpe: 5.5 },
];

const today = new Date("2026-02-19T12:00:00");
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export function fmtDate(isoStr: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(isoStr + "T12:00:00").toLocaleDateString("en-GB", opts);
}
export function relDate(isoStr: string) {
  const diff = Math.round((today.getTime() - new Date(isoStr + "T12:00:00").getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return fmtDate(isoStr);
}

export const historyWorkouts: HistoryWorkout[] = (() => {
  const rnd = seeded(7);
  const offsets = [1, 3, 5, 7, 9, 11, 13, 15, 17, 20, 22, 24, 27, 29, 31, 34, 36, 38, 41, 43, 45, 48, 50, 52, 55, 57, 59, 62, 64, 66];
  return offsets.map((off, i) => {
    const t = templates[i % templates.length];
    const d = new Date(today); d.setDate(today.getDate() - off);
    const drift = 1 - Math.min(0.2, off / 400) + (rnd() - 0.5) * 0.06;
    return { ...t, id: `w${i + 1}`, dateISO: iso(d), volume: Math.round(t.volume * drift / 10) * 10, durationMin: t.durationMin + Math.round((rnd() - 0.5) * 8) };
  });
})();

export interface DetailSet { set: number; reps: number; weight: number; rpe: number; done: boolean; }
export function detailSets(exId: string, seed: number): DetailSet[] {
  const rnd = seeded(seed);
  const base: Record<string, [number, number]> = { bench: [82.5, 5], incdb: [30, 10], fly: [17.5, 12], skull: [30, 10], pushdown: [27.5, 12], pullup: [12.5, 6], row: [90, 8], latpd: [65, 10], facepull: [22.5, 15], curl: [14, 10], squat: [120, 5], rdl: [110, 8], bss: [22, 10], legpress: [180, 12], calf: [90, 15], ohp: [52.5, 5], latraise: [10, 15], revfly: [12.5, 15], hlr: [0, 12], pallof: [15, 12], hs: [0, 30], flever: [0, 8], dip: [0, 10], hollow: [0, 40], run: [0, 40] };
  const [w, r] = base[exId] ?? [20, 10];
  const n = 4;
  return Array.from({ length: n }, (_, i) => ({ set: i + 1, reps: Math.max(1, r - (i > 2 ? 1 : 0)), weight: w, rpe: Math.min(10, Math.round((6.5 + i * 0.6 + rnd() * 0.6) * 2) / 2), done: !(i === n - 1 && rnd() < 0.2) }));
}

/* ----------------------------------------------------------- progress data */
export function bodyWeightSeries(points: number, stepDays: number) {
  const rnd = seeded(11);
  const out: { label: string; value: number }[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i * stepDays);
    const trend = 74.5 + (i * stepDays) / 60 * 1.1;
    out.push({ label: fmtDate(iso(d)), value: Math.round((trend + (rnd() - 0.5) * 0.7) * 10) / 10 });
  }
  return out;
}

export const strengthExercises = [
  { id: "bench", name: "Barbell Bench Press", start: 70, end: 82.5, reps: 5 },
  { id: "squat", name: "Back Squat", start: 100, end: 120, reps: 5 },
  { id: "row", name: "Barbell Row", start: 75, end: 90, reps: 8 },
  { id: "ohp", name: "Standing Overhead Press", start: 45, end: 52.5, reps: 5 },
  { id: "pullup", name: "Weighted Pull-up", start: 5, end: 12.5, reps: 6 },
];
export function strengthSeries(exId: string, points: number) {
  const ex = strengthExercises.find((e) => e.id === exId) ?? strengthExercises[0];
  const rnd = seeded(exId.length * 13 + points);
  const labels: string[] = [], e1rm: number[] = [], vol: number[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i * Math.max(3, Math.round(84 / points)));
    const w = ex.start + (ex.end - ex.start) * (1 - i / (points - 1)) + (rnd() - 0.5) * 2;
    labels.push(fmtDate(iso(d)));
    e1rm.push(Math.round(w * (1 + ex.reps / 30) * 2) / 2);
    vol.push(Math.round(w * ex.reps * (4 + Math.round(rnd() * 2)) / 10) * 10);
  }
  return { labels, e1rm, vol };
}

export const personalRecords = [
  { exercise: "Back Squat", value: "120 kg × 5", e1rm: 140, date: "2026-02-14", delta: "+5 kg", muscle: "Legs" as MuscleGroup },
  { exercise: "Barbell Row", value: "90 kg × 8", e1rm: 114, date: "2026-02-16", delta: "+2.5 kg", muscle: "Back" as MuscleGroup },
  { exercise: "Barbell Bench Press", value: "82.5 kg × 5", e1rm: 96, date: "2026-02-18", delta: "+2.5 kg", muscle: "Chest" as MuscleGroup },
  { exercise: "Weighted Pull-up", value: "+12.5 kg × 6", e1rm: 0, date: "2026-02-16", delta: "+2.5 kg", muscle: "Back" as MuscleGroup },
  { exercise: "Standing Overhead Press", value: "52.5 kg × 5", e1rm: 61, date: "2026-02-12", delta: "+2.5 kg", muscle: "Shoulders" as MuscleGroup },
  { exercise: "Front Lever Tuck", value: "8 s hold", e1rm: 0, date: "2026-02-10", delta: "+2 s", muscle: "Core" as MuscleGroup },
];

export const heatmapDays: number[] = (() => {
  const rnd = seeded(3);
  return Array.from({ length: 52 * 7 }, (_, i) => {
    const dow = i % 7;
    const p = dow === 6 ? 0.1 : dow === 5 ? 0.35 : 0.62;
    const r = rnd();
    return r < p ? (r < p * 0.15 ? 2 : 1) : 0;
  });
})();

export const muscleDistribution = [
  { label: "Legs", value: 68, color: "var(--primary)" },
  { label: "Back", value: 62, color: "var(--primary-dark)" },
  { label: "Chest", value: 54, color: "var(--primary-soft-2)" },
  { label: "Shoulders", value: 38, color: "#A79DF3" },
  { label: "Core", value: 30, color: "#8577F0" },
  { label: "Arms", value: 24, color: "var(--tag-cyan-fg)" },
];

/* ---------------------------------------------------------- recovery data */
export type SleepQuality = "Poor" | "Fair" | "Good" | "Excellent";
export type GutStatus = "Good" | "Bloated" | "Uncomfortable";
export const qualityScore: Record<SleepQuality, number> = { Poor: 25, Fair: 50, Good: 75, Excellent: 100 };
export const gutScore: Record<GutStatus, number> = { Good: 85, Bloated: 55, Uncomfortable: 30 };
export function recoveryScore(sleepH: number, quality: SleepQuality, stress: number, gut: GutStatus) {
  const sleep = Math.min(1, sleepH / 8) * 100;
  const s = 0.4 * sleep + 0.3 * qualityScore[quality] + 0.2 * (10 - stress) * 10 + 0.1 * gutScore[gut];
  return Math.round(s);
}
export const recoveryHistory = (() => {
  const rnd = seeded(21);
  const q: SleepQuality[] = ["Poor", "Fair", "Good", "Excellent"], g: GutStatus[] = ["Good", "Bloated", "Uncomfortable"];
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (13 - i));
    const sleep = Math.round((5.6 + rnd() * 2.9) * 10) / 10;
    const quality = q[Math.min(3, Math.floor((sleep - 5) / 1.05))];
    const stress = Math.max(1, Math.min(9, Math.round(8 - (sleep - 5.6) * 1.6 + (rnd() - 0.5) * 3)));
    const gut = g[rnd() < 0.7 ? 0 : rnd() < 0.7 ? 1 : 2];
    return { dateISO: iso(d), sleep, quality, stress, gut, score: recoveryScore(sleep, quality, stress, gut) };
  });
})();

/* ----------------------------------------------------------- cognitype */
export type Sound = "Brown noise" | "Pink noise" | "Ambient" | "Rhythmic" | "Silence";
export type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";
export type PassageCategory = "Prose" | "Technical" | "Numeric";
export const sounds: Sound[] = ["Brown noise", "Pink noise", "Ambient", "Rhythmic", "Silence"];
export const timesOfDay: TimeOfDay[] = ["Morning", "Afternoon", "Evening", "Night"];

export const passages: Record<PassageCategory, string[]> = {
  Prose: [
    "The river does not hurry, yet it arrives. Every morning the fog lifts from the water in the same slow way, and the fishermen wait for it without checking their watches.",
    "She kept the letters in a tin box under the stairs, and once a year she read them in order, from the first careful hello to the last hurried goodbye.",
    "A good walk has no destination worth mentioning. The point is the pace, the weather, and the small decision at every corner to keep going.",
  ],
  Technical: [
    "A mutex guards shared state by ensuring that only one thread holds the lock at a time; contention increases latency, so keep critical sections short and predictable.",
    "The cache invalidation strategy uses a write-through policy: every update to the primary store synchronously refreshes the cached entry before the request returns.",
    "Progressive overload requires that training stress rises gradually; increase either load, volume, or density, but rarely all three within the same microcycle.",
  ],
  Numeric: [
    "Order 4471 shipped 12 units at 38.50 each; order 4472 shipped 9 units at 41.25; the combined invoice total came to 833.25 before a 7.5% discount.",
    "Set 1: 82.5 kg x 5 reps, RPE 7.5. Set 2: 82.5 kg x 5, RPE 8. Set 3: 85 kg x 3, RPE 9. Rest intervals were 180, 195 and 210 seconds.",
    "Latitude 51.5074, longitude -0.1278; elevation 11 m; sunrise 07:02, sunset 17:21; mean temperature 6.4 degrees with 63% humidity.",
  ],
};

export interface CogniSession {
  id: string; dateISO: string; timeOfDay: TimeOfDay; sound: Sound; difficulty: 1 | 2 | 3; category: PassageCategory;
  focus: number; attention: number; rhythm: number; accuracy: number; pauseControl: number;
  wpm: number; errorRate: number; meanLatency: number; latencySd: number; pauseEntropy: number; attentionEvents: number; recovery: number; latencies: number[];
}
export const cogniSessions: CogniSession[] = (() => {
  const rnd = seeded(99);
  const cats: PassageCategory[] = ["Prose", "Technical", "Numeric"];
  return Array.from({ length: 18 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (17 - i) * 2 - (rnd() < 0.5 ? 0 : 1));
    const sound = sounds[Math.floor(rnd() * 5)];
    const tod = timesOfDay[Math.floor(rnd() * 4)];
    const diff = (1 + Math.floor(rnd() * 3)) as 1 | 2 | 3;
    const soundBonus = { "Brown noise": 8, "Pink noise": 6, Ambient: 3, Rhythmic: -2, Silence: 0 }[sound];
    const todBonus = { Morning: 6, Afternoon: 1, Evening: -2, Night: -6 }[tod];
    const recovery = Math.round(55 + rnd() * 40);
    const focus = Math.max(35, Math.min(97, Math.round(62 + soundBonus + todBonus + (recovery - 70) * 0.35 + (rnd() - 0.5) * 12)));
    const meanLatency = Math.round(190 - focus * 0.6 + rnd() * 30);
    const latencySd = Math.round(120 - focus * 0.8 + rnd() * 25);
    const errorRate = Math.round(Math.max(0.6, 7 - focus * 0.06 + rnd() * 2) * 10) / 10;
    const attentionEvents = Math.max(0, Math.round(5 - focus * 0.05 + rnd() * 2));
    const lr = seeded(i + 1);
    const latencies = Array.from({ length: 60 }, () => Math.round(meanLatency + (lr() - 0.5) * latencySd * 2.2));
    return {
      id: `c${i + 1}`, dateISO: iso(d), timeOfDay: tod, sound, difficulty: diff, category: cats[Math.floor(rnd() * 3)],
      focus, attention: Math.min(100, focus + 4 - attentionEvents * 3), rhythm: Math.max(30, 100 - latencySd * 0.7), accuracy: Math.round(100 - errorRate * 2.8), pauseControl: Math.max(30, Math.round(focus + (rnd() - 0.5) * 16)),
      wpm: Math.round(48 + focus * 0.3 + (rnd() - 0.5) * 8), errorRate, meanLatency, latencySd, pauseEntropy: Math.round((3.1 - focus * 0.012 + rnd() * 0.3) * 100) / 100, attentionEvents, recovery, latencies,
    };
  });
})();
