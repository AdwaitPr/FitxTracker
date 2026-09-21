import { useMemo, useState } from "react";
import clsx from "clsx";
import { PageHeader, Shell } from "../chrome";
import { Card, Popover, RingProgress, SectionHeading, Segmented, Tag } from "../ui";
import { Button, Chip, Slider, Stepper, Textarea, Toast } from "../forms";
import { LineChart } from "../charts";
import { fmtDate, gutScore, qualityScore, recoveryHistory, recoveryScore, relDate } from "../data2";
import type { GutStatus, SleepQuality } from "../data2";

export function levelFor(score: number) {
  if (score >= 80) return { level: "optimal", color: "var(--tag-green-fg)", tone: "green" as const, label: "Optimal", verdict: "Go for a PR", intensity: "High — heavy top sets, RPE 8–9", body: "Sleep, stress and gut are all in the zone. Push the main lift and keep 5–6 heavy sets." };
  if (score >= 60) return { level: "normal", color: "var(--primary)", tone: "violet" as const, label: "Normal", verdict: "Train as planned", intensity: "Moderate — RPE 7–8, full volume", body: "Run the session as written. Keep 2–3 minutes of rest on the big lifts and one rep in reserve." };
  if (score >= 40) return { level: "warning", color: "var(--tag-amber-fg)", tone: "amber" as const, label: "Warning", verdict: "Cut volume by 20%", intensity: "Light — RPE ≤ 7, −20% sets", body: "Keep the movement pattern, drop the load. Skip the last set of every exercise." };
  return { level: "critical", color: "var(--danger)", tone: "danger" as const, label: "Critical", verdict: "Rest and recover", intensity: "Active recovery only", body: "Walk 20 minutes, stretch hips and shoulders, log how you feel tonight." };
}

function StressDots({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between"><span className="text-[13px] font-semibold text-ink-soft">Stress</span><span className="tnum text-[13px] font-bold text-ink">{value} / 10</span></div>
      <div role="radiogroup" aria-label="Stress level 1 to 10" className="flex items-end justify-between gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const on = n <= value;
          const t = (n - 1) / 9;
          return (
            <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`Stress ${n}`} onClick={() => onChange(n)} className="grid h-11 flex-1 place-items-end rounded-lg pb-1 hover:bg-canvas">
              <span className="block rounded-full transition-all duration-200" style={{ width: 10 + t * 8, height: 10 + t * 8, background: on ? `color-mix(in oklab, var(--tag-green-fg) ${Math.round((1 - t) * 100)}%, var(--danger))` : "var(--hairline)" }} />
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-muted"><span>Calm</span><span>Overloaded</span></div>
    </div>
  );
}

export default function Recovery() {
  const [sleep, setSleep] = useState(7.2);
  const [quality, setQuality] = useState<SleepQuality>("Good");
  const [stress, setStress] = useState(4);
  const [gut, setGut] = useState<GutStatus>("Good");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const score = useMemo(() => recoveryScore(sleep, quality, stress, gut), [sleep, quality, stress, gut]);
  const lv = levelFor(score);
  const factors = [
    { label: "Sleep hours", value: `${sleep.toFixed(1)} h`, score: Math.round(Math.min(1, sleep / 8) * 100), w: "40%" },
    { label: "Sleep quality", value: quality, score: qualityScore[quality], w: "30%" },
    { label: "Stress (inverted)", value: `${stress}/10`, score: (10 - stress) * 10, w: "20%" },
    { label: "Gut status", value: gut, score: gutScore[gut], w: "10%" },
  ];

  return (
    <Shell>
      <PageHeader eyebrow="Daily readiness" title="Recovery" sub="Log how you slept and feel — the score decides today's intensity." actions={
        <Popover align="right" trigger={(p) => <Button variant="outline" icon="info" {...p}>How this is calculated</Button>}>
          <div className="w-72 p-3">
            <p className="text-[14px] font-semibold text-ink">Recovery score weights</p>
            <ul className="mt-2 space-y-2">
              {[["Sleep hours", 40, "hours ÷ 8, capped"], ["Sleep quality", 30, "Poor 25 · Fair 50 · Good 75 · Excellent 100"], ["Stress", 20, "inverted: (10 − stress) × 10"], ["Gut status", 10, "Good 85 · Bloated 55 · Uncomfortable 30"]].map(([l, w, d]) => (
                <li key={l as string}><div className="flex justify-between text-[12.5px]"><span className="font-semibold text-ink-soft">{l}</span><span className="tnum font-bold text-ink">{w}%</span></div><div className="mt-1 h-1.5 rounded-full bg-hairline"><div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} /></div><p className="mt-0.5 text-[11px] text-muted">{d}</p></li>
              ))}
            </ul>
            <p className="mt-3 text-[11.5px] text-muted">≥80 optimal · 60–79 normal · 40–59 warning · &lt;40 critical</p>
          </div>
        </Popover>
      } />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* gauge */}
        <Card className="rise flex flex-col items-center p-6 text-center xl:sticky xl:top-6 xl:self-start">
          <RingProgress value={score / 100} size={228} stroke={12} color={lv.color} label={`Recovery score ${score} of 100, ${lv.label}`}>
            <div><div className="tnum text-[56px] font-bold leading-none tracking-[-0.03em]" style={{ color: lv.color }}>{score}</div><div className="micro mt-2 text-muted">out of 100</div></div>
          </RingProgress>
          <Tag tone={lv.tone} icon="zap" className="mt-5">{lv.label} — {lv.verdict}</Tag>
          <p className="mt-3 max-w-[24rem] text-[14px] leading-relaxed text-ink-soft">{lv.body}</p>
          <div className="mt-5 w-full rounded-panel bg-inset p-4 text-left">
            <p className="micro text-muted">Suggested intensity</p>
            <p className="mt-1 text-[14.5px] font-semibold text-ink">{lv.intensity}</p>
          </div>
          <ul className="mt-4 w-full space-y-3 text-left">
            {factors.map((f) => (
              <li key={f.label}>
                <div className="flex items-baseline justify-between"><span className="text-[13px] font-medium text-ink-soft">{f.label} <span className="micro ml-1 text-muted">{f.w}</span></span><span className="tnum text-[12.5px] font-semibold text-ink">{f.value}</span></div>
                <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-hairline" role="progressbar" aria-valuenow={f.score} aria-valuemin={0} aria-valuemax={100} aria-label={`${f.label} ${f.score} of 100`}><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${f.score}%`, background: levelFor(f.score).color }} /></div>
              </li>
            ))}
          </ul>
          <Button className="mt-5 w-full" arrow onClick={() => setToast(`Logged today · score ${score}`)}>Save today's log</Button>
        </Card>

        {/* form */}
        <div className="space-y-6">
          <Card className="rise p-5 sm:p-6">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Today's log</h2>
            <div className="mt-5 space-y-6">
              <div>
                <Slider label="Sleep hours" min={3} max={11} step={0.1} value={sleep} onChange={setSleep} format={(v) => `${v.toFixed(1)} h`} />
                <div className="mt-1 flex items-center justify-between"><span className="text-[12px] text-muted">Target 8.0 h</span><Stepper label="Sleep hours" min={3} max={11} step={0.25} value={sleep} onChange={setSleep} format={(v) => `${v.toFixed(2).replace(/\.?0+$/, "")} h`} /></div>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-soft">Sleep quality</p>
                <Segmented label="Sleep quality" value={quality} onChange={(v) => setQuality(v as SleepQuality)} options={(["Poor", "Fair", "Good", "Excellent"] as SleepQuality[]).map((q) => ({ value: q, label: q }))} />
              </div>
              <StressDots value={stress} onChange={setStress} />
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-soft">Gut status</p>
                <div className="flex flex-wrap gap-2">
                  {(["Good", "Bloated", "Uncomfortable"] as GutStatus[]).map((g) => <Chip key={g} selected={gut === g} tone={g === "Good" ? "green" : g === "Bloated" ? "amber" : "pink"} onClick={() => setGut(g)}>{g}</Chip>)}
                </div>
              </div>
              <Textarea label="Notes" placeholder="Late dinner, woke twice, felt groggy until coffee…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </Card>

          <section aria-labelledby="trend-title">
            <SectionHeading id="trend-title" title="Sleep vs. stress · 14 days" />
            <Card className="p-5">
              <div className="mb-3 flex gap-5 text-[12.5px] font-semibold text-muted"><span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-primary" /> Sleep (h)</span><span className="flex items-center gap-2"><span className="h-0.5 w-5 border-t-2 border-dashed" style={{ borderColor: "var(--danger)" }} /> Stress (/10)</span></div>
              <LineChart height={190} labels={recoveryHistory.map((r) => fmtDate(r.dateISO, { day: "numeric" }))} series={[{ name: "Sleep", values: recoveryHistory.map((r) => r.sleep), area: true }, { name: "Stress", values: recoveryHistory.map((r) => r.stress), color: "var(--danger)", dashed: true }]} yMin={0} summary={`Fourteen-day trend: sleep averaged ${(recoveryHistory.reduce((a, r) => a + r.sleep, 0) / 14).toFixed(1)} hours and stress ${(recoveryHistory.reduce((a, r) => a + r.stress, 0) / 14).toFixed(1)} out of 10; nights under 6 hours line up with higher stress the next day.`} />
            </Card>
          </section>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="hist-title">
        <SectionHeading id="hist-title" title="14-day history" />
        <Card className="px-5 py-2">
          <div className="micro hidden grid-cols-[110px_1fr_80px_80px_110px_60px] gap-4 px-1 py-3 text-muted md:grid"><span>Date</span><span>Score</span><span>Sleep</span><span>Stress</span><span>Gut</span><span className="text-right">Level</span></div>
          <ul>
            {[...recoveryHistory].reverse().map((r) => {
              const l = levelFor(r.score);
              return (
                <li key={r.dateISO} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-dashed border-hairline py-3.5 md:grid-cols-[110px_1fr_80px_80px_110px_60px]">
                  <span className="text-[13.5px] font-semibold text-ink">{relDate(r.dateISO)}</span>
                  <span className="col-span-2 flex items-center gap-3 md:col-span-1"><span className="h-[6px] flex-1 overflow-hidden rounded-full bg-hairline" role="progressbar" aria-valuenow={r.score} aria-valuemin={0} aria-valuemax={100} aria-label={`Score ${r.score}`}><span className="block h-full rounded-full" style={{ width: `${r.score}%`, background: l.color }} /></span><span className="tnum w-7 text-right text-[13px] font-bold" style={{ color: l.color }}>{r.score}</span></span>
                  <span className="tnum text-[13px] text-ink-soft md:block"><span className="md:hidden text-muted">Sleep </span>{r.sleep} h</span>
                  <span className="tnum text-[13px] text-ink-soft"><span className="md:hidden text-muted">Stress </span>{r.stress}/10</span>
                  <span className={clsx("text-[13px] text-ink-soft", r.gut !== "Good" && "font-semibold")} style={r.gut !== "Good" ? { color: "var(--tag-amber-fg)" } : undefined}>{r.gut}</span>
                  <span className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto"><Tag tone={l.tone}>{l.label}</Tag></span>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </Shell>
  );
}
