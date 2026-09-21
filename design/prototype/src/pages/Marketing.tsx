import { useEffect, useState } from "react";
import clsx from "clsx";
import { Logo, useTheme } from "../chrome";
import { Icon } from "../icons";
import type { IconName } from "../icons";
import { IconButton, RingProgress, Tag } from "../ui";
import { Button, Input, Select } from "../forms";
import { Link, navigate } from "../router";

/* ------------------------------------------------------ Sparkle decor */
function Sparkles({ className = "" }: { className?: string }) {
  return (
    <svg className={clsx("pointer-events-none absolute inset-0 h-full w-full", className)} viewBox="0 0 900 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="mk-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      <rect x="640" y="-60" width="260" height="260" rx="52" fill="#fff" fillOpacity=".06" />
      <rect x="760" y="230" width="220" height="220" rx="60" fill="#fff" fillOpacity=".05" />
      <rect x="180" y="60" width="1.4" height="320" fill="url(#mk-v)" />
      <g fill="#C9C3F5"><path d="M740 60c10 70 37 97 107 107-70 10-97 37-107 107-10-70-37-97-107-107 70-10 97-37 107-107z" fillOpacity=".42" /><path d="M600 300c4 28 15 39 43 43-28 4-39 15-43 43-4-28-15-39-43-43 28-4 39-15 43-43z" fillOpacity=".3" /><path d="M840 380c3 20 10 27 30 30-20 3-27 10-30 30-3-20-10-27-30-30 20-3 27-10 30-30z" fillOpacity=".26" /><path d="M520 90c2 15 8 21 23 23-15 2-21 8-23 23-2-15-8-21-23-23 15-2 21-8 23-23z" fillOpacity=".22" /></g>
    </svg>
  );
}

/* ------------------------------------------------- dashboard mock (CSS) */
function DashboardMock() {
  const bar = (w: string, c = "bg-hairline") => <span className={clsx("block h-2 rounded-full", c)} style={{ width: w }} />;
  return (
    <div className="rise mx-auto w-full max-w-4xl overflow-hidden rounded-[24px] bg-frame p-2 shadow-window" aria-label="Preview of the FitxTracker dashboard" role="img">
      <div className="flex overflow-hidden rounded-[18px] bg-canvas">
        <div className="hidden w-40 shrink-0 space-y-3 bg-surface p-4 sm:block">
          <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-primary" />{bar("50%", "bg-ink/70")}</div>
          <div className="pt-3 space-y-2.5">{[["60%", true], ["45%"], ["55%"], ["50%"], ["40%"], ["48%"]].map(([w, a], i) => <div key={i} className="flex items-center gap-2"><span className={clsx("h-4 w-4 rounded-md", a ? "bg-primary-soft" : "bg-hairline")} />{bar(w as string, a ? "bg-ink/60" : undefined)}</div>)}</div>
        </div>
        <div className="min-w-0 flex-1 space-y-3 p-4">
          <div className="flex items-center gap-2"><span className="h-6 flex-1 rounded-full border border-hairline bg-surface" /><span className="h-6 w-6 rounded-full border border-hairline bg-surface" /><span className="h-6 w-6 rounded-full bg-primary-soft" /></div>
          <div className="relative overflow-hidden rounded-[16px] bg-primary p-4"><Sparkles /><div className="relative space-y-2">{bar("20%", "bg-white/50")}<span className="block h-3 w-3/5 rounded-full bg-white" /><span className="block h-3 w-2/5 rounded-full bg-white" /><span className="mt-2 inline-block h-6 w-24 rounded-full bg-[#0F0F14]" /></div></div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{["violet", "cyan", "pink", "amber"].map((t) => <div key={t} className="flex items-center gap-2 rounded-[12px] bg-surface p-2.5"><span className="h-7 w-7 rounded-lg" style={{ background: `var(--tag-${t}-bg)` }} /><span className="flex-1 space-y-1.5">{bar("70%")}{bar("45%", "bg-ink/60")}</span></div>)}</div>
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="rounded-[12px] bg-surface p-2"><span className={clsx("block h-12 rounded-[8px]", i === 0 ? "bg-primary-soft-2" : i === 1 ? "bg-tag-cyan-bg" : "bg-tag-pink-bg")} /><span className="mt-2 block space-y-1.5">{bar("80%", "bg-ink/60")}{bar("50%")}<span className="block h-1 w-full rounded-full bg-hairline"><span className="block h-1 w-2/3 rounded-full bg-primary" /></span></span></div>)}</div>
        </div>
        <div className="hidden w-44 shrink-0 space-y-3 border-l border-hairline p-4 lg:block">
          <div className="rounded-[14px] bg-surface p-3"><div className="mx-auto h-16 w-16 rounded-full border-4 border-primary-soft" style={{ borderTopColor: "var(--primary)", borderRightColor: "var(--primary)" }} /><div className="mt-3 space-y-1.5">{bar("70%", "bg-ink/60")}{bar("50%")}</div><div className="mt-3 flex h-12 items-end gap-1.5">{[40, 70, 50, 90, 60].map((h, i) => <span key={i} className={clsx("flex-1 rounded-t-full", i % 2 ? "bg-primary" : "bg-primary-soft-2")} style={{ height: `${h}%` }} />)}</div></div>
          <div className="rounded-[14px] bg-surface p-3 space-y-2">{bar("60%", "bg-ink/60")}{[80, 60, 45, 70].map((w, i) => <span key={i} className="block h-1.5 rounded-full bg-hairline"><span className="block h-1.5 rounded-full bg-primary" style={{ width: `${w}%` }} /></span>)}<span className="block h-6 rounded-full bg-primary-soft" /></div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Landing */
export function Landing() {
  const { dark, toggle } = useTheme();
  const features: { icon: IconName; tone: string; t: string; d: string }[] = [
    { icon: "dumbbell", tone: "violet", t: "Log sets in seconds", d: "Editable grid, one-tap complete, rest timer that follows you, copy-previous-set." },
    { icon: "pulse", tone: "green", t: "Recovery-led intensity", d: "Sleep, stress and gut roll into one score that tells you whether to push or pull back." },
    { icon: "trend", tone: "cyan", t: "Progress you can see", d: "e1RM curves, volume bars, PR list, and a year-long frequency heatmap." },
    { icon: "sparkle", tone: "pink", t: "CogniType focus tests", d: "60-second typing passages measure attention stability and how it tracks recovery." },
    { icon: "shield", tone: "amber", t: "Private by default", d: "Your data lives in your own SQLite database. Export anytime, delete instantly." },
    { icon: "moon", tone: "violet", t: "Calm dark theme", d: "Same layout, softer light. Built for late sessions and early mornings." },
  ];
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav aria-label="Marketing" className="hidden items-center gap-7 text-[14px] font-medium text-ink-soft md:flex">
          <a href="#features" className="hover:text-ink">Features</a><a href="#preview" className="hover:text-ink">Preview</a><Link to="/cognitype" className="hover:text-ink">CogniType</Link>
        </nav>
        <div className="flex items-center gap-2">
          <IconButton icon={dark ? "sun" : "moon"} label="Toggle theme" onClick={toggle} />
          <Link to="/login" className="hidden h-11 items-center rounded-full px-4 text-[14px] font-semibold text-ink-soft hover:bg-surface sm:inline-flex">Log in</Link>
          <Button arrow onClick={() => navigate("/register")}>Get started</Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-4">
          <div className="rise relative overflow-hidden rounded-hero bg-primary px-6 py-14 text-white shadow-soft sm:px-14 sm:py-20">
            <Sparkles />
            <div className="relative max-w-[36rem]">
              <p className="micro text-white">Training · Recovery · Focus</p>
              <h1 className="mt-4 text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[56px]">Train hard on the days your body says&nbsp;yes.</h1>
              <p className="mt-5 max-w-[30rem] text-[15.5px] leading-relaxed text-white/90">FitxTracker joins your workout log, a daily recovery score and a cognitive focus test into one calm dashboard — so intensity is a decision, not a guess.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#/register" className="group inline-flex items-center gap-3 rounded-full bg-[#0F0F14] py-1.5 pl-6 pr-1.5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5">Start free<span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0F0F14] transition-transform group-hover:translate-x-0.5"><Icon name="arrowRight" size={18} strokeWidth={1.8} /></span></a>
                <Link to="/dashboard" className="inline-flex h-12 items-center gap-2 rounded-full bg-white/15 px-5 text-[14px] font-semibold text-white hover:bg-white/25">Open live demo <Icon name="arrowUpRight" size={16} /></Link>
              </div>
            </div>
            <div className="relative mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[["79", "Recovery today"], ["3 / 4", "Weekly sessions"], ["+12", "Focus trend"]].map(([v, l]) => <div key={l} className="rounded-panel bg-white/12 px-4 py-3"><p className="tnum text-[22px] font-bold leading-none">{v}</p><p className="micro mt-1.5 text-white/80">{l}</p></div>)}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 pt-16">
          <div className="mx-auto max-w-xl text-center"><p className="micro text-muted">What's inside</p><h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">One dashboard, three signals</h2><p className="mt-3 text-[14.5px] text-muted">Everything in the product is built from the same tokens: soft surfaces, dashed hairlines, indigo accents.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <article key={f.t} className="rise lift rounded-card bg-surface p-6 shadow-soft" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="grid h-12 w-12 place-items-center rounded-tag" style={{ background: `var(--tag-${f.tone}-bg)`, color: `var(--tag-${f.tone}-fg)` }}><Icon name={f.icon} size={22} /></span>
                <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-ink">{f.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{f.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="preview" className="mx-auto max-w-6xl px-5 pt-16">
          <div className="mx-auto max-w-xl text-center"><p className="micro text-muted">Preview</p><h2 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">The new dashboard</h2></div>
          <div className="mt-8"><DashboardMock /></div>
          <div className="mt-8 flex justify-center"><Button size="lg" arrow onClick={() => navigate("/dashboard")}>Explore the demo</Button></div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-4 rounded-hero bg-surface p-8 shadow-soft sm:grid-cols-3">
            {[["4.9", "App Store rating", "star"], ["2.1M", "sets logged", "dumbbell"], ["31%", "fewer missed sessions after 8 weeks", "trend"]].map(([v, l, ic]) => <div key={l} className="flex items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><Icon name={ic as IconName} size={22} /></span><div><p className="tnum text-[26px] font-bold leading-none tracking-[-0.02em] text-ink">{v}</p><p className="mt-1 text-[12.5px] text-muted">{l}</p></div></div>)}
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-[12.5px] text-muted sm:flex-row"><Logo compact /><p>© 2026 FitxTracker. Built with care, not hype.</p><div className="flex gap-5"><a href="#" className="hover:text-ink">Privacy</a><a href="#" className="hover:text-ink">Terms</a><Link to="/login" className="hover:text-ink">Log in</Link></div></div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- Auth */
const quotes = [
  { q: "The recovery score stopped me from wrecking my week. I trained on the green days and finally got past my squat plateau.", n: "Priya N.", r: "Powerlifter, 2 years on FitxTracker", s: "+22.5 kg squat" },
  { q: "CogniType showed my focus tanks after 9 pm. I moved deep work to mornings and my sessions got shorter and sharper.", n: "Daniel O.", r: "Software engineer", s: "Focus 61 → 84" },
  { q: "It looks calm. That matters at 6 am. Nothing shouts, everything I need is one tap away.", n: "Maya K.", r: "Physiotherapist", s: "4-day streak × 30 weeks" },
];

function AuthShell({ title, sub, children, footer }: { title: string; sub: string; children: React.ReactNode; footer: React.ReactNode }) {
  const [i, setI] = useState(0);
  const { dark, toggle } = useTheme();
  useEffect(() => { const t = window.setInterval(() => setI((x) => (x + 1) % quotes.length), 4500); return () => window.clearInterval(t); }, []);
  const qt = quotes[i];
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1fr_1fr]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between"><Logo /><IconButton icon={dark ? "sun" : "moon"} label="Toggle theme" onClick={toggle} /></div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="rise w-full max-w-[440px] rounded-hero bg-surface p-7 shadow-soft sm:p-9">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
            <p className="mt-1.5 text-[14px] text-muted">{sub}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
        <p className="text-center text-[13px] text-muted">{footer}</p>
      </div>
      <aside aria-label="Testimonial" className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Sparkles />
        <div className="relative"><p className="micro text-white">Why athletes stay</p></div>
        <div className="relative max-w-md" aria-live="polite">
          <p key={i} className="rise text-[28px] font-semibold leading-[1.25] tracking-[-0.02em]">“{qt.q}”</p>
          <div className="mt-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-[13px] font-bold">{qt.n.split(" ").map((w) => w[0]).join("")}</span><div><p className="text-[14.5px] font-semibold">{qt.n}</p><p className="text-[12.5px] text-white/80">{qt.r}</p></div><Tag tone="violet" className="ml-auto bg-white text-primary">{qt.s}</Tag></div>
          <div className="mt-6 flex gap-1.5">{quotes.map((_, k) => <button key={k} type="button" aria-label={`Show testimonial ${k + 1}`} onClick={() => setI(k)} className={clsx("h-1.5 rounded-full transition-all", k === i ? "w-8 bg-white" : "w-3 bg-white/40")} />)}</div>
        </div>
        <div className="relative grid grid-cols-3 gap-3">{[["79", "avg recovery"], ["3.6", "sessions / wk"], ["+12", "focus in 30 d"]].map(([v, l]) => <div key={l} className="rounded-panel bg-white/12 px-4 py-3"><p className="tnum text-[22px] font-bold leading-none">{v}</p><p className="micro mt-1.5 text-white/80">{l}</p></div>)}</div>
      </aside>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState("aarav.sharma@example.com");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) er.email = "Enter a valid email.";
    if (pw.length < 8) er.pw = "Password is at least 8 characters.";
    setErr(er);
    if (!Object.keys(er).length) navigate("/dashboard");
  };
  return (
    <AuthShell title="Welcome back" sub="Log in to see today's recovery and pick up your plan." footer={<>New here? <Link to="/register" className="font-semibold text-primary underline decoration-primary/40 underline-offset-4">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Email" type="email" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} error={err.email} autoComplete="email" />
        <div className="relative">
          <Input label="Password" type={show ? "text" : "password"} icon="lock" value={pw} onChange={(e) => setPw(e.target.value)} error={err.pw} autoComplete="current-password" placeholder="••••••••" />
          <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} className="absolute right-1 top-[29px] grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink"><Icon name={show ? "eyeOff" : "eye"} size={17} /></button>
        </div>
        <div className="flex items-center justify-between text-[13px]"><label className="flex items-center gap-2 text-ink-soft"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" /> Remember me</label><a href="#" className="font-semibold text-primary">Forgot password?</a></div>
        <Button type="submit" size="lg" arrow className="w-full justify-between pl-6">Log in</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted"><span className="h-px flex-1 bg-hairline" />or<span className="h-px flex-1 bg-hairline" /></div>
      <Button variant="outline" size="lg" className="w-full" icon="sparkle" onClick={() => navigate("/dashboard")}>Continue with demo account</Button>
    </AuthShell>
  );
}

export function Register() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", email: "", pw: "", height: "", weight: "", age: "", gender: "Prefer not to say", goal: "Build muscle" });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const pwScore = Math.min(4, (f.pw.length >= 10 ? 1 : 0) + (/[A-Z]/.test(f.pw) ? 1 : 0) + (/\d/.test(f.pw) ? 1 : 0) + (/[^\w]/.test(f.pw) ? 1 : 0) + (f.pw.length >= 14 ? 1 : 0));

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (step === 1) {
      if (!f.name.trim()) er.name = "Tell us your name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) er.email = "Enter a valid email.";
      if (f.pw.length < 10) er.pw = "Use at least 10 characters.";
      setErr(er);
      if (!Object.keys(er).length) setStep(2);
    } else {
      if (+f.height < 120 || +f.height > 230) er.height = "120–230 cm.";
      if (+f.weight < 30 || +f.weight > 250) er.weight = "30–250 kg.";
      if (+f.age < 13 || +f.age > 100) er.age = "13–100.";
      setErr(er);
      if (!Object.keys(er).length) navigate("/dashboard");
    }
  };

  return (
    <AuthShell title={step === 1 ? "Create your account" : "About your body"} sub={step === 1 ? "Two short steps. Your data stays yours." : "We use these for volume, e1RM and recovery baselines."} footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary underline decoration-primary/40 underline-offset-4">Log in</Link></>}>
      <ol className="mb-6 flex items-center gap-3" aria-label="Progress">
        {[1, 2].map((n) => (
          <li key={n} className="flex flex-1 items-center gap-3">
            <span className={clsx("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-bold", step > n ? "bg-primary text-white" : step === n ? "bg-ink text-canvas" : "bg-hairline text-muted")} aria-current={step === n ? "step" : undefined}>{step > n ? <Icon name="check" size={14} strokeWidth={2.4} /> : n}</span>
            <span className={clsx("text-[12.5px] font-semibold", step >= n ? "text-ink" : "text-muted")}>{n === 1 ? "Account" : "Profile"}</span>
            {n === 1 && <span className="h-px flex-1 bg-hairline"><span className="block h-px bg-primary transition-all duration-500" style={{ width: step > 1 ? "100%" : "0%" }} /></span>}
          </li>
        ))}
      </ol>
      <form onSubmit={next} className="space-y-4" noValidate>
        {step === 1 ? (
          <>
            <Input label="Full name" icon="user" value={f.name} onChange={set("name")} error={err.name} autoComplete="name" />
            <Input label="Email" type="email" icon="mail" value={f.email} onChange={set("email")} error={err.email} autoComplete="email" />
            <div>
              <Input label="Password" type="password" icon="lock" value={f.pw} onChange={set("pw")} error={err.pw} autoComplete="new-password" hint="10+ characters. A passphrase works best." />
              <div className="mt-2 flex gap-1" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ background: i < pwScore ? (pwScore >= 3 ? "var(--tag-green-fg)" : "var(--tag-amber-fg)") : "var(--hairline)" }} />)}</div>
            </div>
            <Button type="submit" size="lg" arrow className="w-full justify-between pl-6">Continue</Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Height" type="number" suffix="cm" value={f.height} onChange={set("height")} error={err.height} inputMode="numeric" />
              <Input label="Weight" type="number" suffix="kg" step={0.1} value={f.weight} onChange={set("weight")} error={err.weight} inputMode="decimal" />
              <Input label="Age" type="number" value={f.age} onChange={set("age")} error={err.age} inputMode="numeric" />
            </div>
            <Select label="Gender" value={f.gender} onChange={set("gender")}><option>Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option></Select>
            <Select label="Fitness goal" value={f.goal} onChange={set("goal")}><option>Build muscle</option><option>Lose fat</option><option>Get stronger</option><option>Improve endurance</option><option>Stay healthy</option></Select>
            <div className="flex gap-2"><Button type="button" variant="outline" size="lg" icon="arrowLeft" onClick={() => setStep(1)}>Back</Button><Button type="submit" size="lg" arrow className="flex-1 justify-between pl-6">Create account</Button></div>
          </>
        )}
      </form>
      <span className="sr-only"><RingProgress value={step / 2} size={10} label="Step progress" /></span>
    </AuthShell>
  );
}
