import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { PageHeader, Shell } from "../chrome";
import { Icon, MuscleGlyph } from "../icons";
import { Card, IconButton, Menu, RingProgress, SectionHeading, Tag } from "../ui";
import { Button, Chip, EmptyState, Input, Modal, Select, Textarea, Toast } from "../forms";
import { equipmentList, exerciseLibrary, muscleGroups, muscleTone } from "../data2";
import type { Equipment, Exercise } from "../data2";
import type { MuscleGroup } from "../data";
import { navigate } from "../router";

/* ------------------------------------------------------------------ types */
type Variation = "Standard" | "Diamond" | "Weighted" | "Slow-Tempo";
interface SetRow { id: string; reps: number | ""; weight: number | ""; rest: number; done: boolean; variation: Variation; tempo: string; added: number | ""; rpe: number | ""; justDone?: boolean }
interface Entry { id: string; exercise: Exercise; sets: SetRow[]; advanced: boolean }

let uid = 0;
const nid = () => `n${++uid}`;
const newSet = (prev?: SetRow): SetRow => ({ id: nid(), reps: prev?.reps ?? "", weight: prev?.weight ?? "", rest: prev?.rest ?? 120, done: false, variation: prev?.variation ?? "Standard", tempo: prev?.tempo ?? "", added: prev?.added ?? "", rpe: "" });
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------ RestTimer */
function RestTimer({ total, onDone }: { total: number; onDone: () => void }) {
  const [left, setLeft] = useState(total);
  const [max, setMax] = useState(total);
  const [paused, setPaused] = useState(false);
  useEffect(() => { setLeft(total); setMax(total); setPaused(false); }, [total]);
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(t);
  }, [paused]);
  useEffect(() => { if (left <= 0) onDone(); }, [left, onDone]);
  const pct = Math.max(0, left / max);
  return (
    <div role="timer" aria-live="off" aria-label={`Rest timer, ${mmss(Math.max(0, left))} remaining`} className="rise fixed bottom-[calc(160px+env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-ink py-2 pl-2 pr-3 text-canvas shadow-lift sm:gap-3 md:bottom-24 xl:bottom-8">
      <RingProgress value={pct} size={40} stroke={3.5} color="var(--primary)" label="Rest remaining"><span className="text-[9px] font-bold">{Math.round(pct * 100)}%</span></RingProgress>
      <span><span className="micro block opacity-60">Rest</span><span className="tnum block text-[18px] font-bold leading-none">{mmss(Math.max(0, left))}</span></span>
      <span className="mx-1 h-6 w-px bg-canvas/20" />
      <button type="button" onClick={() => { setLeft((l) => l + 30); setMax((m) => m + 30); }} className="h-9 rounded-full px-3 text-[12px] font-semibold hover:bg-canvas/10">+30s</button>
      <button type="button" aria-label={paused ? "Resume" : "Pause"} onClick={() => setPaused((p) => !p)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-canvas/10"><Icon name={paused ? "play" : "pause"} size={16} /></button>
      <button type="button" onClick={onDone} className="h-9 rounded-full bg-canvas px-3.5 text-[12px] font-semibold text-ink">Skip</button>
    </div>
  );
}

/* --------------------------------------------------------- CompleteButton */
function CompleteButton({ done, onToggle, label, pop }: { done: boolean; onToggle: () => void; label: string; pop?: boolean }) {
  return (
    <button type="button" aria-pressed={done} aria-label={label} onClick={onToggle} className={clsx("relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200", done ? "border-transparent text-white" : "border-hairline text-transparent hover:border-primary", pop && "check-pop check-ripple")} style={done ? { background: "var(--tag-green-fg)" } : undefined}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" className={pop ? "check-draw" : undefined} /></svg>
    </button>
  );
}

/* ---------------------------------------------------------- SetRowGrid */
const cell = "tnum h-11 w-full min-w-0 rounded-[12px] border border-hairline bg-canvas px-3 text-center text-[14px] font-semibold text-ink focus:border-primary/60 focus:bg-surface focus:outline-none disabled:opacity-60";
function num(v: string): number | "" { return v === "" ? "" : Math.max(0, Number(v)); }

function EntryCard({ entry, index, onChange, onRemove, onComplete }: { entry: Entry; index: number; onChange: (e: Entry) => void; onRemove: () => void; onComplete: (rest: number) => void }) {
  const setSet = (i: number, patch: Partial<SetRow>) => onChange({ ...entry, sets: entry.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const done = entry.sets.filter((s) => s.done).length;
  const tone = muscleTone[entry.exercise.muscle];
  const bodyweight = entry.exercise.equipment === "Bodyweight" || entry.exercise.equipment === "Rings";
  const invalid = (s: SetRow) => s.done && (s.reps === "" || s.reps === 0);

  return (
    <Card as="article" className="rise p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-tag" style={{ background: `var(--tag-${tone}-bg)`, color: `var(--tag-${tone}-fg)` }}><MuscleGlyph name={entry.exercise.muscle} className="h-7 w-7" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="micro text-muted">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{entry.exercise.name}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Tag tone={tone}>{entry.exercise.muscle}</Tag>
            <span className="text-[12px] text-muted">{entry.exercise.equipment} · {done}/{entry.sets.length} sets done</span>
          </div>
        </div>
        <Menu label={`Options for ${entry.exercise.name}`} items={[{ label: "View", icon: "eye" }, { label: "Duplicate", icon: "copy" }, { label: "Delete", icon: "trash", tone: "danger" }]} />
      </div>

      {/* grid header */}
      <div className={clsx("micro mt-5 hidden gap-2 px-1 text-muted sm:grid", entry.advanced ? "grid-cols-[32px_1fr_1fr_1fr_1.2fr_1fr_1fr_0.8fr_44px_36px]" : "grid-cols-[32px_1fr_1fr_1fr_44px_36px_36px]")}>
        <span>Set</span><span>Reps</span><span>{bodyweight ? "+kg" : "Kg"}</span><span>Rest s</span>
        {entry.advanced && (<><span>Variation</span><span>Tempo</span><span>Added kg</span><span>RPE</span></>)}
        <span className="text-center">Done</span>{!entry.advanced && <span />}<span />
      </div>

      <ul className="mt-2 space-y-2">
        {entry.sets.map((s, i) => (
          <li key={s.id} className={clsx("rounded-[16px] p-1.5 transition-colors duration-300", s.done && "bg-primary-soft/40", invalid(s) && "ring-1 ring-danger")}>
            <div className={clsx("grid items-center gap-2", entry.advanced ? "grid-cols-[32px_1fr_1fr_1fr_44px] sm:grid-cols-[32px_1fr_1fr_1fr_1.2fr_1fr_1fr_0.8fr_44px_36px]" : "grid-cols-[32px_1fr_1fr_1fr_44px] sm:grid-cols-[32px_1fr_1fr_1fr_44px_36px_36px]")}>
              <span className="tnum text-center text-[13px] font-bold text-muted">{i + 1}</span>
              <label className="sr-only" htmlFor={`${s.id}-reps`}>Reps set {i + 1}</label>
              <input id={`${s.id}-reps`} type="number" inputMode="numeric" min={0} placeholder="reps" value={s.reps} onChange={(e) => setSet(i, { reps: num(e.target.value) })} className={cell} aria-invalid={invalid(s) || undefined} />
              <label className="sr-only" htmlFor={`${s.id}-w`}>Weight kg set {i + 1}</label>
              <input id={`${s.id}-w`} type="number" inputMode="decimal" min={0} step={0.5} placeholder={bodyweight ? "BW" : "kg"} value={s.weight} onChange={(e) => setSet(i, { weight: num(e.target.value) })} className={cell} />
              <label className="sr-only" htmlFor={`${s.id}-r`}>Rest seconds set {i + 1}</label>
              <input id={`${s.id}-r`} type="number" inputMode="numeric" min={0} step={15} value={s.rest} onChange={(e) => setSet(i, { rest: Number(e.target.value) })} className={cell} />
              {entry.advanced && (
                <>
                  <label className="sr-only" htmlFor={`${s.id}-v`}>Variation set {i + 1}</label>
                  <select id={`${s.id}-v`} value={s.variation} onChange={(e) => setSet(i, { variation: e.target.value as Variation })} className={clsx(cell, "col-span-2 appearance-none text-left sm:col-span-1")}>
                    {(["Standard", "Diamond", "Weighted", "Slow-Tempo"] as Variation[]).map((v) => <option key={v}>{v}</option>)}
                  </select>
                  <label className="sr-only" htmlFor={`${s.id}-t`}>Tempo set {i + 1}</label>
                  <input id={`${s.id}-t`} type="text" placeholder="3-1-3" value={s.tempo} onChange={(e) => setSet(i, { tempo: e.target.value })} className={cell} pattern="\d-\d-\d" />
                  <label className="sr-only" htmlFor={`${s.id}-a`}>Added weight kg set {i + 1}</label>
                  <input id={`${s.id}-a`} type="number" inputMode="decimal" min={0} step={0.5} placeholder="+kg" value={s.added} onChange={(e) => setSet(i, { added: num(e.target.value) })} className={cell} />
                  <label className="sr-only" htmlFor={`${s.id}-rpe`}>RPE set {i + 1}</label>
                  <select id={`${s.id}-rpe`} value={s.rpe} onChange={(e) => setSet(i, { rpe: num(e.target.value) })} className={clsx(cell, "appearance-none")}>
                    <option value="">RPE</option>
                    {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </>
              )}
              <div className={clsx(entry.advanced && "col-start-5 row-start-1 sm:col-start-auto sm:row-start-auto")}>
                <CompleteButton done={s.done} pop={s.justDone} label={`Mark set ${i + 1} ${s.done ? "incomplete" : "complete"}`} onToggle={() => {
                  const next = !s.done;
                  setSet(i, { done: next, justDone: next });
                  if (next) onComplete(s.rest);
                }} />
              </div>
              {!entry.advanced && (
                <button type="button" aria-label={`Copy set ${i} into set ${i + 1}`} disabled={i === 0} onClick={() => setSet(i, { ...entry.sets[i - 1], id: s.id, done: false, justDone: false })} className="hidden h-9 w-9 place-items-center rounded-full text-muted hover:bg-canvas hover:text-primary disabled:opacity-30 sm:grid"><Icon name="copy" size={16} /></button>
              )}
              <button type="button" aria-label={`Remove set ${i + 1}`} disabled={entry.sets.length === 1} onClick={() => onChange({ ...entry, sets: entry.sets.filter((_, j) => j !== i) })} className="hidden h-9 w-9 place-items-center rounded-full text-muted hover:bg-canvas hover:text-danger disabled:opacity-30 sm:grid"><Icon name="close" size={16} /></button>
            </div>
            {invalid(s) && <p role="alert" className="mt-1 px-2 text-[11.5px] font-medium" style={{ color: "var(--danger)" }}>Completed sets need at least 1 rep.</p>}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-hairline pt-3">
        <Button variant="soft" size="sm" icon="plus" onClick={() => onChange({ ...entry, sets: [...entry.sets, newSet(entry.sets[entry.sets.length - 1])] })}>Add set</Button>
        <Button variant="outline" size="sm" icon="copy" onClick={() => onChange({ ...entry, sets: [...entry.sets, { ...newSet(entry.sets[entry.sets.length - 1]) }] })}>Copy previous set</Button>
        <button type="button" aria-expanded={entry.advanced} onClick={() => onChange({ ...entry, advanced: !entry.advanced })} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-muted hover:text-primary">
          Advanced <Icon name="chevronDown" size={15} className={clsx("transition-transform duration-200", entry.advanced && "rotate-180")} />
        </button>
        <button type="button" onClick={onRemove} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold hover:bg-danger/10" style={{ color: "var(--danger)" }}><Icon name="trash" size={15} /> Remove</button>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------- LibraryModal */
function LibraryModal({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (e: Exercise) => void }) {
  const [q, setQ] = useState("");
  const [mg, setMg] = useState<MuscleGroup | null>(null);
  const [eq, setEq] = useState<Equipment | "">("");
  const list = exerciseLibrary.filter((e) => (!mg || e.muscle === mg) && (!eq || e.equipment === eq) && e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose} title="Add exercise" size="lg">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <Input icon="search" placeholder="Search the library…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search exercises" />
        <Select value={eq} onChange={(e) => setEq(e.target.value as Equipment | "")} aria-label="Equipment filter"><option value="">All equipment</option>{equipmentList.map((e) => <option key={e}>{e}</option>)}</Select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip selected={mg === null} onClick={() => setMg(null)}>All</Chip>
        {muscleGroups.map((m) => <Chip key={m} selected={mg === m} tone={muscleTone[m]} onClick={() => setMg(mg === m ? null : m)}>{m}</Chip>)}
      </div>
      <ul className="mt-4 max-h-[46vh] overflow-y-auto no-scrollbar">
        {list.length === 0 && <li className="py-8 text-center text-[13.5px] text-muted">No exercises match “{q}”.</li>}
        {list.map((e) => (
          <li key={e.id} className="border-t border-dashed border-hairline first:border-0">
            <button type="button" onClick={() => onPick(e)} className="flex min-h-[56px] w-full items-center gap-3 rounded-[12px] px-2 py-2 text-left hover:bg-canvas">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-tag" style={{ background: `var(--tag-${muscleTone[e.muscle]}-bg)`, color: `var(--tag-${muscleTone[e.muscle]}-fg)` }}><MuscleGlyph name={e.muscle} className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-ink">{e.name}</span><span className="block text-[12px] text-muted">{e.equipment}{e.secondary ? ` · also ${e.secondary}` : ""}</span></span>
              <Tag tone={muscleTone[e.muscle]}>{e.muscle}</Tag>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted"><Icon name="plus" size={16} /></span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/* --------------------------------------------------------------- page */
export default function NewWorkout() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("2026-02-19");
  const [duration, setDuration] = useState<number | "">(60);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [lib, setLib] = useState(false);
  const [rest, setRest] = useState<{ total: number; key: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ m: string; tone?: "ok" | "danger" } | null>(null);
  const [saved, setSaved] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [startedAt]);

  const stats = useMemo(() => {
    const all = entries.flatMap((e) => e.sets);
    const done = all.filter((s) => s.done);
    const volume = done.reduce((a, s) => a + (Number(s.reps) || 0) * ((Number(s.weight) || 0) + (Number(s.added) || 0)), 0);
    const rpes = done.map((s) => Number(s.rpe)).filter((r) => r > 0);
    return { total: all.length, done: done.length, volume, rpe: rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : null };
  }, [entries]);

  const onComplete = useCallback((restS: number) => {
    setStartedAt((s) => s ?? Date.now());
    if (restS > 0) setRest({ total: restS, key: Date.now() });
  }, []);
  const clearRest = useCallback(() => setRest(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const addExercise = (e: Exercise) => {
    setEntries((list) => [...list, { id: nid(), exercise: e, sets: [newSet(), newSet(), newSet()], advanced: false }]);
    setLib(false);
    setToast({ m: `${e.name} added` });
  };
  const loadLast = () => {
    const ids = ["bench", "incdb", "fly", "skull", "pushdown"];
    const w: Record<string, [number, number]> = { bench: [5, 82.5], incdb: [10, 30], fly: [12, 17.5], skull: [10, 30], pushdown: [12, 27.5] };
    setName("Push Day — Chest & Triceps");
    setEntries(ids.map((id) => { const ex = exerciseLibrary.find((x) => x.id === id)!; return { id: nid(), exercise: ex, advanced: false, sets: Array.from({ length: 4 }, () => ({ ...newSet(), reps: w[id][0], weight: w[id][1] })) }; }));
    setToast({ m: "Loaded last Push Day as a template" });
  };

  const finish = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Give the workout a name.";
    if (duration === "" || Number(duration) <= 0) err.duration = "Duration must be more than 0.";
    if (entries.length === 0) err.entries = "Add at least one exercise.";
    else if (stats.done === 0) err.entries = "Complete at least one set before finishing.";
    if (entries.some((e) => e.sets.some((s) => s.done && (s.reps === "" || s.reps === 0)))) err.entries = "Some completed sets are missing reps.";
    setErrors(err);
    if (Object.keys(err).length) {
      setToast({ m: "Fix the highlighted fields", tone: "danger" });
      if (err.name) document.getElementById("wk-name")?.focus();
      return;
    }
    setSaved(true);
  };

  const plannedSec = (Number(duration) || 60) * 60;
  const rail = (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
      <Card as="article" className="rise p-5">
        <div className="flex items-center justify-between"><h2 className="text-[17px] font-semibold tracking-[-0.02em]">Live session</h2><Menu label="Session options" items={[{ label: "Reset timer", icon: "refresh" }, { label: "Discard", icon: "trash", tone: "danger" }]} /></div>
        <div className="mt-5 flex flex-col items-center">
          <RingProgress value={Math.min(1, elapsed / plannedSec)} size={152} stroke={6} label={`Elapsed ${mmss(elapsed)} of planned ${duration || 60} minutes`}>
            <div className="text-center"><div className="tnum text-[28px] font-bold leading-none tracking-[-0.02em] text-ink">{mmss(elapsed)}</div><div className="micro mt-1.5 text-muted">{startedAt ? "elapsed" : "not started"}</div></div>
          </RingProgress>
          {!startedAt ? (
            <Button variant="soft" size="sm" icon="play" className="mt-4" onClick={() => setStartedAt(Date.now())}>Start timer</Button>
          ) : (
            <p className="mt-4 text-[12.5px] text-muted">Planned {duration || 60} min · {Math.max(0, Math.round((plannedSec - elapsed) / 60))} min left</p>
          )}
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-2 rounded-panel bg-inset p-3 text-center">
          <div><dt className="micro text-muted">Volume</dt><dd className="tnum mt-1 text-[16px] font-bold text-ink">{stats.volume >= 1000 ? `${(stats.volume / 1000).toFixed(1)}k` : stats.volume}<span className="text-[10px] font-semibold text-muted"> kg</span></dd></div>
          <div className="border-x border-dashed border-hairline"><dt className="micro text-muted">Sets</dt><dd className="tnum mt-1 text-[16px] font-bold text-ink">{stats.done}<span className="text-[11px] font-semibold text-muted">/{stats.total}</span></dd></div>
          <div><dt className="micro text-muted">Avg RPE</dt><dd className="tnum mt-1 text-[16px] font-bold text-ink">{stats.rpe ? stats.rpe.toFixed(1) : "—"}</dd></div>
        </dl>
        <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-hairline" role="progressbar" aria-valuenow={stats.total ? Math.round((stats.done / stats.total) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label="Sets completed"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} /></div>
        <ul className="mt-4 space-y-2">
          {entries.length === 0 && <li className="text-[12.5px] text-muted">Exercises you add will appear here.</li>}
          {entries.map((e, i) => (
            <li key={e.id} className="flex items-center gap-2.5 text-[13px]">
              <span className="tnum w-5 text-muted">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{e.exercise.name}</span>
              <span className="tnum text-[12px] font-semibold text-muted">{e.sets.filter((s) => s.done).length}/{e.sets.length}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 hidden xl:block">
          <Button onClick={finish} arrow className="w-full justify-between pl-6">Finish workout</Button>
          {errors.entries && <p role="alert" className="mt-2 text-[12px] font-medium" style={{ color: "var(--danger)" }}>{errors.entries}</p>}
        </div>
      </Card>
    </div>
  );

  return (
    <Shell rail={rail} railSticky>
      <PageHeader eyebrow="Log a workout" title="New Workout" sub="Add exercises, tick sets as you go — volume, timer and RPE update live in the summary." actions={<Button variant="outline" icon="history" onClick={loadLast}>Use last workout</Button>} />

      <Card className="rise p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <Input id="wk-name" label="Workout name" placeholder="e.g. Push Day — Chest & Triceps" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} className="sm:col-span-2 lg:col-span-1" />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Duration" type="number" min={1} inputMode="numeric" suffix="min" value={duration} onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))} error={errors.duration} />
        </div>
        <Textarea label="Notes" placeholder="How did it feel? Anything to remember next time?" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-4" />
      </Card>

      <div className="mt-8">
        <SectionHeading title="Exercises">
          <Button variant="primary" icon="plus" onClick={() => setLib(true)}>Add exercise</Button>
        </SectionHeading>
        {entries.length === 0 ? (
          <EmptyState icon="dumbbell" title="No exercises yet" body="Pick from the library of 30 movements or reuse your last session as a template. Sets, rest and RPE are all editable inline." action={<><Button variant="primary" icon="plus" onClick={() => setLib(true)}>Add exercise</Button><Button variant="outline" icon="history" onClick={loadLast}>Use last workout</Button></>} />
        ) : (
          <div className="space-y-4">
            {entries.map((e, i) => (
              <EntryCard key={e.id} entry={e} index={i} onChange={(n) => setEntries((l) => l.map((x) => (x.id === n.id ? n : x)))} onRemove={() => setEntries((l) => l.filter((x) => x.id !== e.id))} onComplete={onComplete} />
            ))}
            <button type="button" onClick={() => setLib(true)} className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-card border border-dashed border-hairline text-[13.5px] font-semibold text-muted transition-colors hover:border-primary hover:text-primary"><Icon name="plus" size={16} /> Add another exercise</button>
          </div>
        )}
        {errors.entries && <p role="alert" className="mt-3 flex items-center gap-1.5 text-[12.5px] font-medium xl:hidden" style={{ color: "var(--danger)" }}><Icon name="alert" size={14} />{errors.entries}</p>}
      </div>

      {/* sticky bottom action bar (below xl) */}
      <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 border-t border-hairline bg-surface/95 px-4 py-3 md:bottom-0 md:left-[76px] xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1"><p className="micro text-muted">{stats.done}/{stats.total} sets · {mmss(elapsed)}</p><p className="tnum truncate text-[14px] font-bold text-ink">{stats.volume.toLocaleString()} kg volume</p></div>
          <IconButton icon="plus" label="Add exercise" variant="soft" size={44} onClick={() => setLib(true)} />
          <Button onClick={finish} arrow className="pl-5">Finish</Button>
        </div>
      </div>

      <LibraryModal open={lib} onClose={() => setLib(false)} onPick={addExercise} />
      {rest && <RestTimer key={rest.key} total={rest.total} onDone={clearRest} />}
      {toast && <Toast message={toast.m} tone={toast.tone} onDone={clearToast} />}

      <Modal open={saved} onClose={() => setSaved(false)} title="Workout saved" footer={<><Button variant="outline" onClick={() => { setSaved(false); setEntries([]); setName(""); setStartedAt(null); setElapsed(0); }}>Log another</Button><Button arrow onClick={() => navigate("/workouts/history")}>View history</Button></>}>
        <div className="flex items-center gap-4 rounded-panel bg-inset p-4">
          <span className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ background: "var(--tag-green-fg)" }}><Icon name="check" size={22} strokeWidth={2.2} /></span>
          <div><p className="text-[15px] font-semibold text-ink">{name}</p><p className="tnum text-[12.5px] text-muted">{date} · {duration} min · {entries.length} exercises · {stats.done} sets · {stats.volume.toLocaleString()} kg</p></div>
        </div>
        {notes && <p className="mt-3 text-[13px] text-ink-soft">“{notes}”</p>}
      </Modal>
    </Shell>
  );
}
