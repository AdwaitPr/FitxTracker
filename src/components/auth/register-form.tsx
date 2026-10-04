"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Check, ArrowLeft, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    height: "",
    weight: "",
    age: "",
    gender: "Prefer not to say",
    goal: "Build muscle",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const pw = formData.password;
  const pwScore = Math.min(
    4,
    (pw.length >= 6 ? 1 : 0) +
      (/[A-Z]/.test(pw) ? 1 : 0) +
      (/\d/.test(pw) ? 1 : 0) +
      (/[^\w]/.test(pw) || pw.length >= 10 ? 1 : 0)
  );

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tell us your name.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email.";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setError("");
      setStep(2);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.height) {
      const h = parseFloat(formData.height);
      if (isNaN(h) || h < 100 || h > 250) {
        newErrors.height = "100–250 cm.";
      }
    }

    if (formData.weight) {
      const w = parseFloat(formData.weight);
      if (isNaN(w) || w < 30 || w > 250) {
        newErrors.weight = "30–250 kg.";
      }
    }

    if (formData.age) {
      const a = parseInt(formData.age, 10);
      if (isNaN(a) || a < 10 || a > 120) {
        newErrors.age = "10–120.";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          age: formData.age ? parseInt(formData.age, 10) : null,
          gender: formData.gender || null,
          fitnessGoal: formData.goal || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      // Auto sign-in on account creation
      const signInRes = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.ok) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login?registered=true";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 1 ? "Create your account" : "About your body"}
      sub={
        step === 1
          ? "Two short steps. Your data stays yours."
          : "We use these for volume, e1RM and recovery baselines."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Log in
          </Link>
        </>
      }
    >
      {/* Step Indicator */}
      <ol className="mb-6 flex items-center gap-3" aria-label="Registration steps">
        {[1, 2].map((n) => (
          <li key={n} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-bold transition-colors",
                step > n
                  ? "bg-primary text-white"
                  : step === n
                  ? "bg-ink text-canvas"
                  : "bg-hairline text-muted"
              )}
              aria-current={step === n ? "step" : undefined}
            >
              {step > n ? <Check size={14} strokeWidth={2.4} /> : n}
            </span>
            <span
              className={cn(
                "text-[12.5px] font-semibold",
                step >= n ? "text-ink" : "text-muted"
              )}
            >
              {n === 1 ? "Account" : "Profile"}
            </span>
            {n === 1 && (
              <span className="h-px flex-1 bg-hairline overflow-hidden">
                <span
                  className="block h-px bg-primary transition-all duration-500"
                  style={{ width: step > 1 ? "100%" : "0%" }}
                />
              </span>
            )}
          </li>
        ))}
      </ol>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-[13.5px] font-medium text-danger">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4" noValidate>
          <Input
            id="name"
            name="name"
            label="Full name"
            icon={<User size={16} />}
            value={formData.name}
            onChange={updateField("name")}
            error={errors.name}
            autoComplete="name"
            placeholder="John Doe"
            required
          />

          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            icon={<Mail size={16} />}
            value={formData.email}
            onChange={updateField("email")}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <div>
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              icon={<Lock size={16} />}
              value={formData.password}
              onChange={updateField("password")}
              error={errors.password}
              autoComplete="new-password"
              placeholder="••••••••"
              hint="At least 6 characters (10+ recommended)."
              required
            />
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors duration-200"
                  style={{
                    background:
                      i < pwScore
                        ? pwScore >= 3
                          ? "var(--tag-green-fg)"
                          : "var(--tag-amber-fg)"
                        : "var(--hairline)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              arrow
              fullWidth
              className="justify-between pl-6"
            >
              Continue
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="register-height"
              label="Height"
              type="number"
              suffix="cm"
              placeholder="178"
              value={formData.height}
              onChange={updateField("height")}
              error={errors.height}
              inputMode="numeric"
            />
            <Input
              id="register-weight"
              label="Weight"
              type="number"
              suffix="kg"
              step={0.1}
              placeholder="75"
              value={formData.weight}
              onChange={updateField("weight")}
              error={errors.weight}
              inputMode="decimal"
            />
            <Input
              id="register-age"
              label="Age"
              type="number"
              placeholder="28"
              value={formData.age}
              onChange={updateField("age")}
              error={errors.age}
              inputMode="numeric"
            />
          </div>

          <Select
            id="register-gender"
            label="Gender"
            value={formData.gender}
            onChange={updateField("gender")}
          >
            <option>Prefer not to say</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
          </Select>

          <Select
            id="register-goal"
            label="Fitness goal"
            value={formData.goal}
            onChange={updateField("goal")}
          >
            <option>Build muscle</option>
            <option>Lose fat</option>
            <option>Get stronger</option>
            <option>Improve endurance</option>
            <option>Stay healthy</option>
          </Select>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              icon={<ArrowLeft size={16} />}
              onClick={() => {
                setError("");
                setStep(1);
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              arrow
              isLoading={isLoading}
              className="flex-1 justify-between pl-6"
            >
              Create account
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
