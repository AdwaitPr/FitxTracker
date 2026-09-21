import { useEffect, useMemo, useState } from "react";
import { PageHeader, Shell } from "../chrome";
import { Icon } from "../icons";
import { Card, Menu, SectionHeading, Segmented, Tag } from "../ui";
import { Button, Input, Modal, Skeleton, Toast } from "../forms";
import { Bars, CalendarHeatmap, Donut, LineChart } from "../charts";
import { bodyWeightSeries, fmtDate, heatmapDays, muscleDistribution, muscleTone, personalRecords, strengthExercises, strengthSeries } from "../data2";

type Range = "4W" | "3M" | "6M" | "1Y";
const RANGE: Record<Range, { points: number; step: number }> = { "4W": { points: 8, step: 4 }, "3M": { points: 13, step: 7 }, "6M": { points: 13, step: 14 }, "1Y": { points: 13, step: 28 } };

function useLoading(dep: unknown, ms = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const t = window.setTimeout(() => setLoading(false), ms); return () => window.clearTimeout(t); }, [dep, ms]);
  return loading;
}

function ChartSkeleton({ h = 200 }: { h?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading chart">
      <div className="flex gap-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-14" /></div>
      <Skeleton className={h > 190 ? "h-[210px] w-full" : "h-[170px] w-full"} />
    </div>
  );
}

export default function Progress() {
  const [range, setRange] = useState<Range>("3M");
  const [goal, setGoal] = useState(76);
  const [logOpen, setLogOpen] = useState(false);
  const [weight, setWeight] = useState("74.5");
  const [wDate, setWDate] = useState("2026-02-19");
  const [wErr, setWErr] = useState("");
  const [extra, setExtra] = useState<{ label: string; value: number }[]>([]);
  const [ex, setEx] = useState("bench");
  const [toast, setToast] = useState<string | null>(null);
  const loading = useLoading(range);

  const bw = useMemo(() => [...bodyWeightSeries(RANGE[range].points, RANGE[range].step), ...extra], [range, extra]);
  const st = useMemo(() => strengthSeries(ex, RANGE[range].points), [ex, range]);
  const exMeta = strengthExercises.find((e) => e.id === ex)!;
  const first = bw[0].value, last = bw[bw.length - 1].value;
  const sessions = heatmapDays.slice(-RANGE[range].points * RANGE[range].step).reduce((a, b) => a + b, 0);

  const logWeight = () => {
    const v = Number(weight);
    if (!v || v < 30 || v > 250) { setWErr("Enter a weight between 30 and 250 kg."); return; }
    setWErr("");
    setExtra((x) => [...x, { label: fmtDate(wDate), value: v }]);
    setLogOpen(false);
    setToast(`Logged ${v} kg`);
  };

  return (
    <Shell>
      <PageHeader eyebrow="Trends & records" title="Progress" sub="Body weight, strength, consistency and where your sets go." actions={
        <>
          <Segmented label="Time range" value={range} onChange={(v) => setRange(v as Range)} options={(["4W", "3M", "6M", "1Y"] as Range[]).map((r) => ({ value: r, label: r }))} />
          <Button icon="plus" onClick={() => setLogOpen(true)}>Log weight</Button>
        </>
      } />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Body weight", value: `${last} kg`, sub: `${last - first >= 0 ? "+" : ""}${(last - first).toFixed(1)} kg in range`, tone: "pink", icon: "scale" as const },
          { label: "Sessions", value: String(sessions), sub: `${range} window`, tone: "violet", icon: "calendar" as const },
          { label: "Best e1RM", value: `${Math.max(...st.e1rm)} kg`, sub: exMeta.name, tone: "cyan", icon: "trophy" as const },
          { label: "New PRs", value: "6", sub: "last 30 days", tone: "amber", icon: "flame" as const },
        ].map((k, i) => (
          <Card key={k.label} as="article" className="rise lift flex items-center gap-3.5 p-4" >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-tag" style={{ background: `var(--tag-${k.tone}-bg)`, color: `var(--tag-${k.tone}-fg)`, animationDelay: `${i * 60}ms` }}><Icon name={k.icon} size={20} /></span>
            <div className="min-w-0"><p className="micro truncate text-muted">{k.label}</p>{loading ? <Skeleton className="mt-1.5 h-6 w-20" /> : <p className="tnum mt-1 text-[20px] font-bold leading-none tracking-[-0.02em] text-ink">{k.value}</p>}<p className="mt-1 truncate text-[11.5px] text-muted">{k.sub}</p></div>
          </Card>
        ))}
      </div>

      {/* body weight */}
      <section className="mt-8" aria-labelledby="bw-title">
        <SectionHeading id="bw-title" title="Body-weight trend">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">Goal
              <input type="number" step={0.5} value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="tnum h-9 w-20 rounded-full border border-hairline bg-surface px-3 text-center text-[13px] font-bold text-ink focus:border-primary/50 focus:outline-none" aria-label="Goal weight kg" /> kg</label>
            <Menu label="Body-weight options" items={[{ label: "View", icon: "eye" }, { label: "Duplicate", icon: "copy" }, { label: "Delete", icon: "trash", tone: "danger" }]} />
          </div>
        </SectionHeading>
        <Card className="p-5">
          {loading ? <ChartSkeleton /> : (
            <LineChart labels={bw.map((b) => b.label)} series={[{ name: "Weight", values: bw.map((b) => b.value), area: true }]} goal={goal} goalLabel={`Goal ${goal} kg`} unit=" kg" summary={`Body weight over ${range}: from ${first} kg to ${last} kg, goal ${goal} kg.`} />
          )}
          <p className="mt-3 text-[12.5px] text-muted">Weekly average, kg. Goal line dashed green. {last < goal ? `${(goal - last).toFixed(1)} kg to go — on track at ~0.3 kg/week.` : "Goal reached — consider a maintenance phase."}</p>
        </Card>
      </section>

      {/* strength */}
      <section className="mt-8" aria-labelledby="st-title">
        <SectionHeading id="st-title" title="Strength progression">
          <div className="relative">
            <select value={ex} onChange={(e) => setEx(e.target.value)} aria-label="Select exercise" className="h-10 appearance-none rounded-full border border-hairline bg-surface pl-4 pr-10 text-[13px] font-semibold text-ink focus:border-primary/50 focus:outline-none">
              {strengthExercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </SectionHeading>
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold text-muted">
            <span className="flex items-center gap-2"><span className="h-2.5 w-5 rounded-full bg-primary" /> Session volume (kg)</span>
            <span className="flex items-center gap-2"><span className="h-0.5 w-5 rounded-full bg-ink" /> Estimated 1RM (kg, right axis)</span>
          </div>
          {loading ? <ChartSkeleton /> : (
            <Bars labels={st.labels} values={st.vol} unit=" kg" line={st.e1rm} lineName="e1RM" lineUnit=" kg" height={210} summary={`${exMeta.name}: estimated one-rep max rose from ${st.e1rm[0]} kg to ${st.e1rm[st.e1rm.length - 1]} kg over ${range}; session volume between ${Math.min(...st.vol)} and ${Math.max(...st.vol)} kg.`} />
          )}
          <p className="mt-3 text-[12.5px] text-muted">e1RM uses Epley: weight × (1 + reps/30) on the heaviest set.</p>
        </Card>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* PRs */}
        <section aria-labelledby="pr-title">
          <SectionHeading id="pr-title" title="Personal records"><a href="#/workouts/history" className="text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">See all</a></SectionHeading>
          <Card className="px-5 py-2">
            <ul>
              {personalRecords.map((p, i) => (
                <li key={p.exercise} className="flex items-center gap-3 border-t border-dashed border-hairline py-3.5 first:border-0">
                  {loading ? <Skeleton className="h-10 w-full" /> : (
                    <>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-tag" style={{ background: i === 0 ? "var(--tag-amber-bg)" : "var(--primary-soft)", color: i === 0 ? "var(--tag-amber-fg)" : "var(--primary)" }}><Icon name="trophy" size={18} /></span>
                      <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold text-ink">{p.exercise}</p><p className="text-[12px] text-muted">{fmtDate(p.date)}{p.e1rm ? ` · e1RM ${p.e1rm} kg` : ""}</p></div>
                      <Tag tone={muscleTone[p.muscle]} className="hidden sm:inline-flex">{p.muscle}</Tag>
                      <div className="text-right"><p className="tnum text-[14px] font-bold text-ink">{p.value}</p><p className="tnum text-[11.5px] font-semibold" style={{ color: "var(--tag-green-fg)" }}>{p.delta}</p></div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* donut */}
        <section aria-labelledby="mg-title">
          <SectionHeading id="mg-title" title="Muscle-group distribution"><Menu label="Distribution options" items={[{ label: "View", icon: "eye" }, { label: "Duplicate", icon: "copy" }, { label: "Delete", icon: "trash", tone: "danger" }]} /></SectionHeading>
          <Card className="p-5">
            {loading ? <div className="flex items-center gap-5"><Skeleton className="h-[180px] w-[180px] rounded-full" /><div className="flex-1 space-y-3"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /></div></div> : (
              <Donut slices={muscleDistribution} summary={`Sets by muscle group in ${range}: ${muscleDistribution.map((m) => `${m.label} ${m.value}`).join(", ")}.`} />
            )}
            <p className="mt-4 text-[12.5px] text-muted">Arms are under 10% of sets — add one direct arm session if hypertrophy is the goal.</p>
          </Card>
        </section>
      </div>

      {/* heatmap */}
      <section className="mt-8" aria-labelledby="hm-title">
        <SectionHeading id="hm-title" title="Workout frequency"><span className="tnum text-[12.5px] font-semibold text-muted">{heatmapDays.filter(Boolean).length} active days · 52 weeks</span></SectionHeading>
        <Card className="p-5">
          {loading ? <Skeleton className="h-[130px] w-full" /> : <CalendarHeatmap days={heatmapDays} weeks={range === "4W" ? 8 : range === "3M" ? 14 : range === "6M" ? 26 : 52} summary={`Training days over the last ${range}. Typical pattern: 3–4 sessions per week, mostly Monday to Friday, with rest on Sundays.`} />}
        </Card>
      </section>

      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="Log body weight" footer={<><Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button><Button onClick={logWeight} icon="save">Save entry</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Weight" type="number" step={0.1} inputMode="decimal" suffix="kg" value={weight} onChange={(e) => setWeight(e.target.value)} error={wErr} hint="Weigh in the morning, after the bathroom, before food." />
          <Input label="Date" type="date" value={wDate} onChange={(e) => setWDate(e.target.value)} />
        </div>
      </Modal>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </Shell>
  );
}
