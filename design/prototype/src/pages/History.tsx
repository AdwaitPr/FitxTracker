import { useMemo, useState } from "react";
import clsx from "clsx";
import { PageHeader, Shell } from "../chrome";
import { Icon, MuscleGlyph } from "../icons";
import { Card, IconButton, Menu, SectionHeading, Tag } from "../ui";
import { Button, Chip, Disclosure, EmptyState, Input, Modal, Select, Toast } from "../forms";
import { detailSets, exerciseLibrary, fmtDate, historyWorkouts, muscleGroups, muscleTone, relDate } from "../data2";
import type { HistoryWorkout } from "../data2";
import type { MuscleGroup } from "../data";
import { Link, navigate } from "../router";

const fmtVol = (v: number) => (v === 0 ? "Bodyweight" : `${v.toLocaleString()} kg`);

function weekLabel(isoStr: string) {
  const diff = Math.floor((new Date("2026-02-19T12:00:00").getTime() - new Date(isoStr + "T12:00:00").getTime()) / 86400000);
  const w = Math.floor((diff + 3) / 7); // week starts Monday (19 Feb 2026 is a Thursday)
  return w === 0 ? "This week" : w === 1 ? "Last week" : `${w} weeks ago`;
}

/* ================================================================ History */
export function History() {
  const [q, setQ] = useState("");
  const [mg, setMg] = useState<MuscleGroup | null>(null);
  const [range, setRange] = useState("all");
  const [deleted] = useState<string[]>([]);

  const list = useMemo(() => {
    const maxDays = range === "all" ? 999 : Number(range);
    return historyWorkouts.filter((w) => {
      const days = Math.floor((new Date("2026-02-19T12:00:00").getTime() - new Date(w.dateISO + "T12:00:00").getTime()) / 86400000);
      return !deleted.includes(w.id) && days <= maxDays && (!mg || w.muscle === mg) && (w.name.toLowerCase().includes(q.toLowerCase()) || w.topSet.toLowerCase().includes(q.toLowerCase()));
    });
  }, [q, mg, range, deleted]);

  const groups = useMemo(() => {
    const m = new Map<string, HistoryWorkout[]>();
    list.forEach((w) => { const k = weekLabel(w.dateISO); m.set(k, [...(m.get(k) ?? []), w]); });
    return [...m.entries()];
  }, [list]);

  const totals = { n: list.length, vol: list.reduce((a, w) => a + w.volume, 0), min: list.reduce((a, w) => a + w.durationMin, 0) };

  return (
    <Shell>
      <PageHeader eyebrow="Archive" title="History" sub={`${totals.n} workouts · ${(totals.vol / 1000).toFixed(1)}k kg lifted · ${Math.round(totals.min / 60)} h ${totals.min % 60} min under the bar`} actions={<Button icon="plus" onClick={() => navigate("/workouts/new")}>Log workout</Button>} />

      <Card className="rise p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <Input icon="search" placeholder="Search workouts or top sets…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search workouts" />
          <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range"><option value="all">All time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></Select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Chip selected={mg === null} onClick={() => setMg(null)}>All groups</Chip>
          {muscleGroups.map((m) => <Chip key={m} selected={mg === m} tone={muscleTone[m]} onClick={() => setMg(mg === m ? null : m)}>{m}</Chip>)}
        </div>
      </Card>

      {groups.length === 0 && <div className="mt-6"><EmptyState icon="history" title="Nothing matches" body="Try another search term, clear the muscle-group filter or widen the date range." action={<Button variant="outline" onClick={() => { setQ(""); setMg(null); setRange("all"); }}>Clear filters</Button>} /></div>}

      {groups.map(([label, items], gi) => (
        <section key={label} className="mt-8" aria-labelledby={`g-${gi}`}>
          <SectionHeading id={`g-${gi}`} title={label}><span className="tnum text-[12.5px] font-semibold text-muted">{items.length} session{items.length > 1 ? "s" : ""} · {(items.reduce((a, w) => a + w.volume, 0) / 1000).toFixed(1)}k kg</span></SectionHeading>
          <Card className="px-4 py-1 sm:px-6">
            <div className="micro hidden grid-cols-[1.8fr_1fr_0.7fr_0.8fr_1.1fr_44px] gap-4 px-1 pb-2 pt-3 text-muted lg:grid"><span>Workout</span><span>Muscle group</span><span>Duration</span><span>Volume</span><span>Top set</span><span className="text-right">Open</span></div>
            <ul>
              {items.map((w) => (
                <li key={w.id} className="border-t border-dashed border-hairline first:border-0 lg:first:border-t">
                  <Link to={`/workouts/${w.id}`} className="group grid grid-cols-[44px_1fr_44px] items-center gap-x-3 gap-y-1.5 rounded-[14px] px-1 py-3.5 transition-colors hover:bg-canvas lg:grid-cols-[1.8fr_1fr_0.7fr_0.8fr_1.1fr_44px] lg:gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-tag lg:hidden" style={{ background: `var(--tag-${muscleTone[w.muscle]}-bg)`, color: `var(--tag-${muscleTone[w.muscle]}-fg)` }}><MuscleGlyph name={w.muscle} className="h-7 w-7" /></span>
                    <span className="min-w-0"><span className="block truncate text-[14.5px] font-semibold text-ink">{w.name}</span><span className="tnum block text-[12px] text-muted">{relDate(w.dateISO)} · {fmtDate(w.dateISO, { weekday: "short", day: "numeric", month: "short" })}<span className="lg:hidden"> · {w.durationMin} min · {fmtVol(w.volume)}</span></span></span>
                    <span className="hidden lg:block"><Tag tone={muscleTone[w.muscle]}>{w.muscle}</Tag></span>
                    <span className="tnum hidden text-[13.5px] text-ink-soft lg:block">{w.durationMin} min</span>
                    <span className="tnum hidden text-[13.5px] font-semibold text-ink lg:block">{fmtVol(w.volume)}</span>
                    <span className="hidden truncate text-[13px] text-ink-soft lg:block">{w.topSet}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-hairline text-ink-soft transition-colors group-hover:border-primary"><Icon name="arrowRight" size={17} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ))}
      {deleted.length > 0 && <span className="sr-only">{deleted.length} deleted</span>}
    </Shell>
  );
}

/* ========================================================== WorkoutDetail */
export function WorkoutDetail({ id }: { id: string }) {
  const w = historyWorkouts.find((x) => x.id === id) ?? historyWorkouts[0];
  const [del, setDel] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const tone = muscleTone[w.muscle];
  const exs = w.exerciseIds.map((eid, i) => ({ ex: exerciseLibrary.find((e) => e.id === eid)!, sets: detailSets(eid, i + w.id.length) }));
  const totalSets = exs.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const allSets = exs.reduce((a, e) => a + e.sets.length, 0);
  const idx = historyWorkouts.findIndex((x) => x.id === w.id);
  const prev = historyWorkouts[idx + 1], next = historyWorkouts[idx - 1];

  return (
    <Shell>
      <div className="rise mb-5 flex items-center justify-between gap-3">
        <Link to="/workouts/history" className="inline-flex h-10 items-center gap-2 rounded-full pl-2 pr-4 text-[13.5px] font-semibold text-ink-soft hover:bg-surface hover:text-primary"><span className="grid h-8 w-8 place-items-center rounded-full border border-hairline"><Icon name="arrowLeft" size={16} /></span> History</Link>
        <div className="flex items-center gap-2">
          {prev && <IconButton icon="chevronLeft" label="Older workout" onClick={() => navigate(`/workouts/${prev.id}`)} />}
          {next && <IconButton icon="chevronRight" label="Newer workout" onClick={() => navigate(`/workouts/${next.id}`)} />}
          <Menu label="Workout options" items={[{ label: "View", icon: "eye" }, { label: "Duplicate", icon: "copy" }, { label: "Delete", icon: "trash", tone: "danger" }]} />
        </div>
      </div>

      {/* hero header */}
      <Card className="rise relative overflow-hidden p-6 sm:p-8">
        <span className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-[48px] opacity-60" style={{ background: `var(--tag-${tone}-bg)` }} />
        <span className="pointer-events-none absolute right-8 top-8 hidden h-32 w-32 sm:block" style={{ color: `var(--tag-${tone}-fg)`, opacity: 0.35 }}><MuscleGlyph name={w.muscle} className="h-full w-full" /></span>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2"><Tag tone={tone}>{w.muscle}</Tag><span className="micro text-muted">{fmtDate(w.dateISO, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
          <h1 className="mt-3 max-w-[22ch] text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[36px]">{w.name}</h1>
          <p className="tnum mt-2 text-[14px] text-muted">{relDate(w.dateISO)} · {w.durationMin} min · {exs.length} exercises</p>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
            {[{ l: "Volume", v: w.volume ? `${(w.volume / 1000).toFixed(1)}k` : "BW", u: w.volume ? "kg" : "" }, { l: "Sets", v: `${totalSets}`, u: `/${allSets}` }, { l: "Avg RPE", v: w.avgRpe.toFixed(1), u: "/10" }].map((k) => (
              <div key={k.l} className="rounded-panel bg-inset px-3 py-3"><p className="micro text-muted">{k.l}</p><p className="tnum mt-1 text-[20px] font-bold leading-none text-ink">{k.v}<span className="text-[11px] font-semibold text-muted"> {k.u}</span></p></div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button icon="copy" onClick={() => navigate("/workouts/new")}>Repeat workout</Button>
            <Button variant="outline" icon="edit">Edit</Button>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
        <section aria-labelledby="ex-title">
          <SectionHeading id="ex-title" title="Exercises"><span className="tnum text-[12.5px] font-semibold text-muted">{w.topSet}</span></SectionHeading>
          <Card className="px-4 py-2 sm:px-5">
            {exs.map(({ ex, sets }, i) => {
              const done = sets.filter((s) => s.done).length;
              const vol = sets.filter((s) => s.done).reduce((a, s) => a + s.reps * s.weight, 0);
              return (
                <Disclosure key={ex.id} defaultOpen={i === 0} className="border-t border-dashed border-hairline py-1.5 first:border-0"
                  title={<span className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-tag" style={{ background: `var(--tag-${muscleTone[ex.muscle]}-bg)`, color: `var(--tag-${muscleTone[ex.muscle]}-fg)` }}><MuscleGlyph name={ex.muscle} className="h-6 w-6" /></span><span className="min-w-0"><span className="block truncate text-[14.5px] font-semibold text-ink">{ex.name}</span><span className="tnum block text-[12px] text-muted">{done}/{sets.length} sets · {vol ? `${vol.toLocaleString()} kg` : "bodyweight"} · best {Math.max(...sets.map((s) => s.weight))} kg × {sets[0].reps}</span></span></span>}
                  meta={<Tag tone={muscleTone[ex.muscle]} className="hidden sm:inline-flex">{ex.muscle}</Tag>}>
                  <div className="mb-3 overflow-hidden rounded-panel bg-inset">
                    <table className="w-full text-left text-[13.5px]">
                      <thead><tr className="micro text-muted"><th className="px-4 py-2.5 font-semibold">Set</th><th className="px-2 py-2.5 font-semibold">Reps × kg</th><th className="px-2 py-2.5 font-semibold">RPE</th><th className="px-4 py-2.5 text-right font-semibold">Done</th></tr></thead>
                      <tbody>
                        {sets.map((s) => (
                          <tr key={s.set} className={clsx("border-t border-dashed border-hairline", !s.done && "opacity-60")}>
                            <td className="tnum px-4 py-2.5 font-bold text-muted">{s.set}</td>
                            <td className="tnum px-2 py-2.5 font-semibold text-ink">{s.reps} × {s.weight ? `${s.weight} kg` : "BW"}</td>
                            <td className="tnum px-2 py-2.5 text-ink-soft">{s.rpe}</td>
                            <td className="px-4 py-2.5 text-right"><span className={clsx("inline-grid h-6 w-6 place-items-center rounded-full", s.done ? "text-white" : "border border-hairline text-transparent")} style={s.done ? { background: "var(--tag-green-fg)" } : undefined}><Icon name="check" size={13} strokeWidth={2.4} /></span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Disclosure>
              );
            })}
          </Card>
        </section>

        <aside aria-label="Notes and actions" className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Notes</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{w.notes ?? "No notes for this session."}</p>
          </Card>
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Session facts</h2>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              {[["Started", "18:05"], ["Finished", `${18 + Math.floor((5 + w.durationMin) / 60)}:${String((5 + w.durationMin) % 60).padStart(2, "0")}`], ["Recovery that day", "79 · Normal"], ["Body weight", "74.5 kg"]].map(([k, v]) => <div key={k} className="flex justify-between border-b border-dashed border-hairline pb-2.5 last:border-0"><dt className="text-muted">{k}</dt><dd className="tnum font-semibold text-ink">{v}</dd></div>)}
            </dl>
          </Card>
          <Card className="border border-dashed border-hairline p-5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: "var(--danger)" }}>Danger zone</h2>
            <p className="mt-1.5 text-[12.5px] text-muted">Deleting removes the session and its sets from every chart and record. This cannot be undone.</p>
            <Button variant="dangerSoft" icon="trash" className="mt-4 w-full" onClick={() => setDel(true)}>Delete workout</Button>
          </Card>
        </aside>
      </div>

      <Modal open={del} onClose={() => setDel(false)} title="Delete this workout?" danger footer={<><Button variant="outline" onClick={() => setDel(false)}>Keep it</Button><Button variant="danger" icon="trash" disabled={confirm.trim().toLowerCase() !== "delete"} onClick={() => { setDel(false); setToast("Workout deleted"); window.setTimeout(() => navigate("/workouts/history"), 900); }}>Delete permanently</Button></>}>
        <div className="flex gap-3 rounded-panel p-4" style={{ background: "#FDE9E1" }}>
          <span className="shrink-0 text-[#B03A16]"><Icon name="alert" size={20} /></span>
          <p className="text-[13.5px] text-[#B03A16]"><strong>{w.name}</strong> from {fmtDate(w.dateISO)} — {allSets} sets and {fmtVol(w.volume)} will be removed from your progress, records and streaks.</p>
        </div>
        <Input className="mt-4" label="Type DELETE to confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" autoComplete="off" />
      </Modal>
      {toast && <Toast message={toast} tone="danger" onDone={() => setToast(null)} />}
    </Shell>
  );
}
