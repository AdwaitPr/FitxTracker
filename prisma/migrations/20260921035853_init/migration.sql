-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "age" INTEGER,
    "gender" TEXT,
    "fitnessGoal" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "equipment" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "restTime" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "variationType" TEXT,
    "tempo" TEXT,
    "addedWeight" DOUBLE PRECISION,
    "perceivedDifficulty" INTEGER,
    "workoutExerciseId" TEXT NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyWeightLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BodyWeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRecovery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" TEXT,
    "gutStatus" TEXT,
    "stressLevel" INTEGER,
    "notes" TEXT,

    CONSTRAINT "DailyRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextPassage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "category" TEXT,

    CONSTRAINT "TextPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "soundType" TEXT,
    "timeOfDay" TEXT NOT NULL,
    "durationMs" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TypingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeystrokeEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "key" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "isCorrection" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "KeystrokeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttentionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION,

    CONSTRAINT "AttentionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionMetrics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "meanInterKeyLatency" DOUBLE PRECISION NOT NULL,
    "latencyStdDev" DOUBLE PRECISION NOT NULL,
    "pauseEntropy" DOUBLE PRECISION NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "correctionLatency" DOUBLE PRECISION NOT NULL,
    "switchCount" INTEGER NOT NULL,
    "switchTimeRatio" DOUBLE PRECISION NOT NULL,
    "resumeLatency" DOUBLE PRECISION NOT NULL,
    "fatigueSlope" DOUBLE PRECISION NOT NULL,
    "focusStabilityScore" DOUBLE PRECISION NOT NULL,
    "soundType" TEXT,
    "difficultyLevel" INTEGER NOT NULL,
    "sessionTimeOfDay" TEXT NOT NULL,

    CONSTRAINT "SessionMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBaseline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "stdDev" DOUBLE PRECISION NOT NULL,
    "sampleCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutId_idx" ON "WorkoutExercise"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "Set_workoutExerciseId_idx" ON "Set"("workoutExerciseId");

-- CreateIndex
CREATE INDEX "BodyWeightLog_userId_idx" ON "BodyWeightLog"("userId");

-- CreateIndex
CREATE INDEX "DailyRecovery_userId_date_idx" ON "DailyRecovery"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecovery_userId_date_key" ON "DailyRecovery"("userId", "date");

-- CreateIndex
CREATE INDEX "TypingSession_userId_idx" ON "TypingSession"("userId");

-- CreateIndex
CREATE INDEX "TypingSession_passageId_idx" ON "TypingSession"("passageId");

-- CreateIndex
CREATE INDEX "KeystrokeEvent_sessionId_idx" ON "KeystrokeEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AttentionEvent_sessionId_idx" ON "AttentionEvent"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionMetrics_sessionId_key" ON "SessionMetrics"("sessionId");

-- CreateIndex
CREATE INDEX "UserBaseline_userId_idx" ON "UserBaseline"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBaseline_userId_metric_key" ON "UserBaseline"("userId", "metric");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyWeightLog" ADD CONSTRAINT "BodyWeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecovery" ADD CONSTRAINT "DailyRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypingSession" ADD CONSTRAINT "TypingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypingSession" ADD CONSTRAINT "TypingSession_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "TextPassage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeystrokeEvent" ADD CONSTRAINT "KeystrokeEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TypingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttentionEvent" ADD CONSTRAINT "AttentionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TypingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMetrics" ADD CONSTRAINT "SessionMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TypingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBaseline" ADD CONSTRAINT "UserBaseline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
