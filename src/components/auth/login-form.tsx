"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      sub="Log in to see today's recovery and pick up your plan."
      footer={
        <>
          New here?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {registered && !error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary-soft p-3.5 text-[13.5px] font-medium text-primary">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Account created successfully! Please sign in.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-danger/20 bg-danger/10 p-3.5 text-[13.5px] font-medium text-danger">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          id="email"
          name="email"
          label="Email"
          type="email"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <div className="relative">
          <Input
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-1 top-[29px] grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[13px] pt-1">
          <label className="flex items-center gap-2 text-ink-soft select-none cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-hairline accent-[var(--primary)]"
            />
            <span>Remember me</span>
          </label>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            arrow
            fullWidth
            isLoading={isLoading}
            className="justify-between pl-6"
          >
            Log in
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
