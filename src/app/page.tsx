import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { LandingClient } from "@/components/landing/landing-client";

export const metadata = {
  title: "FitxTracker · Train Hard When Your Body Says Yes",
  description:
    "FitxTracker unifies your workout log, autonomic recovery score, and CogniType focus tests into one calm dashboard.",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingClient />;
}
