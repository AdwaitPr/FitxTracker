import { useId, useRef, useState } from "react";
import clsx from "clsx";
import { Icon, MuscleGlyph } from "./icons";
import type { MuscleGlyphName } from "./icons";
import { BarChart, Card, IconButton, Menu, RecoveryGauge, RingProgress, SectionHeading, Segmented, Tag } from "./ui";
import type { Tone } from "./ui";
import {
  quickStats,
  recoveryStates,
  user,
  volumeByMonth,
  volumeByWeek,
  workouts,
} from "./data";
import type { MuscleGroup, RecoveryLevel, RecoveryState, Workout } from "./data";

export const levelMeta: Record<RecoveryLevel, { tone: Tone; color: string }> = {
  optimal: { tone: "green", color: "var(--tag-green-fg)" },
  normal: { tone: "violet", color: "var(--primary)" },
  warning: { tone: "amber", color: "var(--tag-amber-fg)" },
  critical: { tone: "danger", color: "var(--danger)" },
};

const MUSCLE_TONE: Record<MuscleGroup, Tone> = {
  Chest: "pink",
  Back: "cyan",
  Legs: "amber",
  Shoulders: "violet",
  Arms: "violet",
  Core: "green",
  Cardio: "pink",
};

const COVER: Record<MuscleGlyphName, { g1: string; g2: string; m1: string; m2: string }> = {
  Chest: { g1: "#8E7BF0", g2: "#6C5CE1", m1: "#F49BDD", m2: "#B4A9FF" },
  Back: { g1: "#6FB6D9", g2: "#4E7FD6", m1: "#A9E4F0", m2: "#8577F0" },
  Legs: { g1: "#DFA362", g2: "#B9722F", m1: "#FFD79A", m2: "#F49BDD" },
  Shoulders: { g1: "#8577F0", g2: "#5A4BD1", m1: "#7FD3EC", m2: "#C9C3F5" },
  Arms: { g1: "#9B8BF2", g2: "#6C5CE1", m1: "#FFD79A", m2: "#F49BDD" },
  Core: { g1: "#4FBF8B", g2: "#2C8F72", m1: "#A9E4C8", m2: "#8577F0" },
  Cardio: { g1: "#E86F9E", g2: "#A83E78", m1: "#FFD79A", m2: "#B4A9FF" },
};

const scoreColor = (s: number) =>
  s >= 75
    ? "var(--tag-green-fg)"
    : s >= 55
      ? "var(--primary)"
      : s >= 40
        ? "var(--tag-amber-fg)"
        : "var(--danger)";

/* --------------------------------------------------- Dev state switcher */
export function DevSwitcher({
  level,
  onChange,
}: {
  level: RecoveryLevel;
  onChange: (l: RecoveryLevel) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-panel border border-dashed border-hairline px-3 py-2.5">
      <span className="micro mr-1 text-muted">Prototype · recovery state</span>
      {(Object.keys(recoveryStates) as RecoveryLevel[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={level === l}
          className={clsx(
            "rounded-full px-3 py-1.5 text-[11.5px] font-semibold capitalize transition-colors duration-200",
            level === l
              ? "bg-ink text-canvas"
              : "bg-canvas text-muted hover:text-ink"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- HeroBanner */
export function HeroBanner({ state }: { state: RecoveryState }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="rise relative overflow-hidden rounded-hero bg-primary px-6 py-8 text-white shadow-soft sm:px-10 sm:py-11"
      style={{ animationDelay: "40ms" }}
    >
      {/* tone-on-tone decoration */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 900 340"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="streak-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="streak-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="596" y="-40" width="230" height="230" rx="44" fill="#fff" fillOpacity="0.06" />
        <rect x="742" y="120" width="180" height="180" rx="52" fill="#fff" fillOpacity="0.05" />
        <rect x="222" y="42" width="1.4" height="250" fill="url(#streak-v)" />
        <rect x="600" y="246" width="300" height="1.4" fill="url(#streak-h)" />
        <g fill="#C9C3F5">
          <path
            d="M726 32c9 62 33 86 95 95-62 9-86 33-95 95-9-62-33-86-95-95 62-9 86-33 95-95z"
            fillOpacity="0.4"
          />
          <path
            d="M600 176c4 26 14 36 40 40-26 4-36 14-40 40-4-26-14-36-40-40 26-4 36-14 40-40z"
            fillOpacity="0.3"
          />
          <path
            d="M812 214c3 20 10 27 30 30-20 3-27 10-30 30-3-20-10-27-30-30 20-3 27-10 30-30z"
            fillOpacity="0.26"
          />
          <path
            d="M528 62c2 15 8 21 23 23-15 2-21 8-23 23-2-15-8-21-23-23 15-2 21-8 23-23z"
            fillOpacity="0.22"
          />
        </g>
      </svg>

      <div className="relative max-w-[30rem]">
        <p className="micro text-white">{state.eyebrow}</p>
        <h1
          id="hero-title"
          className="mt-4 text-[25px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[32px] lg:text-[38px]"
        >
          <span className="block">{state.headline[0]}</span>
          <span className="block">{state.headline[1]}</span>
        </h1>
        <p className="mt-4 max-w-[27rem] text-[14.5px] leading-relaxed text-white/95">
          {state.sub}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <a
            href="#/workouts/new"
            className="group inline-flex items-center gap-3 rounded-full bg-[#0F0F14] py-1.5 pl-6 pr-1.5 text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            {state.cta}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#0F0F14] transition-transform duration-200 group-hover:translate-x-0.5">
              <Icon name="arrowRight" size={17} strokeWidth={1.8} />
            </span>
          </a>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-[12px] font-semibold text-white">
            <Icon name="zap" size={14} strokeWidth={1.8} />
            {state.verdict}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ StatChip */
function StatChip({ stat, index }: { stat: (typeof quickStats)[number]; index: number }) {
  return (
    <article
      className="rise lift flex items-center gap-3.5 rounded-card bg-surface p-4 shadow-soft"
      style={{ animationDelay: `${120 + index * 60}ms` }}
    >
      <span
        style={{
          background: `var(--tag-${stat.tone}-bg)`,
          color: `var(--tag-${stat.tone}-fg)`,
        }}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-tag"
      >
        <Icon name={stat.icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="micro truncate text-muted">{stat.label}</p>
        <p className="tnum mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[20px] font-bold leading-none tracking-[-0.02em] text-ink">
            {stat.value}
          </span>
          <span className="truncate text-[11.5px] font-medium text-muted">{stat.unit}</span>
        </p>
        <p className="mt-1 truncate text-[11.5px] text-muted">{stat.caption}</p>
      </div>
      <Menu label={`Options for ${stat.label}`} items={MENU_ITEMS} />
    </article>
  );
}

const MENU_ITEMS = [
  { label: "View", icon: "eye" as const },
  { label: "Duplicate", icon: "copy" as const },
  { label: "Delete", icon: "trash" as const, tone: "danger" as const },
];

export function StatChipRow() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {quickStats.map((s, i) => (
        <StatChip key={s.id} stat={s} index={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------- WorkoutCover */
function WorkoutCover({ muscle }: { muscle: MuscleGroup }) {
  const uid = useId().replace(/:/g, "");
  const p = COVER[muscle];
  return (
    <svg viewBox="0 0 320 170" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.g1} />
          <stop offset="100%" stopColor={p.g2} />
        </linearGradient>
        <filter id={`b${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      <rect width="320" height="170" fill={`url(#g${uid})`} />
      <g filter={`url(#b${uid})`}>
        <circle cx="52" cy="34" r="76" fill={p.m1} opacity="0.55" />
        <circle cx="286" cy="150" r="96" fill={p.m2} opacity="0.5" />
        <circle cx="196" cy="18" r="52" fill={p.m1} opacity="0.3" />
      </g>
      <g stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1">
        <path d="M0 42h320M0 128h320M96 0v170M236 0v170" />
      </g>
      <rect x="18" y="18" width="284" height="134" rx="26" fill="none" stroke="#fff" strokeOpacity="0.18" />
      <g transform="translate(112 36) scale(0.98)" color="#ffffff" opacity="0.62">
        <MuscleGlyph name={muscle} className="h-[98px] w-[98px]" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- WorkoutCard */
function WorkoutCard({
  workout,
  index,
  fav,
  onFav,
}: {
  workout: Workout;
  index: number;
  fav: boolean;
  onFav: () => void;
}) {
  const pct = Math.round((workout.setsDone / workout.setsTotal) * 100);
  return (
    <article
      className="rise lift flex w-[288px] shrink-0 snap-start flex-col rounded-card bg-surface p-3.5 shadow-soft sm:w-[326px]"
      style={{ animationDelay: `${160 + index * 60}ms` }}
    >
      <div className="relative h-[150px] overflow-hidden rounded-[20px]">
        <WorkoutCover muscle={workout.muscle} />
        <button
          type="button"
          onClick={onFav}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/25 text-white transition-colors duration-200 hover:bg-white/50"
        >
          {fav ? (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20.2s-6.8-4.2-6.8-9A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 6.8 2.6c0 4.8-6.8 9-6.8 9z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <Icon name="heart" size={17} strokeWidth={1.7} />
          )}
        </button>
        <span className="absolute bottom-3 left-3">
          <Tag tone={MUSCLE_TONE[workout.muscle]}>{workout.muscle}</Tag>
        </span>
      </div>

      <h3 className="mt-4 min-h-[2.6rem] text-[16.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
        {workout.name}
      </h3>
      <p className="tnum mt-1.5 text-[12.5px] text-muted">
        {workout.date} · {workout.durationMin} min · {workout.exercises.length} exercises
      </p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="micro text-muted">Sets completed</span>
          <span className="tnum text-[12px] font-semibold text-ink-soft">
            {workout.setsDone}/{workout.setsTotal}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${workout.name}: ${pct}% of sets completed`}
          className="mt-2 h-[6px] overflow-hidden rounded-full bg-hairline"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${pct}%`, transition: "width 700ms cubic-bezier(.2,.8,.2,1)" }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-dashed border-hairline pt-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-canvas text-muted">
          <Icon name="dumbbell" size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-ink">
            {workout.topExercise}
          </span>
          <span className="micro block text-muted">Top lift</span>
        </span>
        <span className="tnum shrink-0 text-right text-[12.5px] font-bold text-ink">
          {workout.volume}
          <span className="micro block font-semibold text-muted">Volume</span>
        </span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------- RecentWorkouts */
export function RecentWorkouts({
  favs,
  onFav,
}: {
  favs: Record<string, boolean>;
  onFav: (id: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    rail.current?.scrollBy({ left: dir * 348, behavior: "smooth" });

  return (
    <section id="recent-workouts" aria-labelledby="recent-title" className="mt-9">
      <SectionHeading id="recent-title" title="Recent Workouts">
        <div className="flex items-center gap-2">
          <IconButton icon="chevronLeft" label="Scroll to previous workouts" variant="outline" onClick={() => scroll(-1)} />
          <IconButton icon="chevronRight" label="Scroll to next workouts" variant="solid" onClick={() => scroll(1)} />
        </div>
      </SectionHeading>

      <div
        ref={rail}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 pt-1"
      >
        {workouts.map((w, i) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            index={i}
            fav={!!favs[w.id]}
            onFav={() => onFav(w.id)}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------- WorkoutTable */
export function WorkoutTable() {
  return (
    <section id="workout-log" aria-labelledby="log-title" className="mt-9">
      <SectionHeading id="log-title" title="Workout Log">
        <a
          href="#/workouts/history"
          className="text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
        >
          See all
        </a>
      </SectionHeading>

      <Card className="px-5 py-4 sm:px-6">
        {/* header */}
        <div className="micro hidden grid-cols-[1.7fr_0.9fr_0.8fr_0.6fr_auto] gap-4 px-1 pb-3 text-muted md:grid">
          <span>Workout</span>
          <span>Muscle group</span>
          <span>Date</span>
          <span>Duration</span>
          <span className="w-11 text-right">Action</span>
        </div>

        <ul>
          {workouts.map((w) => (
            <li key={w.id}>
              {/* desktop row */}
              <div className="hidden grid-cols-[1.7fr_0.9fr_0.8fr_0.6fr_auto] items-center gap-4 border-t border-dashed border-hairline py-3.5 md:grid">
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-semibold text-ink">{w.name}</p>
                  <p className="truncate text-[12px] text-muted">{w.topExercise}</p>
                </div>
                <div>
                  <Tag tone={MUSCLE_TONE[w.muscle]}>{w.muscle}</Tag>
                </div>
                <p className="tnum text-[13.5px] text-ink-soft">{w.date}</p>
                <p className="tnum text-[13.5px] text-ink-soft">{w.durationMin} min</p>
                <a
                  href={`#/workouts/${w.id}`}
                  aria-label={`Open ${w.name}`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-ink-soft transition-colors duration-200 hover:border-primary hover:text-primary"
                >
                  <Icon name="arrowRight" size={17} />
                </a>
              </div>

              {/* mobile stacked card */}
              <div className="border-t border-dashed border-hairline py-4 md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold leading-snug text-ink">{w.name}</p>
                    <p className="tnum mt-1 text-[12.5px] text-muted">
                      {w.date} · {w.durationMin} min
                    </p>
                  </div>
                  <a
                    href={`#/workouts/${w.id}`}
                    aria-label={`Open ${w.name}`}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairline text-ink-soft"
                  >
                    <Icon name="arrowRight" size={17} />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Tag tone={MUSCLE_TONE[w.muscle]}>{w.muscle}</Tag>
                  <span className="tnum text-[12px] text-muted">
                    {w.setsDone}/{w.setsTotal} sets · {w.volume}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------- Statistic rail */
export function StatisticCard({ level }: { level: RecoveryLevel }) {
  const [range, setRange] = useState("week");
  const data = range === "week" ? volumeByWeek : volumeByMonth;
  const ticks = range === "week" ? [20, 40, 60] : [40, 80, 120];
  const unit = "thousand kg";
  const total = data.reduce((s, d) => s + d.value, 0).toFixed(1);
  const goalPct = user.weeklyGoalDone / user.weeklyGoalTotal;
  const meta = levelMeta[level];
  const summary = `Training volume, last five ${range === "week" ? "weeks" : "months"}: ${data
    .map((d) => `${d.label} ${d.value} thousand kg`)
    .join(", ")}.`;

  return (
    <Card className="rise p-5" as="article">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Statistic</h2>
        <Menu label="Statistic options" items={MENU_ITEMS} />
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <RingProgress
          value={goalPct}
          size={152}
          stroke={6}
          color={meta.color}
          label={`Weekly goal: ${user.weeklyGoalDone} of ${user.weeklyGoalTotal} sessions`}
          badge={`${Math.round(goalPct * 100)}%`}
        >
          <span className="grid h-[104px] w-[104px] place-items-center rounded-full bg-primary-soft text-[30px] font-bold tracking-[-0.02em] text-primary">
            {user.initials}
          </span>
        </RingProgress>
        <p className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-ink">
          Good Morning, {user.firstName} 🔥
        </p>
        <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{user.streakLine}</p>
      </div>

      <div className="mt-5 rounded-panel bg-inset p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="micro min-w-0 truncate text-muted">Volume · &rsquo;000 kg</p>
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
        <BarChart data={data} ticks={ticks} unit={unit} summary={summary} />
        <p className="micro mt-1 text-right text-muted">
          {range === "week" ? "5-week" : "5-month"} total {total}k kg
        </p>
      </div>
    </Card>
  );
}

export function RecoveryCard({ state }: { state: RecoveryState }) {
  const meta = levelMeta[state.level];
  return (
    <Card className="rise p-5" as="article">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Today&rsquo;s Recovery
        </h2>
        <button
          type="button"
          className="rounded-full border border-hairline px-3.5 py-1.5 text-[12px] font-semibold text-ink-soft transition-colors duration-200 hover:border-primary hover:text-primary"
        >
          Log
        </button>
      </div>

      <div className="mt-5">
        <RecoveryGauge score={state.score} color={meta.color} caption={state.verdict} />
      </div>

      <ul className="mt-5 space-y-3.5">
        {state.factors.map((f) => (
          <li key={f.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-medium text-ink-soft">{f.label}</span>
              <span className="tnum text-[12.5px] font-semibold text-ink">{f.value}</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={f.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${f.label}: ${f.value} (${f.detail}), ${f.score} of 100`}
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

      <a
        href="#/recovery"
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-soft text-[13.5px] font-semibold text-primary transition-colors duration-200 hover:bg-primary-soft-2 hover:text-primary-dark"
      >
        Open Recovery
        <Icon name="arrowUpRight" size={16} strokeWidth={1.8} />
      </a>
    </Card>
  );
}
