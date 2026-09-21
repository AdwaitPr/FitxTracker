import { useMemo, useState } from "react";
import { PageHeader, Shell, useTheme } from "../chrome";
import { Icon, MuscleGlyph } from "../icons";
import { Card, Menu, SectionHeading, Segmented, Tag } from "../ui";
import { Button, Chip, EmptyState, Input, Modal, Select, Toast, Toggle } from "../forms";
import { equipmentList, exerciseLibrary, fmtDate, muscleGroups, muscleTone } from "../data2";
import type { Equipment } from "../data2";
import type { MuscleGroup } from "../data";
import { user } from "../data";
import { navigate, usePath } from "../router";

/* ============================================================ Exercises */
export function Exercises() {
  const path = usePath();
  const initial = decodeURIComponent(path.split("?q=")[1] ?? "");
  const [q, setQ] = useState(initial);
  const [mg, setMg] = useState<MuscleGroup | null>(null);
  const [eq, setEq] = useState<Equipment | "">("");
  const [favs, setFavs] = useState<Record<string, boolean>>({ squat: true, pullup: true });
  const list = useMemo(() => exerciseLibrary.filter((e) => (!mg || e.muscle === mg) && (!eq || e.equipment === eq) && e.name.toLowerCase().includes(q.toLowerCase())), [q, mg, eq]);

  return (
    <Shell>
      <PageHeader eyebrow="Library" title="Exercises" sub={`${exerciseLibrary.length} movements across ${muscleGroups.length} muscle groups. Favourites float to the top of the picker when you log.`} actions={<Button icon="plus" variant="outline">Create custom</Button>} />
      <Card className="rise p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <Input icon="search" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search exercises" />
          <Select value={eq} onChange={(e) => setEq(e.target.value as Equipment | "")} aria-label="Equipment"><option value="">All equipment</option>{equipmentList.map((e) => <option key={e}>{e}</option>)}</Select>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <Chip selected={mg === null} onClick={() => setMg(null)}>All</Chip>
          {muscleGroups.map((m) => <Chip key={m} selected={mg === m} tone={muscleTone[m]} onClick={() => setMg(mg === m ? null : m)}>{m}</Chip>)}
        </div>
      </Card>

      {list.length === 0 ? <div className="mt-6"><EmptyState icon="list" title={`No results for “${q}”`} body="Try a broader term, or create a custom exercise with its own muscle group and equipment." action={<Button variant="outline" onClick={() => { setQ(""); setMg(null); setEq(""); }}>Clear filters</Button>} /></div> : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e, i) => {
            const t = muscleTone[e.muscle];
            return (
              <Card key={e.id} as="article" className="rise lift flex flex-col p-4" >
                <div className="relative flex h-[96px] items-center justify-center overflow-hidden rounded-[16px]" style={{ background: `var(--tag-${t}-bg)`, color: `var(--tag-${t}-fg)`, animationDelay: `${i * 30}ms` }}>
                  <span className="pointer-events-none absolute inset-x-6 top-1/2 border-t border-dashed" style={{ borderColor: "currentColor", opacity: 0.25 }} />
                  <MuscleGlyph name={e.muscle} className="relative h-14 w-14" />
                  <button type="button" aria-pressed={!!favs[e.id]} aria-label={favs[e.id] ? "Remove favourite" : "Add favourite"} onClick={() => setFavs((f) => ({ ...f, [e.id]: !f[e.id] }))} className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-surface/70 text-ink-soft hover:bg-surface">
                    {favs[e.id] ? <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-6.8-4.2-6.8-9A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 6.8 2.6c0 4.8-6.8 9-6.8 9z" fill="var(--danger)" /></svg> : <Icon name="heart" size={16} />}
                  </button>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0"><h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{e.name}</h3><p className="text-[12px] text-muted">{e.equipment}{e.secondary ? ` · also ${e.secondary}` : ""}</p></div>
                  <Menu label={`Options for ${e.name}`} items={[{ label: "View", icon: "eye" }, { label: "Duplicate", icon: "copy" }, { label: "Delete", icon: "trash", tone: "danger" }]} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-hairline pt-3">
                  <Tag tone={t}>{e.muscle}</Tag>
                  <button type="button" onClick={() => navigate("/workouts/new")} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-primary hover:bg-primary-soft">Log <Icon name="arrowRight" size={14} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

/* ============================================================== Profile */
export function Profile() {
  const path = usePath();
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState(path.includes("settings") ? "settings" : "profile");
  const [form, setForm] = useState({ name: user.fullName, email: "aarav.sharma@example.com", height: "178", weight: "74.5", age: "29", gender: "Male", goal: "Build muscle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState([{ d: "2026-02-17", v: 74.5 }, { d: "2026-02-10", v: 74.8 }, { d: "2026-02-03", v: 75.1 }]);
  const [newW, setNewW] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [units, setUnits] = useState("kg");
  const [remind, setRemind] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [delOpen, setDelOpen] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const save = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Name is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = "Enter a valid email.";
    if (+form.height < 120 || +form.height > 230) err.height = "Height 120–230 cm.";
    if (+form.weight < 30 || +form.weight > 250) err.weight = "Weight 30–250 kg.";
    if (+form.age < 13 || +form.age > 100) err.age = "Age 13–100.";
    setErrors(err);
    if (!Object.keys(err).length) setToast("Profile saved");
  };

  return (
    <Shell narrow>
      <PageHeader eyebrow="Account" title="Profile" actions={<Segmented label="Profile section" value={tab} onChange={setTab} options={[{ value: "profile", label: "Profile" }, { value: "settings", label: "Settings" }]} />} />

      <Card className="rise flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center">
        <div className="relative">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-[30px] font-bold tracking-[-0.02em] text-primary">{user.initials}</span>
          <button type="button" aria-label="Change avatar" className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-ink text-canvas"><Icon name="edit" size={15} /></button>
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{form.name}</h2>
          <p className="text-[13.5px] text-muted">{form.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start"><Tag tone="violet" icon="target">{form.goal}</Tag><Tag tone="green" icon="flame">4-week streak</Tag><Tag tone="cyan">Member since Oct 2025</Tag></div>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center">
          {[["Workouts", "126"], ["Volume", "1.2M kg"], ["PRs", "31"]].map(([k, v]) => <div key={k}><dt className="micro text-muted">{k}</dt><dd className="tnum mt-1 text-[18px] font-bold text-ink">{v}</dd></div>)}
        </dl>
      </Card>

      {tab === "profile" ? (
        <>
          <section className="mt-8" aria-labelledby="pd"><SectionHeading id="pd" title="Personal details" />
            <Card className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" value={form.name} onChange={set("name")} error={errors.name} icon="user" />
                <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} icon="mail" />
                <Input label="Height" type="number" suffix="cm" value={form.height} onChange={set("height")} error={errors.height} icon="ruler" />
                <Input label="Weight" type="number" step={0.1} suffix="kg" value={form.weight} onChange={set("weight")} error={errors.weight} icon="scale" />
                <Input label="Age" type="number" value={form.age} onChange={set("age")} error={errors.age} icon="calendar" />
                <Select label="Gender" value={form.gender} onChange={set("gender")}><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></Select>
                <Select label="Fitness goal" value={form.goal} onChange={set("goal")} className="sm:col-span-2"><option>Build muscle</option><option>Lose fat</option><option>Get stronger</option><option>Improve endurance</option><option>Stay healthy</option></Select>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-dashed border-hairline pt-5"><Button variant="outline" onClick={() => setErrors({})}>Discard</Button><Button icon="save" onClick={save}>Save changes</Button></div>
            </Card>
          </section>

          <section className="mt-8" aria-labelledby="bw"><SectionHeading id="bw" title="Body-weight log"><a href="#/progress" className="text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4">Open trend</a></SectionHeading>
            <Card className="p-5 sm:p-6">
              <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); const v = Number(newW); if (!v || v < 30 || v > 250) return; setWeights([{ d: "2026-02-19", v }, ...weights]); setNewW(""); setToast(`Logged ${v} kg`); }}>
                <Input label="Today's weight" type="number" step={0.1} inputMode="decimal" suffix="kg" placeholder="74.3" value={newW} onChange={(e) => setNewW(e.target.value)} className="w-48" />
                <Button type="submit" icon="plus" variant="primary">Add entry</Button>
              </form>
              <ul className="mt-4">
                {weights.map((w, i) => {
                  const prev = weights[i + 1];
                  const d = prev ? w.v - prev.v : 0;
                  return (
                    <li key={w.d + i} className="flex items-center justify-between border-t border-dashed border-hairline py-3 text-[13.5px]">
                      <span className="text-ink-soft">{fmtDate(w.d, { weekday: "short", day: "numeric", month: "short" })}</span>
                      <span className="flex items-center gap-3"><span className="tnum font-bold text-ink">{w.v.toFixed(1)} kg</span>{prev && <span className="tnum text-[12px] font-semibold" style={{ color: d <= 0 ? "var(--tag-green-fg)" : "var(--tag-amber-fg)" }}>{d > 0 ? "+" : ""}{d.toFixed(1)}</span>}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="mt-8" aria-labelledby="pref"><SectionHeading id="pref" title="Preferences" />
            <Card className="divide-y divide-dashed divide-hairline px-5 sm:px-6">
              <Toggle checked={dark} onChange={toggle} label="Dark theme" desc="Kept in memory for this session only." />
              <div className="flex items-center justify-between gap-4 py-3"><span><span className="block text-[14px] font-semibold text-ink">Units</span><span className="block text-[12.5px] text-muted">Applies to loads and body weight.</span></span><Segmented label="Units" value={units} onChange={setUnits} options={[{ value: "kg", label: "kg" }, { value: "lb", label: "lb" }]} /></div>
              <Toggle checked={remind} onChange={setRemind} label="Recovery reminders" desc="Nudge at 07:30 if today's log is empty." />
              <Toggle checked={weekly} onChange={setWeekly} label="Weekly summary email" desc="Sunday evening recap of volume, PRs and focus." />
            </Card>
          </section>
          <section className="mt-8" aria-labelledby="sec"><SectionHeading id="sec" title="Security" />
            <Card className="p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><Input label="Current password" type="password" icon="lock" placeholder="••••••••" /><Input label="New password" type="password" icon="lock" placeholder="At least 10 characters" hint="Use a passphrase — length beats symbols." /></div><div className="mt-5 flex justify-end"><Button variant="outline" icon="shield">Update password</Button></div></Card>
          </section>
          <section className="mt-8" aria-labelledby="dz"><SectionHeading id="dz" title="Danger zone" />
            <Card className="border border-dashed border-hairline p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-[14.5px] font-semibold text-ink">Sign out of this device</p><p className="text-[12.5px] text-muted">You'll need your password to sign back in.</p></div>
                <Button variant="danger" icon="logout" onClick={() => navigate("/login")}>Logout</Button>
              </div>
              <div className="mt-5 flex flex-col gap-4 border-t border-dashed border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-[14.5px] font-semibold text-ink">Delete account</p><p className="text-[12.5px] text-muted">Removes 126 workouts, recovery logs and CogniType sessions permanently.</p></div>
                <Button variant="dangerSoft" icon="trash" onClick={() => setDelOpen(true)}>Delete account</Button>
              </div>
            </Card>
          </section>
          <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Delete your account?" danger footer={<><Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button><Button variant="danger" icon="trash" onClick={() => { setDelOpen(false); setToast("Deletion scheduled — 14-day grace period"); }}>Delete account</Button></>}>
            <p className="text-[13.5px] text-ink-soft">We keep your data for 14 days in case you change your mind, then erase everything: workouts, sets, recovery logs, CogniType sessions and your profile.</p>
          </Modal>
        </>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </Shell>
  );
}
