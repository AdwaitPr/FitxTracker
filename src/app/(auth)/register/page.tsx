import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register · FitxTracker",
  description: "Create your personal FitxTracker account to log workouts, monitor recovery, and measure focus.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <RegisterForm />
    </Suspense>
  );
}
