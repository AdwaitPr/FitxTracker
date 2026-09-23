import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ExercisesClient } from "@/components/exercises";

export const metadata: Metadata = {
  title: "Exercises — FitxTracker",
  description: "Browse movement library, filter by muscle groups and equipment.",
};

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params?.q || "";

  const exercises = await prisma.exercise.findMany({
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });

  return (
    <ExercisesClient
      exercises={exercises}
      initialQuery={initialQuery}
    />
  );
}
