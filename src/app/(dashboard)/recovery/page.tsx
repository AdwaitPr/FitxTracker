import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { RecoveryClient } from "@/components/recovery";
import type { SerializedRecoveryLog } from "@/components/recovery";

export const metadata = {
  title: "Recovery — FitxTracker",
  description: "Track your sleep, stress, gut status, and recovery readiness.",
};

export default async function RecoveryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Query recent recovery records (up to 30 to deduplicate by calendar day)
  const rawLogs = await prisma.dailyRecovery.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  const seenDays = new Set<string>();
  const dailyLogs: SerializedRecoveryLog[] = [];

  for (const log of rawLogs) {
    const dayKey = log.date.toISOString().split("T")[0];
    if (!seenDays.has(dayKey)) {
      seenDays.add(dayKey);
      dailyLogs.push({
        id: log.id,
        dateISO: log.date.toISOString(),
        sleepHours: log.sleepHours,
        sleepQuality: log.sleepQuality,
        gutStatus: log.gutStatus,
        stressLevel: log.stressLevel,
        notes: log.notes,
      });
      if (dailyLogs.length >= 14) break;
    }
  }

  const todayKey = new Date().toISOString().split("T")[0];
  const todayLog =
    dailyLogs.find((l) => l.dateISO.split("T")[0] === todayKey) || null;

  return <RecoveryClient initialLogs={dailyLogs} todayLog={todayLog} />;
}
