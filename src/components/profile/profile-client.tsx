"use client";

import { useState, useTransition, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Ruler,
  Scale,
  Calendar,
  Save,
  Plus,
  Target,
  Flame,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Segmented } from "@/components/ui/segmented";
import { SectionHeading } from "@/components/ui/section-header";
import { Toggle } from "@/components/ui/toggle";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { setTheme as setThemeAction } from "@/app/actions/theme";
import { formatDisplayDate } from "@/lib/workout-derived";

export interface SerializedUser {
  id: string;
  name: string | null;
  email: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: string | null;
  fitnessGoal: string | null;
  createdAt: string;
}

export interface SerializedWeightLogItem {
  id: string;
  dateISO: string;
  weight: number;
}

export interface ProfileClientProps {
  user: SerializedUser;
  initialWeightLogs: SerializedWeightLogItem[];
  stats: {
    workoutCount: number;
    totalVolume: number;
    prCount: number;
    streakWeeks: number;
    streakText: string;
  };
}

const subscribeTheme = (callback: () => void) => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
      ) {
        callback();
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
};

const getThemeSnapshot = (): "light" | "dark" => {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
};

const getServerThemeSnapshot = (): "light" | "dark" => "dark";

function formatVolumeCompact(kg: number): string {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}M kg`;
  if (kg >= 1_000) return `${Math.round(kg / 1_000)}k kg`;
  return `${Math.round(kg)} kg`;
}

function ProfileInner({
  user,
  initialWeightLogs,
  stats,
}: ProfileClientProps) {
  const toast = useToast();
  const [, startTransition] = useTransition();

  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const [tab, setTab] = useState<"profile" | "settings">("profile");

  // Form State
  const [name, setName] = useState(user.name || "");
  const [height, setHeight] = useState(user.height != null ? String(user.height) : "");
  const [weight, setWeight] = useState(user.weight != null ? String(user.weight) : "");
  const [age, setAge] = useState(user.age != null ? String(user.age) : "");
  const [gender, setGender] = useState(user.gender || "Male");
  const [fitnessGoal, setFitnessGoal] = useState(user.fitnessGoal || "Build muscle");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Body Weight Log State
  const [weightLogs, setWeightLogs] = useState<SerializedWeightLogItem[]>(initialWeightLogs);
  const [newWeight, setNewWeight] = useState("");
  const [isAddingWeight, setIsAddingWeight] = useState(false);

  const initials = (name || user.email)
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const handleDiscard = () => {
    setName(user.name || "");
    setHeight(user.height != null ? String(user.height) : "");
    setWeight(user.weight != null ? String(user.weight) : "");
    setAge(user.age != null ? String(user.age) : "");
    setGender(user.gender || "Male");
    setFitnessGoal(user.fitnessGoal || "Build muscle");
    setErrors({});
  };

  const handleSaveProfile = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (height && (Number(height) < 120 || Number(height) > 230)) {
      errs.height = "Height must be 120–230 cm.";
    }
    if (weight && (Number(weight) < 30 || Number(weight) > 250)) {
      errs.weight = "Weight must be 30–250 kg.";
    }
    if (age && (Number(age) < 13 || Number(age) > 100)) {
      errs.age = "Age must be 13–100.";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          height: height ? Number(height) : undefined,
          weight: weight ? Number(weight) : undefined,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          fitnessGoal: fitnessGoal || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.show({ message: "Profile saved", tone: "ok" });
    } catch {
      toast.show({ message: "Failed to save profile", tone: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newWeight);
    if (!val || isNaN(val) || val < 30 || val > 250) {
      toast.show({ message: "Enter a weight between 30 and 250 kg", tone: "danger" });
      return;
    }

    setIsAddingWeight(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: val }),
      });

      if (!res.ok) throw new Error("Failed to save body weight");

      const created: SerializedWeightLogItem = {
        id: `bw-${Date.now()}`,
        dateISO: new Date().toISOString(),
        weight: val,
      };

      setWeightLogs((prev) => [created, ...prev]);
      setWeight(String(val));
      setNewWeight("");
      toast.show({ message: `Logged ${val} kg`, tone: "ok" });
    } catch {
      toast.show({ message: "Failed to log body weight", tone: "danger" });
    } finally {
      setIsAddingWeight(false);
    }
  };

  const handleToggleTheme = (checked: boolean) => {
    const nextTheme = checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    startTransition(async () => {
      await setThemeAction(nextTheme);
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        actions={
          <Segmented
            label="Profile section"
            value={tab}
            onChange={(v) => setTab(v as "profile" | "settings")}
            options={[
              { value: "profile", label: "Profile" },
              { value: "settings", label: "Settings" },
            ]}
          />
        }
      />

      {/* Hero Profile Card */}
      <Card className="rise flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center">
        <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-primary-soft text-[30px] font-bold tracking-[-0.02em] text-primary">
          {initials}
        </span>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="truncate text-[22px] font-semibold tracking-[-0.02em] text-ink">
            {name || "Athlete"}
          </h2>
          <p className="truncate text-[13.5px] text-ink-muted">{user.email}</p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Tag tone="violet" icon={<Target size={14} />}>
              {fitnessGoal || "Build muscle"}
            </Tag>
            <Tag tone="green" icon={<Flame size={14} />}>
              {stats.streakText}
            </Tag>
            <Tag tone="cyan">Member since {memberSince}</Tag>
          </div>
        </div>

        <dl className="grid w-full grid-cols-3 gap-4 border-t border-dashed border-hairline pt-4 sm:w-auto sm:border-0 sm:pt-0 text-center">
          <div>
            <dt className="micro text-ink-muted">Workouts</dt>
            <dd className="tnum mt-1 text-[18px] font-bold text-ink">
              {stats.workoutCount}
            </dd>
          </div>
          <div>
            <dt className="micro text-ink-muted">Volume</dt>
            <dd className="tnum mt-1 text-[18px] font-bold text-ink">
              {formatVolumeCompact(stats.totalVolume)}
            </dd>
          </div>
          <div>
            <dt className="micro text-ink-muted">PRs</dt>
            <dd className="tnum mt-1 text-[18px] font-bold text-ink">
              {stats.prCount}
            </dd>
          </div>
        </dl>
      </Card>

      {tab === "profile" ? (
        <>
          {/* Personal Details */}
          <section aria-labelledby="pd-title">
            <SectionHeading id="pd-title" title="Personal details" />
            <Card className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  icon={<User size={16} />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                  hint="Account email is managed by your provider."
                  icon={<Mail size={16} />}
                />
                <Input
                  label="Height"
                  type="number"
                  suffix="cm"
                  placeholder="178"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  error={errors.height}
                  icon={<Ruler size={16} />}
                />
                <Input
                  label="Weight"
                  type="number"
                  step={0.1}
                  suffix="kg"
                  placeholder="74.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  error={errors.weight}
                  icon={<Scale size={16} />}
                />
                <Input
                  label="Age"
                  type="number"
                  placeholder="29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  error={errors.age}
                  icon={<Calendar size={16} />}
                />
                <Select
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </Select>
                <div className="sm:col-span-2">
                  <Select
                    label="Fitness goal"
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                  >
                    <option value="Build muscle">Build muscle</option>
                    <option value="Lose fat">Lose fat</option>
                    <option value="Get stronger">Get stronger</option>
                    <option value="Improve endurance">Improve endurance</option>
                    <option value="Stay healthy">Stay healthy</option>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-dashed border-hairline pt-5">
                <Button variant="outline" onClick={handleDiscard}>
                  Discard
                </Button>
                <Button
                  variant="primary"
                  icon={<Save size={16} />}
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </Card>
          </section>

          {/* Body-weight Log */}
          <section aria-labelledby="bw-title">
            <SectionHeading
              id="bw-title"
              title="Body-weight log"
              actions={
                <Link
                  href="/progress"
                  className="text-[13.5px] font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
                >
                  Open trend
                </Link>
              }
            />
            <Card className="p-5 sm:p-6">
              <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={handleAddWeight}
              >
                <Input
                  label="Today's weight"
                  type="number"
                  step={0.1}
                  inputMode="decimal"
                  suffix="kg"
                  placeholder="74.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-48"
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Plus size={16} />}
                  disabled={isAddingWeight}
                >
                  {isAddingWeight ? "Adding..." : "Add entry"}
                </Button>
              </form>

              <ul className="mt-5 divide-y divide-dashed divide-hairline border-t border-dashed border-hairline">
                {weightLogs.length === 0 ? (
                  <li className="py-6 text-center text-[13.5px] text-ink-muted">
                    No body weight logs yet. Add your current weight above.
                  </li>
                ) : (
                  weightLogs.map((w, i) => {
                    const prev = weightLogs[i + 1];
                    const delta = prev ? w.weight - prev.weight : 0;

                    return (
                      <li
                        key={w.id}
                        className="flex items-center justify-between py-3 text-[13.5px]"
                      >
                        <span className="text-ink-soft">
                          {formatDisplayDate(w.dateISO, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="tnum font-bold text-ink">
                            {w.weight.toFixed(1)} kg
                          </span>
                          {prev && (
                            <span
                              className="tnum text-[12px] font-semibold"
                              style={{
                                color:
                                  delta <= 0
                                    ? "var(--tag-green-fg)"
                                    : "var(--tag-amber-fg)",
                              }}
                            >
                              {delta > 0 ? "+" : ""}
                              {delta.toFixed(1)}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </Card>
          </section>
        </>
      ) : (
        /* Settings Tab */
        <section aria-labelledby="pref-title">
          <SectionHeading id="pref-title" title="Preferences" />
          <Card className="px-5 sm:px-6">
            <Toggle
              checked={theme === "dark"}
              onChange={handleToggleTheme}
              label="Dark theme"
              desc="Toggle between dark and light appearance."
            />
          </Card>
        </section>
      )}
    </div>
  );
}

export function ProfileClient(props: ProfileClientProps) {
  return (
    <ToastProvider>
      <ProfileInner {...props} />
    </ToastProvider>
  );
}
