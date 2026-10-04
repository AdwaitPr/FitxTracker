"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Sparkles as SparklesDecor } from "@/components/auth/sparkles";
import { DashboardMock } from "@/components/landing/dashboard-mock";
import { useThemeMode } from "@/lib/use-theme";
import {
  Dumbbell,
  Activity,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

interface FeatureItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "violet" | "green" | "cyan" | "pink" | "amber";
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: Dumbbell,
    tone: "violet",
    title: "Log sets in seconds",
    description:
      "Editable grid, one-tap complete, rest timer that follows you, copy-previous-set.",
  },
  {
    icon: Activity,
    tone: "green",
    title: "Recovery-led intensity",
    description:
      "Sleep, stress and gut roll into one score that tells you whether to push or pull back.",
  },
  {
    icon: TrendingUp,
    tone: "cyan",
    title: "Progress you can see",
    description:
      "e1RM curves, volume bars, PR list, and a year-long frequency heatmap.",
  },
  {
    icon: Sparkles,
    tone: "pink",
    title: "CogniType focus tests",
    description:
      "60-second typing passages measure attention stability and how it tracks recovery.",
  },
  {
    icon: ShieldCheck,
    tone: "amber",
    title: "Private by default",
    description:
      "Your data lives in your own PostgreSQL database. Export anytime, delete instantly.",
  },
  {
    icon: Moon,
    tone: "violet",
    title: "Calm dark theme",
    description:
      "Same layout, softer light. Built for late sessions and early mornings.",
  },
];

// Replaced unverifiable metrics with evidence-based non-numeric claims per Decision 8
const principles = [
  {
    icon: Sparkles,
    title: "Pure Focus",
    subtitle: "Zero ads, zero social feeds, zero vanity metrics. Built purely for training.",
  },
  {
    icon: Dumbbell,
    title: "Science-Led",
    subtitle: "RPE pacing, e1RM progression curves, volume load, and autonomic recovery scores.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Default",
    subtitle: "Your data stays yours with zero third-party tracking and full export capability.",
  },
];

export function LandingClient() {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />

        <nav
          aria-label="Marketing"
          className="hidden items-center gap-7 text-[14px] font-medium text-ink-soft md:flex"
        >
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#preview" className="hover:text-ink transition-colors">
            Preview
          </a>
          <a href="#values" className="hover:text-ink transition-colors">
            Principles
          </a>
          <Link href="/cognitype" className="hover:text-ink transition-colors">
            CogniType
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <IconButton
            icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
            label="Toggle theme"
            onClick={toggleTheme}
          />
          <Link
            href="/login"
            className="hidden h-11 items-center rounded-full px-4 text-[14px] font-semibold text-ink-soft hover:bg-surface hover:text-ink transition-colors sm:inline-flex"
          >
            Log in
          </Link>
          <Link href="/register">
            <Button arrow>Get started</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-5 pt-4">
          <div className="rise relative overflow-hidden rounded-hero bg-primary px-6 py-14 text-white shadow-soft sm:px-14 sm:py-20">
            <SparklesDecor />

            <div className="relative max-w-[36rem]">
              <p className="micro text-white/90">Training · Recovery · Focus</p>
              <h1 className="mt-4 text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[56px]">
                Train hard on the days your body says&nbsp;yes.
              </h1>
              <p className="mt-5 max-w-[30rem] text-[15.5px] leading-relaxed text-white/90">
                FitxTracker joins your workout log, a daily recovery score and a
                cognitive focus test into one calm dashboard — so intensity is a
                decision, not a guess.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#0F0F14] py-1.5 pl-6 pr-1.5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start free
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0F0F14] transition-transform group-hover:translate-x-0.5">
                    <ArrowRight size={18} strokeWidth={2} />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white/15 px-5 text-[14px] font-semibold text-white hover:bg-white/25 transition-colors"
                >
                  Sign in to dashboard <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="relative mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["79", "Recovery today"],
                ["3 / 4", "Weekly sessions"],
                ["+12", "Focus trend"],
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
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-6xl px-5 pt-16 scroll-mt-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="micro text-muted">What&apos;s inside</p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
              One dashboard, three signals
            </h2>
            <p className="mt-3 text-[14.5px] text-muted">
              Everything in the product is built from the same tokens: soft surfaces,
              dashed hairlines, indigo accents.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const IconComp = f.icon;
              return (
                <article
                  key={f.title}
                  className="rise lift rounded-card bg-surface p-6 shadow-soft border border-hairline/60"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-tag"
                    style={{
                      background: `var(--tag-${f.tone}-bg)`,
                      color: `var(--tag-${f.tone}-fg)`,
                    }}
                  >
                    <IconComp size={22} />
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                    {f.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Preview Section */}
        <section id="preview" className="mx-auto max-w-6xl px-5 pt-16 scroll-mt-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="micro text-muted">Preview</p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
              The new dashboard
            </h2>
          </div>

          <div className="mt-8">
            <DashboardMock />
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/register">
              <Button size="lg" arrow>
                Get started
              </Button>
            </Link>
          </div>
        </section>

        {/* Principles / Values Section (Decision 8 compliant) */}
        <section id="values" className="mx-auto max-w-6xl px-5 py-16 scroll-mt-6">
          <div className="grid gap-4 rounded-hero bg-surface p-8 shadow-soft border border-hairline/60 sm:grid-cols-3">
            {principles.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <IconComp size={22} />
                  </span>
                  <div>
                    <p className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-[12.5px] text-muted sm:flex-row">
          <Logo compact />
          <p>© 2026 FitxTracker. Built with care, not hype.</p>
          <div className="flex gap-5 font-medium">
            <a href="#features" className="hover:text-ink transition-colors">
              Features
            </a>
            <Link href="/cognitype" className="hover:text-ink transition-colors">
              CogniType
            </Link>
            <Link href="/login" className="hover:text-ink transition-colors">
              Log in
            </Link>
            <Link href="/register" className="hover:text-ink transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
