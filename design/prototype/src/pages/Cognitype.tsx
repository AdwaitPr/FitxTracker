import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { PageHeader, Shell } from "../chrome";
import { Icon } from "../icons";
import type { IconName } from "../icons";
import { Card, IconButton, Menu, RingProgress, SectionHeading, Segmented, Tag } from "../ui";
import type { Tone } from "../ui";
import { Button, Chip, EmptyState, Input, Select } from "../forms";
import { Bars, GridHeatmap, LineChart, Scatter, Sparkline } from "../charts";
import { cogniSessions, fmtDate, passages, relDate, sounds, timesOfDay } from "../data2";
import type { CogniSession, PassageCategory, Sound, TimeOfDay } from "../data2";
import { Link, navigate } from "../router";

const soundIcon: Record<Sound, IconName> = { "Brown noise": "waves", "Pink noise": "waves", Ambient: "volume", Rhythmic: "music", Silence: "moon" };
const todIcon: Record<TimeOfDay, IconName> = { Morning: "sun", Afternoon: "sun", Evening: "moon", Night: "moon" };
const diffLabel = { 1: "Simple", 2: "Moderate", 3: "Complex" } as const;
const diffTone: Record<1 | 2 | 3, Tone> = { 1: "green", 2: "amber", 3: "pink" };
const scoreColor = (s: number) => (s >= 80 ? "var(--tag-green-fg)" : s >= 60 ? "var(--primary)" : s >= 40 ? "var(--tag-amber-fg)" : "var(--danger)");

/* ============================================================== Test */
type Phase = "setup" | "typing" | "results";

export function CogniTest() {
  const [sound, setSound] = useState<Sound>("Brown noise");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [category, setCategory] = useState<PassageCategory>("Prose");
  const [tod, setTod] = useState<TimeOfDay>("Morning");
  const [phase, setPhase] = useState<Phase>("setup");
  const passage = useMemo(() => passages[category][difficulty - 1], [category, difficulty]);

  const [typed, setTyped] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const lat = useRef<number[]>([]);
  const lastKey = useRef<number | null>(null);
  const errs = useRef(0);
  const events = useRef<{ blur: number; hidden: number; idle: number }>({ blur: 0, hidden: 0, idle: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const LIMIT = 60;

  useEffect(() => {
    if (phase !== "typing") return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    const onBlur = () => { events.current.blur++; };
    const onVis = () => { if (document.hidden) events.current.hidden++; };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    inputRef.current?.focus();
    return () => { window.clearInterval(t); window.removeEventListener("blur", onBlur); document.removeEventListener("visibilitychange", onVis); };
  }, [phase]);

  const elapsed = start ? Math.min(LIMIT, (now - start) / 1000) : 0;
  const finished = phase === "typing" && (typed.length >= passage.length || elapsed >= LIMIT);
  useEffect(() => { if (finished) setPhase("results"); }, [finished]);

  const onType = (v: string) => {
    if (v.length > passage.length) return;
    const t = Date.now();
    if (!start) { setStart(t); setNow(t); }
    if (lastKey.current) { const d = t - lastKey.current; lat.current.push(d); if (d > 2500) events.current.idle++; }
    lastKey.current = t;
    if (v.length > typed.length && v[v.length - 1] !== passage[v.length - 1]) errs.current++;
    setTyped(v);
  };

  const correct = [...typed].filter((c, i) => c === passage[i]).length;
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const minutes = Math.max(elapsed, 1) / 60;
  const wpm = Math.round(correct / 5 / minutes);

  const reset = () => { setTyped(""); setStart(null); lat.current = []; lastKey.current = null; errs.current = 0; events.current = { blur: 0, hidden: 0, idle: 0 }; setPhase("setup"); };

  /* -------- results computation */
  const result = useMemo(() => {
    if (phase !== "results") return null;
    const l = lat.current.length ? lat.current : [200];
    const mean = l.reduce((a, b) => a + b, 0) / l.length;
    const sd = Math.sqrt(l.reduce((a, b) => a + (b - mean) ** 2, 0) / l.length);
    const cv = sd / mean;
    const buckets = new Map<number, number>();
    l.forEach((x) => buckets.set(Math.min(8, Math.floor(x / 150)), (buckets.get(Math.min(8, Math.floor(x / 150))) ?? 0) + 1));
    const entropy = -[...buckets.values()].reduce((a, n) => { const p = n / l.length; return a + p * Math.log2(p); }, 0);
    const ev = events.current.blur + events.current.hidden + events.current.idle;
    const errorRate = typed.length ? (errs.current / typed.length) * 100 : 0;
    const rhythm = Math.max(20, Math.min(100, Math.round(100 - cv * 90)));
    const attention = Math.max(20, Math.min(100, 100 - ev * 12));
    const accuracy = Math.max(20, Math.min(100, Math.round(100 - errorRate * 3)));
    const pause = Math.max(20, Math.min(100, Math.round(100 - entropy * 18)));
    const focus = Math.round(rhythm * 0.3 + attention * 0.3 + accuracy * 0.25 + pause * 0.15);
    return { mean: Math.round(mean), sd: Math.round(sd), entropy: Math.round(entropy * 100) / 100, ev, errorRate: Math.round(errorRate * 10) / 10, rhythm, attention, accuracy, pause, focus, latencies: l };
  }, [phase, typed.length]);

  if (phase === "typing") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas" onClick={() => inputRef.current?.focus()}>
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <span className="micro text-muted">{category} · {diffLabel[difficulty]} · {sound}</span>
          <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-muted hover:text-ink"><Icon name="close" size={16} /> Abort</button>
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-24">
          <p className="text-[22px] leading-[1.75] tracking-[0.005em] sm:text-[26px]" aria-hidden="true">
            {[...passage].map((ch, i) => {
              const state = i < typed.length ? (typed[i] === ch ? "ok" : "bad") : i === typed.length ? "cur" : "todo";
              return <span key={i} className={clsx(state === "ok" && "text-ink", state === "bad" && "rounded-[3px] text-[#B03A16] bg-[#FDE9E1] dark:bg-[#F26B3A]/20 dark:text-[#FFA183]", state === "cur" && "caret text-ink-soft", state === "todo" && "text-muted/60")}>{ch}</span>;
            })}
          </p>
          <label className="sr-only" htmlFor="type-input">Type the passage shown above</label>
          <textarea id="type-input" ref={inputRef} value={typed} onChange={(e) => onType(e.target.value)} onPaste={(e) => e.preventDefault()} autoCapitalize="off" autoCorrect="off" spellCheck={false} className="absolute h-px w-px opacity-0" aria-describedby="hud" />
          <p className="mt-6 text-[12.5px] text-muted">{start ? "Keep going — the test ends when you finish the passage or after 60 s." : "Start typing to begin. Backspace is allowed; paste is not."}</p>
        </div>
        <div id="hud" role="status" aria-live="off" className="fixed inset-x-0 bottom-0 flex justify-center pb-6">
          <div className="flex items-center gap-6 rounded-full border border-hairline bg-surface/90 py-2 pl-2 pr-6 shadow-soft">
            <RingProgress value={elapsed / LIMIT} size={44} stroke={4} color="var(--primary-soft-2)" label={`${Math.round(LIMIT - elapsed)} seconds left`}><span className="tnum text-[11px] font-bold text-muted">{Math.max(0, Math.round(LIMIT - elapsed))}</span></RingProgress>
            <span><span className="micro block text-muted">WPM</span><span className="tnum block text-[16px] font-bold text-ink-soft">{start ? wpm : "—"}</span></span>
            <span><span className="micro block text-muted">Accuracy</span><span className="tnum block text-[16px] font-bold text-ink-soft">{acc}%</span></span>
            <span><span className="micro block text-muted">Progress</span><span className="tnum block text-[16px] font-bold text-ink-soft">{Math.round((typed.length / passage.length) * 100)}%</span></span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    const fake: CogniSession = { id: "live", dateISO: "2026-02-19", timeOfDay: tod, sound, difficulty, category, focus: result.focus, attention: result.attention, rhythm: result.rhythm, accuracy: result.accuracy, pauseControl: result.pause, wpm, errorRate: result.errorRate, meanLatency: result.mean, latencySd: result.sd, pauseEntropy: result.entropy, attentionEvents: result.ev, recovery: 79, latencies: result.latencies };
    return (
      <Shell narrow>
        <PageHeader eyebrow="Session complete" title="Your results" actions={<><Button variant="outline" icon="refresh" onClick={reset}>Run again</Button><Button arrow onClick={() => navigate("/cognitype/sessions")}>All sessions</Button></>} />
        <Results s={fake} live />
      </Shell>
    );
  }

  return (
    <Shell narrow>
      <PageHeader eyebrow="Cognitive focus test" title="CogniType" sub="A 60-second typing passage. We measure rhythm, pauses, errors and attention drops — not just speed." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="rise p-6">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Set up your session</h2>
          <div className="mt-5 space-y-6">
            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-soft">Background sound</p>
              <div className="flex flex-wrap gap-2">{sounds.map((s) => <Chip key={s} selected={sound === s} icon={soundIcon[s]} onClick={() => setSound(s)}>{s}</Chip>)}</div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><p className="mb-2 text-[13px] font-semibold text-ink-soft">Passage difficulty</p><Segmented label="Difficulty" value={String(difficulty)} onChange={(v) => setDifficulty(Number(v) as 1 | 2 | 3)} options={[{ value: "1", label: "1 · Simple" }, { value: "2", label: "2 · Moderate" }, { value: "3", label: "3 · Complex" }]} /></div>
              <div><p className="mb-2 text-[13px] font-semibold text-ink-soft">Category</p><Segmented label="Category" value={category} onChange={(v) => setCategory(v as PassageCategory)} options={[{ value: "Prose", label: "Prose" }, { value: "Technical", label: "Technical" }, { value: "Numeric", label: "Numeric" }]} /></div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-soft">Time of day</p>
              <div className="flex flex-wrap gap-2">{timesOfDay.map((t) => <Chip key={t} selected={tod === t} icon={todIcon[t]} onClick={() => setTod(t)}>{t}</Chip>)}</div>
            </div>
            <div className="rounded-panel bg-inset p-4">
              <p className="micro text-muted">Passage preview · {passage.split(" ").length} words</p>
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">{passage}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" arrow icon="keyboard" onClick={() => setPhase("typing")}>Start test</Button>
            <p className="text-[12.5px] text-muted">Full-screen, low-contrast canvas. Escape via “Abort”.</p>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="rise p-5">
            <p className="micro text-muted">Last session</p>
            <div className="mt-3 flex items-center gap-4">
              <RingProgress value={cogniSessions[17].focus / 100} size={84} stroke={6} color={scoreColor(cogniSessions[17].focus)} label={`Last focus score ${cogniSessions[17].focus}`}><span className="tnum text-[20px] font-bold" style={{ color: scoreColor(cogniSessions[17].focus) }}>{cogniSessions[17].focus}</span></RingProgress>
              <div><p className="text-[14px] font-semibold text-ink">Focus Stability</p><p className="text-[12.5px] text-muted">{relDate(cogniSessions[17].dateISO)} · {cogniSessions[17].sound} · {cogniSessions[17].timeOfDay}</p><Link to={`/cognitype/sessions/${cogniSessions[17].id}`} className="mt-1 inline-block text-[12.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4">Open results</Link></div>
            </div>
          </Card>
          <Card className="rise p-5">
            <p className="text-[14px] font-semibold text-ink">What we capture</p>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-muted">
              {["Mean inter-key latency & std-dev", "Pause entropy (distribution of gaps)", "Error rate per character", "Attention events: blur, tab hidden, idle > 2.5 s", "Composite Focus Stability Score"].map((t) => <li key={t} className="flex gap-2"><Icon name="check" size={14} className="mt-0.5 shrink-0 text-primary" />{t}</li>)}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/* =========================================================== Results */
function Results({ s, live = false }: { s: CogniSession; live?: boolean }) {
  const subs = [
    { l: "Attention Stability", v: s.attention, d: `${s.attentionEvents} attention event${s.attentionEvents === 1 ? "" : "s"}` },
    { l: "Rhythm Consistency", v: Math.round(s.rhythm), d: `latency σ ${s.latencySd} ms` },
    { l: "Accuracy", v: s.accuracy, d: `${s.errorRate}% error rate` },
    { l: "Pause Control", v: s.pauseControl, d: `entropy ${s.pauseEntropy} bits` },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="rise flex flex-col items-center p-6 text-center">
        <RingProgress value={s.focus / 100} size={200} stroke={11} color={scoreColor(s.focus)} label={`Focus Stability Score ${s.focus} of 100`}>
          <div><div className="tnum text-[52px] font-bold leading-none tracking-[-0.03em]" style={{ color: scoreColor(s.focus) }}>{s.focus}</div><div className="micro mt-2 text-muted">Focus stability</div></div>
        </RingProgress>
        <p className="mt-5 text-[16px] font-semibold text-ink">{s.focus >= 80 ? "Locked in." : s.focus >= 60 ? "Steady focus." : s.focus >= 40 ? "Fragmented focus." : "Scattered session."}</p>
        <p className="mt-1 text-[13px] text-muted">{live ? "Just now" : relDate(s.dateISO)} · {s.timeOfDay} · {s.sound}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2"><Tag tone={diffTone[s.difficulty]}>{diffLabel[s.difficulty]}</Tag><Tag tone="cyan">{s.category}</Tag><Tag tone="violet" icon={soundIcon[s.sound]}>{s.sound}</Tag></div>
        <dl className="mt-5 grid w-full grid-cols-3 gap-2 rounded-panel bg-inset p-3">
          {[["WPM", s.wpm], ["Accuracy", `${Math.max(0, 100 - s.errorRate).toFixed(0)}%`], ["Recovery", s.recovery]].map(([k, v]) => <div key={k}><dt className="micro text-muted">{k}</dt><dd className="tnum mt-1 text-[16px] font-bold text-ink">{v}</dd></div>)}
        </dl>
      </Card>
      <div className="space-y-5">
        <Card className="rise p-5">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Sub-scores</h2>
          <ul className="mt-4 space-y-4">
            {subs.map((x) => (
              <li key={x.l}>
                <div className="flex items-baseline justify-between"><span className="text-[13.5px] font-medium text-ink-soft">{x.l}</span><span className="tnum text-[13px] font-bold text-ink">{x.v}<span className="text-muted">/100</span></span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-hairline" role="progressbar" aria-valuenow={x.v} aria-valuemin={0} aria-valuemax={100} aria-label={`${x.l} ${x.v} of 100`}><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${x.v}%`, background: scoreColor(x.v) }} /></div>
                <p className="mt-1 text-[11.5px] text-muted">{x.d}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="rise p-5">
          <div className="flex items-baseline justify-between"><h2 className="text-[15px] font-semibold tracking-[-0.01em]">Keystroke latency</h2><span className="tnum text-[12px] font-semibold text-muted">mean {s.meanLatency} ms · σ {s.latencySd} ms</span></div>
          <div className="mt-3 h-[72px]"><Sparkline values={s.latencies} height={72} label={`Inter-key latency across ${s.latencies.length} keystrokes, mean ${s.meanLatency} ms, standard deviation ${s.latencySd} ms.`} /></div>
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-muted"><span>first key</span><span>last key</span></div>
        </Card>
      </div>
    </div>
  );
}

export function CogniSessionDetail({ id }: { id: string }) {
  const s = cogniSessions.find((x) => x.id === id) ?? cogniSessions[cogniSessions.length - 1];
  return (
    <Shell narrow>
      <div className="rise mb-5"><Link to="/cognitype/sessions" className="inline-flex h-10 items-center gap-2 rounded-full pl-2 pr-4 text-[13.5px] font-semibold text-ink-soft hover:bg-surface hover:text-primary"><span className="grid h-8 w-8 place-items-center rounded-full border border-hairline"><Icon name="arrowLeft" size={16} /></span> Sessions</Link></div>
      <PageHeader eyebrow={fmtDate(s.dateISO, { weekday: "long", day: "numeric", month: "long" })} title={`Session ${s.id.replace("c", "#")}`} actions={<><Button variant="outline" icon="refresh" onClick={() => navigate("/cognitype")}>Repeat setup</Button><Menu label="Session options" items={[{ label: "View", icon: "eye" }, { label: "Duplicate", icon: "copy" }, { label: "Delete", icon: "trash", tone: "danger" }]} /></>} />
      <Results s={s} />
    </Shell>
  );
}

/* ========================================================== Sessions */
export function CogniSessions() {
  const [q, setQ] = useState("");
  const [sound, setSound] = useState<Sound | "">("");
  const [diff, setDiff] = useState<"" | 1 | 2 | 3>("");
  const list = [...cogniSessions].reverse().filter((s) => (!sound || s.sound === sound) && (!diff || s.difficulty === diff) && `${s.category} ${s.timeOfDay} ${s.sound}`.toLowerCase().includes(q.toLowerCase()));
  const avg = Math.round(list.reduce((a, s) => a + s.focus, 0) / (list.length || 1));
  return (
    <Shell>
      <PageHeader eyebrow="CogniType" title="Sessions" sub={`${list.length} sessions · average focus ${avg}`} actions={<Button icon="keyboard" onClick={() => navigate("/cognitype")}>New test</Button>} />
      <Card className="rise p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <Input icon="search" placeholder="Search category, time of day…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search sessions" />
          <Select value={sound} onChange={(e) => setSound(e.target.value as Sound | "")} aria-label="Sound filter"><option value="">All sounds</option>{sounds.map((s) => <option key={s}>{s}</option>)}</Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip selected={diff === ""} onClick={() => setDiff("")}>All levels</Chip>
          {([1, 2, 3] as const).map((d) => <Chip key={d} selected={diff === d} tone={diffTone[d]} onClick={() => setDiff(diff === d ? "" : d)}>{d} · {diffLabel[d]}</Chip>)}
        </div>
      </Card>
      {list.length === 0 ? <div className="mt-6"><EmptyState icon="keyboard" title="No sessions match" body="Clear a filter or run a new test." action={<Button variant="outline" onClick={() => { setQ(""); setSound(""); setDiff(""); }}>Clear filters</Button>} /></div> : (
        <Card className="mt-6 px-4 py-1 sm:px-6">
          <div className="micro hidden grid-cols-[90px_1fr_1fr_1fr_90px_80px_44px] gap-4 px-1 py-3 text-muted lg:grid"><span>Focus</span><span>Date</span><span>Sound</span><span>Passage</span><span>Time</span><span>WPM</span><span className="text-right">Open</span></div>
          <ul>
            {list.map((s) => (
              <li key={s.id} className="border-t border-dashed border-hairline">
                <Link to={`/cognitype/sessions/${s.id}`} className="grid grid-cols-[52px_1fr_44px] items-center gap-x-3 gap-y-1 rounded-[14px] px-1 py-3 hover:bg-canvas lg:grid-cols-[90px_1fr_1fr_1fr_90px_80px_44px] lg:gap-4">
                  <span className="flex items-center gap-2"><RingProgress value={s.focus / 100} size={44} stroke={4} color={scoreColor(s.focus)} label={`Focus ${s.focus}`}><span className="tnum text-[12px] font-bold" style={{ color: scoreColor(s.focus) }}>{s.focus}</span></RingProgress></span>
                  <span className="min-w-0"><span className="block text-[14px] font-semibold text-ink">{relDate(s.dateISO)}</span><span className="block truncate text-[12px] text-muted lg:hidden">{s.sound} · {s.category} · {s.timeOfDay} · {s.wpm} wpm</span><span className="hidden text-[12px] text-muted lg:block">{fmtDate(s.dateISO, { weekday: "short", day: "numeric", month: "short" })}</span></span>
                  <span className="hidden items-center gap-2 text-[13px] text-ink-soft lg:flex"><Icon name={soundIcon[s.sound]} size={16} className="text-muted" />{s.sound}</span>
                  <span className="hidden items-center gap-2 lg:flex"><Tag tone={diffTone[s.difficulty]}>{diffLabel[s.difficulty]}</Tag><span className="text-[12.5px] text-muted">{s.category}</span></span>
                  <span className="hidden text-[13px] text-ink-soft lg:block">{s.timeOfDay}</span>
                  <span className="tnum hidden text-[13px] font-semibold text-ink lg:block">{s.wpm}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-ink-soft"><Icon name="arrowRight" size={17} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Shell>
  );
}

/* ========================================================= Analytics */
export function CogniAnalytics() {
  const [metric, setMetric] = useState("focus");
  const key = metric as "focus" | "wpm";
  const bySound = sounds.map((s) => { const l = cogniSessions.filter((x) => x.sound === s); return l.length ? Math.round(l.reduce((a, x) => a + x[key], 0) / l.length) : 0; });
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heat = timesOfDay.map((t) => days.map((_, di) => { const l = cogniSessions.filter((x) => x.timeOfDay === t && new Date(x.dateISO).getDay() % 7 === (di + 1) % 7); const base = { Morning: 78, Afternoon: 71, Evening: 66, Night: 58 }[t]; return l.length ? Math.round(l.reduce((a, x) => a + x.focus, 0) / l.length) : base + ((di * 7 + t.length) % 9) - 4; }));
  const trend = cogniSessions.map((s) => s.focus);
  const ma = trend.map((_, i) => Math.round(trend.slice(Math.max(0, i - 2), i + 1).reduce((a, b) => a + b, 0) / Math.min(3, i + 1)));
  const best = sounds[bySound.indexOf(Math.max(...bySound))];
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = useCallback((d: number) => scrollRef.current?.scrollBy({ left: d * 320, behavior: "smooth" }), []);

  return (
    <Shell>
      <PageHeader eyebrow="CogniType" title="Analytics" sub="Which conditions produce your steadiest focus — and how closely it tracks recovery." actions={<Segmented label="Metric" value={metric} onChange={setMetric} options={[{ value: "focus", label: "Focus" }, { value: "wpm", label: "WPM" }]} />} />

      <div ref={scrollRef} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {[
          { l: "Best sound", v: best, d: `${Math.max(...bySound)} avg ${metric}`, tone: "violet", icon: soundIcon[best] },
          { l: "Best time", v: "Morning", d: "78 avg focus", tone: "amber", icon: "sun" as IconName },
          { l: "Sessions", v: String(cogniSessions.length), d: "last 5 weeks", tone: "cyan", icon: "calendar" as IconName },
          { l: "Trend", v: `${ma[ma.length - 1] - ma[0] >= 0 ? "+" : ""}${ma[ma.length - 1] - ma[0]}`, d: "3-session moving avg", tone: "green", icon: "trend" as IconName },
        ].map((k) => (
          <Card key={k.l} as="article" className="rise lift flex w-[230px] shrink-0 snap-start items-center gap-3.5 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-tag" style={{ background: `var(--tag-${k.tone}-bg)`, color: `var(--tag-${k.tone}-fg)` }}><Icon name={k.icon} size={20} /></span>
            <div className="min-w-0"><p className="micro truncate text-muted">{k.l}</p><p className="truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink">{k.v}</p><p className="truncate text-[11.5px] text-muted">{k.d}</p></div>
          </Card>
        ))}
      </div>
      <div className="mt-1 flex justify-end gap-2 lg:hidden"><IconButton icon="chevronLeft" label="Scroll left" size={36} onClick={() => scroll(-1)} /><IconButton icon="chevronRight" label="Scroll right" variant="solid" size={36} onClick={() => scroll(1)} /></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="bs"><SectionHeading id="bs" title="By sound type" /><Card className="p-5"><Bars labels={sounds.map((s) => s.replace(" noise", ""))} values={bySound} height={200} summary={`Average ${metric} by background sound: ${sounds.map((s, i) => `${s} ${bySound[i]}`).join(", ")}. Best: ${best}.`} highlight={bySound.indexOf(Math.max(...bySound))} /><p className="mt-3 text-[12.5px] text-muted">Brown and pink noise consistently beat silence; rhythmic audio drags rhythm consistency down.</p></Card></section>
        <section aria-labelledby="bt"><SectionHeading id="bt" title="By time of day" /><Card className="p-5"><GridHeatmap rows={timesOfDay} cols={days} values={heat} summary={`Average focus by time of day and weekday. Mornings average 78, nights 58.`} /><p className="mt-3 text-[12.5px] text-muted">Cells are the mean Focus Stability Score; darker indigo is higher. Weekday mornings are your window.</p></Card></section>
      </div>

      <section className="mt-6" aria-labelledby="tr"><SectionHeading id="tr" title="Focus over time"><span className="flex gap-4 text-[12px] font-semibold text-muted"><span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-primary" /> Focus</span><span className="flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed border-ink" /> 3-session avg</span></span></SectionHeading>
        <Card className="p-5"><LineChart labels={cogniSessions.map((s) => fmtDate(s.dateISO))} series={[{ name: "Focus", values: trend, area: true }, { name: "Moving avg", values: ma, color: "var(--ink)", dashed: true }]} height={220} summary={`Focus Stability across ${trend.length} sessions, from ${trend[0]} to ${trend[trend.length - 1]}; moving average moved ${ma[ma.length - 1] - ma[0]} points.`} /></Card></section>

      <section className="mt-6" aria-labelledby="sc"><SectionHeading id="sc" title="Focus vs. recovery score" />
        <Card className="p-5"><Scatter points={cogniSessions.map((s) => ({ x: s.recovery, y: s.focus, label: `${relDate(s.dateISO)} · ${s.sound}` }))} xLabel="Recovery" yLabel="Focus" summary="Scatter of daily recovery score against Focus Stability Score for each session; higher recovery days show higher focus with a moderate positive correlation." /><p className="mt-3 text-[12.5px] text-muted">Recovery explains a meaningful share of focus variance — schedule complex passages on high-recovery mornings.</p></Card></section>
    </Shell>
  );
}
