/**
 * Smart alert system for workout recommendations based on recovery data
 */

interface RecoveryData {
    sleepHours: number | null;
    sleepQuality: string | null;
    stressLevel: number | null;
    gutStatus: string | null;
}

export interface Alert {
    level: "optimal" | "normal" | "warning" | "critical";
    message: string;
    suggestedIntensity: string;
    icon: string;
}

/**
 * Calculate recovery score (0-100) from recovery data
 */
export function calculateRecoveryScore(data: RecoveryData): number {
    let score = 0;
    let weight = 0;

    // Sleep hours = 40% of score
    if (data.sleepHours !== null) {
        const sleepScore = Math.min(data.sleepHours / 8, 1) * 40;
        score += sleepScore;
        weight += 40;
    }

    // Sleep quality = 30% of score
    if (data.sleepQuality) {
        const qualityMap: Record<string, number> = {
            Poor: 0.25,
            Fair: 0.5,
            Good: 0.75,
            Excellent: 1,
        };
        score += (qualityMap[data.sleepQuality] || 0.5) * 30;
        weight += 30;
    }

    // Stress level (inverted) = 20% of score
    if (data.stressLevel !== null) {
        score += ((10 - data.stressLevel) / 10) * 20;
        weight += 20;
    }

    // Gut status = 10% of score
    if (data.gutStatus) {
        const gutMap: Record<string, number> = {
            Good: 1,
            Bloated: 0.5,
            Uncomfortable: 0.2,
        };
        score += (gutMap[data.gutStatus] || 0.5) * 10;
        weight += 10;
    }

    // Normalize to 0-100 based on available data
    if (weight === 0) return 0;
    return Math.round((score / weight) * 100);
}

/**
 * Get workout recommendation based on recovery data
 */
export function getWorkoutRecommendation(data: RecoveryData): Alert {
    const score = calculateRecoveryScore(data);

    if (score >= 80) {
        return {
            level: "optimal",
            message: "Great recovery — push for PRs today! 💪",
            suggestedIntensity: "high",
            icon: "🟢",
        };
    }

    if (score >= 60) {
        return {
            level: "normal",
            message: "Moderate recovery — train as planned",
            suggestedIntensity: "moderate",
            icon: "🟡",
        };
    }

    if (score >= 40) {
        return {
            level: "warning",
            message: "Low recovery — reduce volume by 30%",
            suggestedIntensity: "light",
            icon: "🟠",
        };
    }

    return {
        level: "critical",
        message: "Very low recovery — active rest only ⚠️",
        suggestedIntensity: "rest",
        icon: "🔴",
    };
}

/**
 * Get recovery score color for UI
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
}
