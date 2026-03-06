-- CreateTable
CREATE TABLE "TextPassage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "TypingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "soundType" TEXT,
    "timeOfDay" TEXT NOT NULL,
    "durationMs" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TypingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TypingSession_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "TextPassage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeystrokeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "timestamp" REAL NOT NULL,
    "key" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "isCorrection" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "KeystrokeEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TypingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttentionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" REAL NOT NULL,
    "duration" REAL,
    CONSTRAINT "AttentionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TypingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "meanInterKeyLatency" REAL NOT NULL,
    "latencyStdDev" REAL NOT NULL,
    "pauseEntropy" REAL NOT NULL,
    "errorRate" REAL NOT NULL,
    "correctionLatency" REAL NOT NULL,
    "switchCount" INTEGER NOT NULL,
    "switchTimeRatio" REAL NOT NULL,
    "resumeLatency" REAL NOT NULL,
    "fatigueSlope" REAL NOT NULL,
    "focusStabilityScore" REAL NOT NULL,
    "soundType" TEXT,
    "difficultyLevel" INTEGER NOT NULL,
    "sessionTimeOfDay" TEXT NOT NULL,
    CONSTRAINT "SessionMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TypingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBaseline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "baselineValue" REAL NOT NULL,
    "stdDev" REAL NOT NULL,
    "sampleCount" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserBaseline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
