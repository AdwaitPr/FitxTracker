import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getWorkoutRecommendation } from "@/lib/alerts";
import { Shell } from "@/components/layout/shell";
import type { Alert } from "@/lib/alerts";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  let user = null;
  let alert: Alert | null = null;

  if (session?.user?.id) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [userData, todayRecovery] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            name: true,
            email: true,
            fitnessGoal: true,
            image: true,
          },
        }),
        prisma.dailyRecovery.findFirst({
          where: {
            userId: session.user.id,
            date: { gte: today },
          },
          orderBy: { date: "desc" },
        }),
      ]);

      user = userData;
      if (todayRecovery) {
        alert = getWorkoutRecommendation(todayRecovery);
      }
    } catch {
      // In case of any DB transient issue, continue gracefully
    }
  }

  return (
    <Shell user={user} alert={alert}>
      {children}
    </Shell>
  );
}
