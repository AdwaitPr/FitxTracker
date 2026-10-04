"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { Sparkles } from "@/components/auth/sparkles";
import { useThemeMode } from "@/lib/use-theme";
import { Sun, Moon } from "lucide-react";

interface Testimonial {
  q: string;
  n: string;
  r: string;
  s: string;
}

// Anonymized roles and evidence-based claims per Decision 8
const quotes: Testimonial[] = [
  {
    q: "The recovery score stopped me from wrecking my week. I trained on the green days and finally got past my squat plateau.",
    n: "Competitive Powerlifter",
    r: "Strength Athlete · 2 yrs logging",
    s: "+22.5 kg squat",
  },
  {
    q: "CogniType showed my focus tanks after late sessions. I moved high-intensity work earlier and cognitive fatigue plummeted.",
    n: "Software Engineer",
    r: "High-Cognitive Professional",
    s: "Focus 61 → 84",
  },
  {
    q: "It looks calm. That matters at 6 am. Nothing shouts, everything I need is one tap away.",
    n: "Sports Physiotherapist",
    r: "Movement Specialist",
    s: "30-week streak",
  },
];

export interface AuthShellProps {
  title: string;
  sub: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ title, sub, children, footer }: AuthShellProps) {
  const [index, setIndex] = useState(0);
  const { isDark, toggleTheme } = useThemeMode();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((curr) => (curr + 1) % quotes.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const activeQuote = quotes[index];
  const initials = activeQuote.n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1fr_1fr]">
      {/* Left interactive form column */}
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo />
          <IconButton
            icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
            label="Toggle theme"
            onClick={toggleTheme}
          />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="rise w-full max-w-[440px] rounded-hero bg-surface p-7 shadow-soft sm:p-9 border border-hairline/60">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">
              {title}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted">{sub}</p>
            <div className="mt-6">{children}</div>
          </div>
        </main>

        <footer className="text-center text-[13px] text-muted py-2">
          {footer}
        </footer>
      </div>

      {/* Right editorial testimonial aside (hidden on mobile, visible on desktop) */}
      <aside
        aria-label="Athletic testimonials"
        className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <Sparkles />

        <div className="relative">
          <p className="micro text-white">Why athletes stay</p>
        </div>

        <div className="relative max-w-md" aria-live="polite">
          <p
            key={index}
            className="rise text-[28px] font-semibold leading-[1.25] tracking-[-0.02em]"
          >
            “{activeQuote.q}”
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-[13px] font-bold tracking-wider">
              {initials}
            </span>
            <div>
              <p className="text-[14.5px] font-semibold">{activeQuote.n}</p>
              <p className="text-[12.5px] text-white/80">{activeQuote.r}</p>
            </div>
            <Tag tone="violet" className="ml-auto bg-white text-primary font-semibold">
              {activeQuote.s}
            </Tag>
          </div>

          <div className="mt-6 flex gap-1.5">
            {quotes.map((_, k) => (
              <button
                key={k}
                type="button"
                aria-label={`Show testimonial ${k + 1}`}
                onClick={() => setIndex(k)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                  k === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            ["79", "avg recovery"],
            ["3.6", "sessions / wk"],
            ["+12", "focus in 30 d"],
          ].map(([val, label]) => (
            <div
              key={label}
              className="rounded-panel bg-white/12 px-4 py-3 backdrop-blur-[2px]"
            >
              <p className="tnum text-[22px] font-bold leading-none">{val}</p>
              <p className="micro mt-1.5 text-white/80">{label}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
