import { prisma } from "../src/lib/prisma";

const exercises = [
    // Chest
    { name: "Barbell Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
    { name: "Incline Barbell Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
    { name: "Decline Barbell Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
    { name: "Dumbbell Bench Press", muscleGroup: "Chest", equipment: "Dumbbell" },
    { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell" },
    { name: "Dumbbell Flyes", muscleGroup: "Chest", equipment: "Dumbbell" },
    { name: "Incline Dumbbell Flyes", muscleGroup: "Chest", equipment: "Dumbbell" },
    { name: "Cable Crossover", muscleGroup: "Chest", equipment: "Cable" },
    { name: "Chest Dips", muscleGroup: "Chest", equipment: "Bodyweight" },
    { name: "Push-ups", muscleGroup: "Chest", equipment: "Bodyweight" },
    { name: "Machine Chest Press", muscleGroup: "Chest", equipment: "Machine" },
    { name: "Pec Deck Machine", muscleGroup: "Chest", equipment: "Machine" },

    // Back
    { name: "Conventional Deadlift", muscleGroup: "Back", equipment: "Barbell" },
    { name: "Sumo Deadlift", muscleGroup: "Back", equipment: "Barbell" },
    { name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell" },
    { name: "Pendlay Row", muscleGroup: "Back", equipment: "Barbell" },
    { name: "Dumbbell Row", muscleGroup: "Back", equipment: "Dumbbell" },
    { name: "Pull-ups", muscleGroup: "Back", equipment: "Bodyweight" },
    { name: "Chin-ups", muscleGroup: "Back", equipment: "Bodyweight" },
    { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable" },
    { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable" },
    { name: "T-Bar Row", muscleGroup: "Back", equipment: "Barbell" },
    { name: "Face Pulls", muscleGroup: "Back", equipment: "Cable" },
    { name: "Straight Arm Pulldown", muscleGroup: "Back", equipment: "Cable" },
    { name: "Machine Row", muscleGroup: "Back", equipment: "Machine" },
    { name: "Hyperextensions", muscleGroup: "Back", equipment: "Bodyweight" },

    // Legs
    { name: "Barbell Back Squat", muscleGroup: "Legs", equipment: "Barbell" },
    { name: "Front Squat", muscleGroup: "Legs", equipment: "Barbell" },
    { name: "Goblet Squat", muscleGroup: "Legs", equipment: "Dumbbell" },
    { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Hack Squat", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell" },
    { name: "Dumbbell Romanian Deadlift", muscleGroup: "Legs", equipment: "Dumbbell" },
    { name: "Walking Lunges", muscleGroup: "Legs", equipment: "Dumbbell" },
    { name: "Bulgarian Split Squat", muscleGroup: "Legs", equipment: "Dumbbell" },
    { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Lying Leg Curl", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Standing Calf Raise", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Seated Calf Raise", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Hip Thrust", muscleGroup: "Legs", equipment: "Barbell" },
    { name: "Leg Press Calf Raise", muscleGroup: "Legs", equipment: "Machine" },
    { name: "Step Ups", muscleGroup: "Legs", equipment: "Dumbbell" },

    // Shoulders
    { name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell" },
    { name: "Seated Dumbbell Press", muscleGroup: "Shoulders", equipment: "Dumbbell" },
    { name: "Arnold Press", muscleGroup: "Shoulders", equipment: "Dumbbell" },
    { name: "Lateral Raises", muscleGroup: "Shoulders", equipment: "Dumbbell" },
    { name: "Cable Lateral Raise", muscleGroup: "Shoulders", equipment: "Cable" },
    { name: "Front Raises", muscleGroup: "Shoulders", equipment: "Dumbbell" },
    { name: "Reverse Flyes", muscleGroup: "Shoulders", equipment: "Dumbbell" },
    { name: "Rear Delt Cable Fly", muscleGroup: "Shoulders", equipment: "Cable" },
    { name: "Upright Row", muscleGroup: "Shoulders", equipment: "Barbell" },
    { name: "Machine Shoulder Press", muscleGroup: "Shoulders", equipment: "Machine" },
    { name: "Barbell Shrugs", muscleGroup: "Shoulders", equipment: "Barbell" },
    { name: "Dumbbell Shrugs", muscleGroup: "Shoulders", equipment: "Dumbbell" },

    // Arms - Biceps
    { name: "Barbell Curl", muscleGroup: "Arms", equipment: "Barbell" },
    { name: "EZ-Bar Curl", muscleGroup: "Arms", equipment: "Barbell" },
    { name: "Dumbbell Curl", muscleGroup: "Arms", equipment: "Dumbbell" },
    { name: "Hammer Curls", muscleGroup: "Arms", equipment: "Dumbbell" },
    { name: "Incline Dumbbell Curl", muscleGroup: "Arms", equipment: "Dumbbell" },
    { name: "Concentration Curl", muscleGroup: "Arms", equipment: "Dumbbell" },
    { name: "Cable Curl", muscleGroup: "Arms", equipment: "Cable" },
    { name: "Preacher Curl", muscleGroup: "Arms", equipment: "Barbell" },

    // Arms - Triceps
    { name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable" },
    { name: "Overhead Tricep Extension", muscleGroup: "Arms", equipment: "Cable" },
    { name: "Skull Crushers", muscleGroup: "Arms", equipment: "Barbell" },
    { name: "Close Grip Bench Press", muscleGroup: "Arms", equipment: "Barbell" },
    { name: "Tricep Dips", muscleGroup: "Arms", equipment: "Bodyweight" },
    { name: "Dumbbell Kickbacks", muscleGroup: "Arms", equipment: "Dumbbell" },
    { name: "Diamond Push-ups", muscleGroup: "Arms", equipment: "Bodyweight" },

    // Core
    { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Side Plank", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Crunches", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Russian Twists", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Leg Raises", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Hanging Leg Raises", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Ab Wheel Rollout", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Cable Woodchops", muscleGroup: "Core", equipment: "Cable" },
    { name: "Mountain Climbers", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Dead Bug", muscleGroup: "Core", equipment: "Bodyweight" },
    { name: "Bicycle Crunches", muscleGroup: "Core", equipment: "Bodyweight" },

    // Cardio
    { name: "Treadmill Running", muscleGroup: "Cardio", equipment: "Machine" },
    { name: "Outdoor Running", muscleGroup: "Cardio", equipment: "Bodyweight" },
    { name: "Cycling", muscleGroup: "Cardio", equipment: "Machine" },
    { name: "Rowing Machine", muscleGroup: "Cardio", equipment: "Machine" },
    { name: "Elliptical", muscleGroup: "Cardio", equipment: "Machine" },
    { name: "Stair Climber", muscleGroup: "Cardio", equipment: "Machine" },
    { name: "Jump Rope", muscleGroup: "Cardio", equipment: "Bodyweight" },
    { name: "Battle Ropes", muscleGroup: "Cardio", equipment: "Bodyweight" },
    { name: "Box Jumps", muscleGroup: "Cardio", equipment: "Bodyweight" },
    { name: "Burpees", muscleGroup: "Cardio", equipment: "Bodyweight" },
];

async function seed() {
    console.log("🌱 Seeding exercises...");

    for (const exercise of exercises) {
        await prisma.exercise.upsert({
            where: { name: exercise.name },
            update: {},
            create: exercise,
        });
    }

    const count = await prisma.exercise.count();
    console.log(`✅ Done! ${count} exercises in the database.`);
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
