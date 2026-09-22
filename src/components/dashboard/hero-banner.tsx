import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export interface HeroBannerProps {
  level?: "optimal" | "normal" | "warning" | "critical" | null;
}

export const HERO_VARIANTS: Record<
  "optimal" | "normal" | "warning" | "critical",
  {
    eyebrow: string;
    headline: [string, string];
    sub: string;
    cta: string;
    verdict: string;
  }
> = {
  optimal: {
    eyebrow: "Optimal Recovery · Ready to Train",
    headline: ["Great recovery —", "push for PRs today!"],
    sub: "All recovery factors are high. Ideal session to increase load, test an e1RM, or tackle a high-volume workout.",
    cta: "Log Workout",
    verdict: "High Intensity",
  },
  normal: {
    eyebrow: "Moderate Recovery · Training On Track",
    headline: ["Moderate recovery —", "train as planned"],
    sub: "Your body is sufficiently recovered for your planned progression. Maintain working sets and standard rest times.",
    cta: "Log Workout",
    verdict: "Moderate Intensity",
  },
  warning: {
    eyebrow: "Low Recovery · Reduce Load",
    headline: ["Low recovery —", "reduce volume by 30%"],
    sub: "Sleep or stress metrics are suppressed. Dial back volume, skip failure sets, and focus on clean movement quality.",
    cta: "Log Light Session",
    verdict: "Light Intensity",
  },
  critical: {
    eyebrow: "Suppressed Recovery · Active Rest Recommended",
    headline: ["Recovery depleted —", "rest or light mobility"],
    sub: "Critical recovery deficit detected. Heavy loading increases injury risk. Prioritise sleep, hydration, and gentle walking.",
    cta: "Log Mobility",
    verdict: "Rest Recommended",
  },
};

const DEFAULT_VARIANT = {
  eyebrow: "Welcome Back · Ready to Train",
  headline: ["Track your workouts —", "build consistent strength"] as [string, string],
  sub: "Log today's exercises, track your volume and reps, and monitor recovery baselines for steady progression.",
  cta: "Start Workout",
  verdict: "Ready to Train",
};

export function HeroBanner({ level }: HeroBannerProps) {
  const content = (level && HERO_VARIANTS[level]) || DEFAULT_VARIANT;

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="rise relative overflow-hidden rounded-hero bg-primary px-6 py-8 text-white shadow-soft sm:px-10 sm:py-11"
      style={{ animationDelay: "40ms" }}
    >
      {/* Tone-on-tone decoration */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
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
        <rect
          x="596"
          y="-40"
          width="230"
          height="230"
          rx="44"
          fill="#fff"
          fillOpacity="0.06"
        />
        <rect
          x="742"
          y="120"
          width="180"
          height="180"
          rx="52"
          fill="#fff"
          fillOpacity="0.05"
        />
        <rect
          x="222"
          y="42"
          width="1.4"
          height="250"
          fill="url(#streak-v)"
        />
        <rect
          x="600"
          y="246"
          width="300"
          height="1.4"
          fill="url(#streak-h)"
        />
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
        <p className="micro text-white/90">{content.eyebrow}</p>
        <h1
          id="hero-title"
          className="mt-4 text-[25px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[32px] lg:text-[38px]"
        >
          <span className="block">{content.headline[0]}</span>
          <span className="block">{content.headline[1]}</span>
        </h1>
        <p className="mt-4 max-w-[27rem] text-[14.5px] leading-relaxed text-white/95">
          {content.sub}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href="/workouts/new"
            className="group inline-flex items-center gap-3 rounded-full bg-[#0F0F14] py-1.5 pl-6 pr-1.5 text-[14.5px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            {content.cta}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#0F0F14] transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight size={17} strokeWidth={1.8} />
            </span>
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-[12px] font-semibold text-white">
            <Zap size={14} strokeWidth={1.8} />
            {content.verdict}
          </span>
        </div>
      </div>
    </section>
  );
}
